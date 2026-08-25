// scripts/work-close.test.js
// 순수 로직 테스트. 실행: node scripts/work-close.test.js
const {
  field, listField, parseWo, mentionsLineage, checkClosure, checkIssuance, buildTable, inject, CONTRACT,
} = require('./work-close');
const { validateContract } = require('./gate-contract');

let pass = 0, fail = 0;
function check(label, cond) { if (cond) pass++; else { fail++; console.error(`FAIL ${label}`); } }

const WO = [
  '<!-- (예시) -->',
  '---',
  'id: WO-01a-1',
  'title: (예시) 인증 게이트웨이 배선',
  'status: Active',
  'parent: PLAN-01a',
  'evidence: "node scripts/x.test.js 12/12"',
  'closed_by:',
  '  - .union-stack/feature/live.md',
  '  - .union-stack/verification/derived/state.md',
  '---',
  '## 목표',
].join('\n');

// --- frontmatter 파싱 ---
const wo = parseWo('.union-stack/sprint/WO-01a-1_example.md', WO);
check('WO 레코드 파싱', wo && wo.id === '01a-1' && wo.status === 'Active' && wo.parent === 'PLAN-01a');
check('따옴표 벗기기', wo.evidence === 'node scripts/x.test.js 12/12');
check('블록 리스트 파싱', wo.closed_by.length === 2 && wo.closed_by[0].endsWith('live.md'));
check('인라인 리스트 파싱', listField('closed_by: [a.md, "b.md"]', 'closed_by').join(',') === 'a.md,b.md');
check('없는 필드는 null', field('id: x', 'nope') === null);
check('빈 값은 null', field('evidence:   ', 'evidence') === null);
check('WO 아닌 도메인은 null', parseWo('.union-stack/sprint/HANDOFF.md', WO) === null);
check('frontmatter 없으면 malformed', parseWo('.union-stack/sprint/WO-01a-2_x.md', '# 본문만').malformed === true);

// --- 계보 참조 판정 (흔적을 *확인 가능한 사실*로 만드는 검사) ---
check('자기 ID 참조 인식', mentionsLineage('행: [WO-01a-1] 배선 완료', '01a-1'));
check('조상 ID 참조 인식', mentionsLineage('| (예시) 로그인 | [PLAN-01a] | 운영 |', '01a-1'));
check('무관 계보는 불인식', mentionsLineage('[PLAN-02b] 다른 것', '01a-1') === false);
check('브래킷 없으면 불인식', mentionsLineage('PLAN-01a 를 산문으로만 언급', '01a-1') === false);

// --- 닫힘 점검 ---
const traces = {
  '.union-stack/feature/live.md': '| (예시) | [PLAN-01a] | 운영 |',
  '.union-stack/verification/derived/state.md': '- [WO-01a-1] 반영됨',
};
check('충족 시 이슈 0', checkClosure(wo, traces).issues.length === 0);

const noTrace = { ...wo, closed_by: [] };
check('흔적 없음 → no-trace', checkClosure(noTrace, {}).issues.some(i => i.code === 'no-trace'));

const noEv = { ...wo, evidence: null };
check('증거 없음 → no-evidence', checkClosure(noEv, traces).issues.some(i => i.code === 'no-evidence'));

const noneEv = { ...wo, evidence: 'none — 문서 수정, 실행 산출물 없음' };
check('`none — 이유`는 통과', checkClosure(noneEv, traces).issues.length === 0);

// 선언만 하고 반영 안 한 경우 — 이 검사가 흔적을 선언에서 사실로 바꾼다.
check('참조 없는 흔적 → trace-unreferenced',
  checkClosure(wo, { ...traces, '.union-stack/feature/live.md': '무관한 내용' })
    .issues.some(i => i.code === 'trace-unreferenced'));
check('읽을 수 없는 흔적 → trace-missing',
  checkClosure(wo, { '.union-stack/verification/derived/state.md': traces['.union-stack/verification/derived/state.md'] })
    .issues.some(i => i.code === 'trace-missing'));

// 형제가 전부 Closed → 부모 전이 후보(정보, 이슈 아님)
const sibs = [wo, { id: '01a-2', parent: 'PLAN-01a', status: 'Closed' }];
check('형제 전부 Closed → info', checkClosure(wo, traces, sibs).info.length === 1);
check('형제 미완이면 info 없음',
  checkClosure(wo, traces, [wo, { id: '01a-2', parent: 'PLAN-01a', status: 'Active' }]).info.length === 0);

