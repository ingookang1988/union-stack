<!-- [Wiki] 작업 지시. 상태 정본은 이 frontmatter `status:` 하나뿐이다([PRO-15]). scaffold 생성 — 선택 절(배경·설계·절차)은 필요할 때만 추가. -->
---
id: WO-29a-3
title: 1회차 적용 회신 결함 2 — 어답터 생성 파일의 상류 ID up: 접두 + census 이력 밖 앵커를 sync 경로로 한정 — [PRO-29] ①
status: Draft
parent: PRO-29
evidence: "none — 착수 전"
closed_by: []
version: 1.0
---
# [WO-29a-3] 1회차 적용 회신 결함 2 — 어답터 생성 파일의 상류 ID up: 접두 + census 이력 밖 앵커를 sync 경로로 한정 — [PRO-29] ①

## 목표
[WO-29a-2] 하류 적용 1회차 회신(3곳, 원문 비공개 `eval/private/pro29/`)에서 나온 상류 결함 2건. [WO-29a-2] 범위 고정 원칙에 따라 따로 고친다.
1. **어답터 생성 파일의 상류 ID**: `work-close` 의 `NEXT_SKELETON` 이 어답터 `sprint/next.md` 머리글에 `[PRO-15]` 를 쓴다 → 로컬 PRO-15 가 없는 어답터에서
   `ref-linter --strict` Fail-close(C 실측 · 손 편집 금지 생성 파일이라 어답터가 못 고친다). 상류가 **어답터 쪽에 쓰는** 문자열의 상류 ID 는 `[up:ID]`([PRO-27] ①).
2. **census 이력 밖 앵커 과대 경보**: B 의 5건은 전부 review 범주 — `template-update` 3-way 가드는 sync 후보의 앵커만 쓰고 review 는 `--apply`·`--force` 어느 쪽도 쓰지 않으므로
   **덮어쓰기 위험이 없다**. 열의 ⚠ 와 "다음 `--apply` 가 덮는다" 문구는 틀렸다. foreign 은 sync 범주 경로만 센다(review 앵커는 별도 INFO 또는 생략).

## 수용 기준
- 테스트 먼저([ADR-40]): work-close — 어답터 모드(템플릿 아님)에서 새로 만든 next.md 에 `[up:PRO-15]`, 상류 자신은 현행 유지 · 그 파일에 어답터 `ref-linter --strict` 0건.
  다른 생성기(`scaffold`·`blocks-index`·`tools-index`·`test-catalog` 등 어답터 파일에 쓰는 것)의 상류 ID 문자열을 전수 확인 — 발견분은 같은 규칙으로, 0건이면 0건이라고 적는다.
- census — `syncLag` 의 foreign 은 `classifyPath === 'sync'` 경로만 · review 이력 밖 앵커는 경보 아님(표기하면 INFO) · B 픽스처 꼴(5건 review) → ⚠ 0.
- 기존 어답터 next.md 는 고치지 않는다(어답터 몫) — MIGRATION 한 줄: 머리글의 `[PRO-15]` → `[up:PRO-15]` 또는 `work-close --table --write` 재생성.
- 팔 7 형상 · 스위트 회귀 0 · CHANGELOG · 카드 [TOOL-23]·[TOOL-30] · 1회차 회신 요약(익명)을 증거 절에.

## 증거
- 닫을 때 frontmatter `evidence:` 에 값 또는 `none — 이유`(선언 검사가 있으면 `rcpt:<name>@<sha>`). 상위 축 흔적은 `closed_by:`.
