// scripts/handoff-linter.test.js
// 순수 함수(analyze) 단위 + 실제 HANDOFF.md 통합. 실행: node scripts/handoff-linter.test.js
const { analyze, run } = require('./handoff-linter');
const { OUTCOME } = require('./gate-contract');

let pass = 0, fail = 0;
function check(label, got, exp) {
  const ok = JSON.stringify(got) === JSON.stringify(exp);
  if (ok) pass++; else { fail++; console.error(`FAIL ${label}: got ${JSON.stringify(got)}, exp ${JSON.stringify(exp)}`); }
}

const FULL = `---
session_id: x
---
# Handoff
## 1. 세션 요약
- 했다
## 2. 변경 위치 (ID)
- [WO-01a]
## 3. 다음 작업
- [WO-01a-2]부터
## 4. 미해결 / 주의
— 해당 없음
## 5. 검증 상태
- 테스트 그린
`;

// 5부 완비 → 무발견
check('완비 → 0 findings', analyze(FULL).findings.length, 0);

// '— 해당 없음' 명시는 유효한 정직 기입(SPIKE C6) — 빈 부 판정을 받지 않는다
check('해당없음 명시 부 통과', analyze(FULL).findings.filter(f => f.rule === 'part-empty').length, 0);

// 부 누락 → part-missing (검증 상태 부를 삭제)
const missing = FULL.replace(/## 5\. 검증 상태[\s\S]*$/, '');
check('부 누락 검출', analyze(missing).findings.map(f => f.rule), ['part-missing']);

// 부는 있으나 비어 있음 → part-empty
const empty = FULL.replace('— 해당 없음\n', '');
check('빈 부 검출', analyze(empty).findings.map(f => f.rule), ['part-empty']);

// 예산 초과 → budget (한글 장문 — 1,500 tok 초과 확실)
const bloated = FULL + '## 붙임\n' + '기록할 가치가 없는 과정 서사가 길게 이어진다 '.repeat(200);
check('예산 초과 검출', analyze(bloated).findings.some(f => f.rule === 'budget'), true);

// 헤더 키워드 내성: 영문 헤더도 5부로 인식
const en = FULL
  .replace('1. 세션 요약', 'Summary').replace('2. 변경 위치 (ID)', 'Changed IDs')
  .replace('3. 다음 작업', 'Next entry').replace('4. 미해결 / 주의', 'Open / caution')
  .replace('5. 검증 상태', 'Verification');
check('영문 헤더 인식', analyze(en).findings.length, 0);

// 결과는 PASS 또는 CLARIFY뿐 — REJECT 없음([PRO-13] §5)
check('빈 본문도 CLARIFY까지만(분석은 findings일 뿐)', analyze('').findings.length > 0, true);

// --- 통합: 현재 레포 HANDOFF.md — 차단값(1)은 어떤 경우에도 안 나온다 ---
const code = run([]);
check('현재 레포: PASS 또는 CLARIFY', [OUTCOME.PASS, OUTCOME.CLARIFY].includes(code), true);
check('REJECT 불가 게이트', code === OUTCOME.REJECT, false);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
