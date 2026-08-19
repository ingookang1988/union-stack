<!-- 방법론 자산 카드(leakage-guard METHODOLOGY 등재) — 이 템플릿이 실제로 배송하는 도구. -->
---
id: TOOL-25
title: dashboard (평면 대시보드 — 관측 표면 합성)
kind: cli
impl: scripts/dashboard.js
status: Active
version: 1.1
---

# [TOOL-25] dashboard

## 용도
관측 표면을 자기완결 HTML 1장으로 **합성**한다 — 스탯 타일 4개 + 카드 7절:
Health 게이트+관측([TOOL-04]) · 부트스트랩 토큰 예산 · 활성 WO 작업대([TOOL-23]) ·
평면 신선도 · 파일 크기 헤드룸 · 효과 표면 도구별([ADR-23]) · 계보 트리+상태 필터([TOOL-24]).
세션 진입/종료 시 평면 상태를 한 화면에서 훑는 용도다.

**세 절은 불리언/한 줄 텍스트로는 안 보이던 것을 드러내려고 있다:**
- *크기 헤드룸* — 게이트는 상한을 *넘는 순간*에만 말한다. `archive_ledger`는 append-only라
  줄어들 수 없으므로 임박(27/30KB)을 미리 봐야 분할·로테이션을 제때 결정한다.
- *평면 신선도* — `무기입`은 "동기화 지연"이 아니라 **한 번도 쓰인 적 없는 평면**이다(현재 3면).
  경과일 pill 로 죽은 평면과 늦은 평면을 가른다.
- *효과 표면 도구별* — 7항목이 한 줄로 흐르면 스캔이 안 된다.

## 설계 불변식
- **합성이지 계산이 아니다** — 4개 도구의 기존 export(`health.gather` · `context-budget.gather` ·
  `work-close.gather`+`ACTIVE` · `lineage-tree.planeBody`+`PLANE_CSS`+`FILTER_JS`)를 소비만 한다.
  `health.gather()`가 판정(`dims`) 외에 원자료(`sizes`·`sync`)도 내므로 같은 수집을 두 번 하지 않는다.
- 경과일 계산의 `today`는 `gatherAll`이 주입한다 — 렌더는 순수하게 유지되고 테스트가 결정적이다.
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
