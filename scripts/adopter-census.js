#!/usr/bin/env node
// scripts/adopter-census.js
// @ship upstream-only — 센서스 — 상류가 형제 레포를 읽는다([PRO-24] ①(c))
// 어답터 센서스([PRO-24] ② 회수층) — 이 머신의 형제 레포(어답터)를 **읽기 전용**으로 재서 익명 집계 행을 낸다. 사람 왕복 0 · 어답터 변경 0.
//
// 왜: 1차 설문(9건)이 드러낸 것은 결함이 아니라 **경로 부재**였다 — 어답터가 상류를 어떻게 쓰는지 상류가 볼 계기가 없었고, 그래서
// 상류 형상에서만 참인 규칙이 2/3 어답터에서 전제부터 틀렸다([ADR-54]). 설문은 3주·세션 4가 든다. 센서스는 계측기만 읽는다.
//
// 읽는 것(전부 상류 도구를 `root` 인자로 — 어답터의 스크립트를 **실행하지 않는다**, 코드·문서 본문도 읽지 않는다):
//   health(gather) · CHANGELOG 헤딩 버전 · template-sync.json ref·날짜 · 계측기 유무 · WO frontmatter status 분포(첫 토큰) · evidence 기입률 ·
//   백필 대상 수([TOOL-29]) · 중복 ID · 상류 ID 충돌 · arithmeticFrom 추정("같은 번호에 PLAN 과 PRO 가 둘 다 있는 구간", [PRO-27] §7-3) ·
//   upward-fetch 공백률 · `upstream_candidate: true` PRO(ID·개수만).
//
// 쓰는 것: (i) 원자료 JSON → eval/private/census/(gitignore — 경로·상세 포함, 다음 회차 비교용) (ii) eval/CENSUS.md 에 **익명 행**(라벨만 —
// 경로·제목·파일명 0, status 는 첫 토큰만). 둘 다 `--write` 일 때만. 기본은 dry-run(표만 출력).
//
// 실행: node scripts/adopter-census.js [--repos eval/private/census-repos.json] [--write] [--json]
//   목록 파일: { "repos": [ { "label": "A", "path": "<로컬 체크아웃>" }, … ] } — 비공개(gitignore). 라벨 입도는 인간이 정한다([PRO-24] §9 ②).
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { buildIndex } = require('./zfs_index');
const { gather: gatherHealth } = require('./health');
const { gather: gatherWos } = require('./work-close');
const { plan: backfillPlan } = require('./frontmatter-backfill');
const { lint } = require('./zfs-linter');
const { upwardFetch, fetchOutcome } = require('./query');
const { load: loadAdapter, resolveSection } = require('./adapter');
const { parseChangelogVersion } = require('./template-update');
const ledger = require('./ledger');
const { withContract, OUTCOME } = require('./gate-contract');

const CONTRACT = {
  gate: 'Adopter Census Gate (adopter-census)',
  input: '비공개 목록의 형제 레포 경로 — 각 레포의 .union-stack 평면 frontmatter·계측기 존재·CHANGELOG 헤딩·template-sync.json (상류 도구를 root 인자로 읽는다)',
  predicate: '목록의 레포 1곳 이상이 측정된다. 측정 불가(.union-stack 없음)는 건너뛰고 보고한다',
  scope: '집계만 낸다 — 어답터 코드·문서 본문을 읽지 않고, 어답터 스크립트를 실행하지 않으며, 어답터에 파일을 쓰지 않는다. 익명 행에는 경로·제목·파일명이 없다. 판정·점수 없음([PRO-11] §4)',
  outcomes: ['PASS', 'CLARIFY'],
  failure_mode: '목록 없음·측정 0 → CLARIFY(3, 비차단). 측정 실패한 레포는 행에 "측정 실패"로 남긴다',
};

