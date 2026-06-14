<!-- [Wiki] 세션 이어달리기. 세션을 마치는 에이전트가 덮어쓴다. 최신 하나만 유효.
     다음 세션 부트스트랩 시 가장 먼저 읽힘. -->
---
session_id: harness-review-followups-2026-06-14
date: 2026-06-14T00:00:00Z
author: agent
verification: "전체 게이트 그린 + 테스트 13스위트 전부 통과 (186 passed, 0 failed). npm 래퍼는 git-bash에서 segfault — node 직접 실행으로 검증."
version: 1.0
---

# Handoff → 다음 세션

## 1. 세션 요약 (1~3줄)
- 외부 하네스-엔지니어 리뷰의 7개 보완점을 순서대로 구현. **런타임 강제(hooks)·효능 eval·컨텍스트
  예산·ref 게이트 승격** 4종은 코드+테스트로, **횡단축·플릿 동시성·기둥 자기규율** 3종은 하네스
  자기진화 루프(PRO-04·05 + 가이드)로 처리.
- 핵심 전환: "선언적 거버넌스" → "사전 강제 런타임 하네스"의 마지막 간극(의례 강제·효능 측정)을 닫음.

## 2. 변경 위치 (ID 목록 / 파일 — Upward Fetching·탐색 진입점)
- `[PRO-04]` 횡단 관심사 = pillar 아님, `concern:` 태그 오버레이 (§8.3 종결)
- `[PRO-05]` 병렬 플릿 동시성 = append union-merge + 계보 파티셔닝 + Wiki OCC (+ `.gitattributes`)
- 신규 코드(전부 zero-dep·테스트동반): `scripts/hooks.js`·`hook-pretool.js`·`hook-userprompt.js`·`HOOKS.md`,
  `scripts/context-budget.js`, `scripts/eval.js`, `eval/PROTOCOL.md`
- 게이트 변경: `scripts/ref-linter.js`(forward 마커 `[ID?]` + `--strict` 게이팅), `scripts/health.js`(+context budget 차원)
- 엔트리: `AGENTS.md`(부트스트랩 토큰예산 문단), `proposals/_GUIDE.md`(신규 pillar 분할원리 정당화 의무),
  `package.json`(eval·budget 스크립트 + 신규 테스트 3종), `.github/workflows/harness.yml`(ref --strict + npm test)

## 3. 다음 작업 (단일 진입점)
- → **[E3] enforce 도그푸딩 = PHASE-02 마지막 1개.** E1·E2·E4 **전부 완료**(`eval/RESULTS.md` + `CALIBRATION.md`):
  · E1(H1~H4): 순수 비국소 측정 시 세 가치 **+1.0 분산0**, 모델-무관, **토큰 ROI ≈82×**(주입 208 tok, 손익분기 1.2%).
  · E4: 캘리브레이션 모델 `scripts/eval.js` 코드화·E1 4점 재현. · E2: `scripts/fetch-eval.js` 100노드 평면
  **precision=recall=1.00·주입 불변**. [E3]만 남음 — 본질적 *종단* 작업이라 부분 가림: ①훅 활성화는 사용자가
  `.claude/settings.json`에 `scripts/HOOKS.md` 스니펫 복사(에이전트 자동설치 분류기 차단), ②CI 재착륙은
  워크플로 스코프 필요, ③enforce FP율은 실사용 누적 필요. E3 완료 시 **v6.0 승격**.

## 4. 미해결 / 주의
- **hooks 활성화는 사용자 행위**: 보안상 에이전트가 `.claude/settings.json`을 자동 설치하지 않는다.
  `scripts/HOOKS.md`의 스니펫을 사용자가 직접 복사해야 작동(명령 실행 훅이므로 의도된 제약).
- **이월(PRO-04)**: `health.js`에 `concern:` 태그 분포 INFO 차원 — YAGNI까지 보류.
- **이월(PRO-05)**: 런타임 분산락은 비범위(정직한 한계). 구조적 회피(계보 분할)가 1차, version OCC가 2차.
- ref advisory 15건은 전부 예시/가이드/방법론(정화-면제) — strict 게이트엔 0건. 실프로젝트 init 후에만 문다.
- 토큰 추정은 char/4 근사(실 토크나이저 아님) — 절대값 아닌 추세·예산대비로 읽을 것.

## 5. 검증 상태
- 게이트 전부 그린: naming·history·leakage·permission(append-only)·ref(--strict)·size·lock·**context budget**.
- 테스트 13스위트 **186 passed, 0 failed**(신규 hooks 11·context-budget 7·eval 9 포함).
- hooks 실측: Schema 편집 차단(exit 2)·작업ID 맥락 자동주입 확인. `health`: 가이드 21, MTG:2, PRO:5.
