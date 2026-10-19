<!-- [Wiki] 작업 지시. 상태 정본은 이 frontmatter `status:` 하나뿐이다([PRO-15]). scaffold 생성 — 선택 절(배경·설계·절차)은 필요할 때만 추가. -->
---
id: WO-29a-4
title: census 지연 분류 + health upstream 실행 가능 항목만 — [PRO-29] ① 5회차 보정
status: Verifying
parent: PRO-29
evidence: "구현 완료(2026-10-19, 테스트 먼저): template-update updates = 실행 가능 항목만(auto · 안 본 review · ⚠ · 릴리스) + reviewSeen(--apply·--ack-review 만 기록) · health upstream 실행할 것 없음 표기 · census 지연 5분류(적용 가능·보존 포크·review·상류 전용·거부, 로컬은 해시만). rcpt:n/a — template-update.test 125 · health.test 78 · adopter-census.test 58 · 스위트 50 중 48(실패 2 = fdt spike) · 팔 7 형상. 5회차 재계산: 적용 가능 A 0 · B 0 · C 0"
closed_by: [.union-stack/reference/tools/TOOL-30_adopter_census.md, .union-stack/reference/tools/TOOL-21_template_update.md, .union-stack/proposals/PRO-29_connection_closure.md]
version: 1.0
---
# [WO-29a-4] census 지연 분류 + health upstream 실행 가능 항목만 — [PRO-29] ① 5회차 보정

## 목표
[PRO-29] §6 판정(2026-10-19: 바 = **자동 적용 가능 지연 0**)을 도구에 싣는다. census 5회차가 드러낸 두 결함을 고친다.
1. **census 지연 분류**: 한 숫자 "지연 N"을 **적용 가능 · 보존 포크 · review · 상류 전용 · 거부** 다섯 갈래로 나눈다. 바는 "적용 가능 0"이다.
   - 상류 전용: 상류 `ship-manifest.json` 의 upstreamOnly. 거부: 어답터 `adapter.json upstreamIgnored`. review: `classifyPath === 'review'`.
   - 보존 포크: 어답터 로컬 블롭 ≠ 앵커(3-way 의 modified와 같은 판정 — 로컬 파일 **해시만** 계산하고 본문은 읽지 않는다). 나머지 sync 지연 = 적용 가능.
2. **health `upstream` 알림 피로**: 5회차에 3곳 모두 실행할 것이 없는데 상시 "업데이트 있음"이 떴다. `checkSummary.updates` 를 **실행 가능 항목이 있을 때만** true 로 한다.
   - 실행 가능 = 자동 적용 대상(sync − 분기 − 앵커 없음 − HOLD) > 0 · 새 review 반영 대상 > 0(직전 확인 이후 상류에서 바뀐 review) · ⚠ 마이그레이션 > 0.
   - 보존 포크·이미 본 review 는 줄의 숫자로만 보인다(INFO), "업데이트 있음"을 켜지 않는다.

## 수용 기준
- 테스트 먼저([ADR-40]): census `syncLag` 다섯 갈래(픽스처 각 1) · 상류 전용·거부 판별 · 해시만 읽기(어답터 쓰기 0) · 익명 열 "적용 가능 N · 포크 · review · 상류 전용 · 거부".
  template-update — 포크만 남음 → updates false · 앵커 없음만 → false(대신 키트/`--force` 안내) · review 변화 새것 → true · ⚠ → true · 기존 lastCheck 꼴 읽기 호환.
  health — "업데이트 있음"/"최신(보존 포크 N · review N)" 표기 · handoff-linter 는 새 `updates` 를 그대로 따른다(실행할 것 없으면 침묵).
- "새 review" 판별: lastCheck 에 직전 review 경로→상류 sha 를 남겨 비교(캐시 키 추가, 앵커 불변). 첫 확인은 전부 새것.
- 5회차 원자료로 재계산: A·B·C 적용 가능 0 · health 상시 알림 0 이 나와야 한다(나오지 않으면 그 사유를 증거에).
- 팔 7 형상 · 스위트 회귀 0 · 카드 [TOOL-21]·[TOOL-04]·[TOOL-30] · CHANGELOG · MIGRATION("upstream 줄 읽는 법" 갱신).

## 증거
- 테스트: template-update +14(포크만·앵커 없음만·HOLD 만 = false · 자동 1 = true · review 안 봄/봄/다시 바뀜 · ⚠ · 릴리스 · reviewSeenFrom · 보존 3종) · health +3(실행할 것 없음 표기 · 실행 가능 순서 · 구 캐시) ·
  census +5(5분류 각 1 · 로컬 없음 = 적용 가능 · ctx 없음 회귀 0 · 익명 열 2).
- **5회차 원자료 재계산(origin/main, 2026-10-19)**: 적용 가능 **A 0 · B 0 · C 0** ✓ — 나머지 A 보존 포크 2 · B 보존 포크 6 · review 4 · 상류 전용 2(+ review 이력 밖 5, 무해) · C 0.
- health 상시 알림: 어답터의 현 캐시는 구 코드가 쓴 것이라 아직 "업데이트 있음". 새 코드는 첫 확인에서 **안 본 review 를 한 번** 알린다(reviewSeen 이 아직 없다 — 설계상 1회).
  `--apply` 또는 `--ack-review` 한 번 뒤 조용해진다 — 다음 적용 회차에서 3곳 확인(자기 확인 열이 "최신"/"실행할 것 없음"으로 바뀌어야 한다).
- 설계 판단: "본 review"는 백그라운드 확인이 아니라 **사람이 보고서를 본 시점**(`--apply` · `--ack-review`)에만 기록 — 확인만으로 표시하면 아무도 안 본 변화가 조용히 사라진다.
