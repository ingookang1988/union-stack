#!/usr/bin/env node
// scripts/eval.js
// 하네스 *레버리지* 스코어카드 — health(자기 준수도)와 달리, 하네스가 *주장하는 가치*를
// 측정 가능한 구조 프록시로 환산한다. 시간(ON/OFF·버전 간)에 걸쳐 diff해 추세를 본다.
// read-only·zero-dep. 실행: node scripts/eval.js [--json]
//
// 정직한 한계: 이것은 *모델 A/B가 아니다*. "구조가 가치를 가능케 하는가"의 프록시일 뿐,
//   "에이전트가 실제로 더 잘하는가"는 측정하지 못한다. 진짜 효능 A/B 프로토콜은 eval/PROTOCOL.md.
const fs = require('fs');
const path = require('path');
const { buildIndex } = require('./zfs_index');
const { ancestorChain } = require('./zfs_util');
const { gather: gatherBudget } = require('./context-budget');

// HISTORY의 사실+근거 행 수(표 본문 행만). anti-regression 커버리지 프록시.
function countHistoryRows(root) {
  try {
    const txt = fs.readFileSync(path.join(root, '.union-stack/project/HISTORY.md'), 'utf8');
    return txt.split('\n').filter(l => /^\|/.test(l) && !/^\|\s*-+/.test(l) && !/Turning point|Date\s*\|/.test(l)).length;
  } catch { return 0; }
}

/**
 * 순수: 인덱스+예산+히스토리 → 4대 가치 신호. (FS 비의존 → 테스트 용이)
 *  - reuse        : 재사용 강제 표면(공유 계약 CON 좌표화 수)
 *  - prewarning   : 시간축 경고 도달성(계보에 앵커된 LSN 수)
 *  - antiRegression: 폐기 방향 회귀 방지(HISTORY 사실+근거 행 수)
 *  - contextEconomy: 부트스트랩이 예산 내인가(context-rot 자가유발 방지)
 */
function computeScorecard({ index, budget, historyRows }) {
  const contracts = index.filter(d => d.domain === 'CON');
  const lessons = index.filter(d => d.domain === 'LSN');
  // LSN이 실제로 주입되려면 같은 계보에 부모 맥락 문서가 있어야 한다(Upward Fetching 도달성).
  const anchorIds = new Set(index.filter(d => ['PLAN', 'FLOW', 'CON', 'ARCH', 'MTG'].includes(d.domain)).map(d => d.id));
  const lessonsAnchored = lessons.filter(l => ancestorChain(l.id).some(a => anchorIds.has(a))).length;

  const signals = [
    { name: 'reuse', metric: '공유 계약 좌표화(CON)', value: contracts.length,
      rating: contracts.length >= 1 ? 'OK' : 'GAP', why: '에이전트가 재발명 대신 찾아 쓸 표면' },
    { name: 'prewarning', metric: '계보 앵커된 LSN(주입 도달)', value: `${lessonsAnchored}/${lessons.length}`,
      rating: lessons.length === 0 ? 'EMPTY' : (lessonsAnchored === lessons.length ? 'OK' : 'PARTIAL'),
      why: '앵커 없는 LSN은 Upward Fetching에 안 걸려 사문화' },
    { name: 'antiRegression', metric: 'HISTORY 사실+근거 행', value: historyRows,
      rating: historyRows >= 1 ? 'OK' : 'EMPTY', why: '폐기된 방향으로의 재진입 방지' },
    { name: 'contextEconomy', metric: '부트스트랩 토큰/상한', value: `${budget.total}/${budget.totalCap}`,
      rating: budget.over ? 'OVER' : 'OK', why: '주입이 비대해지면 하네스가 막으려던 rot를 자가유발' },
  ];
  const gaps = signals.filter(s => ['GAP', 'OVER'].includes(s.rating)).length;
  return { signals, gaps, healthy: gaps === 0 };
}

function gather(root = path.resolve(__dirname, '..')) {
  return computeScorecard({
    index: buildIndex(root),
    budget: gatherBudget(root),
    historyRows: countHistoryRows(root),
  });
}

function run(root) {
  const r = gather(root);
  if (process.argv.includes('--json')) { console.log(JSON.stringify(r, null, 2)); return r.gaps ? 1 : 0; }
  console.log('# union-stack 레버리지 스코어카드 (구조 프록시 — 모델 A/B 아님; 프로토콜: eval/PROTOCOL.md)\n');
  for (const s of r.signals) {
    const mark = s.rating === 'OK' ? '✓' : (s.rating === 'GAP' || s.rating === 'OVER') ? '✗' : '·';
    console.log(`  ${mark} ${s.name.padEnd(15)} ${String(s.value).padEnd(8)} ${s.rating.padEnd(8)} ${s.metric}`);
    console.log(`      └ ${s.why}`);
  }
  console.log(r.healthy
    ? '\n구조 레버리지: 가치 표면이 모두 가용(빈 신호는 콘텐츠 채우면 해소).'
    : `\n구조 레버리지: ${r.gaps}개 구조적 결손 — 가치 주장이 무력화되는 지점.`);
  return r.gaps ? 1 : 0;
}

module.exports = { computeScorecard, countHistoryRows, gather };

if (require.main === module) process.exit(run());
