<!-- [Wiki] 세션 이어달리기. 세션을 마치는 에이전트가 덮어쓴다. 최신 하나만 유효.
     다음 세션 부트스트랩 시 가장 먼저 읽힘. -->
---
session_id: pro29-connection-closure-2026-10-20
date: 2026-10-20T12:00:00Z
author: agent
verification: "스위트 52 중 50 통과(실패 2 = leakage·ref 테스트, 미커밋 fdt spike 귀속 — 이전과 동일) · 팔 7 형상 충족 · weakening-guard PASS · ship-manifest 동기화(배송 91 · 상류 전용 20) · tool·smell 린터 통과 · 누설 가드 ✗ fdt 1건만 · handoff-linter 통과"
version: 1.0
---

# Handoff → 다음 세션

## 1. 세션 요약 (1~3줄)
- **[PRO-28] ⑤ 판정**(ΔC 신고 조건부 · 압축 보존 보류) → [WO-28a-6] AGENTS.md 계측(5,925 tok, 생성 블록 48%). **[PRO-29] 연계 완결 승인**([ADR-56]) — 세 고리 중 ①② 완료, ③ 진행 중.
- ① 하류 제안 고리 **완료**([WO-29a-1]~[WO-29a-4]): health `upstream`(실행 가능 항목만) · `template-update --proposal`·`--ack-review` · 바 재정의 "자동 적용 가능 지연 0" → 3곳 0. 남은 관측 1(상시 알림 조용함).
- ② 상류 이탈 알림 고리 **완료**([WO-29a-5]~[WO-29a-8]): census 이탈 4종·델타 · 대시보드 카드·`--handoff`·health 7일·린터. 오탐 보정 2(약화 배송본 · 가드 없는 어답터 누설).
- ③ 이식기 **진행**([WO-29a-9] drop-template-bits · [WO-29a-11] `init --adopt` dry-run): OSS 실측 nodejs/TSC high 396 사람 판정 수정률 0% · 매핑표 개정(거버넌스 → ARCH · 로드맵에 전략).

## 2. 변경 위치 (ID 목록 — Upward Fetching 진입점)
- 승인·원장: [PRO-29] v1.0(§6 판정 주석 ①②③ · §7-4 임계) · [ADR-56]. 오더(archived): [WO-28a-6] · [WO-29a-1]~[WO-29a-9] · [WO-29a-11].
- 스크립트: template-update · health · handoff-linter · adopter-census · dashboard · init · 신규 `census_round.js`·`adopt-map.js`(배송). 카드 [TOOL-04] [TOOL-06] [TOOL-21] [TOOL-30] · MIGRATION · CHANGELOG · `eval/CENSUS.md` 5·6회차.

## 3. 다음 작업 (단일 진입점)
→ **[WO-29a-12]** `init --adopt --apply`(Draft, 발행됨) — 대상 레포의 사람이 실행 · high/approved 행만 git mv · file 행은 링크 목록 · 배송·골격·앵커·린트 1회. 실측은 scratchpad TSC 사본에서만.
  그 뒤 ③(d) MIGRATION "세 경로" 재편 + 냉독 완주 → [PRO-29] 전체 완료 정의(상류 릴리스 1회가 "하류 승인 1회 + 상류 확인 0회"로 3곳 도달).

## 4. 미해결 / 주의
- 어답터 이탈(census 6회차 원문): `어답터 이탈 신규 8 (census 2026-10-19) — A sync:applicable · weak:numeric-change · B sync:applicable · C rule:blocks-missing · …`
  → 보정 뒤 실제 이탈: **A gate:naming gate**(중복 ID 2 · TASKFORCE 파일 2) · **C rule:blocks-missing**(PRO-14 미완) · **3곳 sync:applicable**(3회차 적용 대기). 안내문은 사람이 C·A 세션에 전달(상류는 어답터 레포를 쓰지 않는다). 다음 census 회차로 해소 확인.
- [WO-29a-10] 하위 설치 **보류**(트리거: ③(a) 이식의 localOwned 로 안 되는 `scripts/` 충돌 실례). 규모 = 루트 계산 60곳 · 경로 문자열 66곳.
- [PRO-13] §4-4 AGENTS.md 예산 판정(5,925 tok > 상한 4000, 생성 색인 48%) — 사람 몫, 미판정. 압축 보존 문단은 그 뒤.
- 평평한 docs 트리는 `--adopt` 가 high 0(전부 medium 검토) — 의도(§7-4 판정).
- 공개 평면: 하류 이름·경로·커밋 금지. 설문 대상은 예시가 아니라 실어답터 — 회신 원문은 `eval/private/pro29/`, 레이블 매핑은 `eval/private/census-repos.json`.
- **미커밋 유지**: `ref/` · `spike/SPIKE-fdt_canon_import_utility_analysis.md` → 로컬 누설·ref 테스트 상시 red. 목록 대조로 새 위반 확인([ADR-39]).
- 이월: [PRO-22] §5 훅 재제안 금지([ADR-08]) · [WO-10a-1] 인간 대기 · [LSN-17]. 재제안 금지 목록은 AGENTS.md blocks 블록 소유 — 복제 금지.

## 5. 검증 상태
- 수치는 frontmatter `verification:` 이 정본. 방법: `node --test "scripts/*.test.js"`(npm 래퍼는 이 머신에서 크래시) · `node scripts/adopter-arm.js`(7 형상) · `node scripts/weakening-guard.js` ·
  누설 가드는 **마지막 쓰기 뒤** 재실행([ADR-39]) · `node scripts/adopter-census.js --delta`(읽기 전용) · `node scripts/work-close.js --table`.
