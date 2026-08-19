// scripts/dashboard.test.js
// 섹션 함수(순수) 단위 + 실평면 합성 스모크. 대시보드는 *합성*이므로 여기서는 그리기만 검증한다 —
// 데이터의 옳음은 각 소스 도구의 테스트(health·context-budget·work-close·lineage-tree)가 소유한다.
const { tilesSection, healthSection, budgetSection, worktableSection,
  sizeSection, syncSection, effectSection, contractSection, normCard, normView,
  gatherSprint, sprintView, gatherTime, timeView, render, gatherAll, VIEWS } = require('./dashboard');

let pass = 0, fail = 0;
function check(label, cond) { if (cond) pass++; else { fail++; console.error(`FAIL ${label}`); } }

// tilesSection — 스탯 타일: 게이트 통과/실패, 잠금 카운트, 예산 초과 강조
const tileData = {
  index: [{ domain: 'A', id: '1', status: 'Verifying' }, { domain: 'B', id: '2', status: 'Draft' }],
  health: { fails: 0, warns: 1 },
  budget: { total: 100, totalCap: 4000, over: 0 },
  wos: [{ id: '1', status: 'Draft', malformed: false }],
};
const ts = tilesSection(tileData);
check('tiles: 4개', (ts.match(/class="tile"/g) || []).length === 4);
check('tiles: 게이트 통과(good)', ts.includes('통과') && ts.includes('tv good'));
check('tiles: 잠금 카운트', ts.includes('1 Verifying'));
const tsBad = tilesSection({ ...tileData, health: { fails: 2, warns: 0 }, budget: { total: 5000, totalCap: 4000, over: 1 } });
check('tiles: 게이트 실패(bad) + 예산 초과', tsBad.includes('2 실패') && tsBad.includes('초과 1'));

// healthSection — 판정 마크는 글리프+단어(색 단독 금지), FAIL 이 보인다
const hFix = {
  dims: [
    { name: 'naming gate', status: 'OK', value: '0 violations' },
    { name: 'leakage gate', status: 'FAIL', value: '1 unmarked', note: 'x.md' },
    { name: 'tier distribution', status: 'INFO', value: 'draft:0' },
  ],
  byDomain: { PLAN: 1 }, fails: 1, warns: 0, healthy: false,
};
const hs = healthSection(hFix);
check('health: FAIL 글리프+단어', hs.includes('✗ FAIL') && hs.includes('leakage gate'));
check('health: 실패 판정문', hs.includes('게이트 1건 실패'));
check('health: note 표기', hs.includes('x.md'));
const hOk = healthSection({ dims: [], byDomain: {}, fails: 0, warns: 0, healthy: true });
check('health: 통과 판정문', hOk.includes('게이트 전부 통과'));

// budgetSection — OVER 강조, 바 폭은 100% 상한
const bs = budgetSection({
  rows: [
    { name: 'project', tokens: 500, budget: 2000, status: 'OK' },
    { name: 'handoff', tokens: 3000, budget: 1500, status: 'OVER' },
  ], total: 3500, totalCap: 4000, over: 1,
});
check('budget: OVER 표기', bs.includes('OVER') && bs.includes('초과 1건'));
check('budget: 바 폭 상한 100%', bs.includes('width:100%') && !bs.includes('width:200%'));

// worktableSection — 활성만, 빈 목록 처리, frontmatter 자유 문자열 이스케이프
check('worktable: 빈 목록', worktableSection([]).includes('활성 WO 없음'));
const ws = worktableSection([
  { id: '10a-1', title: 'E6 <b>x</b>', parent: 'PRO-10', status: 'Draft', evidence: 'none — "이유"', closed_by: [], malformed: false },
  { id: '01a-1', title: '닫힌 것', parent: 'PLAN-01a', status: 'Closed', evidence: 'ok', closed_by: [], malformed: false },
]);
check('worktable: 활성만 표시(Closed 제외)', ws.includes('[WO-10a-1]') && !ws.includes('[WO-01a-1]'));
check('worktable: 제목 이스케이프', !ws.includes('<b>x</b>') && ws.includes('&lt;b&gt;'));
const wm = worktableSection([{ id: null, file: 'sprint/broken.md', malformed: true, closed_by: [] }]);
check('worktable: malformed 경고', wm.includes('frontmatter 없는 WO 1건'));