// 계보에 PHASE 가 있으면 exit criteria 검토 후보(정보 — 강제 아님, [PRO-19] ②)
check('계보 PHASE → info', checkClosure(wo, traces, [], [{ id: '01' }]).info.some(i => i.includes('[PHASE-01]')));
check('PHASE 없으면 info 없음', checkClosure(wo, traces, [], []).info.length === 0);

// --- 발행 점검 ([PRO-19] ① — 종료 의례의 상류 대칭) ---
const IDX = [{ domain: 'PLAN', id: '01a', file: 'p.md' }, { domain: 'PRO', id: '10', file: 'q.md' }];
// 픽스처 WO 는 `## 목표`만 있다 → 나머지 두 절이 걸린다(sprint/_GUIDE §Anatomy 이행).
check('필수 절 누락 검출', (() => {
  const i = checkIssuance(wo, IDX).find(x => x.code === 'anatomy-missing');
  return i && i.msg.includes('수용 기준') && i.msg.includes('증거');
})());
const FULL_WO = parseWo('.union-stack/sprint/WO-01a-1_x.md', WO + '\n## 수용 기준\n- x\n## 증거\n- y');
check('3절 완비 + 실존 parent → 이슈 0', checkIssuance(FULL_WO, IDX).length === 0);
check('parent 미기입 → no-parent', checkIssuance({ ...FULL_WO, parent: null }, IDX).some(i => i.code === 'no-parent'));
check('죽은 parent → parent-missing', checkIssuance(FULL_WO, [{ domain: 'PRO', id: '10', file: 'q.md' }]).some(i => i.code === 'parent-missing'));
// 도메인까지 맞아야 실존 — 다른 도메인의 동일 계보(FLOW-01a)가 죽은 부모(PLAN-01a)를 가리면 안 된다.
check('도메인 불일치는 실존 아님', checkIssuance(FULL_WO, [{ domain: 'FLOW', id: '01a', file: 'f.md' }]).some(i => i.code === 'parent-missing'));
// 계보 불일치(승인 §7-⑤ 포함): PLAN-02 는 01a-1 의 조상이 아니다 — 파티션([PRO-05]) 오분할 방지.
check('계보 절단 → lineage-break', checkIssuance({ ...FULL_WO, parent: 'PLAN-02' }, [{ domain: 'PLAN', id: '02', file: 'p2.md' }])
  .some(i => i.code === 'lineage-break'));
// 계보 밖 도메인이라도 계보가 이어지면 통과(현행 관례: WO-10a-1 의 parent PRO-10)
check('PRO 부모라도 계보 일치면 통과', checkIssuance({ ...FULL_WO, id: '10a-1', parent: 'PRO-10' }, IDX).length === 0);
check('frontmatter 없으면 no-frontmatter', checkIssuance(parseWo('.union-stack/sprint/WO-01a-2_x.md', '# 본문만'), IDX)
  .some(i => i.code === 'no-frontmatter'));

// --- 작업대 뷰 ---
const table = buildTable([
  { id: '01a-2', title: 'B', status: 'Closed', parent: 'PLAN-01a', evidence: 'x' },
  { id: '01a-1', title: 'A', status: 'Active', parent: 'PLAN-01a', evidence: 'x' },
  { id: '01b-1', title: 'C', status: 'Draft', parent: 'PLAN-01b', evidence: 'none — 문서' },
]);
check('Closed 는 뷰에서 자동 제외', !table.includes('01a-2'));
check('활성만 id 정렬', table.indexOf('01a-1') < table.indexOf('01b-1'));
check('증거 유무 표기', table.includes('| 있음 |') && table.includes('| 해당없음 |'));
check('활성 0건이면 빈 행', buildTable([{ id: '01a-1', status: 'Closed' }]).includes('활성 WO 없음'));

// --- 주입 ---
const NX = '# t\n<!-- worktable:begin (gen) -->\nstale\n<!-- worktable:end -->\ntail';
check('블록 치환', inject(NX, table).includes('| WO |') && !inject(NX, table).includes('stale'));
check('마커 없으면 null', inject('# no markers', table) === null);
const CRLF = NX.split('\n').join('\r\n');
check('지배적 EOL 보존(CRLF)', !/(?<!\r)\n/.test(inject(CRLF, table)));

check('CONTRACT 필수 필드 완비', validateContract(CONTRACT).length === 0);

console.log(`work-close.test: ${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
