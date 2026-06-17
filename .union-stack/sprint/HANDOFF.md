<!-- [Wiki] 세션 이어달리기. 세션을 마치는 에이전트가 덮어쓴다. 최신 하나만 유효.
     다음 세션 부트스트랩 시 가장 먼저 읽힘. -->
---
session_id: pro-06-agent-team-2026-06-17
date: 2026-06-17T00:00:00Z
author: agent
verification: "전 게이트 그린(naming·leakage·permission·history·ref --strict·context-budget·size·lock·domain) + 테스트 15스위트 0 fail. context budget 1316/4000 불변. npm 래퍼는 git-bash segfault — node --test 직접 실행으로 검증."
version: 1.0
---

# Handoff → 다음 세션

## 1. 세션 요약 (1~3줄)
- 프로젝트 현황 리뷰(v6.0 Empirical Harness, E3만 잔여 확인) → 사용자 요청으로 **sub-agent 레이어 추가**.
- **[PRO-06] 승인·구현 완료**: agent-team 리소스(SCIM-Group + `lead`) + 계보-파티셔닝 오케스트레이션 의례.
  [PRO-03] §5 이월 회수, [PRO-05] 동시성 재사용, 신규 도메인·게이트·스크립트 **0**(profile/agent 셀 확장).

## 2. 변경 위치 (ID 목록 / 파일 — Upward Fetching·탐색 진입점)
- `[PRO-06]` agent-team 리소스 + 플릿 오케스트레이션 (status: Approved, §7 결정 기록)
- `profile/agent/team_example.md` **신규** — SCIM-Group 더미(`lead`·`members[]`참조·`overrides{}`·advisory authority)
- `profile/agent/_GUIDE.md` — "future" 절 → 확정 team 스키마 표 + `lead` 설명
- `AGENTS.md` §Upward Fetching — **플릿 오케스트레이션 문단**(리드 계보 분해→위임, 서브트리별 ritual, 리드 단독 HANDOFF)
- `sprint/_GUIDE.md` — HANDOFF 단일-작성자(리드) 규율 1줄

## 3. 다음 작업 (단일 진입점)
- → **[E3] enforce 도그푸딩 = PHASE-02 마지막 1개**(불변). 본질적 *종단*+권한 가림: ①훅 활성화=사용자가
  `scripts/HOOKS.md` 스니펫을 `.claude/settings.json`에 직접 복사, ②CI 재착륙=워크플로 스코프, ③enforce FP율=실사용 누적.
- (선택) **PRO-06 실전 검증**: 작은 작업을 2개 계보로 분할해 서브에이전트 위임 시연 — agent-team 모델 도그푸딩.

## 4. 미해결 / 주의
- **agent-team은 서술적 전용**: 이 평면은 에이전트를 spawn하지 않는다. 실제 기동은 플랫폼(Claude Code `Agent`
  툴/subagent_type, Workflow) 몫. `lead`·`authority`는 advisory(CODEOWNERS 패턴) — 집행은 플랫폼 hooks/permissions.
- **플릿 충돌 회피는 락 아닌 계보 분할**(PRO-05): version OCC는 탐지이지 예방 아님. 계보 겹치면 직렬화/인간 에스컬레이트(Fail-close).
- **hooks 활성화=사용자 행위**(불변): 보안상 에이전트가 `.claude/settings.json` 자동 설치 안 함.
- **이월**: PRO-04(concern 태그 INFO 차원), PRO-05(런타임 분산락 비범위), PRO-06(팀 health 지표=YAGNI까지 보류).
- 커밋은 main에 올림(레포 관례). **push 미실행** — main-push는 재승인 필요(메모리 기록).

## 5. 검증 상태
- 게이트 전부 그린: naming·history·leakage·permission(append-only)·ref(--strict)·size·lock·context budget·domain.
- 테스트 15스위트 **0 failed**. context budget **1316/4000 불변**(오케스트레이션 문단을 정적 부트스트랩이 아닌 작업별 ritual 구역에 배치).
- 도메인 분포: PRO:5→6. doc/guide 20/21.
