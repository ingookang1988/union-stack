#!/usr/bin/env node
// scripts/health.js
// 하네스 자가 건강진단 — "조견표의 코드화". 게이트 상태 + 구조 지표를 자동 산출한다.
// read-only·zero-dep. 실행: node scripts/health.js [--json]
// (true A/B eval은 템플릿 단독으론 불가 — 대신 *자기 준수도*를 지속 측정한다.)
const fs = require('fs');
const path = require('path');
const { VALID_DOMAINS } = require('./zfs_util');
const { buildIndex } = require('./zfs_index');
const { lint } = require('./zfs-linter');
const { findViolations: historyViolationsOf } = require('./history-linter');
const { collectFiles, isSanitized } = require('./leakage-guard');
const { walkFiles } = require('./fs_walk');
const { gather: gatherBrokenRefs } = require('./ref-linter');
const { gather: gatherBudget } = require('./context-budget');

const { withContract } = require('./gate-contract');

const LOCKED = ['Verifying'];
const SIZE_CAP_KB = 30; // soft cap — 초과 시 분할/로테이션 권고

// 계약 선언([PRO-11] — [GRAM-12c] 꼴).
const CONTRACT = {
  gate: 'Health Scorecard Gate (health) — 집계',
  input: '각 게이트의 순수 함수 재호출 결과 + .union-stack/ 구조 지표(크기·참조·예산·잠금·sync·lessons·tier·effect surface)',
  predicate: '개별 게이트 FAIL 0건이면 건강. sync·lessons·tier 절은 판정 없는 관측 병치([PRO-11] §4 측도 금지)',
  scope: '자기 준수도만 잰다 — 하네스 효능(true A/B)은 eval/PROTOCOL.md 소관. 관측 절은 stale "판정"을 하지 않는다',
  outcomes: ['PASS', 'REJECT'],
  failure_mode: '게이트 FAIL 존재 시 REJECT(차단). WARN·INFO는 비차단 표면화',
};

// 동기화 관측 대상 평면([PRO-11] C3 — 최종 기입 시각과 ledger 증가분의 "병치"만, 점수 없음).
const SYNC_PLANES = [
  { name: 'gap', rel: '.union-stack/verification/derived/gap.md' },
  { name: 'state', rel: '.union-stack/verification/derived/state.md' },
  { name: 'evidence', rel: '.union-stack/verification/raw/evidence.md' },
  { name: 'live', rel: '.union-stack/feature/live.md' },
];
const LEDGER = '.union-stack/archive_ledger.md';
const LESSONS_DIR = '.union-stack/reference/lessons';

// 효과 표면(갭 분석 §3-C) — 비가역 외부 효과는 평면이 아니라 에이전트 설정의 문자열 allowlist가 다스린다.
// [ADR-08]의 논리는 "훅으로 *강제*하지 않는다"였지 "*관측*하지 않는다"가 아니었다. 그래서 게이트가 아니라 관측 1절이다.
const EFFECT_SETTINGS = ['.claude/settings.json', '.claude/settings.local.json'];

/** 본문에서 가장 늦은 YYYY-MM-DD를 뽑는다(순수). 없으면 null — "무기입"으로 표기된다. */
function lastDateIn(txt) {
  const ds = String(txt || '').match(/\b20\d{2}-\d{2}-\d{2}\b/g);
  return ds && ds.length ? ds.sort().pop() : null;
}

