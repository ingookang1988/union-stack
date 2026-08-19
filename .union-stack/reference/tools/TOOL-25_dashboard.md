<!-- 방법론 자산 카드(leakage-guard METHODOLOGY 등재) — 이 템플릿이 실제로 배송하는 도구. -->
---
id: TOOL-25
title: dashboard (평면 대시보드 — 관측 표면 합성)
kind: cli
impl: scripts/dashboard.js
status: Active
version: 1.0
---

# [TOOL-25] dashboard

## 용도
관측 표면 4개를 자기완결 HTML 1장으로 **합성**한다: Health 게이트+관측([TOOL-04]) ·
부트스트랩 토큰 예산 · 활성 WO 작업대([TOOL-23]) · 계보 트리+상태 필터([TOOL-24]).
세션 진입/종료 시 평면 상태를 한 화면에서 훑는 용도다.

## 설계 불변식
- **합성이지 계산이 아니다** — 4개 도구의 기존 export(`health.gather` · `context-budget.gather` ·
  `work-close.gather`+`ACTIVE` · `lineage-tree.planeBody`+`PLANE_CSS`+`FILTER_JS`)를 소비만 한다.
  데이터의 옳음은 각 소스 도구의 테스트가 소유하고, 여기서는 그리기만 검증한다(로직 1벌, 표면 N개).
- 어답터 평면 무가정은 소스 도구가 이미 보장한다 — 이 도구는 그 출력을 재해석하지 않는다.
- 판정 마크 색은 dataviz 예약 status 팔레트(OK 녹·FAIL 적·WARN 호박) — 계열색(도메인 칩)과
  절대 공유하지 않고, 항상 글리프+단어를 동반한다(색 단독 금지).
- 섹션 함수는 전부 순수(데이터 → HTML 조각) · zero-dep 자기완결(인라인 CSS/JS, CDN 0).
- 산출물(`dashboard.html`)은 **gitignore** — 커밋하면 드리프트 게이트가 하나 더 필요해진다.

## 언제 쓰나
- 세션 진입 시 낯선 평면(어답터 레포)의 건강·예산·작업대·구조를 한 번에 잡을 때.
- 세션 종료 전 게이트 FAIL·예산 초과·잠금(🔒)을 마지막으로 훑을 때.

## 언제 쓰지 않나
- **CI/커밋 게이트** — 판정은 각 린터의 exit code 가 정본이다(`--json`은 health FAIL 시 exit 1을
  중계하지만, 게이트 체인을 대체하지 않는다).
- **계보만 볼 때** — [TOOL-24] `npm run tree`가 더 가볍다.

## 호출
```bash
node scripts/dashboard.js                 # 실평면 → dashboard.html (gitignored)
node scripts/dashboard.js --out <path>    # 출력 경로 지정
node scripts/dashboard.js --json          # 수집 데이터를 JSON 으로 (health FAIL 시 exit 1)
```
