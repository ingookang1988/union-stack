<!-- [Wiki] 세션 이어달리기. 세션을 마치는 에이전트가 덮어쓴다. 최신 하나만 유효.
     다음 세션 부트스트랩 시 가장 먼저 읽힘. -->
---
session_id: dashboard-spike-and-effect-surface-2026-08-18
date: 2026-08-18T00:00:00Z
author: agent
verification: "30스위트 통과 · 2스위트 실패(전부 미커밋 fdt_canon 스파이크 귀속, 사본으로 증명) · lint 7종 통과 · 부트스트랩 2272/4000"
version: 1.0
---

# Handoff → 다음 세션

## 1. 세션 요약 (1~3줄)
- 2세션 체류하던 **E6를 `[WO-10a-1]`로 승격**해 HANDOFF에서 뺐다([PRO-13] §4-4). 미착수 원인은 우선순위가
  아니라 실행 주체였다 — 10런은 인간의 top-level 세션이라 세션 내 에이전트가 대신 못 돈다.
- **시각화 대시보드 스파이크 종료**: 3후보 중 ①계보 트리만 승격, ③참조 그래프는 **기각**(시각화 문제가
  아니라 계측 결함), ②히트맵은 보류. 프로토타입이 첫 렌더에서 구조 결함 하나를 드러냈다.
- 갭 분석 §3-C의 hold 출구를 **`health.js` 관측 1절**로 닫았다([ADR-23]).

## 2. 변경 위치 (ID 목록 — Upward Fetching 진입점)
- 작업: `[WO-10a-1]` E6 A/B 1사이클(Draft) — `sprint/`. `next.md` 뷰 재생성됨
- 결정: `[ADR-23]` 효과 표면 관측 — 원장
- 도구: `[TOOL-04]` health에 `effect surface` 절 추가(관측 4절 체제) · `leakage-guard` METHODOLOGY 1건 등재
- 탐색: `spike/SPIKE-visualization_dashboard.md` (§6에 출구·미결 2건)

## 3. 다음 작업 (단일 진입점)
→ **계보 트리 도구 구현** — `SPIKE-visualization_dashboard.md` §5·§6이 정본. 스크립트 1 + `TOOL-24` 카드
  ([PRO-08]상 PRO 불요). 스파이크가 이미 확정한 것:
  - 소비 표면: `zfs_index.buildIndex` + `zfs_util.ancestorChain`. **새 계산 0**.
  - 성패 판정: `fetch-eval.syntheticPlane(30)`(101노드, `status`·`tier` **부재**, 도메인 5종)이
    무가정 렌더되는가. 프로토타입은 통과했다(실평면 54docs/28노드/13도메인도 동시 통과).
  - 색은 도메인 문자열 해시 → 색상환(하드코딩 0). 산출물은 gitignore.
  - 범위 축소를 지킬 것 — 히트맵·참조 그래프를 끼워 넣지 말 것(각각 보류·기각이다).

## 4. 미해결 / 주의
- ~~ID 공간 충돌~~ **결정됨([ADR-25])**: 단일 공간 유지 명문화(`ARCH-00` §ID space). 코드 분리는
  재제안 차단 목록 등재 — 재개 조건은 잠금 오탐/GC 오차단 실관측. `lock exposure`가 트립와이어.
- ~~ref integrity 상류~~ **수리됨([ADR-24])**: 원장·GRANTS 행 앵커를 known set에 편입, 114→53.
  남은 53건 중 30건은 아래 미커밋 스파이크 귀속, 나머지는 예시 forward-ref + 실조치 가능분.
- **미커밋 유지**: `ref/`와 `spike/SPIKE-fdt_canon_import_utility_analysis.md`. 공개 여부는 인간 판단.
  이 파일 하나가 `leakage` FAIL 1 + `ref-linter --strict` 게이팅 + 실패 테스트 2스위트의 원인 전부다
  (fdt 제외 사본에서 둘 다 0 — 이번 세션 2회 실증). 다음 세션은 30/2로 읽을 것.
- **계측 공백 유지**: `context-budget.js`가 여전히 **AGENTS.md를 안 잰다**. 상시 주입 최대 파일이
  예산 게이트 밖이다. 계보 트리와 무관하게 독립적으로 닫을 수 있는 작은 결함.
- **관측 지표 셋**: `tier distribution`의 `draft:`가 0에서 움직이는가 · GRANT-02 3개월 생존 시 규칙 승격 검토 ·
  [PRO-15] 반증(WO가 실제로 만들어지는가 — 이번 세션 1건 생성으로 첫 신호) · **신규**: `effect surface`의
  `deny 0 · ask 0`과 wildcard 13이 문제로 관측되면 그때 게이트를 제안한다([ADR-23]).
- 재제안 금지 목록은 **AGENTS.md의 `blocks-index` 블록**이 소유한다 — 여기 복제하지 말 것([ADR-18]).

## 5. 검증 상태
- 테스트 **30스위트 통과 · 2스위트 실패**(`leakage-guard`·`ref-linter`) — 둘 다 위 미커밋 파일 귀속.
  `health.test.js` 21단언(효과 표면 7단언 신규).
- lint 7종 통과: naming·history·tool·tools-index·blocks-index·work-close·smell.
- 부트스트랩 2272/4000 tok · `permission-guard --strict` 통과 · WO 도메인 2건(예시 1 + 실작업 1).
