<!-- [Wiki] 작업 지시. 상태 정본은 이 frontmatter `status:` 하나뿐이다([PRO-15]). scaffold 생성 — 선택 절(배경·설계·절차)은 필요할 때만 추가. -->
---
id: WO-29a-6
title: 상류 이탈 알림 고리 ② — 대시보드 어답터 이탈(신규) 카드 + HANDOFF 한 줄 + 7일 health INFO — [PRO-29] ②(c)(d)
status: Verifying
parent: PRO-29
evidence: "구현 완료(2026-10-19, 테스트 먼저): census_round 배송 헬퍼 · 대시보드 어답터 이탈(신규) 카드 · census --handoff 한 줄 · 상류 health adopter census(7일) · handoff-linter adopter-deviation-unrelayed — 전부 상류 전용(어답터 회귀 0). rcpt:n/a — census_round.test 12 · health.test 83 · handoff-linter.test 34 · dashboard.test 195 · 스위트 51 중 49(실패 2 = fdt spike) · 팔 7 형상 · 실데이터 6회차 표면 4곳 도달 · 주입 재사용 4/4"
closed_by: [.union-stack/reference/tools/TOOL-30_adopter_census.md, .union-stack/reference/tools/TOOL-04_health.md, .union-stack/proposals/PRO-29_connection_closure.md]
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
- 테스트: census_round 신규 12(원자료 없음 = null · 레이블별 최신 · 익명 · 신규 수 · HANDOFF 한 줄 4꼴 · 7일 경계) · health +5(회차 없음 · 6일/8일 · fails·warns 불변 · 어답터 차원 없음) ·
  handoff-linter +5(미언급 CLARIFY · 언급 통과 · 신규 0·null 침묵 · --handoff 안내) · dashboard +7(카드 없음/있음 · 델타 없음 · 이스케이프). health 차원 수 스냅샷은 "20 + 상류 전용 1"로 갱신.
- 설계: 표면 3곳(dashboard·health·handoff-linter)은 배송 파일이라 상류 전용 adopter-census 를 require 못 한다 → 배송 헬퍼 `census_round.js`(어답터에선 원자료가 없어 전부 null). ship-manifest 재생성(배송 89).
- **성공 바 — 실데이터**: census `--delta --write` 1회(6회차) → 대시보드 카드 ✓ · `--handoff` 한 줄 "어답터 이탈 신규 8 — A sync:applicable · weak:numeric-change · B sync:applicable · C rule:blocks-missing · …" ✓ ·
  health `adopter census` "신규 이탈 8" ✓ · handoff-linter 가 현 HANDOFF(이번 세션 전 작성)에 `adopter-deviation-unrelayed` CLARIFY ✓ — 세션 종료 HANDOFF 에 한 줄을 실으면 해소.
- **성공 바 — 주입 재사용**(어답터 형상 사본): 주입 회차 원자료로 세 표면 → HANDOFF 한 줄 5키 · 대시보드 4/4 · health 신규 5 · linter CLARIFY ✓. 8일 경계는 단위 테스트.
- 카드 크기: TOOL-25 에 한 줄을 더하면 smell 상한(4000자)을 넘어 — 표면 설명은 TOOL-30 으로 옮겼다.
