<!-- [Wiki] 세션 이어달리기. 세션을 마치는 에이전트가 덮어쓴다. 최신 하나만 유효.
     다음 세션 부트스트랩 시 가장 먼저 읽힘. -->
---
session_id: profile-pillar-2026-06-10
date: 2026-06-10T00:00:00Z
author: agent
verification: "전체 게이트 그린 + 테스트 10스위트 전부 통과 (155 passed, 0 failed)"
version: 1.0
---

# Handoff → 다음 세션

## 1. 세션 요약 (1~3줄)
- **profile(행위자) pillar 신설** (v5.14) — union-stack 최초의 "누가" 축. 인간(user⊂team⊂org) + 에이전트,
  서술형 통신 선호(존댓말·호칭·톤) 중심, 권한은 advisory만(집행은 플랫폼 위임).
- 정석 완주: 딥리서치(25주장 검증·0기각) → spike → `[MTG-02a]` 심의 → `[PRO-03]` 승인 → 구현.

## 2. 변경 위치 (ID 목록 — Upward Fetching 진입점)
- `[PRO-03]` profile pillar 신설 (Approved) / `[MTG-02a]` 심의 기록 / `SPIKE-profile_axis.md` (해소됨·삭제 가능)
- 신규 평면: `.union-stack/profile/` — `_GUIDE.md` 3종 + 더미 예시 4종(user/team/org/agent)
- 코드: `scripts/leakage-guard.js`(CONTENT_DIRS+profile), `leakage-guard.test.js`(+2케이스),
  `.gitignore`(`profile/**/*.local.md`), `AGENTS.md`(부트스트랩 2단계 삽입 + 규칙2 Wiki에 profile)

## 3. 다음 작업 (단일 진입점)
- → 실사용 시작: 실제 프로필을 `profile/human/user_<id>.local.md`로 작성(gitignore됨, 스키마는 example 참조).
  부트스트랩이 IDENTITY 직후 profile을 읽도록 이미 배선됨.

## 4. 미해결 / 주의
- **이월 1**: PII example-vs-real 심화(스키마 검증 게이트, local 템플릿 자동 생성 등) → 별도 스파이크 필요.
- **이월 2**: agent-team/org 전용 리소스(SCIM Group 유사) → 수요 생기면 후속 PRO. v1은 `provider.organization` 표기.
- 캐스케이드 구현 주의: 선호 스칼라 user-wins, `org.policy.*`만 org-wins — 가이드에 명시됨(`profile/_GUIDE.md`).
- `SPIKE-profile_axis.md`는 해소 완료 — 다음 정리 때 삭제해도 됨(내구 지식은 가이드 3종에 증류).

## 5. 검증 상태
- 게이트 전부 그린: naming·history·leakage(+profile 스캔)·permission·size·lock.
- 테스트 10스위트 155 passed, 0 failed. gitignore 패턴 `git check-ignore`로 실동작 확인.
- `node scripts/health.js`: 가이드 21개(+3), MTG:2, PRO:3.
