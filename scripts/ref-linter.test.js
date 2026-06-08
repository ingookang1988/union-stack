// scripts/ref-linter.test.js
// 순수 함수(extractRefs, findBroken) 단위 + gather 스모크. 실행: node scripts/ref-linter.test.js
const { extractRefs, findBroken, gather } = require('./ref-linter');

let pass = 0, fail = 0;
function check(label, cond) { if (cond) pass++; else { fail++; console.error(`FAIL ${label}`); } }

// extractRefs
const refs = extractRefs('see [PLAN-01a] and [CON-01], also [WO-01a-2]. not [TODO] or [a link](x).');
check('extract count', refs.length === 3);
check('extract raws', JSON.stringify(refs.map(r => r.raw)) === JSON.stringify(['PLAN-01a', 'CON-01', 'WO-01a-2']));
check('no false [TODO]', !refs.some(r => r.domain === 'TODO'));

// findBroken
const known = new Set(['PLAN-01a', 'CON-01']);
const broken = findBroken(extractRefs('[PLAN-01a] [CON-01] [FLOW-09z] [FLOW-09z]'), known);
check('broken = FLOW-09z (deduped)', broken.length === 1 && broken[0].raw === 'FLOW-09z');
check('known resolve', findBroken(extractRefs('[PLAN-01a]'), known).length === 0);

// gather smoke (현재 레포 — 배열 반환, 예외 없이)
const g = gather();
check('gather returns array', Array.isArray(g));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
