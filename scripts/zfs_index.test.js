// scripts/zfs_index.test.js
// 통합 테스트: 실제 레포의 예시 문서를 색인이 제대로 수집·파싱하는지.
// (FS 의존이라 zfs_util.test.js와 분리.) 실행: node scripts/zfs_index.test.js
const { buildIndex } = require('./zfs_index');

let pass = 0, fail = 0;
function check(label, cond) {
  if (cond) pass++; else { fail++; console.error(`FAIL ${label}`); }
}

const index = buildIndex();
const byFileDomain = (domain, id) => index.find(d => d.domain === domain && d.id === id);

// 각 디렉터리의 대표 예시가 색인에 잡히는가
check('FLOW-01a 수집', !!byFileDomain('FLOW', '01a'));
check('PLAN-01 수집', !!byFileDomain('PLAN', '01'));
check('PHASE-01 수집(project/roadmap)', !!byFileDomain('PHASE', '01'));
check('PRO-01 수집(proposals)', !!byFileDomain('PRO', '01'));
check('LSN-01a 수집', !!byFileDomain('LSN', '01a'));

// status frontmatter 파싱
check('PLAN-01 status=Draft', byFileDomain('PLAN', '01')?.status === 'Draft');
check('FLOW-01a status=Active', byFileDomain('FLOW', '01a')?.status === 'Active');
check('PRO-01 status=Rejected', byFileDomain('PRO', '01')?.status === 'Rejected');

// 가이드·매니페스트(_GUIDE.md 등)는 색인에서 제외
check('가이드 제외', !index.some(d => /_GUIDE\.md$/.test(d.file)));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
