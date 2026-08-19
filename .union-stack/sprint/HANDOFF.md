<!-- [Wiki] 세션 이어달리기. 세션을 마치는 에이전트가 덮어쓴다. 최신 하나만 유효.
     다음 세션 부트스트랩 시 가장 먼저 읽힘. -->
---
session_id: tool24-lineage-tree-2026-08-18
date: 2026-08-18T00:00:00Z
author: agent
verification: "33스위트 중 31 통과 · 2 실패(미커밋 fdt_canon 귀속) · lint 7종 통과 · TOOL-24 신규 24단언"
version: 1.0
---

# Handoff → 다음 세션

## 1. 세션 요약 (1~3줄)
- 인간 결정 2건 처리: ID 공간 **단일 유지 명문화**([ADR-25], ARCH-00 §ID space + 차단 목록 6건째) ·
  ref-linter **행 정본 편입**([ADR-24], 미해소 114→53).
- **[TOOL-24] lineage-tree 상륙** — 스파이크 출구 1 완료, 스파이크 파일 삭제(처분은 카드로 이관).
  부모를 최근접 실존 조상에 붙여 blast-radius 의미론과 일치시켰다(중간 세대 부재 시 루트 승격 결함 수리).
## 2. 변경 위치 (ID 목록 — Upward Fetching 진입점)
- 규칙: `[ADR-25]` ID 공간 단일 유지(blocks 6건째) · `[ADR-24]` ref-linter 행 정본
- 도구: `[TOOL-24]` lineage-tree 신설(스크립트+테스트+카드, `npm run tree`) · `[TOOL-04]` effect surface 절
- 평면: `ARCH-00` §ID space 신설(Approved-by 커밋) · `spike/SPIKE-visualization_dashboard.md` **삭제**
  (②히트맵 보류·③참조그래프 기각 처분은 TOOL-24 카드 "언제 쓰지 않나"로 이관)
- 작업: `[WO-10a-1]` E6 A/B(Draft) — 인간 실행 대기
## 3. 다음 작업 (단일 진입점)
→ **`context-budget.js`에 AGENTS.md 계측 추가** — 상시 주입 파일 중 최대인 AGENTS.md가 예산
  게이트 밖이다(대상은 project·profile·handoff뿐). 2세션째 이월되는 계측 공백이며 독립적인 소품.
  주의: AGENTS.md는 예산 3종과 성격이 다르다(분할·압축 불가한 단일 진입 파일) — 상한 신설이 아니라
  **관측 표시**가 먼저인지, [PRO-13]의 예산 문법에 맞춰 판단하고 시작할 것.
## 4. 미해결 / 주의
- **미커밋 유지**: `ref/`와 `spike/SPIKE-fdt_canon_import_utility_analysis.md`. 공개 여부는 인간 판단.
  이 파일 하나가 `leakage` FAIL 1 + `ref-linter --strict` 게이팅 + 실패 테스트 2스위트의 원인 전부
  (fdt 제외 사본에서 둘 다 0 — 2회 실증). 다음 세션은 31/2로 읽을 것.
- **[WO-10a-1] 인간 대기**: E6 10런은 top-level 세션 필요. 에이전트가 세션 내 실행 불가.
- **관측 지표 셋**: `tier distribution` `draft:` 0 이탈 여부 · GRANT-02 3개월 생존 시 규칙 승격 검토 ·
  [PRO-15] 반증(WO 생성 1건 — 첫 신호) · `effect surface` deny 0·ask 0·wildcard 13([ADR-23]) ·
  **신규**: [ADR-25] 재개 조건(잠금 오탐/GC 오차단)은 `lock exposure`가 트립와이어.
- 재제안 금지 목록은 **AGENTS.md의 `blocks-index` 블록**이 소유한다 — 여기 복제하지 말 것([ADR-18]).
## 5. 검증 상태
- 테스트 **33스위트 중 31 통과 · 2 실패**(`leakage-guard`·`ref-linter` — 미커밋 fdt 귀속).
  신규: `lineage-tree.test.js` 24단언(101노드 적대 평면 렌더 = 성패 판정 회귀 고정 + 상태 필터 도출·팔레트 배정).
- lint 7종 통과 · `permission-guard --strict` 범위 통과 · 산출물 gitignore 동작 확인(`git status` 무출현).
