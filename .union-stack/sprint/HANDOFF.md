<!-- [Wiki] 세션 이어달리기. 세션을 마치는 에이전트가 덮어쓴다. 최신 하나만 유효.
     다음 세션 부트스트랩 시 가장 먼저 읽힘. -->
---
session_id: wo24b1-adopter-census-2026-10-16
date: 2026-10-16T20:00:00Z
author: agent
verification: "스위트 41 중 39 통과(실패 2 = leakage·ref 테스트, 미커밋 fdt spike 귀속 — 이전과 동일) · lint 체인 15종 중 leakage 외 전부 exit 0 · 어답터 팔 5 형상 성공 바 전부 충족 · 센서스 1회차 레포 3 측정(공개 행 이름·경로 0) · handoff-linter 통과 · context budget 예산 내"
version: 1.0
---

# Handoff → 다음 세션

## 1. 세션 요약 (1~3줄)
- 하류 설문 2회 회수·집계(`eval/SURVEY-01_results.md` 9건 · `eval/SURVEY-02_results.md` 4건) → **[PRO-22] v1.0 승인**([ADR-53])과
  **[PRO-24]·[PRO-25]·[PRO-26]·[PRO-27] 일괄 승인**([ADR-54] — 결정 넷 + "규칙보다 전제를 먼저 설문" 교훈). 상시 서버 배포 기각은
  blocks 표식으로 AGENTS.md 인덱스에.
- **[PRO-27] 다섯 전제 전부 구현 — [WO-27a-1]·[WO-27a-2]·[WO-27a-3] Verifying.** ①④⑤ `health --root` · 중복 ID REJECT · `[up:ID]` + `upstream-prefix.js` ·
  빈 upward-fetch CLARIFY. ② `statusMap·evidenceFields` 읽기 시 매핑 + `frontmatter-backfill.js`([TOOL-29]). ③ 조상 = 산술 ∪ frontmatter 부모
  (`parent:`/`plan:`, 도메인 무관, 폐포) — upward-fetch·blast-radius·roadmapWiring 이 쓰고 `lineage.arithmeticFrom` 아래는 산술을 끈다.
  상류 PRO-부모 WO 의 CLARIFY 가 닫혔다. 어답터 팔 형상 legacy·serial·vocab. 설문 WO 둘 Closed → archived · 어답터 spike 폐기(인간 지시).
- **[PRO-24] ② 회수층 구현 + 1회차 — [WO-24b-1] Verifying.** `scripts/adopter-census.js`([TOOL-30])가 어답터 3곳을 읽기 전용으로 재서
  `eval/CENSUS.md` 에 익명 행 3개(사람 왕복 0 · 어답터 변경 0). 원자료는 gitignored `eval/private/`. 1회차가 고친 것: statusMap 첫 토큰 폴백 ·
  상태 분포 상위 8종 캡.

## 2. 변경 위치 (ID 목록 — Upward Fetching 진입점)
- [PRO-22] [PRO-24] [PRO-25] [PRO-26] [PRO-27] Approved v1.0 · [ADR-53] [ADR-54] · [WO-27a-1] [WO-27a-2] [WO-27a-3] [WO-24b-1] Verifying · [WO-22b-1] Active.
- (24b-1): adopter-census(신규 · [TOOL-30]) · adapter(mapStatus 첫 토큰) · adopter-arm(vocab 바 2) · `eval/CENSUS.md`(신규, 1회차) · `.gitignore` eval/private/ · CHANGELOG.
- 스크립트(27a-1): zfs_util · ref-linter · query · upward-fetch · blast-radius · health · zfs-linter · adopter-arm · mcp-server · eval · upstream-prefix(신규).
  (27a-2): adapter(statusMap/evidenceFields · mapStatus/fieldAliases) · zfs_index(매핑+rawStatus) · work-close(parseWo cfg) · frontmatter-backfill(신규) ·
  adopter-arm(vocabShape). (27a-3): adapter(lineage.arithmeticFrom · arithmeticApplies) · zfs_index(parents · arithmetic) · query(lineageAncestors · upwardFetch
  via · blastRadius viaParent · roadmapWiring) · upward-fetch/blast-radius 표시 · work-close(lineage-break 산술 구간만) · adopter-arm(serial·legacy 상향).
  카드 [TOOL-01]~[TOOL-04] [TOOL-21] [TOOL-23] [TOOL-26] [TOOL-29](신규) · [CON-00] 블록 · AGENTS.md tools/blocks 블록 · MIGRATION.md · CHANGELOG.md.
- 상류 밖(비커밋): 어답터 3곳 spike 폐기 완료 — 위치·이름은 비공개 메모리([ADR-11]).

## 3. 다음 작업 (단일 진입점)
→ **[WO-22b-1] 착수** — [PRO-22] §3 단계 1·2: 검사 선언(`checks` + kind·env·cost, `ci.js --scan` 생성기) + 실행 영수증(dirty·검사 대상 수·env·generator·
  harness/product, **0건 검사 = 실패**의 3분할 규칙은 WO 본문). 가드 먼저. 센서스 1회차 결과가 [PRO-24] §7 미결(주기·원자료 보관)의 입력이 됐고,
  다음 하류 접촉은 [PRO-24] ①(b) `localOwned`·키트 — 어답터 쪽 적용은 인간 지시 후. [WO-27a-1·2·3]·[WO-24b-1] 은 인간이 Verifying → Closed 판정.

## 4. 미해결 / 주의
- **AGENTS.md 예산 계측 이월 8회+** — 미착수. 설문 실측: AGENTS.md 22KB > Antigravity 규칙 주입 상한(~14.5KB). [PRO-13] §4-4 인간 판정.
- [PRO-23] A/B 런 비용 결정(인간) · PRO-β(상시 주입 위생, ACE 근거) 미작성 · Jev 보류(재검토 조건: 독립 벤치·재현성 명시·가입 재개).
- [PRO-27] §7 미결 4건은 잠정값으로 진행(`up:` 접두 · 백필 기본 = 비움+보고 · arithmeticFrom 은 census 추정 · PRO 상태도 statusMap).
- 상류 WO 의 upward-fetch CLARIFY 는 ③ 으로 닫혔다(PRO 가 `← frontmatter 부모` 로 실림). 남은 뷰 공백: `lineage-tree` 는 산술 부모만 그린다(관측 뷰, 별건).
- 패치 도구 교훈(평면 밖): JS `String.replace` 의 문자열 치환은 `$'`·`$&` 를 해석한다 — 정규식 본문을 넣는 치환은 함수 치환으로.
- 센서스 1회차 수치(상류 ID 충돌 A 21·B 45·C 26, arithmeticFrom 제안 67·19·22, 백필 대상 101·17·18)는 [PRO-27] ①②③ 의 어답터 쪽 적용 근거다 —
  적용은 어답터 몫, 상류는 `eval/CENSUS.md` Δ 만 본다. 레포 라벨 매핑·경로는 비공개(`eval/private/census-repos.json` · 메모리).
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
