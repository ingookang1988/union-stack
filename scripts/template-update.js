#!/usr/bin/env node
// scripts/template-update.js
// 템플릿 업데이트 도구 — 어답터 레포가 상류(union-stack 템플릿)와의 버전·파일 드리프트를
// 확인하고 방법론 파일을 갱신한다. SPIKE-fdt D5("템플릿↔인스턴스가 조용히 갈라졌다 —
// 판별할 장치가 없다")가 진단한 공백의 계측기다.
//
// 설계:
//   · 버전 원천 = CHANGELOG.md의 최신 `## [x.y.z]` 헤딩. package.json은 init.js가 어답터
//     버전(0.1.0)으로 덮어쓰므로 템플릿 버전 마커가 못 된다. CHANGELOG는 init이 보존한다.
//   · 드리프트 판별 = git blob sha 비교(로컬은 crypto로 계산, 상류는 GitHub trees API가 제공)
//     — 파일을 내려받지 않고 판별한다. CRLF 작업트리 대비 LF 정규화 후 해시.
//   · 갱신 대상 = 방법론 파일만. **.union-stack/ 콘텐츠(어답터의 실제 문서)는 절대 건드리지
//     않는다.** sync(자동 갱신 가능)와 review(규범 — 보고만, 인간이 반영 판단) 이원 분류.
//   · init --drop-template-bits로 의도적으로 제거된 파일은 재추가하지 않는다.
//
// 종료 코드(gate-contract 의미론 재사용 — 이 도구는 게이트가 아니라 계측기):
//   0 = 최신 · 3(CLARIFY) = 업데이트 있음(비차단 정보) · 1 = 네트워크/실행 오류
//
// 실행:
//   node scripts/template-update.js              # 확인만(버전 + 드리프트 보고)
//   node scripts/template-update.js --apply      # sync 카테고리 갱신(review는 보고만)
//   node scripts/template-update.js --ref v6.1.0 # 특정 태그/브랜치 기준(기본 main)
//   node scripts/template-update.js --json
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { walkFiles } = require('./fs_walk');
const { OUTCOME } = require('./gate-contract');
const { TEMPLATE_BITS } = require('./init');

const UPSTREAM = 'ingookang1988/union-stack';
const API = `https://api.github.com/repos/${UPSTREAM}`;
const RAW = `https://raw.githubusercontent.com/${UPSTREAM}`;

// 카테고리 규칙 — 첫 매칭이 이긴다.
//   sync   : 실행 자산·이력 문서. 어답터 커스터마이즈 전제가 없어 자동 갱신 안전.
//   review : 규범·가이드. 어답터가 고쳤을 수 있고 상류 변경 = 규칙 변경이므로 인간이 diff를 보고 반영.
const SYNC_RULES = [
  /^scripts\/[^/]+\.js$/,
  /^\.github\/workflows\/harness\.yml$/,
  /^\.github\/workflows\/template-guard\.yml$/,
  /^CHANGELOG\.md$/, /^MIGRATION\.md$/, /^DESIGN_RATIONALE\.md$/,
];
const REVIEW_RULES = [
  /^AGENTS\.md$/, /^README(\.ko)?\.md$/, /^package\.json$/,
  /^\.union-stack\/.*_GUIDE\.md$/,
  /^eval\/(PROTOCOL|CALIBRATION)\.md$/,
];

/** 경로 → 'sync' | 'review' | null(템플릿 소유 아님 — 절대 안 건드림). 순수. */
function classifyPath(p) {
  if (SYNC_RULES.some(r => r.test(p))) return 'sync';
  if (REVIEW_RULES.some(r => r.test(p))) return 'review';
  return null;
}

