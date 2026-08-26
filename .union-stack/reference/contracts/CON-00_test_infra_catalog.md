<!-- [Schema/계약] 테스트 도구 카탈로그(층 2) — 상류 실관용구([PRO-21] 1단계 도그푸딩).
     어답터에선 init 이 이 파일을 제거한다(평면은 어답터의 공간) — 자기 인프라로 새로 채울 것. -->
---
id: CON-00
title: 테스트 도구 카탈로그
status: Active
consumers: [FLOW-01a]
version: 2.0
---
# [CON-00] 테스트 도구 카탈로그 (층 2)

> 이 표는 이 레포(하네스 상류)의 **실제** 테스트 인프라다. 규율: 아래 자산이 있는데 새로 만들면
> 결함이다(AGENTS.md 규칙 4). 필수 3요소 — 무엇이 있고 · 어디 있고 · 어떻게 쓰는가.

| 자산 | 경로(어디) | 호출법(어떻게) |
|---|---|---|
| 수제 러너 관용구 | `scripts/*.test.js` (37개, 자기실행) | `node scripts/<이름>.test.js` — `let pass=0, fail=0` + `check(label, cond)`(2인자) 또는 `check(label, actual, expected)`(3인자) 누적, 종료부 `N passed, M failed` + `process.exit(fail?1:0)`. **npm 래퍼 없이 직접 실행이 정본**, 전체는 셸 루프 또는 CI 체인([TOOL-27] `ci.js`) |
| 순수 로직 분리 규약 | 각 게이트 스크립트 | 게이트는 순수 함수와 `CONTRACT` 를 `module.exports` — 테스트는 FS 없이 require 해 순수부를 먼저 친다(예: `computeHealth`, `parseHeadingEntries`, `checkClosure`) |
| 게이트 계약 검증 | `scripts/gate-contract.js` | `validateContract(CONTRACT)` · `withContract(run)` — 새 게이트는 [PRO-11] 계약 선언 필수, `gate-contract.test.js` 가 전 게이트를 일괄 검사(파일 부재만 건너뜀 — [ADR-28]) |
| 격리 사본 픽스처 | `scripts/fs_walk.js` | `copyTree(src, dst)` — 파괴적 시나리오는 사본에서. [TOOL-20] e6-workspace · [TOOL-26] 어답터 팔이 공유(중복 0) |
| 하류 형상 픽스처 | `scripts/adopter-arm.js` | `dataShape()` — 어답터에서만 참인 데이터 형상의 집합. **규율: 하류 제보로 잡은 형상은 여기에 추가한다**(픽스처가 곧 회귀 고정 — [ADR-40], 실행례 [ADR-47]·[ADR-49]) |
| 임시 작업 공간 | node 표준 | `fs.mkdtempSync(path.join(os.tmpdir(), '...'))` → 종료 시 `fs.rmSync(dir, {recursive:true, force:true})` |

> **검증 순서 규율** (게이트를 먼저 물린다 — [ADR-40]): 수리·가드 배선 전에 *깨진 형상에서 발현*을
> 먼저 실측하고, 수리 후 0 을 확인한다. 단언만으로 통과시키면 [ADR-26] 부류가 재발한다.
> **배송 형상 검증**: 푸시 전, 미커밋 사유물을 뺀 클론에서 전 스위트 — 로컬 green/red 는 둘 다
> 거짓말일 수 있다([ADR-39]).

> **`consumers:` 동작 예시([PRO-16] — 아래는 가공 예시).** 이 카탈로그(계보 `00`)의 호출 규약을 쓰는
> 테스트 케이스가 `[FLOW-01a]`(계보 `01`) 옆에 살면 **계보 산술로는 안 보인다.** 선언해 두면
> `node scripts/blast-radius.js CON-00` 이 소비자와 그 자손을 영향권에 넣고, 소비자가 `Verifying`
> 이면 Fail-close 한다. 도구가 케이스를 생성한다는 §5.3의 관계가 그대로 간선이 된 것이다.
