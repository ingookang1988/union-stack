<!-- 방법론 자산 카드(leakage-guard METHODOLOGY 등재) — 이 템플릿이 실제로 배송하는 도구. -->
---
id: TOOL-02
title: Upward Fetching (작업 진입 의례 자동화)
kind: script
impl: scripts/upward-fetch.js
status: Active
version: 1.0
---

# [TOOL-02] Upward Fetching

## 용도
작업 ID의 부모 계보 맥락(PLAN·FLOW·CON·ARCH·MTG) + 같은 계보 LSN(사전경고)을 수집한다.

## 언제 쓰나
- 코드 작성 **전**, `WO-*`/`PLAN-*` ID를 받은 모든 작업 진입 시(AGENTS.md 의례 1~3단계 자동화).

## 언제 쓰지 않나
- ID가 아직 없는 자유 탐색(→ `spike/`). ID를 억지로 만들지 말 것.

## 호출
```bash
node scripts/upward-fetch.js WO-01a1-2
```
같은 로직: 슬래시 커맨드 `/upward-fetch`, MCP `upward_fetch`, UserPromptSubmit 훅(자동 주입).
- 조상 = **ID 산술 ∪ frontmatter 부모**(`parent:`·`plan:`, 도메인 무관 — PRO·우산 WO·중간 PLAN 도 루트)([PRO-27] ③). 선언 부모는 `← frontmatter 부모` 로 표시되고 그 조상까지 폐포로 따라간다. `adapter.json lineage.arithmeticFrom` 아래 구간은 산술을 끄고 선언 부모만 본다.
- 계보 맥락이 **0건이면 `(없음)` 통과가 아니라 CLARIFY(exit 3)** — 기획 없는 진입인지, 부모를 frontmatter 에 선언해야 하는지 묻는다. 차단 아님.
- `up:` 접두 ID(상류 참조, `up:PRO-27`)는 로컬 색인에서 해소하지 않고 외부 참조 INFO 로 끝낸다([PRO-27] ①).