/** 순수 계산: 1차 지표 → 차원별 평가 리포트. (FS 비의존 → 테스트 용이) */
function computeHealth({ index, domainsDefined, guideCount, namingViolations, historyViolations, leakageViolations, oversize = [], brokenRefs = 0, budget = null, sync = null, lessons = null, effect = null }) {
  const used = new Set(index.map(d => d.domain));
  const unused = domainsDefined.filter(d => !used.has(d));
  const locked = index.filter(d => LOCKED.includes(d.status));
  const byDomain = {};
  index.forEach(d => { byDomain[d.domain] = (byDomain[d.domain] || 0) + 1; });

  const dims = [
    { name: 'naming gate', status: namingViolations === 0 ? 'OK' : 'FAIL', value: `${namingViolations} violations` },
    { name: 'history gate', status: historyViolations === 0 ? 'OK' : 'FAIL', value: `${historyViolations} violations` },
    { name: 'leakage gate', status: leakageViolations === 0 ? 'OK' : 'FAIL', value: `${leakageViolations} unmarked` },
    { name: 'domain utilization', status: unused.length > 6 ? 'WARN' : 'OK',
      value: `${used.size}/${domainsDefined.length} used`, note: unused.length ? `unused: ${unused.join(' ')}` : '' },
    { name: 'doc/guide ratio', status: 'INFO', value: `${index.length} ZFS docs / ${guideCount} guides` },
    { name: 'file size', status: oversize.length ? 'WARN' : 'OK',
      value: `${oversize.length} > ${SIZE_CAP_KB}KB`, note: oversize.map(o => `${o.file}:${o.kb}KB`).join(' ') },
    { name: 'ref integrity', status: 'INFO', value: `${brokenRefs} unresolved bracket refs (advisory)` },
    { name: 'context budget', status: budget && budget.over ? 'WARN' : 'OK',
      value: budget ? `${budget.total}/${budget.totalCap} tok bootstrap` : 'n/a',
      note: budget && budget.over ? budget.rows.filter(r => r.status === 'OVER').map(r => `${r.name}:${r.tokens}>${r.budget}`).join(' ') : '' },
    { name: 'lock exposure', status: locked.length ? 'WARN' : 'OK',
      value: `${locked.length} Verifying`, note: locked.map(l => `${l.domain}-${l.id}`).join(' ') },
  ];
  // 관측 절([PRO-11]·[PRO-12]) — 전부 INFO. 판정·점수를 만들지 않는다(측도 금지, [AXIOM-27] 취지).
  if (sync) {
    dims.push({ name: 'plane sync', status: 'INFO',
      value: `ledger ${sync.ledgerEntries} entries, last ${sync.ledgerLast || '무기입'}`,
      note: sync.planes.map(p => `${p.name}:${p.last || '무기입'}`).join(' ') });
  }
  if (lessons) {
    dims.push({ name: 'lessons lifecycle', status: 'INFO',
      value: `${lessons.total} LSN`,
      note: `status없음:${lessons.unmarked} 조건부(valid_reason):${lessons.conditional}` });
  }
  if (effect) {
    dims.push({ name: 'effect surface', status: 'INFO',
      value: effect.files.length
        ? `allow ${effect.allow} · deny ${effect.deny} · ask ${effect.ask} · wildcard ${effect.wildcard}`
        : '설정 파일 없음 — 관측 불가',
      note: effect.files.length
        ? Object.entries(effect.byTool).map(([t, n]) => `${t}:${n}`).join(' ') + '  ← ' + effect.files.join(' ')
        : '' });
  }
  const tiers = { draft: 0, reviewed: 0, ratified: 0, untagged: 0 };
  index.forEach(d => { tiers[d.tier && tiers[d.tier] !== undefined ? d.tier : 'untagged']++; });
  dims.push({ name: 'tier distribution', status: 'INFO',
    value: `draft:${tiers.draft} reviewed:${tiers.reviewed} ratified:${tiers.ratified} untagged:${tiers.untagged}` });
  const fails = dims.filter(d => d.status === 'FAIL').length;
  const warns = dims.filter(d => d.status === 'WARN').length;
  return { dims, byDomain, fails, warns, healthy: fails === 0 };
}

function countGuides(root) {
  let n = 0;
  walkFiles(root, '.union-stack', rel => { if (rel.endsWith('/_GUIDE.md')) n++; });
  return n;
}

function gather(root = path.resolve(__dirname, '..')) {
  const index = buildIndex(root);
  const namingViolations = lint(root).length;
  const hp = path.join(root, '.union-stack/project/HISTORY.md');
  const historyViolations = fs.existsSync(hp) ? historyViolationsOf(fs.readFileSync(hp, 'utf8')).length : 0;
  const leakageViolations = collectFiles(root)
    .filter(rel => !isSanitized(rel, fs.readFileSync(path.join(root, rel), 'utf8'))).length;
  // 크기는 *전부* 수집하고 초과분만 게이트로 넘긴다. 상한 근접(append-only 원장 등)은
  // 불리언 게이트가 넘는 순간에만 말하므로, 헤드룸을 보려면 분포가 필요하다(대시보드 소비).
  const sizes = [];
  walkFiles(root, '.union-stack', rel => {
    if (!rel.endsWith('.md')) return;
    let kb = 0;
    try { kb = +(fs.statSync(path.join(root, rel)).size / 1024).toFixed(1); } catch { return; }
    sizes.push({ file: rel, kb });
  });
  sizes.sort((a, b) => b.kb - a.kb);
  const oversize = sizes.filter(s => s.kb > SIZE_CAP_KB).map(s => ({ file: s.file, kb: Math.round(s.kb) }));
  const brokenRefs = gatherBrokenRefs(root).length;
  const budget = gatherBudget(root);
  const sync = gatherSync(root);
  const r = computeHealth({
    index, domainsDefined: [...VALID_DOMAINS], guideCount: countGuides(root),
    namingViolations, historyViolations, leakageViolations, oversize, brokenRefs, budget,
    sync, lessons: gatherLessons(root), effect: gatherEffectSurface(root),
  });
  // 판정(dims) 외에 원자료도 함께 낸다 — 대시보드가 같은 수집을 두 번 하지 않도록(합성 원칙).
  return { ...r, sizes, sizeCapKb: SIZE_CAP_KB, sync };
}

