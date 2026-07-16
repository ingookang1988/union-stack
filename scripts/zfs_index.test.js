// scripts/zfs_index.test.js
// 통합 테스트: 실제 레포의 예시 문서를 색인이 제대로 수집·파싱하는지.
// (FS 의존이라 zfs_util.test.js와 분리.) 실행: node scripts/zfs_index.test.js
const { buildIndex, readStatus } = require('./zfs_index');
const fs = require('fs');
const os = require('os');
const path = require('path');

let pass = 0, fail = 0;
function check(label, cond) {
  if (cond) pass++; else { fail++; console.error(`FAIL ${label}`); }
}

const index = buildIndex();
const byFileDomain = (domain, id) => index.find(d => d.domain === domain && d.id === id);

// 픽스처 의존 검사는 *템플릿 모드*(더미 예시 존재)에서만. init 후 실제 프로젝트에선 건너뜀.
const TEMPLATE = !!byFileDomain('PLAN', '01');
if (TEMPLATE) {
  // 각 디렉터리의 대표 예시가 색인에 잡히는가
  check('FLOW-01a 수집', !!byFileDomain('FLOW', '01a'));
  check('PLAN-01 수집', !!byFileDomain('PLAN', '01'));
  check('PHASE-01 수집(project/roadmap)', !!byFileDomain('PHASE', '01'));
  check('PRO-01 수집(proposals)', !!byFileDomain('PRO', '01'));
  check('LSN-01a 수집', !!byFileDomain('LSN', '01a'));
  // status frontmatter 파싱
  check('PLAN-01 status=Draft', byFileDomain('PLAN', '01')?.status === 'Draft');
  check('FLOW-01a status=Active', byFileDomain('FLOW', '01a')?.status === 'Active');
  check('PRO-01 status=Rejected', byFileDomain('PRO', '01')?.status === 'Rejected');
} else {
  console.log('(non-template repo: 픽스처 검사 건너뜀)');
}

// 가이드·매니페스트(_GUIDE.md 등)는 색인에서 제외 (항상 성립)
check('가이드 제외', !index.some(d => /_GUIDE\.md$/.test(d.file)));

// --- readStatus: frontmatter 스코핑 (본문 status를 잠금으로 오인 → 오차단 회귀 방지) ---
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'zfsidx-'));
const w = (n, s) => { const p = path.join(tmp, n); fs.writeFileSync(p, s); return p; };
check('선두주석+frontmatter status 추출',
  readStatus(w('a.md', '<!-- 주석 -->\n---\nid: X\nstatus: Draft\n---\n# 본문\n')) === 'Draft');
check('본문 코드블록의 status 무시',
  readStatus(w('b.md', '# 문서\n\n예시:\n```\nstatus: Live\n```\n')) === null);
check('frontmatter 없으면 null', readStatus(w('c.md', '# 그냥 문서\nstatus: Live\n')) === null);
fs.rmSync(tmp, { recursive: true, force: true });

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
