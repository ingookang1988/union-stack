// scripts/query.test.js
// 순수 조회 로직 단위 테스트(합성 색인 — 레포 비의존). 실행: node scripts/query.test.js
const { upwardFetch, blastRadius, whereToRecord } = require('./query');

let pass = 0, fail = 0;
function check(label, got, exp) {
  const ok = JSON.stringify(got) === JSON.stringify(exp);
  if (ok) pass++; else { fail++; console.error(`FAIL ${label}: got ${JSON.stringify(got)}, exp ${JSON.stringify(exp)}`); }
}

const index = [
  { domain: 'PLAN', id: '01', file: 'plan/PLAN-01_x.md' },
  { domain: 'CON', id: '01', file: 'reference/contracts/CON-01_x.md' },
  { domain: 'FLOW', id: '01a', file: 'feature/flow/FLOW-01a_x.md' },
  { domain: 'MTG', id: '01a', file: 'plan/meetings/MTG-01a_x.md' },
  { domain: 'LSN', id: '01a', file: 'reference/lessons/LSN-01a_x.md' },
  { domain: 'WO', id: '01a1', status: 'Active', file: 'sprint/WO-01a1_x.md' },
  { domain: 'FLOW', id: '01b', status: 'Live', file: 'feature/flow/FLOW-01b_x.md' },
];

// --- upwardFetch ---
const uf = upwardFetch('01a1', index);
check('uf chain', uf.chain, ['01a1', '01a', '01']);
check('uf context domains', uf.context.map(c => c.domain), ['CON', 'FLOW', 'MTG', 'PLAN']);
check('uf lessons', uf.lessons.map(l => l.id), ['01a']);

// --- blastRadius ---
const br = blastRadius('01a', index);
check('br affected ids', br.affected.map(a => a.id).sort(), ['01a', '01a', '01a', '01a1']);
check('br not blocked', br.blocked, false);
const brLocked = blastRadius('01b', index);
check('br blocked(Live)', brLocked.blocked, true);

// --- whereToRecord ---
check('route pivot→HISTORY', whereToRecord('pivot').match.destination, '.union-stack/project/HISTORY.md');
check('route lesson→lessons', whereToRecord('a repeated bug').match.destination, '.union-stack/reference/lessons/LSN-*');
check('route adr→ledger', whereToRecord('tactical decision').match.destination, '.union-stack/archive_ledger.md');
check('route unknown→null', whereToRecord('zzz').match, null);
check('route all has 5', whereToRecord('x').all.length, 5);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
