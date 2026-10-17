<!-- [Wiki] 세션 이어달리기. 세션을 마치는 에이전트가 덮어쓴다. 최신 하나만 유효.
     다음 세션 부트스트랩 시 가장 먼저 읽힘. -->
---
session_id: close-wo28a6-session-end-2026-10-18
date: 2026-10-18T12:00:00Z
author: agent
verification: "스위트 50 중 48 통과(실패 2 = leakage·ref 테스트, 미커밋 fdt spike 귀속 — 이전과 동일) · context-budget.test 25(+10) · weakening-guard PASS(예외 순증 0) · zfs·history·tool·smell 린터 통과 · work-close --table 동기화 · 누설 가드 ✗ fdt 1건만 · handoff-linter 통과"
version: 1.0
---

# Handoff → 다음 세션

## 1. 세션 요약 (1~3줄)
- **[PRO-28] ⑤ 판정(인간 승인 2026-10-18) — 분리**: ΔC 신고 = 조건부 승인(AGENTS.md 계측 먼저) · 압축 보존 문단 = 보류(미계측 표면에 상시 문단 추가는 ΔC 신고와 모순).
  PRO-28 §3 ⑤ 판정 주석 · §7 미결 갱신.
- **[WO-28a-6] Closed**(인간 승인 2026-10-18, archived) — `context-budget` advisory: AGENTS.md 계측(생성 마커 블록 분리) + PRO frontmatter `injects:` 합산·형식 오류 CLARIFY.
  총합·over·exit code 밖(회귀 0). 신고 규칙은 proposals/_GUIDE. 누설 가드 METHODOLOGY 에 WO 등재(같은 근거).
- **실측**: AGENTS.md **5,925 tok**(휴리스틱 — 총 상한 4000 단독 초과) 중 생성 마커 블록(blocks-index·tools-index) **2,853 tok(48%)**. injects 신고 0건. 예산 계측 이월 9회+ → 계측은 해소, 판정은 남음.

## 2. 변경 위치 (ID 목록 — Upward Fetching 진입점)
- 승인·원장: [PRO-28] v1.0(⑤ 판정 주석) · [PRO-13] §4-4(다음 판정 자리). 오더(archived): [WO-28a-1]~[WO-28a-6].
- 스크립트: context-budget(`measureAgents`·`parseInjects`·`gatherInjects`, `advisory` 필드) · leakage-guard(METHODOLOGY +1). 문서: proposals/_GUIDE(ΔC 신고) · CHANGELOG.
  context-budget 전용 TOOL 카드는 없다(health [TOOL-04] 차원) — 신설 안 함.

## 3. 다음 작업 (단일 진입점)
→ **사람 몫**: ① push(로컬 커밋 3개 앞섬) ② **[PRO-13] §4-4 판정** — AGENTS.md 를 상시 주입 상한에 넣을지/별도 예산을 줄지. 재료 = 5,925 tok, 그중 48% 가 생성 색인.
  색인 블록을 링크-위임(on-demand fetch)으로 줄이는 선택지가 손 문단 압축보다 먼저다. 압축 보존 문단 재판정은 이 결과 뒤 첫 압축 때(대안 = 압축 절차 쪽 규칙, 상시 비용 0).
  그 뒤 에이전트 몫: 판정에 따른 WO(예산 행 승격 또는 색인 위임) · 어답터 접촉은 센서스 5회차 때(별칭·exclude 반영 뒤 잔여 원인 이동 관측).

## 4. 미해결 / 주의
- AGENTS.md 본문(Schema)은 사람이 쓴다 — 에이전트는 생성 마커 블록 재생성 외 손대지 않는다.
- [PRO-23] A/B 런 비용(인간) · Jev 보류. [PRO-27] §7 · [PRO-28] §7 미결은 잠정값. A ⑥ `budgets.historyPerEntry` · [PRO-22] 단계 5 · [PRO-26] ⑤ 보류(최하).
- 어답터 잔여(각자 몫, 상류는 어답터 레포를 쓰지 않는다): A = dashboard.test · 중복 ID 2쌍 · evidence 소급; C = `budgets.handoff 2200` + `upstreamIgnored harness.yml` · 상류 전용 사본 6 ·
  permission-guard 포크 CONTRACT · WO-31 중복 · status 없는 WO 18; B = dashboard 포크 · review 12. 셋 다 `template-update --apply` 로 최신을 받는다.
- 키트 미지원 둘: `scripts/union-stack/` 하위 설치 · `init --drop-template-bits` 상류 전용 삭제.
- `receipts.md`: 로컬 suite 줄 REJECT(fdt 귀속), CI 줄 PASS — 미화하지 않는다.
- 공개 평면: 하류 이름·내부 사실·커밋·경로 금지. 설문 원문은 `eval/private/pro28/`, 결과는 익명 집계만.
- **미커밋 유지**: `ref/` · `spike/SPIKE-fdt_canon_import_utility_analysis.md` → 로컬 누설·ref 테스트 상시 red. 목록 대조로 새 위반 확인([ADR-39]).
- 이월: [PRO-22] §5 훅 재제안 금지([ADR-08]) · [WO-10a-1] 인간 대기 · [LSN-17]. 재제안 금지 목록은 AGENTS.md blocks 블록 소유 — 복제 금지.

## 5. 검증 상태
- 수치는 frontmatter `verification:` 이 정본. 방법: `node --test "scripts/*.test.js"`(npm 래퍼는 이 머신에서 크래시) · lint 체인 개별 실행 · 누설 가드는
  **마지막 쓰기 뒤** 재실행([ADR-39]) · `node scripts/weakening-guard.js` · `node scripts/context-budget.js`(advisory 절) · `node scripts/work-close.js --table`.
  실패 2건의 fdt 귀속은 ref-linter 출력과 누설 가드 목록(✗ fdt 1건)으로 확인.
