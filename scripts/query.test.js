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
  { domain: 'FLOW', id: '01b', status: 'Verifying', file: 'feature/flow/FLOW-01b_x.md' },
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
check('br 계약 간선 없으면 viaContract 빈 배열', br.viaContract, []);

// --- blastRadius: 계약의 계보 밖 소비자 간선([PRO-16]) ---
// 계약은 포함관계 아닌 당사자끼리 공유되므로 소비자는 늘 다른 계보에 있다 — 트리 산술로는 안 보인다.
const cIndex = [
  { domain: 'CON', id: '05', status: 'Active', file: 'contracts/CON-05_api.md',
    consumers: ['FLOW-01a', 'FLOW-07b', 'FLOW-99z'] },        // FE · BE · 오타(미해소)
  { domain: 'FLOW', id: '01a', status: 'Active', file: 'flow/FLOW-01a_fe.md' },
  { domain: 'FLOW', id: '07b', status: 'Verifying', file: 'flow/FLOW-07b_be.md' },
  { domain: 'WO', id: '07b-1', status: 'Draft', file: 'sprint/WO-07b-1_task.md' },
  { domain: 'PLAN', id: '42', status: 'Active', file: 'plan/PLAN-42_unrelated.md' },
];
const con = blastRadius('05', cIndex);
check('계약: 소비자가 영향권에 합집합', con.affected.map(a => `${a.domain}-${a.id}`).sort(),
  ['CON-05', 'FLOW-01a', 'FLOW-07b', 'WO-07b-1']);
check('계약: 무관 계보는 안 딸려온다', con.affected.some(a => a.id === '42'), false);
check('계약: 소비자 자손까지 보수적 포함', con.viaContract.some(a => a.id === '07b-1'), true);
check('계약: 간선 출처 표기', con.viaContract.every(a => a.via === 'CON-05'), true);
check('계약: Verifying 소비자가 Fail-close 발동', con.blocked, true);
check('계약: 잠금은 소비자 쪽', con.locked.map(l => l.id), ['07b']);
check('계약: 미해소 소비자 표면화', con.unresolvedConsumers.map(u => u.ref), ['FLOW-99z']);
// 방향은 한쪽만 — 소비자에서 계약을 역으로 끌어오지 않는다(정본이 둘이면 드리프트).
check('계약: 역방향 아님', blastRadius('01a', cIndex).affected.map(a => a.domain), ['FLOW']);

// --- whereToRecord ---
check('route pivot→HISTORY', whereToRecord('pivot').match.destination, '.union-stack/project/HISTORY.md');
check('route lesson→lessons', whereToRecord('a repeated bug').match.destination, '.union-stack/reference/lessons/LSN-*');
check('route adr→ledger', whereToRecord('tactical decision').match.destination, '.union-stack/archive_ledger.md');
check('route unknown→null', whereToRecord('zzz').match, null);
check('route all has 6', whereToRecord('x').all.length, 6);
// 환경/크로스레포 사실은 사적 메모리로(lessons 아님) — 순서가 경계([ADR-11])
check('route env→private memory', /memory/i.test(whereToRecord('a machine-specific tooling-quirk').match.destination), true);
check('route env not lessons', /lessons/.test(whereToRecord('cross-repo environment quirk').match.destination), false);
// 레포/제품 특정 반복 실패는 여전히 lessons(환경 키워드 없으면)
check('route repo pitfall→lessons still', whereToRecord('a repeated pitfall in this feature').match.destination, '.union-stack/reference/lessons/LSN-*');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
