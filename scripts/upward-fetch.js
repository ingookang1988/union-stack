#!/usr/bin/env node
// scripts/upward-fetch.js
// 작업 진입 의식(Upward Fetching). 부모 PHASE/PLAN/FLOW/CON/ARCH/MTG + 같은 계보 LSN.
// 로직은 query.js(순수)에 있다. 실행: node scripts/upward-fetch.js WO-01a1-2 [--json]
// 종료코드([PRO-11] 계약): 0 = 맥락 있음 · 3 = CLARIFY(맥락 0건 — 차단 아님, 질문 병기) · 2 = 인자 오류.
const { parseId, isUpstreamRef } = require('./zfs_util');
const { buildIndex } = require('./zfs_index');
const { upwardFetch, fetchOutcome } = require('./query');
const { OUTCOME } = require('./gate-contract');

const args = process.argv.slice(2);
const json = args.includes('--json');
const arg = args.find(a => !a.startsWith('--'));
if (!arg) { console.error('사용법: node scripts/upward-fetch.js <ID|파일명> [--json]'); process.exit(2); }
// 상류 참조([PRO-27] ①) — 로컬 색인에서 해소하지 않는다. 상류 문서는 상류 레포에서 읽는다.
if (isUpstreamRef(arg)) {
  if (json) { console.log(JSON.stringify({ id: arg, external: true, context: [], lessons: [] }, null, 2)); process.exit(0); }
  console.log(`# Upward Fetching: ${arg}\n  INFO: 상류 참조(up:) — 로컬 색인에서 해소하지 않는 외부 참조다([PRO-27] ①). 상류 레포에서 읽어라.`);
  process.exit(0);
}
const id = parseId(arg);
if (!id) { console.error(`ZFS ID를 해석할 수 없음: ${arg}`); process.exit(2); }

const r = upwardFetch(id, buildIndex());
const o = fetchOutcome(r);
const exitCode = o.outcome === 'CLARIFY' ? OUTCOME.CLARIFY : OUTCOME.PASS;
if (json) { console.log(JSON.stringify({ ...r, outcome: o.outcome, question: o.question }, null, 2)); process.exit(exitCode); }

// 비규범 배너([PRO-12]): tier:draft 문서는 주입하되 구속력 없음을 명시(기본 제외가 아님 —
// 방금 위임받아 쓴 초안이 다음 세션에 안 보이는 컨텍스트 기아를 막는다).
const banner = d => (d.tier === 'draft' ? '  ⚠ tier:draft — 비규범(구속력 없음)' : '');

console.log(`# Upward Fetching: ${r.id}`);
console.log(`계보(조상 역산): ${r.chain.join(' → ')}\n`);
console.log('## 공간 맥락 (부모 PHASE/PLAN/FLOW/CON/ARCH/MTG)');
if (r.context.length) r.context.forEach(d => console.log(`  [${d.domain}-${d.id}] ${d.file}${banner(d)}`));
else console.log('  (없음)');
console.log('\n## 시간축 경고 (같은 계보의 LSN — 과거 반복 실패)');
if (r.lessons.length) r.lessons.forEach(d => console.log(`  ⚠ [${d.domain}-${d.id}] ${d.file}${banner(d)}`));
else console.log('  (없음)');
// 빈 맥락은 통과가 아니다 — 질문 한 줄 병기 후 CLARIFY(3)로 끝낸다([PRO-27] ③ · [PRO-22] 2-bis 와 같은 결함 클래스).
if (o.outcome === 'CLARIFY') console.error(`\nCLARIFY: ${o.question}`);
process.exit(exitCode);