// sizeSection — 헤드룸: 초과·근접·정상 3단계, 빈 입력은 조각 없음
check('size: 빈 입력 → 조각 없음', sizeSection([], 30) === '');
const ss = sizeSection([
  { file: 'a/over.md', kb: 35 }, { file: 'a/near.md', kb: 27 }, { file: 'a/ok.md', kb: 3 },
], 30);
check('size: 초과 강조', ss.includes('bover') && ss.includes('초과 1'));
check('size: 80% 근접 계수', ss.includes('근접 1건') && ss.includes('bnear'));
check('size: 바 폭 상한 100%', ss.includes('width:100%') && !ss.includes('width:116%'));
check('size: 파일명만 표기(경로는 title)', ss.includes('>over.md<') && ss.includes('title="a/over.md"'));

// syncSection — 무기입은 "지연"이 아니라 죽은 평면, 경과일은 today 주입으로 결정적
const sy = syncSection({
  planes: [{ name: 'gap', last: null }, { name: 'evidence', last: '2026-08-18' }, { name: 'old', last: '2026-06-01' }],
  ledgerEntries: 26, ledgerLast: '2026-08-18',
}, '2026-08-18');
check('sync: 무기입 별도 표시', sy.includes('무기입') && sy.includes('pill dead'));
check('sync: 당일은 "오늘"', sy.includes('오늘') && sy.includes('fresh'));
check('sync: 30일 이상은 stale', sy.includes('stale') && sy.includes('78일'));
check('sync: 무기입 카운트', sy.includes('무기입 1면'));
check('sync: 없는 입력 → 조각 없음', syncSection(null, '2026-08-18') === '');

// effectSection — byTool 텍스트를 막대로, 최대값 기준 정규화
const es2 = effectSection({ value: 'allow 92', note: 'Bash:41 WebFetch:40 Skill:2  ← .claude/settings.local.json' });
check('effect: 도구 3종 파싱', (es2.match(/class="brow"/g) || []).length === 3);
check('effect: 최대값이 100%', es2.includes('width:100%'));
check('effect: 파일 경로는 막대가 되지 않음', !es2.includes('settings.local.json<'));
check('effect: 없는 입력 → 조각 없음', effectSection(null) === '' && effectSection({ value: 'x' }) === '');

// contractSection — 그래프가 아니라 채택·무결성 표면([PRO-16] §5 계기)
check('contract: 계약 없으면 조각 없음', contractSection({ contracts: 0, byContract: [], unresolved: [] }) === '');
check('contract: null 안전', contractSection(null) === '');
const cs = contractSection({
  contracts: 3, declaring: 1, edges: 3, resolved: 2, redundant: 1,
  unresolved: [{ ref: 'FLOW-99z', from: 'CON-05', file: 'c.md' }],
  byContract: [{ id: 'CON-05', file: 'c.md', consumers: ['FLOW-07b', 'FLOW-05a', 'FLOW-99z'], resolved: ['FLOW-07b', 'FLOW-05a'], redundant: ['FLOW-05a'] }],
});
check('contract: 미해소 강조', cs.includes('미해소 1') && cs.includes('pill dead'));
check('contract: 동일계보를 무의미로 표기', cs.includes('동일계보') && cs.includes('pill aging'));
check('contract: 해소는 fresh', cs.includes('pill fresh'));
check('contract: 미선언 계약 수', cs.includes('미선언 2'));
const csEmpty = contractSection({ contracts: 2, declaring: 0, edges: 0, resolved: 0, redundant: 0, unresolved: [], byContract: [] });
check('contract: 간선 0이면 반증 조건 관측 문구', csEmpty.includes('[PRO-16] §5'));

// normView — 당위 축 전용 페이지: 등급 3분 + 절 구조 + 게이트 계약 + 인용처 + 드리프트 + concern
check('norm: 규범 없으면 안내 카드', normView({ total: 0, norms: [] }).includes('이 축은 아직 비어 있다'));
const nv = normView(
  { total: 3, gated: 1, cited: 1, isolated: 1, norms: [
    { key: 'ARCH-00', file: 'a/ARCH-00_x.md', title: 'ZFS naming', status: 'Active', tier: null, kb: 3.1,
      grade: 'gated', headings: ['Filename formula', 'Rules'],
      gates: ['scripts/leakage-guard.js'],
      gateContracts: [{ file: 'scripts/leakage-guard.js', gate: 'Leakage Gate', predicate: '마커 보유',
        scope: '마커의 존재만 본다 — 기밀을 이해하지 않는다', outcomes: ['PASS', 'REJECT'], failure_mode: '목록 출력 후 REJECT' }],
      cites: ['scripts/leakage-guard.js'], codeCites: 1, planeCites: 2, planeFiles: ['p/PRO-02_x.md'] },
    { key: 'ARCH-01', file: 'b.md', title: null, status: 'Active', tier: 'draft', kb: 0.7,
      grade: 'cited', headings: [], gates: [], gateContracts: [], cites: [], codeCites: 0, planeCites: 2, planeFiles: ['x.md'] },
    { key: 'INF-02', file: 'c.md', title: null, status: null, tier: null, kb: 1,
      grade: 'isolated', headings: [], gates: [], gateContracts: [], cites: [], codeCites: 0, planeCites: 0, planeFiles: [] },
  ] },
  { planes: [{ name: 'gap', last: null }, { name: 'state', last: null }, { name: 'evidence', last: '2026-08-19' }] },
  { tagged: 0, total: 10, byTag: {} });