/** 평면별 최종 기입 날짜 + ledger 항목 수를 모은다(관측만 — [PRO-11] C3). */
function gatherSync(root) {
  const readIf = rel => { try { return fs.readFileSync(path.join(root, rel), 'utf8'); } catch { return ''; } };
  const planes = SYNC_PLANES.map(p => ({ name: p.name, last: lastDateIn(readIf(p.rel)) }));
  const ledgerTxt = readIf(LEDGER);
  const ledgerEntries = new Set(ledgerTxt.match(/ADR-\d+/g) || []).size;
  return { planes, ledgerEntries, ledgerLast: lastDateIn(ledgerTxt) };
}

/**
 * 권한 규칙 목록 → 효과 표면 계수(순수). entriesByFile: {경로: {allow,deny,ask}}.
 * 의미 분류(어느 규칙이 위험한가)는 하지 않는다 — 규칙 목록 자체가 평면 밖이라 등급을 매길 근거가 없다.
 * 구조만 센다: 몇 개인가 · 도구별로 몇 개인가 · 몇 개가 와일드카드(prefix 매칭이라 경계가 흐린 것)인가.
 * 도구 이름은 **규칙에서 도출**한다 — 목록을 박으면 새 효과 표면(PowerShell·WebFetch…)이 조용히 누락된다.
 */
function computeEffectSurface(entriesByFile = {}) {
  const out = { files: [], allow: 0, deny: 0, ask: 0, wildcard: 0, byTool: {} };
  for (const [file, perms] of Object.entries(entriesByFile)) {
    out.files.push(file);
    for (const k of ['allow', 'deny', 'ask']) out[k] += (perms && perms[k] ? perms[k].length : 0);
    for (const rule of (perms && perms.allow) || []) {
      const m = String(rule).match(/^([A-Za-z_][A-Za-z_0-9]*)\(/);
      const tool = m ? m[1] : '(무형식)';
      out.byTool[tool] = (out.byTool[tool] || 0) + 1;
      if (String(rule).includes('*')) out.wildcard++;
    }
  }
  out.byTool = Object.fromEntries(Object.entries(out.byTool).sort((a, b) => b[1] - a[1]));
  return out;
}

/** 에이전트 설정의 권한 목록을 읽어 계수한다(관측만 — 판정·차단 없음). */
function gatherEffectSurface(root) {
  const byFile = {};
  for (const rel of EFFECT_SETTINGS) {
    const abs = path.join(root, rel);
    if (!fs.existsSync(abs)) continue;
    try { byFile[rel] = (JSON.parse(fs.readFileSync(abs, 'utf8')) || {}).permissions || {}; }
    catch { byFile[rel] = {}; } // 파싱 실패도 관측 결과다 — 규칙 0으로 세고 파일명은 남긴다
  }
  return computeEffectSurface(byFile);
}

/** LSN frontmatter의 status·valid_reason 표면화([PRO-11] C2 축소형 — 기존 필드를 읽기만). */
function gatherLessons(root) {
  const out = { total: 0, unmarked: 0, conditional: 0 };
  walkFiles(root, LESSONS_DIR, rel => {
    if (!rel.endsWith('.md') || rel.endsWith('_GUIDE.md')) return;
    out.total++;
    let txt = '';
    try { txt = fs.readFileSync(path.join(root, rel), 'utf8'); } catch { return; }
    const fm = txt.match(/^(?:\s|<!--[\s\S]*?-->)*---\r?\n([\s\S]*?)\r?\n---/);
    const body = fm ? fm[1] : '';
    if (!/^\s*status:/m.test(body)) out.unmarked++;
    if (/^\s*valid_reason:/m.test(body)) out.conditional++;
  });
  return out;
}

function run(root) {
  const r = gather(root);
  if (process.argv.includes('--json')) { console.log(JSON.stringify(r, null, 2)); return r.fails ? 1 : 0; }
  console.log('# union-stack health\n');
  for (const d of r.dims) {
    const mark = d.status === 'OK' ? '✓' : d.status === 'FAIL' ? '✗' : d.status === 'WARN' ? '!' : '·';
    console.log(`  ${mark} ${d.name.padEnd(20)} ${d.status.padEnd(5)} ${d.value}${d.note ? '  (' + d.note + ')' : ''}`);
  }
  console.log(`\n도메인 분포: ${Object.entries(r.byDomain).map(([k, v]) => `${k}:${v}`).join(' ')}`);
  console.log(r.healthy ? '\n건강: 게이트 전부 통과.' : `\n건강: 게이트 ${r.fails}건 실패 — 확인 필요.`);
  return r.fails ? 1 : 0;
}

module.exports = { computeHealth, gather, gatherSync, gatherLessons, computeEffectSurface, gatherEffectSurface, lastDateIn, CONTRACT };

if (require.main === module) process.exit(withContract(CONTRACT, () => run())());
