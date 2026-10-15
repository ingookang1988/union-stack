<!-- [Wiki] 세션 이어달리기. 세션을 마치는 에이전트가 덮어쓴다. 최신 하나만 유효.
     다음 세션 부트스트랩 시 가장 먼저 읽힘. -->
---
session_id: harness-evolution-literature-survey-2026-10-15
date: 2026-10-15T00:00:00Z
author: agent
verification: "스위트 38 중 36 통과(실패 2 = leakage·ref 테스트, 미커밋 fdt spike 귀속 — 8/20·10/08 과 동일) · lint 체인 7종 전부 exit 0 · 누설 ✗1(fdt spike 만 — 이번 세션 신규 파일 0) · context budget 예산 내 · permission-guard 통과 · 이번 세션 코드 변경 0(문서·설문만) · 설문 답변 0/9"
version: 1.0
---

# Handoff → 다음 세션

## 1. 세션 요약 (1~3줄)
- 하네스 자동 진화 문헌 4편(RRSI·Rethinking·Bad Genius·ACE) 정독 → 루프는 들이지 않고([ADR-12] 유지, 근거는 오히려 강화)
  **선택 규칙만** 이식: **[PRO-23] 채택 자격**(노이즈 하한 δ · 판정 3값 · 형상 반사실, 실행 주체 = 하류) Proposed.
  근거 노트 `spike/SPIKE-harness_evolution_regularization.md`. PRO-β(상시 주입 ΔC 신고 + 압축 보존 규칙, ACE 근거)는 **미작성**.
- 하류 설문을 테스트 축 2곳 → **통합 설문 v1**(`eval/SURVEY-01_adopter.md`: 프로필 · 계측 원문 · 행동 고정 증언 · 제거 우선 ·
  냉독 감사 · 0-4 버전 태깅)로 교체. 회수 범위는 인간 결정으로 **어답터 3곳 × 도구 3종 = 답변 9건**(도구별 answer 파일, 블라인드).
  [WO-22a-1] v2.1.
- Jev(TypeSafe) 검토 — 확률 분류기라 게이트 부적합·외부 반출·재현성 미명시 → **보류**(인간: "나중에"). 재검토 조건: 독립 벤치 ·
  재현성 명시 · 가입 재개. 기록은 대화에만.

## 2. 변경 위치 (ID 목록 — Upward Fetching 진입점)
- 커밋: [PRO-23] 신규 · `eval/SURVEY-01_adopter.md` 신규 · [WO-22a-1] v2.1 · `sprint/next.md` 재생성 · spike 1건 · 이 HANDOFF.
- 상류 밖(비커밋): 어답터 3곳 spike 에 설문 배포 + 1차 설문 삭제, 다른 6곳 사본은 폐기 — 위치·이름은 비공개 메모리([ADR-11]).

## 3. 다음 작업 (단일 진입점)
→ **[WO-22a-1]** — 답변 9건이 오면 리뷰: ①같은 레포 세 답의 **사실 일치율**(§0·§1·5-0) ②제거·제안 후보 교집합/차집합
  ③0-4 버전·동기화 날짜로 태깅 → `eval/SURVEY-01_results.md`(익명) + [PRO-22] v0.2 H1~H5 판정표 + [PRO-23] 전제(5-7) 충족 수.
  답변이 0이면 기다리지 말고 인간에게 레포·도구별 세션 개설을 요청.

## 4. 미해결 / 주의
- **AGENTS.md 예산 계측 이월 7회+** — 이번 세션도 미착수. [PRO-13] §4-4 대로 인간이 WO 승격/드롭 판정(여기 prose 로 또 싣는 것이 오라우팅 신호).
- PRO-β 후보(spike §4 B·D) — AGENTS.md 컨텍스트 예산 절이 Schema 라 승인 필요. ACE 의 붕괴 실측(통짜 재작성 1회에 18k→122 tok)이 근거.
- 설문 C 모드 운영: AGENTS.md 내용을 프롬프트에 붙이지 말 것(7-1·7-5 오염) · ChatGPT/Antigravity 로의 반출 범위는 인간이 먼저 판단(규칙 12).
- 공개 평면: 하류 이름·내부 사실 금지. 설문 정본의 대상은 예시가 아니라 실어답터 — 이름은 비공개 메모리에만.
- **미커밋 유지**: `ref/` · `spike/SPIKE-fdt_canon_import_utility_analysis.md` → 로컬 누설·ref 테스트 상시 red. 목록 대조로 새 위반을 확인([ADR-39]).
- 이월: [PRO-22] §5 훅 재제안 금지([ADR-08]) · [PRO-21] §6 미결 2건은 [PRO-22] §3-5 흡수 · ARCH-00 인용 게이트 누설 가드 하나뿐 ·
  [LSN-17] 배송 한계 · [WO-10a-1] 인간 대기(하류 이관은 [PRO-23] §2-bis 가 제안).
- 재제안 금지 목록은 AGENTS.md blocks-index 블록 소유 — 여기 복제 금지.

## 5. 검증 상태
- 수치는 frontmatter `verification:` 이 정본. 방법: `node --test "scripts/*.test.js"`(npm 래퍼는 이 머신에서 크래시) · lint 체인 7종 개별 실행 ·
  누설 가드는 **마지막 쓰기 뒤** 재실행([ADR-39]).
- 실패 2건의 fdt 귀속은 ref-linter 출력(미해소 ADR-103·MECH-03f/g 전부 fdt 파일)과 누설 가드 목록(✗ fdt 1건)으로 확인.
- 하류 배포본은 상류 게이트 밖 — 치환 앵커 검증은 scratchpad 스크립트(4/4 · 3/3)로. 하류 git 상태 변화(1차 설문 삭제 `D` + 신규 `??`)는
  그 레포 소관.
