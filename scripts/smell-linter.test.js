// scripts/smell-linter.test.js
// 순수 로직(findSmells) + 실레포 통합(gather). 실행: node scripts/smell-linter.test.js
const { findSmells, gather, MAX_CHARS } = require('./smell-linter');

let pass = 0, fail = 0;
function check(label, cond) { if (cond) pass++; else { fail++; console.error(`FAIL ${label}`); } }

const GOOD = '---\nid: TOOL-99\ntitle: t\nkind: script\nimpl: x.js\n---\n# t\n\n## 용도\nx\n\n## 언제 쓰나\nx\n\n## 언제 쓰지 않나\nx\n\n## 호출\n```bash\nx\n```\n';

check('건전 카드 → smell 0', findSmells(GOOD).length === 0);
check('용도 절 없음', findSmells(GOOD.replace('## 용도', '## 목적')).some(s => s.code === 'no-purpose'));
check('부정 스코프 없음', findSmells(GOOD.replace('## 언제 쓰지 않나', '## 기타')).some(s => s.code === 'no-negative-scope'));
check('호출 절 없음', findSmells(GOOD.replace('## 호출', '## 사용')).some(s => s.code === 'no-invocation'));
check('kind 없음', findSmells(GOOD.replace('kind: script\n', '')).some(s => s.code === 'no-kind'));
check('비대 카드', findSmells(GOOD + 'x'.repeat(MAX_CHARS)).some(s => s.code === 'bloat'));
check('빈 텍스트 = 다중 smell', findSmells('').length >= 3);

// --- 실레포 통합: 카탈로그 전 카드가 해부 충족 ---
const cards = gather();
if (cards.length) check('실레포 카드 전부 smell 0', cards.every(c => c.smells.length === 0));
else console.log('(tools 평면 비어 있음: 픽스처 검사 건너뜀)');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
