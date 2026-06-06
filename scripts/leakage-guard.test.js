// scripts/leakage-guard.test.js
// 판정 로직(순수 함수) 단위 + 실제 레포 통합 테스트.
// 실행: node scripts/leakage-guard.test.js
const { isSanitized, run } = require('./leakage-guard');

let pass = 0, fail = 0;
function check(label, got, exp) {
  const ok = JSON.stringify(got) === JSON.stringify(exp);
  if (ok) pass++; else { fail++; console.error(`FAIL ${label}: got ${JSON.stringify(got)}, exp ${JSON.stringify(exp)}`); }
}

// --- isSanitized: 순수 판정 ---
// 더미 마커(본문/슬러그)
check('본문 (예시) 마커', isSanitized('.union-stack/plan/PLAN-01_x.md', '# (예시) 인증'), true);
check('슬러그 example',   isSanitized('.union-stack/lessons/LSN-01a_example_pitfall.md', '내용'), true);
check('영문 dummy 마커',  isSanitized('.union-stack/feature/live.md', 'a dummy row'), true);
// 방법론 allowlist
check('_GUIDE 면제',      isSanitized('.union-stack/sprint/_GUIDE.md', '마커 전혀 없음'), true);
check('ARCH-00 면제',     isSanitized('.union-stack/topology/ARCH-00_zfs_naming.md', '마커 없음'), true);
// 위반: 마커도 allowlist도 아님 = 실제 내용으로 의심
check('마커 없는 실내용',  isSanitized('.union-stack/plan/PLAN-02_real.md', '# 사내 결제 모듈 요구사항'), false);
check('마커 없는 매니페스트', isSanitized('.union-stack/archive_ledger.md', '[ADR-09] 실제 결정'), false);

// --- 통합: 현재 레포는 위반 0건이어야 ---
check('현재 레포 통과', run(), 0);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
