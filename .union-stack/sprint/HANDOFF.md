<!-- [Wiki] 세션 이어달리기. 세션을 마치는 에이전트가 덮어쓴다. 최신 하나만 유효.
     다음 세션 부트스트랩 시 가장 먼저 읽힘. -->
---
session_id: wo27a2-status-map-backfill-2026-10-16
date: 2026-10-16T12:00:00Z
author: agent
verification: "스위트 40 중 38 통과(실패 2 = leakage·ref 테스트, 미커밋 fdt spike 귀속 — 이전과 동일) · lint 체인 15종 중 leakage 외 전부 exit 0 · 어답터 팔 5 형상 성공 바 전부 충족 · 상류 backfill dry-run 대상 0 · handoff-linter 통과 · context budget 2,306/4,000"
version: 1.0
---

# Handoff → 다음 세션

## 1. 세션 요약 (1~3줄)
- 하류 설문 2회 회수·집계(`eval/SURVEY-01_results.md` 9건 · `eval/SURVEY-02_results.md` 4건) → **[PRO-22] v1.0 승인**([ADR-53])과
  **[PRO-24]·[PRO-25]·[PRO-26]·[PRO-27] 일괄 승인**([ADR-54] — 결정 넷 + "규칙보다 전제를 먼저 설문" 교훈). 상시 서버 배포 기각은
  blocks 표식으로 AGENTS.md 인덱스에.
- **[WO-27a-1]·[WO-27a-2] 구현 완료(둘 다 Verifying)** — ①④⑤: `health --root` · 중복 ID REJECT · `[up:ID]` 외부 참조 + `upstream-prefix.js` ·
  빈 upward-fetch CLARIFY(3). ②: `adapter.json statusMap·evidenceFields` 를 zfs_index·work-close 가 읽기 시 매핑(원문 rawStatus) ·
  `scripts/frontmatter-backfill.js`([TOOL-29], dry-run 기본, `--apply` 는 status: 한 줄 · 로컬 어휘 그대로). 어답터 팔 형상 legacy·serial·vocab.
  설문 WO 둘 Closed → archived · 어답터 3곳 설문 spike 폐기(인간 지시).

## 2. 변경 위치 (ID 목록 — Upward Fetching 진입점)
- [PRO-22] [PRO-24] [PRO-25] [PRO-26] [PRO-27] Approved v1.0 · [ADR-53] [ADR-54] · [WO-27a-1] [WO-27a-2] Verifying · [WO-22b-1] Active.
- 스크립트(27a-1): zfs_util · ref-linter · query · upward-fetch · blast-radius · health · zfs-linter · adopter-arm · mcp-server · eval · upstream-prefix(신규).
  (27a-2): adapter(statusMap/evidenceFields · mapStatus/fieldAliases) · zfs_index(매핑+rawStatus) · work-close(parseWo cfg) · frontmatter-backfill(신규) ·
  adopter-arm(vocabShape). 카드 [TOOL-01]~[TOOL-04] [TOOL-21] [TOOL-23] [TOOL-26] [TOOL-29](신규) · [CON-00] 블록 · AGENTS.md tools/blocks 블록 · MIGRATION.md · CHANGELOG.md.
- 상류 밖(비커밋): 어답터 3곳 spike 폐기 완료 — 위치·이름은 비공개 메모리([ADR-11]).

## 3. 다음 작업 (단일 진입점)
→ **[WO-27a-3] 발행·착수** — [PRO-27] ③ frontmatter 계보 1급: `zfs_index` 가 `plan:`/`parent:` 를 읽어 조상 = 산술 ∪ frontmatter ·
  `adapter.json lineage.arithmeticFrom`(그 번호부터만 산술 상속) · 우산 WO(`WO-NN`)·중간 PLAN 을 계보 루트로 · upward-fetch/blast-radius/roadmapWiring 이
  합산 조상을 쓴다. 이것이 상류 PRO-부모 WO 의 upward-fetch CLARIFY 를 닫는다(검증: `upward-fetch WO-27a-2` 가 PRO-27 을 맥락으로 싣고 exit 0).
  팔 `serial` 형상의 바를 CLARIFY → "plan: 부모 반환"으로 올린다. 그 뒤 [WO-22b-1] → [PRO-24] ② census. [WO-27a-1]·[WO-27a-2] 는 인간이 Closed 판정.

## 4. 미해결 / 주의
- **AGENTS.md 예산 계측 이월 8회+** — 미착수. 설문 실측: AGENTS.md 22KB > Antigravity 규칙 주입 상한(~14.5KB). [PRO-13] §4-4 인간 판정.
- [PRO-23] A/B 런 비용 결정(인간) · PRO-β(상시 주입 위생, ACE 근거) 미작성 · Jev 보류(재검토 조건: 독립 벤치·재현성 명시·가입 재개).
- [PRO-27] §7 미결 4건은 잠정값으로 진행(`up:` 접두 · 백필 기본 = 비움+보고 · arithmeticFrom 은 census 추정 · PRO 상태도 statusMap).
- **상류 WO 의 upward-fetch 가 CLARIFY(exit 3)** — WO 부모가 PRO 라 CONTEXT_DOMAINS 밖. 사실이지 결함이 아니며 [WO-27a-3] ③ 이 닫는다. 훅은 영향 없음.
- statusMap 은 **강제가 아니다** — 매핑에 없는 값은 그대로 산다. 상류 자신은 adapter.json 이 없어 모든 출력이 이전과 같다. 백필은 상류가 어답터 문서를
  고치지 않는 경계([PRO-27] §5)를 팔의 "dry-run 쓰기 0" 바가 기계로 지킨다.
- 어답터 팔 사본은 작업트리째(미커밋 spike 포함) — legacy 형상의 strict 바는 픽스처 파일만 과녁으로 잡는다. 배포 접두는 `upstream-prefix.js` 를 거친다.
- 공개 평면: 하류 이름·내부 사실·커밋·경로 금지. 설문 대상은 예시가 아니라 실어답터 — 결과는 익명 집계만 상류에.
- **미커밋 유지**: `ref/` · `spike/SPIKE-fdt_canon_import_utility_analysis.md` → 로컬 누설·ref 테스트 상시 red. 목록 대조로 새 위반 확인([ADR-39]).
- 이월: [PRO-22] §5 훅 재제안 금지([ADR-08]) · [WO-10a-1] 인간 대기 · [LSN-17] 배송 한계. 재제안 금지 목록은 AGENTS.md blocks 블록 소유 — 복제 금지.

## 5. 검증 상태
- 수치는 frontmatter `verification:` 이 정본. 방법: `node --test "scripts/*.test.js"`(npm 래퍼는 이 머신에서 크래시) · lint 체인 개별 실행 ·
  누설 가드는 **마지막 쓰기 뒤** 재실행([ADR-39]).
- 실패 2건의 fdt 귀속은 ref-linter 출력(미해소 ADR-103 전부 fdt 파일)과 누설 가드 목록(✗ fdt 1건)으로 확인.
- 설문 답변 수치 중 상류가 직접 재검증한 것만 results 에 "확인"으로 표기 — 재검증 메모는 비공개 메모리.
