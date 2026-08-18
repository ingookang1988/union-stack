// scripts/health.test.js
// 순수 계산부(computeHealth) 단위 + gather() 스모크. 실행: node scripts/health.test.js
const { computeHealth, gather } = require('./health');

let pass = 0, fail = 0;
function check(label, cond) { if (cond) pass++; else { fail++; console.error(`FAIL ${label}`); } }

const index = [
  { domain: 'PLAN', id: '01' }, { domain: 'FLOW', id: '01a' },
  { domain: 'LSN', id: '01a' }, { domain: 'FLOW', id: '01b', status: 'Verifying' },
];
const defined = ['PLAN', 'FLOW', 'LSN', 'WO', 'WF', 'EVD', 'ADR', 'PRO', 'ARCH'];

// 게이트 전부 통과 + 잠금 1
const h = computeHealth({ index, domainsDefined: defined, guideCount: 5, namingViolations: 0, historyViolations: 0, leakageViolations: 0 });
check('healthy when 0 violations', h.healthy === true && h.fails === 0);
check('lock exposure WARN', h.dims.find(d => d.name === 'lock exposure').status === 'WARN');
check('domain util value', h.dims.find(d => d.name === 'domain utilization').value === '3/9 used');
check('byDomain count', h.byDomain.FLOW === 2);

// 게이트 실패 반영
const bad = computeHealth({ index, domainsDefined: defined, guideCount: 5, namingViolations: 2, historyViolations: 1, leakageViolations: 0 });
check('fails counted', bad.fails === 2 && bad.healthy === false);
check('naming FAIL', bad.dims.find(d => d.name === 'naming gate').status === 'FAIL');

// 도메인 과세분 WARN (>6 unused)
const many = computeHealth({ index, domainsDefined: [...defined, 'A', 'B', 'C', 'D', 'E', 'F'], guideCount: 1, namingViolations: 0, historyViolations: 0, leakageViolations: 0 });
check('domain util WARN when many unused', many.dims.find(d => d.name === 'domain utilization').status === 'WARN');

// 파일 크기 + 참조 차원
const sz = computeHealth({ index, domainsDefined: defined, guideCount: 5, namingViolations: 0, historyViolations: 0, leakageViolations: 0, oversize: [{ file: 'x.md', kb: 47 }], brokenRefs: 3 });
check('file size WARN', sz.dims.find(d => d.name === 'file size').status === 'WARN');
check('ref integrity INFO', sz.dims.find(d => d.name === 'ref integrity').value.includes('3'));

// gather(): 실제 레포 스모크 — 구조 정상이면 fails 0.
// 단 leakage는 *미커밋* 작업트리 콘텐츠에 좌우된다(검토 중 spike 등) — 커밋 평면 게이트만 단언.
const g = gather();
const nonLeakFails = g.dims.filter(d => d.status === 'FAIL' && d.name !== 'leakage gate').length;
check('gather 커밋 평면 게이트 그린', nonLeakFails === 0);
check('gather dims 12 (관측 3절 포함)', g.dims.length === 12);
check('sync 절은 INFO(판정 없음)', g.dims.find(d => d.name === 'plane sync').status === 'INFO');
check('tier 절은 INFO(관측만)', g.dims.find(d => d.name === 'tier distribution').status === 'INFO');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
