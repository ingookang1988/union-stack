// scripts/zfs_index.test.js
// 통합 테스트: 실제 레포의 예시 문서를 색인이 제대로 수집·파싱하는지.
// (FS 의존이라 zfs_util.test.js와 분리.) 실행: node scripts/zfs_index.test.js
const { buildIndex, readStatus, readFront, parseConsumers } = require('./zfs_index');
const fs = require('fs');
const os = require('os');
const path = require('path');

let pass = 0, fail = 0;
function check(label, cond) {
  if (cond) pass++; else { fail++; console.error(`FAIL ${label}`); }
}

const index = buildIndex();
const byFileDomain = (domain, id) => index.find(d => d.domain === domain && d.id === id);

// 픽스처 의존 검사는 *템플릿 모드*에서만. init 후 실제 프로젝트에선 건너뜀.
// 판별자는 [ADR-30]이 정한 레포 모드 판별(package.json name)을 쓴다. "PLAN-01 이 색인에
// 있는가"는 판별자가 될 수 없다 — 어답터도 자기 PLAN-01 을 정당하게 갖기 때문이다
// (실측: 한 어답터에서 픽스처 검사 7건이 자기 문서를 상대로 돌아 실패했다).
const TEMPLATE = (() => {
  try { return require('../package.json').name === 'union-stack'; } catch { return false; }
})();
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

// consumers: 계약의 계보 밖 간선([PRO-16]) — 인라인·블록 둘 다, 브래킷은 벗긴다
check('consumers 인라인', JSON.stringify(parseConsumers('consumers: [FLOW-01a, FLOW-07b]')) === '["FLOW-01a","FLOW-07b"]');
check('consumers 블록', JSON.stringify(parseConsumers('consumers:\n  - FLOW-01a\n  - [FLOW-09c]\nnext: x')) === '["FLOW-01a","FLOW-09c"]');
check('consumers 없으면 빈 배열', JSON.stringify(parseConsumers('status: Active')) === '[]');
check('consumers 블록은 목록 끝에서 멈춘다', JSON.stringify(parseConsumers('consumers:\n  - A-01\nstatus: Active\n  - B-02')) === '["A-01"]');
check('readFront 가 consumers 를 낸다',
  JSON.stringify(readFront(w('d.md', '---\nstatus: Active\nconsumers: [FLOW-01a]\n---\n')).consumers) === '["FLOW-01a"]');
fs.rmSync(tmp, { recursive: true, force: true });

// --- [PRO-27] ② 색인이 adapter.json statusMap 으로 status 를 매핑하고 원문은 rawStatus 로 남긴다 ---
const tmp2 = fs.mkdtempSync(path.join(os.tmpdir(), 'zfsidx-vocab-'));
try {
  const w2 = (rel, s) => { const p = path.join(tmp2, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, s); };
  w2('.union-stack/sprint/WO-07_x.md', '---\nstatus: Done\n---\n# (예시)\n');
  const unmapped = buildIndex(tmp2).find(d => d.domain === 'WO' && d.id === '07');
  check('adapter.json 없으면 로컬 어휘 그대로', unmapped.status === 'Done' && unmapped.rawStatus === 'Done');
  w2('.union-stack/adapter.json', '{"statusMap": {"Done": "Closed"}}');
  const mapped = buildIndex(tmp2).find(d => d.domain === 'WO' && d.id === '07');
  check('statusMap 으로 Done → Closed', mapped.status === 'Closed');
  check('원문은 rawStatus 에 보존', mapped.rawStatus === 'Done');
} finally { fs.rmSync(tmp2, { recursive: true, force: true }); }

// --- [PRO-27] ③ frontmatter 부모(parent:·plan:)가 색인 레코드 parents 로, 산술 플래그는 adapter lineage 로 ---
const { parseParents } = require('./zfs_index');
check('parent 스칼라', JSON.stringify(parseParents('parent: PRO-27')) === '["PRO-27"]');
check('끝 주석 제거', JSON.stringify(parseParents('parent: PLAN-01a         # ID에서 역산 가능')) === '["PLAN-01a"]');
check('plan 인라인 목록 + 브래킷', JSON.stringify(parseParents('plan: [PLAN-07, [PLAN-08]]')) === '["PLAN-07","PLAN-08"]');
check('블록 목록 + parent·plan 합집합(중복 제거)', JSON.stringify(parseParents('parent: PLAN-07\nplan:\n  - PLAN-07\n  - WO-12')) === '["PLAN-07","WO-12"]');
check('up: 외부 참조는 부모 아님', JSON.stringify(parseParents('parent: up:PRO-27')) === '[]');
check('ID 꼴 아니면 버린다', JSON.stringify(parseParents('parent: 없음')) === '[]');
const tmp3 = fs.mkdtempSync(path.join(os.tmpdir(), 'zfsidx-lineage-'));
try {
  const w3 = (rel, s) => { const p = path.join(tmp3, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, s); };
  w3('.union-stack/sprint/WO-12a-1_x.md', '---\nstatus: Active\nparent: PRO-36\n---\n# (예시)\n');
  w3('.union-stack/sprint/WO-36a-1_y.md', '---\nstatus: Active\n---\n# (예시)\n');
  const noCfg = buildIndex(tmp3);
  check('레코드에 parents', JSON.stringify(noCfg.find(d => d.id === '12a-1').parents) === '["PRO-36"]');
  check('설정 없으면 전부 arithmetic', noCfg.every(d => d.arithmetic === true));
  w3('.union-stack/adapter.json', '{"lineage": {"arithmeticFrom": 36}}');
  const cfgIdx = buildIndex(tmp3);
  check('arithmeticFrom 아래는 arithmetic:false', cfgIdx.find(d => d.id === '12a-1').arithmetic === false && cfgIdx.find(d => d.id === '36a-1').arithmetic === true);
} finally { fs.rmSync(tmp3, { recursive: true, force: true }); }

// --- [PRO-26] ① frontmatter mnemonic 이 레코드에 실린다 ---
const tmpM = fs.mkdtempSync(path.join(os.tmpdir(), 'zfsidx-mn-'));
try {
  const wm = (rel, s) => { const p = path.join(tmpM, rel); fs.mkdirSync(path.dirname(p), { recursive: true }); fs.writeFileSync(p, s); };
  wm('.union-stack/plan/PLAN-07_x.md', '---\nstatus: Active\nmnemonic: auth   # 주석\n---\n# (예시)\n');
  wm('.union-stack/plan/PLAN-08_y.md', '---\nstatus: Active\n---\n# (예시)\n');
  const im = buildIndex(tmpM);
  check('mnemonic 파싱(끝 주석 제거)', im.find(d => d.id === '07').mnemonic === 'auth');
  check('mnemonic 없으면 null', im.find(d => d.id === '08').mnemonic === null);
} finally { fs.rmSync(tmpM, { recursive: true, force: true }); }

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
