// scripts/eval.test.js
// 순수 computeScorecard 단위 + gather 스모크. 실행: node scripts/eval.test.js
const { computeScorecard, gather } = require('./eval');

let pass = 0, fail = 0;
function check(label, cond) { if (cond) pass++; else { fail++; console.error(`FAIL ${label}`); } }

const budgetOK = { total: 1000, totalCap: 4000, over: 0 };
const budgetOver = { total: 5000, totalCap: 4000, over: 1 };

// 풍부한 평면: CON 있고, LSN이 PLAN 계보에 앵커됨, HISTORY 1행, 예산 OK → 결손 0
const rich = computeScorecard({
  index: [
    { domain: 'CON', id: '01' },
    { domain: 'PLAN', id: '01a' },
    { domain: 'LSN', id: '01a1' }, // 조상 01a가 PLAN으로 존재 → 앵커됨
  ],
  budget: budgetOK, historyRows: 2,
});
check('rich healthy', rich.healthy === true && rich.gaps === 0);
check('reuse OK', rich.signals.find(s => s.name === 'reuse').rating === 'OK');
check('prewarning OK(anchored)', rich.signals.find(s => s.name === 'prewarning').rating === 'OK');

// 앵커 없는 LSN(고아) → prewarning PARTIAL (결손은 아님)
const orphan = computeScorecard({
  index: [{ domain: 'CON', id: '01' }, { domain: 'LSN', id: '09z' }],
  budget: budgetOK, historyRows: 1,
});
check('orphan LSN partial', orphan.signals.find(s => s.name === 'prewarning').rating === 'PARTIAL');

// CON 없음 → reuse GAP(결손) ; 예산 초과 → contextEconomy OVER(결손)
const poor = computeScorecard({ index: [], budget: budgetOver, historyRows: 0 });
check('no CON → reuse GAP', poor.signals.find(s => s.name === 'reuse').rating === 'GAP');
check('over budget → OVER', poor.signals.find(s => s.name === 'contextEconomy').rating === 'OVER');
check('poor counts 2 gaps', poor.gaps === 2 && poor.healthy === false);
check('empty history EMPTY(not gap)', poor.signals.find(s => s.name === 'antiRegression').rating === 'EMPTY');

// gather 스모크(현 레포)
const g = gather();
check('gather signals 4', Array.isArray(g.signals) && g.signals.length === 4);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