check('norm: 타일 4개', (nv.match(/class="tile"/g) || []).length === 4);
check('norm: 등급 3분 라벨', nv.includes('게이트 있음') && nv.includes('인용만') && nv.includes('고립'));
check('norm: 절 구조 표기', nv.includes('Filename formula') && nv.includes('Rules'));
check('norm: 게이트 계약의 scope 를 규범 옆에', nv.includes('사각지대') && nv.includes('마커의 존재만 본다'));
check('norm: 계약 결과값', nv.includes('PASS') && nv.includes('REJECT'));
check('norm: 게이트 없으면 명시', nv.includes('판정하는 게이트 없음'));
check('norm: 인용처를 파일명으로', nv.includes('PRO-02_x.md') && nv.includes('leakage-guard.js'));
check('norm: 인용≠집행 경고', nv.includes('인용은 집행이 아니다'));
check('norm: 드리프트 무기입이면 "대조된 적 없다"', nv.includes('0건이 현실과 대조된 적 없다'));
check('norm: 드리프트는 gap·state만(evidence 제외)', nv.includes('>gap<') && !nv.includes('>evidence<'));
check('norm: concern 미사용 표기', nv.includes('사용 0'));
check('norm: title 없으면 빈 문자열로 축약', nv.includes('ARCH-01'));
const nvOk = normView(
  { total: 1, gated: 1, cited: 0, isolated: 0, norms: [{ key: 'ARCH-00', file: 'a.md', title: 't', status: 'Active', tier: null, kb: 1,
    grade: 'gated', headings: [], gates: ['g.js'], gateContracts: [], cites: ['g.js'], codeCites: 1, planeCites: 0, planeFiles: [] }] },
  { planes: [{ name: 'gap', last: '2026-08-19' }, { name: 'state', last: '2026-08-19' }] },
  { tagged: 2, total: 5, byTag: { security: 2 } });
check('norm: 검증됐으면 경고 없음', !nvOk.includes('대조된 적 없다') && nvOk.includes('대조 기록 있음'));
check('norm: concern 태그 집계 표기', nvOk.includes('security'));

// normCard — 개요용 요약(세부는 arch 페이지로 링크). 개요 정보를 버리지 않는 것이 요구사항.
const nc = normCard(
  { total: 2, gated: 1, cited: 1, isolated: 0, norms: [
    { key: 'ARCH-00', file: 'a.md', grade: 'gated', gates: ['scripts/g.js'], codeCites: 1, planeCites: 2 },
    { key: 'INF-01', file: 'b.md', grade: 'cited', gates: [], codeCites: 0, planeCites: 1 },
  ] },
  { planes: [{ name: 'gap', last: null }, { name: 'state', last: null }] },
  { tagged: 0, total: 5, byTag: {} });
check('normCard: 등급 요약', nc.includes('게이트 1') && nc.includes('인용만 1'));
check('normCard: arch 로 가는 자세히 링크', nc.includes('data-nav="arch"') && nc.includes('자세히'));
check('normCard: 규범 없으면 조각 없음', normCard({ total: 0, norms: [] }) === '');

// VIEWS — 축 하나 = 페이지 하나. 새 축 추가는 이 배열에 한 줄. 계보는 개요가 보유(별도 페이지 아님).
check('views: 4개 정의(개요·arch·sprint·time)', VIEWS.length === 4 && VIEWS[0].id === 'overview');
check('views: 축 전부 포함', ['arch', 'sprint', 'time'].every(id => VIEWS.some(v => v.id === id)));

