<!-- [Wiki] 세션 이어달리기. 세션을 마치는 에이전트가 덮어쓴다. 최신 하나만 유효.
     다음 세션 부트스트랩 시 가장 먼저 읽힘. -->
---
session_id: canary-c-pro28-2026-10-17
date: 2026-10-18T18:00:00Z
author: agent
verification: "스위트 48 중 46 통과(실패 2 = leakage·ref 테스트, 미커밋 fdt spike 귀속 — 이전과 동일) · 어답터 C 그림자 사본(scratchpad)에 수리 파일 + budgets·upstreamIgnored 설정을 덮어 스위트 그린 확인 · 센서스 3회차 기록(계측기 3곳 전부 9/9) · weakening-guard PASS · ship-manifest 누설 0 · 어답터 팔 7 형상 · lint 체인 leakage 외 exit 0 · handoff-linter 통과"
version: 1.0
---

# Handoff → 다음 세션

## 1. 세션 요약 (1~3줄)
- [PRO-22]·[PRO-24]~[PRO-27] 구현 WO 10건 Closed. **카나리아 A·B·C 전부 완료**(키트 → `template-update --apply`, 각 레포 세션이 직접). A 가 잡은 상류 결함 4 수리(앞 세션),
  C 가 잡은 결함 4 수리(이 세션, 가드 먼저): `adapter.json` **`budgets`**(부트스트랩 예산 재캘리브레이션 — 포크 대신 설정, context-budget·handoff-linter·health·대시보드) ·
  **`upstreamIgnored`**(상류 파일 거부 — 매니페스트 배송보다 우선, Actions 폐기 레포의 harness.yml) · lineage-tree 필터·문서 행 + 대시보드 제품 뷰·규범 카드의 status **첫 토큰**(전문은 title) + live 셀 짝 없는 마커 닫기(산문 status 60종 누설 — 대시보드 '원문 마커 0' 회귀) ·
  센서스 계측기 9(상류 전용·키트 제외) + **WO H2 헤딩 열**.
- **센서스 3회차** 기록(`eval/CENSUS.md`): 계측기 A·B·C 9/9 · 헤딩 분포 — B 는 상류 계약 그대로, A·C 는 한 의미에 표기 3~5종, `## 증거` 0건.
- **[PRO-28] 초안 작성**(Proposed v0.1, `proposals/PRO-28_section_contract.md`): `sections` 별칭 맵(1:N+접두) · 절 계약 린트 CLARIFY · `upward-fetch --sections` 부분 인출 ·
  `scaffold --next`(채번+parent 실존) · PRO-β 흡수(ΔC 신고·압축 보존). 회신 2곳(A·C, 원문 비공개 `eval/private/pro28/`) + 센서스 헤딩 데이터가 근거.

## 2. 변경 위치 (ID 목록 — Upward Fetching 진입점)
- 승인·원장: [PRO-22] [PRO-24] [PRO-25] [PRO-26] [PRO-27] v1.0 · [ADR-53] [ADR-54]. 오더(archived): [WO-27a-1]~[WO-27a-3] [WO-24b-1] [WO-22b-1] [WO-22b-2]
  [WO-25a-1] [WO-26a-1] [WO-24c-1] [WO-24c-2] · [ANL-00a]. 제안: **[PRO-28]**(Proposed).
- 이 세션 스크립트: adapter(`budgets`·`upstreamIgnored`) · context-budget(`budgetsFor`) · handoff-linter(`analyze(text, budget)`) · template-update(거부 글롭·보고) ·
  lineage-tree(`statusHead`) · dashboard(제품 뷰·규범 카드 statusHead · live 셀 closeDanglingMarker) · adopter-census(계측기 9·`headingDist`·헤딩 열). 카드 [TOOL-21] [TOOL-30] · MIGRATION(키 2) · CHANGELOG · `eval/CENSUS.md` 3회차.

## 3. 다음 작업 (단일 진입점)
→ **사람 몫**: ① push ② **[PRO-28] 판정**(§7 미결 4: 접두 방향 · 증거 충족 조건 · ⑤ AGENTS.md 수록 · scaffold 표기) ③ 어답터 잔여 전달 — A: dashboard.test
  (`--apply --force scripts/handoff-linter.js`) · 중복 ID 2쌍; C: `budgets.handoff 2200` + `upstreamIgnored harness.yml` 로 포크·삭제 대체 · 상류 전용 사본 6 삭제 ·
  permission-guard 포크의 CONTRACT · WO-31 중복; B: dashboard 포크 · review 12. 승인 시 에이전트 몫([WO-24c-2] 후속 · 발행 ID 는 WO-28a-1 예정): **sections 파싱 WO**(`sections` 파싱 + 린트 해소, 가드 먼저) → scaffold →
  부분 인출 → 센서스 4회차. 상류 세션은 어답터 레포를 쓰지 않는다(검증은 scratchpad 그림자 사본).

## 4. 미해결 / 주의
- **AGENTS.md 예산 계측 이월 9회+** — 미착수. 설문 실측: 22KB > 한 도구의 규칙 주입 상한(~14.5KB). [PRO-13] §4-4 인간 판정 — [PRO-28] ⑤ 압축 보존 문단과 함께.
- [PRO-23] A/B 런 비용(인간) · PRO-β 는 [PRO-28] ⑤ 로 흡수(별도 승인) · Jev 보류. [PRO-27] §7 미결 4건은 잠정값. [PRO-22] 단계 5 · [PRO-26] ⑤ 는 보류(최하).
- 키트 미지원 둘: `scripts/union-stack/` 하위 설치 · `init --drop-template-bits` 의 상류 전용 삭제. 의존 불일치 경고는 로컬 본문의 require 기준. `upstreamIgnored` 로
  scripts/ 를 거부하면 보고서가 약화 경고 — ci 체인은 없는 단계를 건너뛴다.
- `receipts.md`: 로컬 suite 줄은 REJECT(fdt spike 귀속), CI 줄은 PASS — 영수증은 미화하지 않는다. `work-close` 는 `rcpt:` 인용을 묻는다.
- 공개 평면: 하류 이름·내부 사실·커밋·경로 금지. 설문 대상은 예시가 아니라 실어답터 — 답변 원문은 비공개, 결과는 익명 집계만 상류에. 라벨·경로는 비공개 메모리.
- **미커밋 유지**: `ref/` · `spike/SPIKE-fdt_canon_import_utility_analysis.md` → 로컬 누설·ref 테스트 상시 red. 목록 대조로 새 위반 확인([ADR-39]).
- 이월: [PRO-22] §5 훅 재제안 금지([ADR-08]) · [WO-10a-1] 인간 대기 · [LSN-17]. 재제안 금지 목록은 AGENTS.md blocks 블록 소유 — 복제 금지.

## 5. 검증 상태
- 수치는 frontmatter `verification:` 이 정본. 방법: `node --test "scripts/*.test.js"`(npm 래퍼는 이 머신에서 크래시) · lint 체인 개별 실행 · 누설 가드는
  **마지막 쓰기 뒤** 재실행([ADR-39]) · `node scripts/weakening-guard.js` · `node scripts/adopter-arm.js`(7 형상) · `node scripts/adopter-census.js`(dry-run).
  실패 2건의 fdt 귀속은 ref-linter 출력과 누설 가드 목록(✗ fdt 1건)으로 확인.
