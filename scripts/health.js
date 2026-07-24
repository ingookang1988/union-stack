#!/usr/bin/env node
// scripts/health.js
// 하네스 자가 건강진단 — "조견표의 코드화". 게이트 상태 + 구조 지표를 자동 산출한다.
// read-only·zero-dep. 실행: node scripts/health.js [--json]
// (true A/B eval은 템플릿 단독으론 불가 — 대신 *자기 준수도*를 지속 측정한다.)
const fs = require('fs');
const path = require('path');
const { VALID_DOMAINS } = require('./zfs_util');
const { buildIndex } = require('./zfs_index');
const { lint } = require('./zfs-linter');
const { findViolations: historyViolationsOf } = require('./history-linter');
const { collectFiles, isSanitized } = require('./leakage-guard');
const { walkFiles } = require('./fs_walk');
const { gather: gatherBrokenRefs } = require('./ref-linter');
const { gather: gatherBudget } = require('./context-budget');

const LOCKED = ['Verifying', 'Live'];
const SIZE_CAP_KB = 30; // soft cap — 초과 시 분할/로테이션 권고

/** 순수 계산: 1차 지표 → 차원별 평가 리포트. (FS 비의존 → 테스트 용이) */
function computeHealth({ index, domainsDefined, guideCount, namingViolations, historyViolations, leakageViolations, oversize = [], brokenRefs = 0, budget = null }) {
  const used = new Set(index.map(d => d.domain));
  const unused = domainsDefined.filter(d => !used.has(d));
  const locked = index.filter(d => LOCKED.includes(d.status));
  const byDomain = {};
  index.forEach(d => { byDomain[d.domain] = (byDomain[d.domain] || 0) + 1; });

  const dims = [
    { name: 'naming gate', status: namingViolations === 0 ? 'OK' : 'FAIL', value: `${namingViolations} violations` },
    { name: 'history gate', status: historyViolations === 0 ? 'OK' : 'FAIL', value: `${historyViolations} violations` },
    { name: 'leakage gate', status: leakageViolations === 0 ? 'OK' : 'FAIL', value: `${leakageViolations} unmarked` },
    { name: 'domain utilization', status: unused.length > 6 ? 'WARN' : 'OK',
      value: `${used.size}/${domainsDefined.length} used`, note: unused.length ? `unused: ${unused.join(' ')}` : '' },
    { name: 'doc/guide ratio', status: 'INFO', value: `${index.length} ZFS docs / ${guideCount} guides` },
    { name: 'file size', status: oversize.length ? 'WARN' : 'OK',
      value: `${oversize.length} > ${SIZE_CAP_KB}KB`, note: oversize.map(o => `${o.file}:${o.kb}KB`).join(' ') },
    { name: 'ref integrity', status: 'INFO', value: `${brokenRefs} unresolved bracket refs (advisory)` },
    { name: 'context budget', status: budget && budget.over ? 'WARN' : 'OK',
      value: budget ? `${budget.total}/${budget.totalCap} tok bootstrap` : 'n/a',
      note: budget && budget.over ? budget.rows.filter(r => r.status === 'OVER').map(r => `${r.name}:${r.tokens}>${r.budget}`).join(' ') : '' },
    { name: 'lock exposure', status: locked.length ? 'WARN' : 'OK',
      value: `${locked.length} Verifying/Live`, note: locked.map(l => `${l.domain}-${l.id}`).join(' ') },
  ];
  const fails = dims.filter(d => d.status === 'FAIL').length;
  const warns = dims.filter(d => d.status === 'WARN').length;
  return { dims, byDomain, fails, warns, healthy: fails === 0 };
}

function countGuides(root) {
  let n = 0;
  walkFiles(root, '.union-stack', rel => { if (rel.endsWith('/_GUIDE.md')) n++; });
  return n;
}

function gather(root = path.resolve(__dirname, '..')) {
  const index = buildIndex(root);
  const namingViolations = lint(root).length;
  const hp = path.join(root, '.union-stack/project/HISTORY.md');
  const historyViolations = fs.existsSync(hp) ? historyViolationsOf(fs.readFileSync(hp, 'utf8')).length : 0;
  const leakageViolations = collectFiles(root)
    .filter(rel => !isSanitized(rel, fs.readFileSync(path.join(root, rel), 'utf8'))).length;
  const oversize = [];
  walkFiles(root, '.union-stack', rel => {
    if (!rel.endsWith('.md')) return;
    let kb = 0;
    try { kb = Math.round(fs.statSync(path.join(root, rel)).size / 1024); } catch { return; }
    if (kb > SIZE_CAP_KB) oversize.push({ file: rel, kb });
  });
  const brokenRefs = gatherBrokenRefs(root).length;
  const budget = gatherBudget(root);
  return computeHealth({
    index, domainsDefined: [...VALID_DOMAINS], guideCount: countGuides(root),
    namingViolations, historyViolations, leakageViolations, oversize, brokenRefs, budget,
  });
}

function run(root) {
  const r = gather(root);
  if (process.argv.includes('--json')) { console.log(JSON.stringify(r, null, 2)); return r.fails ? 1 : 0; }
  console.log('# union-stack health\n');
  for (const d of r.dims) {
    const mark = d.status === 'OK' ? '✓' : d.status === 'FAIL' ? '✗' : d.status === 'WARN' ? '!' : '·';
    console.log(`  ${mark} ${d.name.padEnd(20)} ${d.status.padEnd(5)} ${d.value}${d.note ? '  (' + d.note + ')' : ''}`);
  }
  console.log(`\n도메인 분포: ${Object.entries(r.byDomain).map(([k, v]) => `${k}:${v}`).join(' ')}`);
  console.log(r.healthy ? '\n건강: 게이트 전부 통과.' : `\n건강: 게이트 ${r.fails}건 실패 — 확인 필요.`);
  return r.fails ? 1 : 0;
}

module.exports = { computeHealth, gather };

if (require.main === module) process.exit(run());
