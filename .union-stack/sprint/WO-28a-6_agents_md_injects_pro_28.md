<!-- [Wiki] 작업 지시. 상태 정본은 이 frontmatter `status:` 하나뿐이다([PRO-15]). scaffold 생성 — 선택 절(배경·설계·절차)은 필요할 때만 추가. -->
---
id: WO-28a-6
title: 상시 주입 위생 — AGENTS.md 계측 + injects 대조 — [PRO-28] ⑤ 판정 후속
status: Draft
parent: PRO-28
evidence: "none — 착수 전"
closed_by: []
version: 1.0
---
# [WO-28a-6] 상시 주입 위생 — AGENTS.md 계측 + injects 대조 — [PRO-28] ⑤ 판정 후속

## 목표
[PRO-28] ⑤ 판정(2026-10-18: ΔC 신고 조건부 승인 · 압축 보존 문단 보류)을 싣는다. 순서가 조건이다 —
**① 계측 먼저**: `context-budget` 이 가장 큰 상시 주입 표면인 AGENTS.md(마커 블록)를 세지 않는다(휴리스틱 ≈5,925 tok, 총 상한 4000 단독 초과 추정). 이를 advisory 행으로 합산 — 예산 계측 이월 9회+ 해소.
**② 대조**: PRO frontmatter `injects: "+N tok — 이유"` 를 읽어 신고 합계와 실측 증분을 나란히 보인다. 기존 PRO 소급 없음(필드 없음 = 신고 0).

## 수용 기준
- 테스트 먼저([ADR-40]): AGENTS.md 행(마커 블록 경계 · 파일 없음 = 행 없음) · `injects:` 파싱(값 없음/형식 오류 = CLARIFY) · 맵·필드 없음 = 현행 출력과 동일(회귀 0).
- AGENTS.md 행은 **advisory** — 게이트·상한 수치는 정하지 않는다(별도 예산 여부는 [PRO-13] §4-4 인간 판정).
- AGENTS.md 본문은 쓰지 않는다(Schema, 인간 몫). 압축 보존 규칙도 넣지 않는다(보류).
- 카드 [TOOL-*] context-budget · CHANGELOG · 실측 수치를 HANDOFF 에 넘겨 §4-4 판정 재료로.

## 증거
- 닫을 때 frontmatter `evidence:` 에 값 또는 `none — 이유`(선언 검사가 있으면 `rcpt:<name>@<sha>`). 상위 축 흔적은 `closed_by:`.
