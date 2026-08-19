// scripts/dashboard.test.js
// 섹션 함수(순수) 단위 + 실평면 합성 스모크. 대시보드는 *합성*이므로 여기서는 그리기만 검증한다 —
// 데이터의 옳음은 각 소스 도구의 테스트(health·context-budget·work-close·lineage-tree)가 소유한다.
const { tilesSection, healthSection, budgetSection, worktableSection,
  sizeSection, syncSection, effectSection, contractSection, normSection, render, gatherAll } = require('./dashboard');

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

// normSection — 당위 축: 집행 등급 3분 + 드리프트 화살표 + concern 채택
check('norm: 규범 없으면 조각 없음', normSection({ total: 0, norms: [] }) === '');
const ns = normSection(
  { total: 3, gated: 1, cited: 1, isolated: 1, norms: [
    { key: 'ARCH-00', file: 'a.md', grade: 'gated', gates: ['scripts/leakage-guard.js'], codeCites: 4, planeCites: 2 },
    { key: 'ARCH-01', file: 'b.md', grade: 'cited', gates: [], codeCites: 0, planeCites: 2 },
    { key: 'INF-02', file: 'c.md', grade: 'isolated', gates: [], codeCites: 0, planeCites: 0 },
  ] },
  { planes: [{ name: 'gap', last: null }, { name: 'state', last: null }, { name: 'evidence', last: '2026-08-19' }] },
  { tagged: 0, total: 10, byTag: {} });
check('norm: 등급 3분 표기', ns.includes('게이트') && ns.includes('인용만') && ns.includes('고립 1'));
check('norm: 게이트 출처는 파일명', ns.includes('leakage-guard.js'));
check('norm: 인용≠집행 경고', ns.includes('인용은 집행이 아니다'));
check('norm: 드리프트 무기입이면 "대조된 적 없음"', ns.includes('대조된 적 없음'));
check('norm: 드리프트는 gap·state만(evidence 제외)', ns.includes('>gap<') && !ns.includes('>evidence<'));
check('norm: concern 미사용 표기', ns.includes('사용 0'));
const nsTagged = normSection(
  { total: 1, gated: 1, cited: 0, isolated: 0, norms: [{ key: 'ARCH-00', file: 'a.md', grade: 'gated', gates: ['g.js'], codeCites: 1, planeCites: 0 }] },
  { planes: [{ name: 'gap', last: '2026-08-19' }, { name: 'state', last: '2026-08-19' }] },
  { tagged: 2, total: 5, byTag: { security: 2 } });
check('norm: 검증됐으면 경고 없음', !nsTagged.includes('대조된 적 없음'));
check('norm: concern 태그 집계 표기', nsTagged.includes('security'));

// render — 실평면 합성 스모크
const data = gatherAll();
const html = render(data, { title: 'real' });
// 항상 있는 6절. `effect`는 **환경 의존**이라 여기 넣지 않는다 — 근거는 아래 조건부 단언.
check('합성: 항상 있는 8섹션',
  ['id="health"', 'id="budget"', 'id="wo"', 'id="sync"', 'id="size"', 'id="contract"', 'id="norm"', 'id="plane"'].every(s => html.includes(s)));
check('합성: 당위 절이 실규범을 잡는다', html.includes('ARCH-00') && html.includes('당위 축 — 규범과 그 집행'));
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
check('합성: 계보 트리 + 필터 포함', html.includes('계보 트리 — 구조가 있는 노드') && html.includes('class="flt"'));
check('합성: undefined 누출 0', !html.includes('undefined'));
check('합성: 자기완결(외부 참조 0)', html.startsWith('<!doctype html>') && !/src=|href="(?!#)/.test(html));
check('합성: 결정성(같은 입력 → 같은 출력)', render(data, { title: 'real' }) === html);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