// sprintView — 축의 짝은 종료 의례: WO 닫힘 조건 + HANDOFF 인계 상태
check('sprint: 없는 입력 → 조각 없음', sprintView(null) === '');
const spFix = {
  wos: [
    { id: '01a-1', file: 'sprint/a.md', title: '열린 것<b>x</b>', status: 'Draft', parent: 'PLAN-01a',
      evidence: 'none — 아직', closed_by: [], malformed: false,
      closure: { issues: [{ code: 'no-trace', outcome: 'CLARIFY', msg: '흔적이 비었다' }], info: [] } },
    { id: '02b-1', file: 'sprint/b.md', title: '닫힐 수 있는 것', status: 'Verifying', parent: 'PLAN-02b',
      evidence: 'npm test 32/34', closed_by: ['.union-stack/feature/live.md'],
      malformed: false, closure: { issues: [], info: ['부모 전이 후보'] } },
    { id: null, file: 'sprint/broken.md', malformed: true, closed_by: [] },
  ],
  handoff: { session: 's-2026', date: '2026-08-19T00:00:00Z', verification: '32/34 통과',
    findings: [], tokens: 1249, budget: 1500 },
  archived: 3,
};
const sp = sprintView(spFix, '2026-08-19');
check('sprint: 타일 — 충족/활성 비율', sp.includes('1/2') && sp.includes('종료 의례 통과 가능'));
check('sprint: 잠금 타일', sp.includes('Verifying 🔒'));
check('sprint: 아카이브 계수', sp.includes('>3<'));
check('sprint: 닫힘 미충족 사유(work-close CLARIFY)', sp.includes('닫힘 미충족') && sp.includes('흔적이 비었다'));
check('sprint: 충족 WO 는 명시', sp.includes('지금 닫아도 종료 의례를 통과한다'));
check('sprint: 증거 3분 — none 은 사유 명시', sp.includes('none — 사유 명시') && sp.includes('>있음<'));
check('sprint: 상위 흔적 파일명', sp.includes('live.md'));
check('sprint: 부모 전이 참고', sp.includes('부모 전이 후보'));
check('sprint: 제목 이스케이프', !sp.includes('<b>x</b>') && sp.includes('&lt;b&gt;'));
check('sprint: malformed 카드', sp.includes('frontmatter 없음'));
check('sprint: HANDOFF 5부·토큰·검증란', sp.includes('완비') && sp.includes('1249/1500') && sp.includes('32/34 통과'));
check('sprint: HANDOFF 80% 근접 호박', sp.includes('bnear'));
const spNoHo = sprintView({ wos: [], handoff: null, archived: 0 }, '2026-08-19');
check('sprint: HANDOFF 부재는 끊긴 인계로 표시', spNoHo.includes('인계가 끊겨 있다'));

// timeView — 시간축 3층: LSN(사전 경고) · 원장(전술+차단) · HISTORY(전략)
check('time: 없는 입력 → 조각 없음', timeView(null) === '');
const tmFix = {
  adrs: [
    { date: '2026-08-18', id: 'ADR-23', text: '결정 하나 — 상세는 생략' },
    { date: '2026-08-18', id: 'ADR-24', text: '결정 둘' },
    { date: '2026-08-19', id: 'ADR-25', text: 'x'.repeat(100) },
  ],
  history: [
    { date: '(예시) 2026-01', fact: '더미', reason: '이유', note: '', example: true },
    { date: '2026-06-15', fact: 'v6.0 승격', reason: '법칙 확인', note: '후속 필수', example: false },
  ],
  lessons: [
    { file: 'l/LSN-01a_x.md', id: 'LSN-01a', title: '반복 함정<b>x</b>', status: 'Active', occurrences: '3', valid_reason: '아직 미강제' },
    { file: 'l/broken.md', malformed: true },
  ],
  blocks: [{ id: 'ADR-25', blocks: '분리 재제안', reopen_when: '오탐 실측 시' }],
};
const tm = timeView(tmFix, '2026-08-19');
check('time: 타일 — 전술/전략/오답/차단', tm.includes('>3<') && tm.includes('전략 분기점') && tm.includes('재제안 차단'));
check('time: 전략 타일은 예시 제외 계수', tm.includes('예시 1 별도'));
check('time: 밀도 — 날짜별 계수', tm.includes('2026-08-18') && tm.includes('3 결정 / 2 일'));
check('time: 밀도 최대값 100%', tm.includes('width:100%'));
check('time: 최근 결정 요지 절단(72자+…)', tm.includes('…'));
check('time: 차단 표식이 결정 옆에', tm.includes('⛔') && tm.includes('재개 조건: 오탐 실측 시'));
check('time: LSN 반복 횟수·유효 사유', tm.includes('반복') && tm.includes('3회') && tm.includes('아직 미강제'));
check('time: LSN 제목 이스케이프', !tm.includes('<b>x</b>') && tm.includes('&lt;b&gt;'));
check('time: malformed LSN 표시', tm.includes('frontmatter 없음'));
check('time: HISTORY 사실+근거 쌍', tm.includes('v6.0 승격') && tm.includes('왜: 법칙 확인') && tm.includes('시사점: 후속 필수'));
check('time: HISTORY 예시 행은 흐리게', tm.includes('frow dim'));

