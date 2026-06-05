// scripts/zfs_util.test.js
// 의존성 없는 순수 Node 테스트. 실행: node scripts/zfs_util.test.js
const { isValidName, parseId, isDescendant, ancestorChain } = require('./zfs_util');

let pass = 0, fail = 0;
function check(label, got, exp) {
  const ok = JSON.stringify(got) === JSON.stringify(exp);
  if (ok) pass++; else { fail++; console.error(`FAIL ${label}: got ${JSON.stringify(got)}, exp ${JSON.stringify(exp)}`); }
}

// --- 네이밍 검증 ---
const nameCases = [
  ['PLAN-01_example_auth.md', true],
  ['PLAN-01a_example_social.md', true],
  ['PLAN-01a1_example_oauth.md', true],
  ['WO-01a1-1_example_setup.md', true],
  ['FLOW-01a1_example_lineage.md', true],
  ['PLAN-01a1b2_example_deep.md', true],
  ['PLAN-01al_typo.md', false],     // l 금지
  ['PLAN-01o_typo.md', false],      // o 금지
  ['plan-01a_lower_domain.md', false],
  ['PLAN-a1_no_digit_start.md', false],
  ['PLAN-01a1_Bad-Slug.md', false],
  ['TOOLONGDOMAIN-01a_x.md', false],
];
for (const [n, e] of nameCases) check(`name(${n})`, isValidName(n), e);

// --- 자식/형제 판정 ---
const descCases = [
  ['01a1', '01a1', true],
  ['01a1', '01a1b2', true],
  ['01a1', '01a1-2', true],
  ['01a1', '01a10', false],   // 다른 숫자 노드 — 오인 차단
  ['01a', '01a1', true],
  ['01a', '01a2', true],
  ['01a', '01b1', false],     // 형제 계보
  ['01', '02', false],
  ['01', '01a', true],
  ['01', '011', false],
];
for (const [p, o, e] of descCases) check(`desc(${p},${o})`, isDescendant(p, o), e);

// --- 부모 체인 역산 ---
check('chain(01a1-2)', ancestorChain('01a1-2'), ['01a1-2', '01a1', '01a', '01']);
check('chain(01a1)',   ancestorChain('01a1'),   ['01a1', '01a', '01']);
check('chain(01a)',    ancestorChain('01a'),    ['01a', '01']);
check('chain(01)',     ancestorChain('01'),     ['01']);

// --- parseId ---
check('parseId(file)', parseId('WO-01a1-2_example_dto.md'), '01a1-2');
check('parseId(raw)',  parseId('01a1'), '01a1');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
