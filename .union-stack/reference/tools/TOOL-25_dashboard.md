<!-- 방법론 자산 카드(leakage-guard METHODOLOGY 등재) — 이 템플릿이 실제로 배송하는 도구. -->
---
id: TOOL-25
title: dashboard (평면 대시보드 — 관측 표면 합성)
kind: cli
impl: scripts/dashboard.js
status: Active
version: 2.3
---

# [TOOL-25] dashboard

## 용도
관측 표면을 자기완결 HTML 1장으로 **합성**한다. **개요는 전체 대시보드 그대로**이고(요약 카드·계보
트리 포함 — 축 페이지가 개요에서 정보를 *빼가지 않는다*), 축 세부 페이지는 나브 또는 요약 카드의
"자세히 →"로 **추가 진입**한다(현재 당위(ARCH) · 스프린트 · 시간축). 새 축은 `VIEWS` 배열에 한 줄을 더해 늘린다.

> **라우팅: 클릭이 정본, 해시는 부가.** 해시만으로 전환하면 `data:` URL 임베드처럼 해시가 유지되지
> 않는 뷰어에서 첫 뷰에 갇혀 나머지 축에 **영영 도달할 수 없다**(실측으로 재현했다). 그래서 나브
> 클릭이 직접 전환하고, `history.replaceState` 는 지원되는 환경에서만 북마크·뒤로가기를 얹는다.
> 파일 분리로 바꾸려면 `VIEWS` 를 파일별로 렌더하고 href 만 바꾸면 된다 — 뷰 함수는 그대로다.

**개요**: 타일 4 + Health([TOOL-04]) · 예산 · 작업대([TOOL-23]) · 신선도 · 크기 헤드룸 · 효과
표면([ADR-23]) · 계약 간선([PRO-16]) · 당위 요약([PRO-04]) · 계보 트리([TOOL-24]). 각 절의 존재
이유(불리언/한 줄 텍스트가 숨기던 신호)는 impl 의 각 섹션 jsdoc 이 정본이다.

## 축 페이지 — 각 축의 "짝"이 설계 원리다 (상세: impl 의 각 뷰 jsdoc)
- **당위(ARCH)** — 짝: verification 첫 화살표(규범↔현실). 규범마다 절 구조 · 집행자 계약(scope=
  사각지대, [PRO-11]) · 인용처 · 집행 등급 3분. ⚠ 인용 ≠ 집행([ADR-07]) — 관측이지 판정 아님.
  게이트 계약은 정적 파싱(발견된 파일을 실행하지 않는다).
- **스프린트** — 짝: 종료 의례([PRO-15]). WO 마다 닫힘 조건(증거 3분 · closed_by 흔적 · 미충족
  사유는 work-close `checkClosure` 소비) + HANDOFF 인계 카드(5부·토큰·검증란).
- **시간축** — 짝: 격자의 두 번째 빈칸(§3.2 — 반복은 스냅샷에 안 보인다, [ADR-04]). 결정 밀도 ·
  재제안 차단([PRO-14] ⛔+재개 조건) · LSN 오답노트 · HISTORY 분기점. 파서는 소유 도구의 export
  소비(parseLedger→[TOOL-22] · parseEntries→history-linter — 중복 파서는 드리프트).

## 예정 축 (보류 — 기각 아님, 표본이 쌓이면 착수)
보류는 결정이며 재개 조건과 한 쌍이다(스파이크 ②히트맵 보류·계약 그래프 보류와 같은 문법 —
표본 없는 시각화는 짓지 않는다).
- **계약(CON) 축 페이지** — 재개 조건: **실계약 3건 이상 또는 간선 10건 이상**([PRO-16] §4·계약
  그래프 재개 조건과 일치). 현재 계약 2건(둘 다 더미)·실간선 1건이라 개요의 계약 간선 카드가 이미
  전부를 보여준다. 착수 시 내용 후보: 계약별 소비자 그래프 · 판별식("바뀌면 무엇이 깨지는가") 위반
  후보 · blast-radius 잠금 이력.
- **기획(PLAN) 축 페이지** — 재개 조건: **실평면 PLAN ≥ 5**(스파이크 ②히트맵 보류 조건 재사용).
  현재 PLAN 1건(예시)이라 그릴 격자가 없다. 착수 시 내용 후보: PLAN×(FLOW·CON·LSN·WO) 커버리지 ·
  MTG/ANL 이 PLAN 을 먹이는 경로 · Crystallized 전이(GC 조건) 상태.

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