const REPOS_FILE = 'eval/private/census-repos.json';
const RAW_DIR = 'eval/private/census';
const OUT = 'eval/CENSUS.md';
const BLOCK_BEGIN = '<!-- census:rows -->';
// 어답터에 있을 수 있는 상류 계측기 — 존재만 본다(실행 안 함). 이름은 상류 도구명이라 제품 정보가 아니다.
// 배송 도구만([TOOL-34]) — 3회차 실측: 상류 전용 adopter-arm 이 남아 사본 없는 어답터가 9/10 으로 오보됐다.
const INSTRUMENTS = ['health.js', 'work-close.js', 'template-update.js', 'upward-fetch.js', 'blast-radius.js', 'ci.js',
  'frontmatter-backfill.js', 'transcript-stats.js', 'session-friction.js'];

/** WO 본문의 H2 헤딩 분포(순수) — 헤딩 줄만 센다([PRO-28] 재료: 한 의미에 표기 3~5종이라는 어답터 답변의 기계 계수). */
// 선두 번호('1. 목적')는 표기 변형이지 다른 절이 아니다 — 떼고 센다.
function headingDist(texts) {
  const dist = {};
  for (const t of texts) for (const m of String(t || '').matchAll(/^##\s+(.+?)\s*$/gm)) { const h = m[1].replace(/^\d+[.)]\s*/, '').replace(/\s+/g, ' '); dist[h] = (dist[h] || 0) + 1; }
  return dist;
}
const ACTIVE = new Set(['Draft', 'Active', 'Verifying']);
const DIST_CAP = 8;

/** 상태 문자열의 첫 토큰(순수) — 어답터의 산문 status(`Done (2026-01-01)`)를 어휘 하나로 접는다. */
function statusHead(s) { return s == null ? null : String(s).trim().split(/[\s(（—:：]/)[0] || null; } // 공백·괄호·대시·콜론 앞(어답터 실측 "Diagnosed(정정)")

/**
 * arithmeticFrom 추정(순수, [PRO-27] §7-3): 같은 숫자 머리에 PLAN 과 PRO 가 **둘 다** 있는 구간은 독립 채번의 징후다.
 * 제안 = 그런 머리의 최댓값 + 1(그 위부터 산술 상속). 충돌 구간이 없으면 0(전부 산술).
 */
function estimateArithmeticFrom(index) {
  const heads = new Map();
  for (const d of index) {
    const m = String(d.id).match(/^\d+/);
    if (!m) continue;
    const h = parseInt(m[0], 10);
    if (!heads.has(h)) heads.set(h, new Set());
    heads.get(h).add(d.domain);
  }
  const colliding = [...heads].filter(([, doms]) => doms.has('PLAN') && doms.has('PRO')).map(([h]) => h).sort((a, b) => a - b);
  return { colliding, suggested: colliding.length ? Math.max(...colliding) + 1 : 0 };
}

/** frontmatter 에 `upstream_candidate: true` 가 있는가(순수) — 본문은 보지 않는다. */
function isUpstreamCandidate(txt) {
  const fm = String(txt || '').match(/^(?:\s|<!--[\s\S]*?-->)*---\r?\n([\s\S]*?)\r?\n---/);
  return !!fm && /^\s*upstream_candidate:\s*true\s*$/m.test(fm[1]);
}

/** 로컬 날짜 YYYY-MM-DD(원장 날짜와 같은 기준 — UTC 가 아니다). */
function localDate(d = new Date()) { return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }

function readSafe(p) { try { return fs.readFileSync(p, 'utf8'); } catch { return null; } }
function dateOf(p) { try { return fs.statSync(p).mtime.toISOString().slice(0, 10); } catch { return null; } }

/** 한 레포 측정(읽기 전용). upstreamKeys: 상류 색인의 DOMAIN-ID 집합(충돌 계수용). 반환: 원자료(경로 포함 — 비공개). */
/**
 * 동기화 지연(순수, [PRO-29] ①): 어답터 앵커(받은 상류 블롭 sha) vs 상류 트리(origin/main 블롭 sha).
 * behind = 앵커에 있는 파일 중 상류가 그 뒤로 바뀐 것 · removed = 상류에서 사라진 것. 앵커 없음 = 판별 불가(0 아님, [ADR-23]).
 * lastCheck = 어답터 자기 확인 캐시(health upstream) — 병기만. upstreamBlobs(상류 전 이력 블롭 집합)가 있으면 foreign 을 가른다.
 */
function syncLag(syncJson, upstreamTree, upstreamBlobs = null) {
  if (!syncJson || typeof syncJson.blobs !== 'object' || !syncJson.blobs) return { anchor: false };
  const paths = Object.keys(syncJson.blobs);
  const lc = syncJson.lastCheck || null;
  const out = { anchor: true, ref: syncJson.ref || null, files: paths.length, behind: null, removed: null,
    lastCheck: lc ? { at: lc.at || null, updates: lc.updates === true, error: lc.error || null } : null };
  if (!upstreamTree) return out;
  // 앵커 값은 sha 문자열 또는 후보 배열(시딩 — 개행 이형 흡수, template-update gitBlobShas). 후보 중 하나라도 같으면 정합.
  const same = (a, up) => Array.isArray(a) ? a.includes(up) : a === up;
  const lagging = paths.filter(p => upstreamTree[p] && !same(syncJson.blobs[p], upstreamTree[p]));
  // foreign: 지연 중 앵커 값이 상류 이력 어디에도 없는 것 — 로컬 개조가 "정합"으로 시딩됐다(다음 --apply 가 개조를 덮는다). 이력 집합이 있을 때만.
  if (upstreamBlobs) {
    const foreign = lagging.filter(p => !(Array.isArray(syncJson.blobs[p]) ? syncJson.blobs[p] : [syncJson.blobs[p]]).some(x => upstreamBlobs.has(x)));
    out.foreign = foreign.length;
    out.behind = lagging.length - foreign.length;
  } else out.behind = lagging.length;
  out.removed = paths.filter(p => !upstreamTree[p]).length;
  return out;
}

/** 상류 트리(path → blob sha) — 어답터가 받을 수 있는 지점(origin/main), 없으면 HEAD. git 읽기만. */
function upstreamTreeOf(root) {
  for (const ref of ['origin/main', 'HEAD']) {
    try {
      const out = execFileSync('git', ['ls-tree', '-r', ref], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 64 * 1024 * 1024 });
      const tree = {};
      for (const line of out.split('\n')) { const m = line.match(/^\d+ blob ([0-9a-f]{40})\t(.+)$/); if (m) tree[m[2]] = m[1]; }
      return { ref, tree };
    } catch { /* 다음 ref */ }
  }
  return { ref: null, tree: null };
}

/** 상류 전 이력의 블롭 sha 집합(git 읽기만, 1회). 실패 = null(foreign 판별 생략). */
function upstreamBlobsOf(root) {
  try {
    const out = execFileSync('git', ['rev-list', '--all', '--objects'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'], maxBuffer: 512 * 1024 * 1024 });
    return new Set(out.split('\n').map(l => l.slice(0, 40)).filter(x => x.length === 40));
  } catch { return null; }
}

function measure(root, label, upstreamKeys = new Set(), opts = {}) {
  const raw = { label, path: root, measured: localDate() };
  if (!fs.existsSync(path.join(root, '.union-stack'))) { raw.error = '.union-stack 없음 — 측정 대상 아님'; return raw; }
  const adapter = loadAdapter(root);
  raw.adapter = { present: adapter.present, private: adapter.private, statusMapKeys: Object.keys(adapter.statusMap).length,
    evidenceFields: Object.keys(adapter.evidenceFields), arithmeticFrom: adapter.lineage.arithmeticFrom, warnings: adapter.warnings.length };
  const index = buildIndex(root);
  raw.docs = { total: index.length, byDomain: index.reduce((m, d) => { m[d.domain] = (m[d.domain] || 0) + 1; return m; }, {}) };
  raw.version = { changelog: parseChangelogVersion(readSafe(path.join(root, 'CHANGELOG.md'))) };
  const anchor = readSafe(path.join(root, '.union-stack/template-sync.json'));
  let ref = null;
  try { ref = anchor ? (JSON.parse(anchor).ref || null) : null; } catch { ref = '(파싱 실패)'; }
  raw.anchor = { present: !!anchor, ref, date: anchor ? dateOf(path.join(root, '.union-stack/template-sync.json')) : null };
  let syncJson = null;
  try { syncJson = anchor ? JSON.parse(anchor) : null; } catch { syncJson = null; }
  raw.sync = syncLag(syncJson, opts.upstreamTree || null, opts.upstreamBlobs || null);
  let scripts = [];
  try { scripts = fs.readdirSync(path.join(root, 'scripts')); } catch { /* 없음 */ }
  raw.instruments = { present: INSTRUMENTS.filter(f => scripts.includes(f)), missing: INSTRUMENTS.filter(f => !scripts.includes(f)),
    scripts: scripts.filter(f => f.endsWith('.js') && !f.endsWith('.test.js')).length, tests: scripts.filter(f => f.endsWith('.test.js')).length };
  const wos = gatherWos(root);
  // [PRO-28] §6 성공 바 — 필수 절 매칭률(활성 WO 기준). parseWo 가 adapter sections 맵·evidence 충족을 이미 반영한 missingSections 를 준다(읽기만).
  const act = wos.filter(w => !w.malformed && ACTIVE.has(w.status));
  const miss = k => act.filter(w => !(w.missingSections || []).includes(k)).length;
  raw.sections = { active: act.length, goal: miss('목표'), accept: miss('수용 기준'), evidence: miss('증거'), complete: act.filter(w => !(w.missingSections || []).length).length };
  // [PRO-28] §6 판정(바 유지 + 잔여 원인): 미해소 절의 원인 — 규칙 밖(H2 없음 · 절 부재) / 별칭 후보(미해소 헤딩이 있다) / evidence 소급(frontmatter 없음). 헤딩 줄만 읽는다.
  const residual = { noH2: 0, absent: 0, alias: 0, evidence: 0, unresolved: {} };
  for (const w of act) {
    const ms = w.missingSections || [];
    if (!ms.length) continue;
    const txt = readSafe(path.join(root, w.file)) || '';
    const heads = [...txt.matchAll(/^##\s+(.+?)\s*$/gm)].map(m => m[1].replace(/^\d+[.)]\s*/, '').replace(/\s+/g, ' '));
    const unresolved = heads.filter(h => !resolveSection(adapter, h));
    if (ms.includes('증거')) residual.evidence++;
    const structural = ms.filter(k => k !== '증거');
    if (structural.length) {
      if (!heads.length) residual.noH2++;
      else if (unresolved.length) { residual.alias++; for (const h of unresolved) residual.unresolved[h] = (residual.unresolved[h] || 0) + 1; }
      else residual.absent++;
    }
  }
  raw.residual = { ...residual, unresolved: Object.entries(residual.unresolved).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0])).map(([heading, n]) => ({ heading, n })) };
  const ok = wos.filter(w => !w.malformed);
  const dist = {};
  for (const w of ok) { const h = statusHead(w.status) || '(없음)'; dist[h] = (dist[h] || 0) + 1; }
  raw.wo = { total: wos.length, malformed: wos.filter(w => w.malformed).length, statusDist: dist,
    evidence: { value: ok.filter(w => w.evidence && !/^none\b/i.test(w.evidence)).length, none: ok.filter(w => w.evidence && /^none\b/i.test(w.evidence)).length,
      missing: ok.filter(w => !w.evidence).length }, closedBy: ok.filter(w => w.closed_by.length).length };
  raw.headings = headingDist(index.filter(d => d.domain === 'WO').map(d => readSafe(path.join(root, d.file))));
  const bf = backfillPlan(root);
  raw.backfill = { targets: bf.length, estimable: bf.filter(r => r.estimate).length };
  const v = lint(root);
  raw.naming = { duplicates: v.filter(x => /중복 ID/.test(x.hint || '')).length, violations: v.filter(x => !/중복 ID/.test(x.hint || '')).length };
  raw.collisions = index.filter(d => upstreamKeys.has(`${d.domain}-${d.id}`)).length;
  raw.arithmeticFrom = { current: adapter.lineage.arithmeticFrom, ...estimateArithmeticFrom(index) };
  const activeWos = index.filter(d => d.domain === 'WO' && ACTIVE.has(d.status));
  let vacuous = 0;
  for (const w of activeWos) if (fetchOutcome(upwardFetch(w.id, index, 'WO')).outcome === 'CLARIFY') vacuous++;
  raw.fetch = { active: activeWos.length, vacuous };
  raw.candidates = index.filter(d => d.domain === 'PRO' && isUpstreamCandidate(readSafe(path.join(root, d.file)))).map(d => `PRO-${d.id}`);
  raw.ledger = { adrs: (ledger.read(root).match(/^- \[\d{4}-\d{2}-\d{2}\]\[ADR-\d+\]:/gm) || []).length };
  try {
    const h = gatherHealth(root);
    raw.health = { fails: h.fails, dims: h.dims.map(d => ({ name: d.name, status: d.status })), planeKb: Math.round((h.sizes || []).reduce((s, x) => s + x.kb, 0)) };
  } catch (e) { raw.health = { error: String(e && e.message || e).split('\n')[0] }; }
  return raw;
}

/** 익명 행(순수) — 경로·제목·파일명 0. 집계 숫자와 상류 도구명·도메인명·ID 만. */
function anonymize(raw) {
  if (raw.error) return { label: raw.label, measured: raw.measured, error: raw.error };
  // 상태 분포는 상위 8종까지 — 어답터 실측 60종(1회차 C) — 나머지는 종·건수만(어휘 자체가 제품 정보를 흘릴 수 있어 표면을 줄인다).
  const entries = Object.entries(raw.wo.statusDist).sort((a, b) => b[1] - a[1]);
  const rest = entries.slice(DIST_CAP);
  const dist = entries.slice(0, DIST_CAP).map(([k, n]) => `${k} ${n}`).join(' · ') + (rest.length ? ` · 외 ${rest.length}종 ${rest.reduce((t, [, n]) => t + n, 0)}건` : '');
  const hEntries = Object.entries(raw.headings || {}).sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
  const hRest = hEntries.slice(DIST_CAP);
  const headings = hEntries.length ? hEntries.slice(0, DIST_CAP).map(([k, n]) => `${k} ${n}`).join(' · ') + (hRest.length ? ` · 외 ${hRest.length}종 ${hRest.reduce((t, [, n]) => t + n, 0)}건` : '') : '—';
  const health = raw.health.error ? `측정 실패` : `FAIL ${raw.health.fails}${raw.health.fails ? ' (' + raw.health.dims.filter(d => d.status === 'FAIL').map(d => d.name).join(' · ') + ')' : ''}`;
  return {
    label: raw.label, measured: raw.measured,
    version: `${raw.version.changelog || 'CHANGELOG 없음'} / 앵커 ${raw.anchor.present ? `${raw.anchor.ref || '?'} @ ${raw.anchor.date}` : '없음'}`,
    instruments: `${raw.instruments.present.length}/${INSTRUMENTS.length}${raw.instruments.missing.length ? ' — 없음: ' + raw.instruments.missing.map(f => f.replace(/\.js$/, '')).join(' · ') : ''}`,
    docs: `${raw.docs.total} (${Object.entries(raw.docs.byDomain).sort((a, b) => b[1] - a[1]).slice(0, 6).map(([k, n]) => `${k} ${n}`).join(' · ')})`,
    wo: `${raw.wo.total} · frontmatter 없음 ${raw.wo.malformed} · ${dist || '—'}`,
    evidence: `값 ${raw.wo.evidence.value} · none ${raw.wo.evidence.none} · 없음 ${raw.wo.evidence.missing} · closed_by ${raw.wo.closedBy}`,
    backfill: `${raw.backfill.targets} (추정 가능 ${raw.backfill.estimable})`,
    duplicates: `${raw.naming.duplicates} (네이밍 위반 ${raw.naming.violations})`,
    collisions: String(raw.collisions),
    arithmeticFrom: `${raw.arithmeticFrom.current} → 제안 ${raw.arithmeticFrom.suggested}${raw.arithmeticFrom.colliding.length ? ` (PLAN·PRO 동번호 ${raw.arithmeticFrom.colliding.length}구간)` : ''}`,
    fetch: `${raw.fetch.vacuous}/${raw.fetch.active} 공백`,
    candidates: raw.candidates.length ? `${raw.candidates.length} (${raw.candidates.join(', ')})` : '0',
    adapter: raw.adapter.present ? `statusMap ${raw.adapter.statusMapKeys} · evidenceFields ${raw.adapter.evidenceFields.join('/') || '없음'}${raw.adapter.private ? ' · private' : ''}` : '없음',
    sections: raw.sections ? (raw.sections.active ? `활성 ${raw.sections.active} · 목표 ${Math.round(100 * raw.sections.goal / raw.sections.active)}% · 수용 기준 ${Math.round(100 * raw.sections.accept / raw.sections.active)}% · 증거 ${Math.round(100 * raw.sections.evidence / raw.sections.active)}% · 3절 충족 ${raw.sections.complete}` : '활성 0') : '—',
    residual: raw.residual ? `H2 없음 ${raw.residual.noH2} · 절 부재 ${raw.residual.absent} · 별칭 후보 ${raw.residual.alias} · evidence 소급 ${raw.residual.evidence}${raw.residual.unresolved.length ? ' — 미해소 헤딩: ' + raw.residual.unresolved.slice(0, DIST_CAP).map(u => `${u.heading}(${u.n})`).join(' · ') + (raw.residual.unresolved.length > DIST_CAP ? ` · 외 ${raw.residual.unresolved.length - DIST_CAP}종` : '') : ''}` : '—',
    sync: !raw.sync ? '—' : !raw.sync.anchor ? '판별 불가(앵커 없음)'
      : `${raw.sync.behind == null ? '지연 ?(상류 트리 없음)' : `지연 ${raw.sync.behind}`} / 앵커 ${raw.sync.files}${raw.sync.removed ? ` · 상류 삭제 ${raw.sync.removed}` : ''}${raw.sync.foreign ? ` · ⚠ 이력 밖 앵커 ${raw.sync.foreign}` : ''}${raw.sync.lastCheck ? ` · 자기 확인 ${raw.sync.lastCheck.error && !raw.sync.lastCheck.at ? '실패' : raw.sync.lastCheck.updates ? '업데이트 있음' : '최신'} @ ${String(raw.sync.lastCheck.at || '').slice(0, 10) || '?'}` : ' · 자기 확인 없음'}`,
    headings, health, adrs: String(raw.ledger.adrs), planeKb: raw.health.planeKb != null ? String(raw.health.planeKb) : '—',
  };
}

const COLS = [
  ['label', '레포'], ['version', '버전 / 앵커'], ['sync', '동기화 지연(파일)'], ['instruments', '계측기'], ['docs', '문서'], ['wo', 'WO · 상태(첫 토큰)'], ['headings', 'WO H2 헤딩(상위 8)'], ['sections', '필수 절 매칭(활성 WO)'], ['residual', '잔여 원인'], ['evidence', 'evidence'],
  ['backfill', '백필 대상'], ['duplicates', '중복 ID'], ['collisions', '상류 ID 충돌'], ['arithmeticFrom', 'arithmeticFrom'], ['fetch', 'upward-fetch'],
  ['candidates', 'upstream_candidate'], ['adapter', 'adapter.json'], ['health', 'health'], ['adrs', 'ADR'], ['planeKb', '평면 KB'],
];

/** 표 렌더(순수). 한 회차 = 헤딩 + 표. */
function render(rows, meta) {
  const esc = s => String(s == null ? '—' : s).replace(/\|/g, '\\|');
  const head = `| ${COLS.map(c => c[1]).join(' | ')} |\n|${COLS.map(() => '---').join('|')}|`;
  const body = rows.map(r => r.error ? `| ${esc(r.label)} | 측정 실패 — ${esc(r.error)} |${' |'.repeat(COLS.length - 2)}` : `| ${COLS.map(c => esc(r[c[0]])).join(' | ')} |`).join('\n');
  return `### ${meta.date} — 상류 ${meta.upstreamVersion || '?'}${meta.sha ? ` @ ${meta.sha}` : ''} · 레포 ${rows.length}\n\n${head}\n${body}\n`;
}

/** 회차 블록 append(순수). 마커 아래에 최신 회차가 위로 쌓인다. 마커 없으면 null. */
function appendSection(md, section) {
  if (!md.includes(BLOCK_BEGIN)) return null;
  return md.replace(BLOCK_BEGIN, () => `${BLOCK_BEGIN}\n\n${section}`);
}

function upstreamMeta(root) {
  let sha = null;
  try { sha = execFileSync('git', ['rev-parse', '--short', 'HEAD'], { cwd: root, encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim(); } catch { /* git 없음 */ }
  return { date: localDate(), upstreamVersion: parseChangelogVersion(readSafe(path.join(root, 'CHANGELOG.md'))), sha };
}

function run(argv = process.argv.slice(2), root = path.resolve(__dirname, '..')) {
  const i = argv.indexOf('--repos');
  const listPath = i >= 0 && argv[i + 1] ? path.resolve(argv[i + 1]) : path.join(root, REPOS_FILE);
  let list;
  try { list = JSON.parse(fs.readFileSync(listPath, 'utf8')).repos; } catch { list = null; }
  if (!Array.isArray(list) || !list.length) {
    console.error(`adopter-census: 레포 목록이 없다 — ${path.relative(root, listPath) || listPath} 에 { "repos": [{ "label": "A", "path": "…" }] } (비공개, gitignore).`);
    return OUTCOME.CLARIFY;
  }
  const upstreamKeys = new Set(buildIndex(root).map(d => `${d.domain}-${d.id}`));
  const { tree: upstreamTree } = upstreamTreeOf(root);
  const upstreamBlobs = upstreamBlobsOf(root);
  const raws = list.map(r => {
    try { return measure(path.resolve(String(r.path || '')), String(r.label || '?'), upstreamKeys, { upstreamTree, upstreamBlobs }); }
    catch (e) { return { label: String(r.label || '?'), path: r.path, measured: localDate(), error: String(e && e.message || e).split('\n')[0] }; }
  });
  const rows = raws.map(anonymize);
  const meta = upstreamMeta(root);
  const measured = rows.filter(r => !r.error).length;
  if (argv.includes('--json')) { console.log(JSON.stringify({ meta, rows }, null, 2)); return measured ? OUTCOME.PASS : OUTCOME.CLARIFY; }
  const section = render(rows, meta);
  if (argv.includes('--write')) {
    const rawDir = path.join(root, RAW_DIR);
    fs.mkdirSync(rawDir, { recursive: true });
    for (const raw of raws) fs.writeFileSync(path.join(rawDir, `${meta.date}_${raw.label}.json`), JSON.stringify(raw, null, 2) + '\n');
    const outPath = path.join(root, OUT);
    const cur = readSafe(outPath);
    const next = cur == null ? null : appendSection(cur, section);
    if (next == null) { console.error(`adopter-census: ${OUT} 에 마커(${BLOCK_BEGIN})가 없다 — 파일과 마커를 먼저 만들어라.`); return OUTCOME.CLARIFY; }
    fs.writeFileSync(outPath, next);
    console.log(`adopter-census: ${OUT} 에 회차 append(레포 ${rows.length} · 측정 ${measured}) · 원자료 ${RAW_DIR}/ (비공개).`);
  } else {
    console.log(section);
    console.log(`(dry-run — ${OUT} 에 쓰려면 --write)`);
  }
  return measured ? OUTCOME.PASS : OUTCOME.CLARIFY;
}

module.exports = { localDate, DIST_CAP, statusHead, headingDist, estimateArithmeticFrom, isUpstreamCandidate, syncLag, upstreamTreeOf, upstreamBlobsOf, measure, anonymize, render, appendSection, run, CONTRACT, INSTRUMENTS, COLS, REPOS_FILE, RAW_DIR, OUT, BLOCK_BEGIN };

if (require.main === module) process.exit(withContract(CONTRACT, argv => run(argv))());
