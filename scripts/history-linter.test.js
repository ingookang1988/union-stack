// scripts/history-linter.test.js
// 순수 함수(findViolations) 단위 + 실제 HISTORY.md 통합 테스트.
// 실행: node scripts/history-linter.test.js
const { findViolations, run } = require('./history-linter');

let pass = 0, fail = 0;
function check(label, got, exp) {
  const ok = JSON.stringify(got) === JSON.stringify(exp);
  if (ok) pass++; else { fail++; console.error(`FAIL ${label}: got ${JSON.stringify(got)}, exp ${JSON.stringify(exp)}`); }
}

const H = '| 날짜 | 분기점(사실) | 근거(왜) | 시사점 |\n|---|---|---|---|\n';

// 사실+근거 모두 있음 → 위반 0
check('정상', findViolations(H + '| 2026-01 | A 폐기 | 라이선스 문제 | 재검토 가능 |').length, 0);

// 사실 있고 근거 빈칸 → 위반 1
check('근거 빈칸', findViolations(H + '| 2026-01 | A 폐기 |  | 메모 |').map(v => v.fact), ['A 폐기']);

// 근거가 플레이스홀더(-) → 위반
check('플레이스홀더', findViolations(H + '| 2026-01 | B 도입 | - | x |').length, 1);

// 전부 빈 행 → 무시(등재 아님)
check('빈 행 무시', findViolations(H + '|  |  |  |  |').length, 0);

// 다중 행: 하나만 위반
check('혼합', findViolations(H +
  '| 2026-01 | A 폐기 | 라이선스 | x |\n' +
  '| 2026-02 | C 피봇 | TBD | y |').map(v => v.fact), ['C 피봇']);

// 근거 컬럼 헤더 자체가 없음(양식 붕괴) → 구조 위반
const noReason = '| 날짜 | 분기점(사실) | 시사점 |\n|---|---|---|\n| 2026-01 | A 폐기 | x |';
check('근거 컬럼 없음', findViolations(noReason).length >= 1, true);

// 분기점 표가 아닌 표 → 무시
const other = '| 이름 | 값 |\n|---|---|\n| foo | bar |';
check('무관 표 무시', findViolations(other).length, 0);

// HISTORY 본문 없음(표 없음) → 위반 0
check('표 없음', findViolations('# 제목\n그냥 텍스트').length, 0);

// --- parseEntries: 분기점 표 → 항목(예시 행은 표시만) — 시간축 페이지 소비 ---
const { parseEntries } = require('./history-linter');
const histFix = [
  '| 날짜 | 분기점(사실) | 근거(왜) | 시사점 |',
  '|---|---|---|---|',
  '| (예시) 2026-01 | (예시) 더미 | (예시) 이유 | 참고 |',
  '| 2026-06-15 | v6.0 승격 | 법칙 확인 | 후속 필수 |',
].join('\n');
const ents = parseEntries(histFix);
check('parseEntries 2건(예시 포함)', ents.length, 2);
check('parseEntries 예시 표시', [ents[0].example, ents[1].example], [true, false]);
check('parseEntries 필드', [ents[1].date, ents[1].fact, ents[1].reason, ents[1].note],
  ['2026-06-15', 'v6.0 승격', '법칙 확인', '후속 필수']);
check('parseEntries 빈 입력', parseEntries(''), []);

// --- 통합: 현재 레포 HISTORY.md → 통과(exit 0) ---
check('현재 레포 통과', run(), 0);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
