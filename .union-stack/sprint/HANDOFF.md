<!-- [Wiki] 세션 이어달리기. 세션을 마치는 에이전트가 덮어쓴다. 최신 하나만 유효.
     다음 세션 부트스트랩 시 가장 먼저 읽힘. -->
---
session_id: delivery-gaps-and-work-exit-ritual-2026-08-18
date: 2026-08-18T00:00:00Z
author: agent
verification: "29스위트 0 fail · lint 8종 통과 · 부트스트랩 2055/4000 · permission-guard --strict 전 커밋 통과. npm 래퍼는 이 머신에서 크래시 — node 직접 실행."
version: 1.0
---

# Handoff → 다음 세션

## 1. 세션 요약 (1~3줄)
- 외부 리서치 대조에서 **"승인했다 ≠ 배송된다"** 결함군을 찾아 셋 다 닫았다 — 결정 원장의 주입 경로 부재
  ([PRO-14]), 승인됐으나 진입점에 없던 `tier: draft`, 실측 마찰의 절반이던 `_GUIDE` 승인([GRANT-02]).
- 이어 **종료 의례의 부재**를 닫았다([PRO-15]) — 진입 3중 대 종료 0. 그 과정에서 결함 둘을 수리했다:
  계보 판정 양방향 불일치([ADR-20])와 발동 경로가 없던 `Live` 잠금([ADR-22]).

## 2. 변경 위치 (ID 목록 — Upward Fetching 진입점)
- 규칙: `[PRO-14]` 재제안 차단 · `[PRO-15]` WO 정본화·종료 의례 · `[GRANT-02]` `_GUIDE` 상시 스탬프
- 결정: `[ADR-18]`~`[ADR-22]` — 원장. 되돌릴 조건은 `blocks:` 표식으로 등재(차단 목록 5건)
- 도구: `[TOOL-22]` blocks-index · `[TOOL-23]` work-close. 둘 다 `npm run lint` 체인에 편입
- 평면: `sprint/WO-*` 신설 · `sprint/next.md`는 **생성 뷰**(손 편집 금지) · `sprint/archived/` 신설
- 탐색: `spike/SPIKE-model_led_graph_gap.md` (§3-C만 미해소)

## 3. 다음 작업 (단일 진입점)
→ **시각화 대시보드 스파이크** — `spike/`에서 먼저 탐색한다(만들기 전에 확인).
  성격: 이 템플릿이 배송하는 **틀**이며, 실제 사용자는 어답터 레포를 운영하는 에이전트다.
  따라서 우리 평면의 도메인·깊이·규모를 **가정하면 안 된다**.
  - 후보 셋(가치순): ①계보 트리/그래프 ②PLAN×(FLOW·CON·LSN·WO) 커버리지 히트맵
    ③끊어진 참조 그래프(현재 `ref integrity` 80건이 평평한 목록이라 아무도 안 본다)
  - 제약: zero-dep 단일 HTML(인라인 SVG+JSON, CDN 금지) · 읽기 전용 · 하드코딩 0(도메인·색까지
    인덱스에서 도출) · 새 계산 금지(`zfs_index`/`query`/`health` export 소비) · 산출물은 gitignore
    (커밋하면 24번째 드리프트 게이트가 필요해진다)
  - **확장성 증명**: `scripts/fetch-eval.js`가 [E2]에서 쓰는 **101노드 적대적 합성 평면**을 렌더해
    가정 없이 도는지 본다. 이게 스파이크의 성패 판정이다.
  - 절차: [PRO-08]상 도구는 PRO 불요 — 스크립트 1 + `TOOL-24` 카드면 된다.
    만들지 **않기로** 결론나면 그것도 정상 출구(스파이크 3출구).

## 4. 미해결 / 주의
- **E6 1사이클 10런이 2세션째 미착수**다. [PRO-13] §4-4상 3세션 생존은 라우팅 오류 신호 —
  다음 세션에서 **승격(WO 문서화) 또는 폐기**를 결정할 것. 조용히 세 번째로 넘기지 말 것.
  (내용: `eval/e6-suite/README.md` 운영 순서. 팔은 사람이 top-level 세션으로 — [ADR-16] ②)
- **미커밋 유지**: `ref/`(외부 리서치)와 `spike/SPIKE-fdt_canon_import_utility_analysis.md`.
  후자는 실 위탁 리포트라 누설 가드가 **정당하게** 막는다(더미 마커 부착은 트립와이어 무력화).
  공개 여부는 인간 판단. 이 파일 하나가 `leakage` FAIL 1 + `ref-linter` 게이팅 30건의 원인 전부다.
- **계측 공백**: `context-budget.js`가 **AGENTS.md를 측정하지 않는다**(대상은 project·profile·handoff).
  상시 주입 파일의 비용이 예산 게이트에 안 보인다 — 대시보드가 이걸 드러낼 첫 후보다.
- **갭 분석 §3-C 미해소**: 효과 표면(git push·Bash)이 평면 밖 비구조 allowlist로 통제된다.
  최소 조치는 `health.js` 관측 차원 1개. 새 게이트는 증거 후.
- **관측 지표 셋**: `tier distribution`의 `draft:`가 0에서 움직이는가 · GRANT-02가 3개월 뒤에도
  살아 있으면 규칙 승격 검토 · [PRO-15] 반증 조건(WO 문서가 실제로 만들어지는가).
- 재제안 금지 목록은 **AGENTS.md의 `blocks-index` 블록**이 소유한다 — 여기 복제하지 말 것([ADR-18]).

## 5. 검증 상태
- lint 8종 통과: naming·history·tool·tools-index·**blocks-index**·**work-close**·smell·leakage.
- 테스트 **29스위트 0 fail**(work-close 28단언 신규, zfs_util 52→73단언).
- 부트스트랩 2055/4000 tok · `permission-guard --strict` 전 커밋 통과 · WO 도메인 첫 사용(미사용 16→13).
