<!-- [Wiki] 작업 지시. 상태 정본은 이 frontmatter `status:` 하나뿐이다([PRO-15]). scaffold 생성 — 선택 절(배경·설계·절차)은 필요할 때만 추가. -->
---
id: WO-29a-2
title: 하류 제안 고리 닫기 — HANDOFF 린터 upstream 연결 + 어답터 3곳 실동기화 관측 — [PRO-29] ①(c)
status: Draft
parent: PRO-29
evidence: "none — 착수 전"
closed_by: []
version: 1.0
---
# [WO-29a-2] 하류 제안 고리 닫기 — HANDOFF 린터 upstream 연결 + 어답터 3곳 실동기화 관측 — [PRO-29] ①(c)

## 목표
[PRO-29] ① 하류 제안 고리를 **닫는다** — 성공 바 "3곳 모두 최신 상류로 동기화된 상태가 census 로 관측된다".
- (c) **HANDOFF 린터 연결**: health `upstream` 이 "업데이트 있음"(캐시 기준, 네트워크 0)인데 HANDOFF §3 다음 작업·§4 미해결에 업데이트 제안이 없으면 CLARIFY 1줄
  (차단 아님 · 캐시 없음/상류 자신 = 침묵). 제안이 사람에게 닿았는지를 세션 종료 의례가 묻는다.
- **실동기화 관측**: 이 WO 의 상류 몫은 (1) 위 변경의 배송 (2) census 에 "동기화 지연" 열(로컬 버전·마지막 `--apply` 일자·`lastCheck.updates`, 읽기 전용 — 앵커 파일만 읽음).
  각 어답터의 적용은 **어답터 세션에서 그 사람이** 한다([PRO-24] §5 — 상류는 어답터 레포를 쓰지 않는다). 상류는 회차 행으로 결과만 본다.

## 수용 기준
- 테스트 먼저([ADR-40]): handoff-linter — 업데이트 있음 + 언급 없음 = CLARIFY · 언급 있음(`template-update`·`업데이트 제안` 등) = 통과 · 캐시 없음·self = 침묵 · 픽스처는 네트워크 없이.
  census — 동기화 지연 열(raw/익명) · 앵커 없음 = "판별 불가"(0 아님, [ADR-23]) · 어답터 쓰기 0 유지.
- 팔 7 형상 충족 · `--apply` 로 받는 두 파일(handoff-linter·template-update)의 의존 불일치 0(HOLD 0).
- **닫힘 조건(사람 몫 포함)**: 어답터 A·B·C 각 세션에서 health `upstream` → `--proposal` → 사람 승인 → `--apply` 를 1회씩 수행하고, 상류 census 5회차 행에서
  3곳 모두 "동기화 지연 0" 이 관측된다. 3곳 중 하나라도 보류하면 그 사유를 행에 남기고 이 WO 는 Verifying 에 머문다(위조 금지).
- 부산물: 적용 중 드러난 상류 결함은 이 WO 에서 고치지 않고 별 WO 로 발행(범위 고정). 카드 [TOOL-30] · handoff-linter 카드 · CHANGELOG.

## 증거
- 닫을 때 frontmatter `evidence:` 에 값 또는 `none — 이유`(선언 검사가 있으면 `rcpt:<name>@<sha>`). 상위 축 흔적은 `closed_by:`.
