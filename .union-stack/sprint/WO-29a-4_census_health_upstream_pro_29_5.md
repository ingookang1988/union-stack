<!-- [Wiki] 작업 지시. 상태 정본은 이 frontmatter `status:` 하나뿐이다([PRO-15]). scaffold 생성 — 선택 절(배경·설계·절차)은 필요할 때만 추가. -->
---
id: WO-29a-4
title: census 지연 분류 + health upstream 실행 가능 항목만 — [PRO-29] ① 5회차 보정
status: Active
parent: PRO-29
evidence: "none — 착수 전"
closed_by: []
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
- 닫을 때 frontmatter `evidence:` 에 값 또는 `none — 이유`(선언 검사가 있으면 `rcpt:<name>@<sha>`). 상위 축 흔적은 `closed_by:`.
