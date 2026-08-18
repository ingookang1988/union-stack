// scripts/lineage-tree.test.js
// 순수 함수(hue·forest·rows·render) 검증. 핵심은 스파이크의 성패 판정을 회귀로 고정하는 것 —
// fetch-eval의 101노드 적대 평면(status·tier 부재, 혼동 형제 포함)이 무가정 렌더되는가.
const { hue, forest, rows, render } = require('./lineage-tree');
const { syntheticPlane } = require('./fetch-eval');
const { buildIndex } = require('./zfs_index');

let pass = 0, fail = 0;
function check(label, cond) { if (cond) pass++; else { fail++; console.error(`FAIL ${label}`); } }

// hue — 결정적, 0..359, 미지 도메인도 값이 나온다
check('hue 결정성', hue('PLAN') === hue('PLAN'));
check('hue 범위', [hue('PLAN'), hue('ZZZZZZ'), hue('')].every(h => h >= 0 && h < 360));

// forest — 적대 코어: 혼동 형제(01a1 vs 01a10)를 부모-자식으로 오인하지 않는다
const adv = [
  { domain: 'PLAN', id: '01', file: 'PLAN-01' },
  { domain: 'FLOW', id: '01a1', file: 'FLOW-01a1' },
  { domain: 'PLAN', id: '01a10', file: 'PLAN-01a10' },
  { domain: 'WO', id: '01a-1', file: 'WO-01a-1' },
  { domain: 'LSN', id: '99', file: 'LSN-99' },
];
const f = forest(adv);
const flat = rows(f);
const depthOf = id => flat.find(r => r.node.id === id).depth;
const node01 = f.find(n => n.id === '01');
check('중간 세대(01a) 부재 → 최근접 실존 조상 01 에 부착(blast-radius 의미론 일치)',
  depthOf('01a1') === 1 && depthOf('01a10') === 1 && depthOf('01a-1') === 1
  && node01.kids.map(k => k.id).sort().join(',') === '01a-1,01a1,01a10');
const n01a1 = flat.find(r => r.node.id === '01a1').node;
check('01a1 이 01a10 을 자식으로 오인하지 않음', n01a1.kids.every(k => k.id !== '01a10'));
check('조상 전무(99)는 루트', depthOf('99') === 0);
check('루트 정렬', f.map(n => n.id).join(',') === [...f.map(n => n.id)].sort().join(','));

// forest — 단말 -N 은 부모가 있으면 자식이다
const term = forest([{ domain: 'PLAN', id: '01a', file: 'P' }, { domain: 'WO', id: '01a-1', file: 'W' }]);
check('단말 -N 자식 판정', term.length === 1 && term[0].kids.length === 1 && term[0].kids[0].id === '01a-1');

// render — 성패 판정: 101노드 적대 평면(status·tier 없음, 도메인 5종) 무가정 렌더
const synth = syntheticPlane(30);
check('적대 평면 101노드', synth.length === 101);
const html = render(synth, { title: 'adversarial' });
check('적대 평면: 전 문서 등장', synth.every(d => html.includes(`>${d.domain}<`) || html.includes(d.file)));
check('적대 평면: undefined/null 누출 0', !html.includes('undefined') && !html.includes('null'));
check('적대 평면: 자기완결 HTML(외부 참조 0)', html.startsWith('<!doctype html>') && !/src=|href=/.test(html));

// render — 실평면 스모크
const real = render(buildIndex(), { title: 'real' });
check('실평면: WO-10a-1 등장', real.includes('e6_scenario_ab_cycle'));
check('실평면: undefined/null 누출 0', !real.includes('undefined') && !real.includes('null'));

// render — 잠금 마커는 Verifying 에만, status 는 이스케이프
const locked = render([{ domain: 'WO', id: '01', file: 'W', slug: 'w', status: 'Verifying' }]);
check('Verifying 잠금 마커', locked.includes('\u{1F512}'));
const unlocked = render([{ domain: 'WO', id: '01', file: 'W', slug: 'w', status: 'Draft' }]);
check('Draft 는 마커 없음', !unlocked.includes('\u{1F512}'));
const hostile = render([{ domain: 'WO', id: '01', file: 'W', slug: 'w', status: '<b>x</b>' }]);
check('status 이스케이프', !hostile.includes('<b>x</b>') && hostile.includes('&lt;b&gt;'));

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
