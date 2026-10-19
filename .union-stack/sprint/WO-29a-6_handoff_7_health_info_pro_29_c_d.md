<!-- [Wiki] 작업 지시. 상태 정본은 이 frontmatter `status:` 하나뿐이다([PRO-15]). scaffold 생성 — 선택 절(배경·설계·절차)은 필요할 때만 추가. -->
---
id: WO-29a-6
title: 상류 이탈 알림 고리 ② — 대시보드 어답터 이탈(신규) 카드 + HANDOFF 한 줄 + 7일 health INFO — [PRO-29] ②(c)(d)
status: Draft
parent: PRO-29
evidence: "none — 착수 전"
closed_by: []
version: 1.0
---
# [WO-29a-6] 상류 이탈 알림 고리 ② — 대시보드 어답터 이탈(신규) 카드 + HANDOFF 한 줄 + 7일 health INFO — [PRO-29] ②(c)(d)

## 목표
[PRO-29] ② 상류 이탈 알림 고리의 (c)(d): [WO-29a-5] 가 판별한 **신규 이탈**을 사람이 이미 보는 표면에 싣고, 그 판별이 잊히지 않게 세션 경계에 건다. 새 채널·데몬은 없다([PRO-29] §2).
- (c) **알림 표면**
  1. 대시보드([TOOL-25]): "어답터 이탈(신규)" 카드 — 최신 원자료의 레포별 신규/지속/해소(익명 라벨·이탈 키만). 상류 전용 — `eval/private/census/` 가 없으면 카드 없음(어답터 대시보드 회귀 0).
  2. census `--handoff`: 상류 HANDOFF §4 에 붙일 **한 줄**을 stdout 으로(예: `어답터 이탈 신규 3 — A sync:applicable · C rule:blocks-missing · …`). 신규 0 이면 "신규 0".
- (d) **트리거**
  1. 상류 health 차원 `adopter census`(상류 자신만, INFO): 마지막 회차 날짜 · **7일 초과**면 "census 회차 필요" + 명령. 원자료 없음 = INFO "회차 없음".
  2. 상류 handoff-linter: 마지막 회차 이후 신규 이탈이 있는데 §4 에 그 언급이 없으면 CLARIFY(차단 아님 — [WO-29a-2] 의 upstream-unrelayed 와 같은 문법). 상류 자신만.

## 수용 기준
- 테스트 먼저([ADR-40]): 대시보드 카드 렌더(원자료 픽스처 · 없음 = 카드 없음) · `--handoff` 한 줄(신규 있음/0/첫 회차) · health 차원 7일 경계(6일 = 정상 · 8일 = 회차 필요) · 어답터(템플릿 아님) = 차원·린터 규칙 없음 ·
  handoff-linter 신규 이탈 미언급 CLARIFY / 언급 통과 / 신규 0 침묵.
- 익명성: 표면 어디에도 어답터 경로·이름 0(라벨·이탈 키·개수만, [ADR-11]). 원자료는 읽기만.
- **닫힘 조건([PRO-29] ② 성공 바)**: census `--delta --write` 1회로 신규 이탈이 대시보드와 HANDOFF 한 줄에 실린다(사람 왕복 0 · 어답터 변경 0) · 주입 실험 재사용으로 표면까지 4/4 · 마지막 회차 8일 픽스처에서 health 가 그 사실을 보인다.
- 팔 7 형상 · 스위트 회귀 0 · 카드 [TOOL-25]·[TOOL-30]·[TOOL-04] · CHANGELOG. 범위 밖: ③ 이식기.

## 증거
- 닫을 때 frontmatter `evidence:` 에 값 또는 `none — 이유`(선언 검사가 있으면 `rcpt:<name>@<sha>`). 상위 축 흔적은 `closed_by:`.