/** CHANGELOG 본문 → 최신 릴리스 버전("## [x.y.z]" 첫 매칭, Unreleased 제외). 순수. */
function parseChangelogVersion(txt) {
  const m = String(txt || '').match(/^##\s*\[(\d+\.\d+\.\d+)\]/m);
  return m ? m[1] : null;
}

/** 버전 비교(숫자 세그먼트). a<b → -1, a==b → 0, a>b → 1. 순수. */
function cmpVersions(a, b) {
  const pa = String(a).split('.').map(Number), pb = String(b).split('.').map(Number);
  for (let i = 0; i < Math.max(pa.length, pb.length); i++) {
    const d = (pa[i] || 0) - (pb[i] || 0);
    if (d) return d < 0 ? -1 : 1;
  }
  return 0;
}

/** git blob sha1(원본 그대로). 순수. */
function gitBlobSha(content) {
  const buf = Buffer.from(String(content), 'utf8');
  return crypto.createHash('sha1')
    .update(`blob ${buf.length}\0`).update(buf).digest('hex');
}

/**
 * 로컬 해시 후보(원본 + LF 정규화, 중복 제거). 순수.
 * 개행만으로는 드리프트로 치지 않는다 — 상류 블롭이 CRLF로 커밋된 이력(예: harness.yml)과
 * autocrlf 작업트리가 만드는 가짜 변경을 양방향 모두 흡수한다(실측: 본 레포에서 발생).
 */
function gitBlobShas(content) {
  const lf = String(content).replace(/\r\n/g, '\n');
  return [...new Set([
    gitBlobSha(content),                      // 원본 그대로
    gitBlobSha(lf),                           // 상류 블롭이 LF일 때
    gitBlobSha(lf.replace(/\n/g, '\r\n')),    // 상류 블롭이 CRLF일 때(예: harness.yml 이력)
  ])];
}

/**
 * 드리프트 계획(순수): {local: {path→sha|sha[]}, upstream: {path→sha}} → 변경/신규/상류삭제 목록.
 * 로컬 값이 배열이면 후보 중 하나만 일치해도 동일로 본다(개행 이형 흡수 — gitBlobShas).
 * 신규 중 TEMPLATE_BITS(init --drop-template-bits 제거 대상)는 dropped로 분리 — 재추가 안 함.
 */
function buildPlan(local, upstream) {
  const plan = { changedSync: [], changedReview: [], newSync: [], newReview: [], removedUpstream: [], dropped: [] };
  for (const [p, sha] of Object.entries(upstream)) {
    const cat = classifyPath(p);
    if (!cat) continue;
    if (!(p in local)) {
      if (TEMPLATE_BITS.includes(p)) { plan.dropped.push(p); continue; }
      plan[cat === 'sync' ? 'newSync' : 'newReview'].push(p);
    } else if (!(Array.isArray(local[p]) ? local[p] : [local[p]]).includes(sha)) {
      plan[cat === 'sync' ? 'changedSync' : 'changedReview'].push(p);
    }
  }
  for (const p of Object.keys(local)) {
    if (classifyPath(p) && !(p in upstream)) plan.removedUpstream.push(p);
  }
  return plan;
}

/** 상류 CHANGELOG에서 (from, to] 구간의 ⚠(마이그레이션 필요) 줄을 뽑는다. 순수. */
function migrationActions(changelogTxt, fromVer, toVer) {
  const out = [];
  let inRange = false;
  for (const line of String(changelogTxt || '').split(/\r?\n/)) {
    const h = line.match(/^##\s*\[([^\]]+)\]/);
    if (h) {
      const v = h[1];
      if (v === 'Unreleased') { inRange = false; continue; }
      inRange = (!toVer || cmpVersions(v, toVer) <= 0) && (!fromVer || cmpVersions(v, fromVer) > 0);
      continue;
    }
    if (inRange && line.includes('⚠')) out.push(line.trim());
  }
  return out;
}

// --- 로컬/네트워크 어댑터 (얇음) ---
function localTemplateFiles(root) {
  const out = {};
  const record = rel => {
    const cat = classifyPath(rel);
    if (!cat) return;
    try { out[rel] = gitBlobShas(fs.readFileSync(path.join(root, rel), 'utf8')); } catch { /* 바이너리/삭제 경합 무시 */ }
  };
  ['scripts', '.github/workflows', 'eval', '.union-stack'].forEach(d => walkFiles(root, d, record));
  ['AGENTS.md', 'README.md', 'README.ko.md', 'package.json', 'CHANGELOG.md', 'MIGRATION.md', 'DESIGN_RATIONALE.md']
    .forEach(f => { if (fs.existsSync(path.join(root, f))) record(f); });
  return out;
}

async function fetchText(url) {
  const r = await fetch(url, { headers: { 'user-agent': 'union-stack-template-update' } });
  if (!r.ok) throw new Error(`HTTP ${r.status} — ${url}`);
  return r.text();
}

async function fetchUpstream(ref) {
  const tree = JSON.parse(await fetchText(`${API}/git/trees/${encodeURIComponent(ref)}?recursive=1`));
  if (tree.truncated) console.error('경고: 상류 트리가 잘렸음(truncated) — 드리프트 판별이 불완전할 수 있음.');
  const shaByPath = {};
  for (const t of tree.tree || []) if (t.type === 'blob') shaByPath[t.path] = t.sha;
  return shaByPath;
}

async function applyPlan(root, ref, plan) {
  const targets = [...plan.changedSync, ...plan.newSync];
  for (const p of targets) {
    const txt = await fetchText(`${RAW}/${encodeURIComponent(ref)}/${p}`);
    const abs = path.join(root, p);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, txt);
    console.log(`  ✓ 갱신: ${p}`);
  }
  return targets.length;
}

async function main(argv = process.argv.slice(2)) {
  const root = path.resolve(__dirname, '..');
  const apply = argv.includes('--apply');
  const json = argv.includes('--json');
  const ri = argv.indexOf('--ref');
  const ref = ri >= 0 ? argv[ri + 1] : 'main';

  const localChangelog = fs.existsSync(path.join(root, 'CHANGELOG.md'))
    ? fs.readFileSync(path.join(root, 'CHANGELOG.md'), 'utf8') : '';
  const localVer = parseChangelogVersion(localChangelog);

  let upstreamChangelog, upstreamMap;
  try {
    [upstreamChangelog, upstreamMap] = await Promise.all([
      fetchText(`${RAW}/${encodeURIComponent(ref)}/CHANGELOG.md`),
      fetchUpstream(ref),
    ]);
  } catch (e) {
    console.error(`상류 조회 실패: ${e.message}\n(네트워크/레이트리밋 확인. 오프라인이면 이 도구는 판단 불가 — 추측하지 않는다.)`);
    return OUTCOME.REJECT;
  }
  const upstreamVer = parseChangelogVersion(upstreamChangelog);
  const plan = buildPlan(localTemplateFiles(root), upstreamMap);
  const drift = plan.changedSync.length + plan.changedReview.length + plan.newSync.length + plan.newReview.length;
  const migrations = migrationActions(upstreamChangelog, localVer, upstreamVer);

  if (json) {
    console.log(JSON.stringify({ ref, localVer, upstreamVer, plan, migrations, applied: false }, null, 2));
    return drift ? OUTCOME.CLARIFY : OUTCOME.PASS;
  }

  console.log(`# union-stack 템플릿 업데이트 확인 (상류: ${UPSTREAM}@${ref})\n`);
  console.log(`  로컬 버전   : ${localVer || '판별 불가(CHANGELOG.md 없음/헤딩 없음)'}`);
  console.log(`  상류 버전   : ${upstreamVer || '판별 불가'}`);
  if (localVer && upstreamVer) {
    const c = cmpVersions(localVer, upstreamVer);
    console.log(`  버전 판정   : ${c === 0 ? '동일' : c < 0 ? '업데이트 있음 ↑' : '로컬이 앞섬(포크 개발 중?)'}`);
  }
  const list = (label, arr) => { if (arr.length) { console.log(`\n  ${label}:`); arr.forEach(p => console.log(`    · ${p}`)); } };
  list('변경된 sync 파일(자동 갱신 가능)', plan.changedSync);
  list('상류 신규 sync 파일', plan.newSync);
  list('변경된 review 파일(규범 — diff를 보고 인간이 반영)', plan.changedReview);
  list('상류 신규 review 파일', plan.newReview);
  list('상류에서 사라진 파일(수동 정리 검토)', plan.removedUpstream);
  if (plan.dropped.length) console.log(`\n  (drop-template-bits 제거분 ${plan.dropped.length}건은 재추가하지 않음)`);
  if (migrations.length) {
    console.log('\n  ⚠ 마이그레이션 필요 항목(상류 CHANGELOG):');
    migrations.forEach(l => console.log(`    ${l}`));
    console.log('    → 적용 절차: MIGRATION.md §"Upgrading from an older union-stack"');
  }

  if (!drift) { console.log('\n최신 상태 — 드리프트 없음.'); return OUTCOME.PASS; }
  if (apply) {
    console.log('\n적용(sync만 — review·.union-stack 콘텐츠는 건드리지 않음):');
    const n = await applyPlan(root, ref, plan);
    console.log(`\n${n}개 파일 갱신. 검증: node scripts/health.js && 테스트 실행. review ${plan.changedReview.length + plan.newReview.length}건은 수동 반영.`);
    return OUTCOME.CLARIFY;
  }
  console.log('\n갱신하려면: node scripts/template-update.js --apply  (sync만 자동, review는 보고만)');
  return OUTCOME.CLARIFY;
}

module.exports = { classifyPath, parseChangelogVersion, cmpVersions, gitBlobSha, gitBlobShas, buildPlan, migrationActions, UPSTREAM };

if (require.main === module) main().then(c => process.exit(c), e => { console.error(e); process.exit(OUTCOME.REJECT); });
