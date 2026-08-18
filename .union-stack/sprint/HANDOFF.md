<!-- [Wiki] 세션 이어달리기. 세션을 마치는 에이전트가 덮어쓴다. 최신 하나만 유효.
     다음 세션 부트스트랩 시 가장 먼저 읽힘. -->
---
session_id: reproposal-blocks-and-schema-friction-2026-08-18
date: 2026-08-18T00:00:00Z
author: agent
verification: "28스위트 0 fail · 게이트 전부 그린 · 부트스트랩 2072/4000 · permission-guard --strict 전 커밋 통과. npm 래퍼는 이 머신에서 크래시 — node 직접 실행."
version: 1.0
---

# Handoff → 다음 세션

## 1. 세션 요약 (1~3줄)
- 외부 딥리서치(`ref/`) 대비 갭 분석에서 **구조적 결함 하나**를 찾아 닫았다 — 결정 기록의 *보존*은
  규율이었으나 *배송* 경로가 없었다([PRO-14]). 같은 병이 [PRO-12] `tier: draft`에서도 발견돼 함께 배선했다.
- Schema 편집 마찰을 실측하고 GRANT-02로 완화했다(규칙 변경 0 — 철회 가능한 스탬프로).

## 2. 변경 위치 (ID 목록 — Upward Fetching 진입점)
- 규칙: `[PRO-14]`(승인·반영 완료) · `[GRANT-02]` — `_GUIDE.md` 상시 스탬프
- 결정: `[ADR-18]`(차단 표식 도입·소급 흡수) `[ADR-19]`(계측기 자기언급 오염 3회차) — 원장
- 신규 도구: `[TOOL-22]` blocks-index · 신규 게이트는 `npm run lint` 체인에 편입
- 탐색: `spike/SPIKE-model_led_graph_gap.md` (§6 출구 — A·B는 승격 완료, **C는 미해소**)

## 3. 다음 작업 (단일 진입점)
→ **E6 1사이클 10런 실행**(`eval/e6-suite/README.md` 운영 순서) — 지난 세션의 진입점이 그대로 남아 있다.
   D1~D5를 ①무시나리오/②강제 두 팔에 같은 순서로. `build`가 찍어 주는 발화 **하나만** 입력(추가 발화 금지),
   종료 후 `verify`. 10런 후 `node scripts/eval-arm.js <①> <②> --n 5`. **pass일 때만** 델타를
   `[TOOL-17]`의 `evidence[]`에 고정하고 `status: Draft → Active`.
   ⚠ 팔은 **사람이 top-level 세션으로** 돌려야 한다 — 서브에이전트 대행은 측정 자체가 안 된다([ADR-16] ②).

## 4. 미해결 / 주의
- **미커밋·미푸시**: 로컬 6커밋이 origin에 없다. `ref/`(외부 리서치 63KB)와
  `spike/SPIKE-fdt_canon_import_utility_analysis.md`는 **의도적으로 커밋하지 않았다** —
  후자는 실 위탁 리포트라 누설 가드가 정당하게 막는다(더미 마커를 붙이면 트립와이어 무력화).
  공개 여부는 인간 판단 사항. 이 파일 하나가 `leakage` FAIL 1건 + `ref-linter` 게이팅 30건의 원인 전부다.
- **[PRO-14] §4.1 실측 교정**: 예산 감소는 관측되지 않았다(2044→2072). 원인은 별건 —
  `context-budget.js`가 **AGENTS.md를 측정하지 않는다**(대상은 project·profile·handoff).
  상시 주입 파일의 비용이 예산 게이트에 안 보인다 → 차원 추가 여부는 미결.
- **관측 지표 둘**: `health`의 `tier distribution`이 `draft:0`에서 움직이는가([PRO-12] 실사용 여부) ·
  GRANT-02가 3개월 뒤에도 철회되지 않으면 규칙 승격(PRO) 검토 — 지금 승격하지 않은 이유가 증거 부족이다.
- **갭 분석 §3-C 미해소**: 효과 표면(git push·Bash)이 평면 밖 비구조 allowlist로 통제된다.
  최소 조치는 `health.js` 관측 차원 1개. 새 게이트는 증거 후.
- 재제안 금지 목록은 이제 **AGENTS.md의 `blocks-index` 블록**이 소유한다 — 여기 복제하지 말 것([ADR-18]).

## 5. 검증 상태
- 게이트 그린: naming·history·permission(+strict)·handoff·tool·smell·tools-index·**blocks-index**·budget·lock.
  (leakage만 FAIL 1 — 위 §4의 untracked 파일 하나, 커밋 대상 아님.)
- 테스트 **28스위트 0 fail** · 부트스트랩 2072/4000 tok · HANDOFF 예산 확인 필요 시 `node scripts/handoff-linter.js`.