// render — 실평면 합성 스모크
const data = gatherAll();
const html = render(data, { title: 'real' });
// 항상 있는 6절. `effect`는 **환경 의존**이라 여기 넣지 않는다 — 근거는 아래 조건부 단언.
// 개요는 기존 대시보드 정보를 전부 유지한다(요약 카드·계보 트리 포함) — 축 페이지는 *추가* 진입.
const ovHtml = html.slice(html.indexOf('data-view="overview"'), html.indexOf('data-view="arch"'));
check('합성: 개요의 9섹션 전부',
  ['id="health"', 'id="budget"', 'id="wo"', 'id="sync"', 'id="size"', 'id="contract"', 'id="norm"', 'id="plane"'].every(s => ovHtml.includes(s)));
check('합성: 개요가 계보 트리 보유', ovHtml.includes('계보 트리 — 구조가 있는 노드') && ovHtml.includes('class="flt"'));
check('합성: 개요 당위 카드에서 arch 진입 링크', ovHtml.includes('data-nav="arch"'));
// 뷰 라우팅 — 클릭이 정본이고 해시는 부가(data: URL 뷰어 대비).
check('라우팅: 뷰 4개 + data-nav 7개(나브 4 + 카드 3)', (html.match(/class="view"/g) || []).length === 4
  && (html.match(/data-nav="/g) || []).length === 7);
check('합성: 시간축 뷰가 실원장을 잡는다', html.includes('data-view="time"') && html.includes('결정 밀도'));
check('합성: 신선도 카드에서 time 진입 링크', ovHtml.includes('data-nav="time"'));
check('합성: 스프린트 뷰가 실 WO·HANDOFF 를 잡는다',
  html.includes('data-view="sprint"') && html.includes('HANDOFF — 세션 이어달리기'));
check('합성: 작업대 카드에서 sprint 진입 링크', ovHtml.includes('data-nav="sprint"'));
check('라우팅: 클릭 핸들러가 있다(해시 미지원 뷰어 대비)', html.includes("addEventListener('click'"));
check('라우팅: 해시는 부가로만', html.includes('history.replaceState'));
check('합성: 당위 뷰가 실규범을 잡는다', html.includes('ARCH-00') && html.includes('verification 첫 화살표'));
check('합성: 계약 절이 health 원자료를 소비', html.includes('계약 간선 — 계보 밖 소비자'));
// effect surface 는 gitignore 된 .claude/settings*.json 에서 온다 — CI 체크아웃엔 없다.
// 따라서 "있으면 그린다 / 없으면 조용히 빠진다"가 계약이고, 둘 다 단언한다(무가정 원칙의 연장).
const effDim = data.health.dims.find(d => d.name === 'effect surface');
const hasSettings = !!(effDim && effDim.note);
check('합성: effect 절은 설정 유무를 따른다', html.includes('id="effect"') === hasSettings);
check('합성: 설정 없으면 health 가 "관측 불가"로 적는다',
  hasSettings || effDim.value.includes('관측 불가'));
check('합성: 크기 헤드룸이 원장을 잡는다', html.includes('archive_ledger.md'));
check('합성: 신선도 pill', html.includes('class="pills"') && html.includes('evidence'));
check('합성: health 차원 등장', html.includes('naming gate') && html.includes('effect surface'));
check('합성: 활성 WO 등장', html.includes('[WO-10a-1]'));

check('합성: undefined 누출 0', !html.includes('undefined'));
check('합성: 자기완결(외부 참조 0)', html.startsWith('<!doctype html>') && !/src=|href="(?!#)/.test(html));
check('합성: 결정성(같은 입력 → 같은 출력)', render(data, { title: 'real' }) === html);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
