// scripts/dashboard.test.js
// 섹션 함수(순수) 단위 + 실평면 합성 스모크. 대시보드는 *합성*이므로 여기서는 그리기만 검증한다 —
// 데이터의 옳음은 각 소스 도구의 테스트(health·context-budget·work-close·lineage-tree)가 소유한다.
const { healthSection, budgetSection, worktableSection, render, gatherAll } = require('./dashboard');

let pass = 0, fail = 0;
function check(label, cond) { if (cond) pass++; else { fail++; console.error(`FAIL ${label}`); } }

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

// render — 실평면 합성 스모크
const data = gatherAll();
const html = render(data, { title: 'real' });
check('합성: 4섹션 전부', ['id="health"', 'id="budget"', 'id="wo"', 'id="plane"'].every(s => html.includes(s)));
check('합성: health 차원 등장', html.includes('naming gate') && html.includes('effect surface'));
check('합성: 활성 WO 등장', html.includes('[WO-10a-1]'));
check('합성: 계보 트리 + 필터 포함', html.includes('계보 트리 — 구조가 있는 노드') && html.includes('class="flt"'));
check('합성: undefined 누출 0', !html.includes('undefined'));
check('합성: 자기완결(외부 참조 0)', html.startsWith('<!doctype html>') && !/src=|href="(?!#)/.test(html));
check('합성: 결정성(같은 입력 → 같은 출력)', render(data, { title: 'real' }) === html);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
