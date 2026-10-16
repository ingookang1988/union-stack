<!-- [Wiki] 세션 이어달리기. 세션을 마치는 에이전트가 덮어쓴다. 최신 하나만 유효.
     다음 세션 부트스트랩 시 가장 먼저 읽힘. -->
---
session_id: wo28a2-2026-10-17
date: 2026-10-19T00:00:00Z
author: agent
verification: "스위트 49 중 47 통과(실패 2 = leakage·ref 테스트, 미커밋 fdt spike 귀속 — 이전과 동일) · scaffold 39(신설) · adapter 77 · work-close 63 · dashboard 186 · 어답터 팔 7 형상 충족 · weakening-guard PASS · work-close --table 동기화 · lint 체인 leakage 외 exit 0 · handoff-linter 통과"
version: 1.0
---

# Handoff → 다음 세션

## 1. 세션 요약 (1~3줄)
- 카나리아 A·B·C 완료 · 센서스 3회차 · **[PRO-28] 승인**([ADR-55], v1.0 — §7 미결 4건은 잠정값). PRO-β 는 [PRO-28] ⑤ 로 흡수(별도 승인).
- **[WO-28a-1] Closed**(인간 승인 2026-10-17, archived · 가드 먼저): `adapter.json sections` 별칭 맵(1:N + 접두, 정규화) · `resolveSection`/`missingSections` · work-close 발행 린트가 맵으로 해소 ·
  frontmatter `evidence:` 가 있으면 `## 증거` 불요 · 매칭 실패 CLARIFY 에 맵 안내. 상류 자신은 맵 없음 = 현행(회귀 0).
- **[WO-28a-2] Verifying**(가드 먼저): `scripts/scaffold.js`([TOOL-36]) — `WO --parent <ID>` 한 줄로 뼈대. 다음 번호 제안(산술: 부모 아래 다음 자식 · 레거시: 도메인 최대+1) ·
  parent 실존 확인 · 필수 3절은 `sections` 맵 첫 별칭 · ≤400 tok · dry-run 기본, `--write` 만 생성. 부수 수리(앞): 대시보드 카드 제목 렌더.

## 2. 변경 위치 (ID 목록 — Upward Fetching 진입점)
- 승인·원장: [PRO-28] v1.0 · [ADR-55]. 오더: **[WO-28a-2]**(Verifying) · archived [WO-28a-1] · [WO-27a-1]~[WO-24c-2] 10건. 이전 승인 [ADR-53] [ADR-54].
- 스크립트: adapter(`sections`·`normalizeHeading`·`resolveSection`·`missingSections`·`SECTION_KEYS`) · work-close(`parseWo` 맵 해소 · evidence 충족 · 안내) · dashboard(카드 제목 proseInline).
  scaffold(신설: `proposeId`·`findParent`·`sectionNames`·`slugOf`·`renderBody`·`plan`). 카드 [TOOL-23] **[TOOL-36]** · `sprint/_GUIDE` §Anatomy · MIGRATION · CHANGELOG ·
  ship-manifest(배송 85) · AGENTS.md tools-index 블록 · `sprint/next.md` 재생성.

## 3. 다음 작업 (단일 진입점)
→ **사람 몫**: ① push ② **[WO-28a-2] 닫기 승인**(Verifying → Closed, archived) ③ 어답터에 `sections` 맵 선언 안내(A: 목적·진입 조건/완료 기준/검증 · C: 목적/수용 게이트·완료 기준/검증 —
  각자 선언, 상류는 안 쓴다; 새 WO 는 `scaffold` 로). 그 뒤 에이전트 몫([PRO-28] 순서, [WO-28a-2] 후속): **③ `upward-fetch --sections` 부분 인출 WO**(발행 ID WO-28a-3 예정 —
  부모 문서의 계약 절만 본문 주입, 나머지는 "절 N · ~M tok 생략" 한 줄, 절 경계 없는 문서는 머리 1,500 tok, 기본값 불변, MCP `upward_fetch` 동반, 가드 먼저) → 센서스 4회차(맵 적용 뒤 매칭률).

## 4. 미해결 / 주의
- **AGENTS.md 예산 계측 이월 9회+** — 미착수. [PRO-13] §4-4 인간 판정 — [PRO-28] ⑤ 압축 보존 문단(Schema)과 함께.
- [PRO-23] A/B 런 비용(인간) · Jev 보류. [PRO-27] §7 미결 4건 · [PRO-28] §7 미결 4건은 잠정값. [PRO-22] 단계 5 · [PRO-26] ⑤ 는 보류(최하).
- 어답터 잔여(각자 몫): A = dashboard.test(`--apply --force scripts/handoff-linter.js`) · 중복 ID 2쌍; C = `budgets.handoff 2200` + `upstreamIgnored harness.yml` · 상류 전용 사본 6 삭제 ·
  permission-guard 포크 CONTRACT · WO-31 중복; B = dashboard 포크 · review 12. 셋 다 `template-update --apply` 로 da9cf67·385cf80·이번 커밋을 받는다.
- 키트 미지원 둘: `scripts/union-stack/` 하위 설치 · `init --drop-template-bits` 의 상류 전용 삭제. `upstreamIgnored` 로 scripts/ 거부는 약화 경고.
- `receipts.md`: 로컬 suite 줄은 REJECT(fdt spike 귀속), CI 줄은 PASS — 영수증은 미화하지 않는다. `work-close` 는 `rcpt:` 인용을 묻는다(이번 WO 는 `rcpt:n/a`).
- 공개 평면: 하류 이름·내부 사실·커밋·경로 금지. 설문 대상은 예시가 아니라 실어답터 — 답변 원문은 비공개(`eval/private/pro28/`), 결과는 익명 집계만.
- **미커밋 유지**: `ref/` · `spike/SPIKE-fdt_canon_import_utility_analysis.md` → 로컬 누설·ref 테스트 상시 red. 목록 대조로 새 위반 확인([ADR-39]).
- 이월: [PRO-22] §5 훅 재제안 금지([ADR-08]) · [WO-10a-1] 인간 대기 · [LSN-17]. 재제안 금지 목록은 AGENTS.md blocks 블록 소유 — 복제 금지.

## 5. 검증 상태
- 수치는 frontmatter `verification:` 이 정본. 방법: `node --test "scripts/*.test.js"`(npm 래퍼는 이 머신에서 크래시) · lint 체인 개별 실행 · 누설 가드는
  **마지막 쓰기 뒤** 재실행([ADR-39]) · `node scripts/weakening-guard.js` · `node scripts/adopter-arm.js`(7 형상) · `node scripts/work-close.js --table`.
  실패 2건의 fdt 귀속은 ref-linter 출력과 누설 가드 목록(✗ fdt 1건)으로 확인.
