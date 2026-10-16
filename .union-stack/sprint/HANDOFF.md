<!-- [Wiki] 세션 이어달리기. 세션을 마치는 에이전트가 덮어쓴다. 최신 하나만 유효.
     다음 세션 부트스트랩 시 가장 먼저 읽힘. -->
---
session_id: canary-a-2026-10-17
date: 2026-10-18T15:00:00Z
author: agent
verification: "스위트 48 중 46 통과(실패 2 = leakage·ref 테스트, 미커밋 fdt spike 귀속 — 이전과 동일) · 어답터 A 그림자 사본(scratchpad)에 수리 파일을 덮어 4 스위트 그린 확인 · ship-manifest 누설 0 · weakening-guard PASS · lint 체인 leakage 외 exit 0 · handoff-linter 통과"
version: 1.0
---

# Handoff → 다음 세션

## 1. 세션 요약 (1~3줄)
- [PRO-22]·[PRO-24]~[PRO-27] 구현 WO 10건 전부 Closed(`sprint/archived/`). 카나리아 B 1·2차 완료, 키트([TOOL-35]) 배송, CI 클린 트리 영수증 수신·retro due 해소.
- **카나리아 A 완료**: 키트 → `template-update --apply` 를 A 세션이 직접 수행. A 가 잡은 **상류 결함 4 수리**(이 세션, 가드 먼저): 템플릿 전용 단언 3 스위트
  (health 게이트 그린 · test-catalog 자산 수/동기화 · tools-index 카드 완전성) 어답터 모드 건너뜀([ADR-30]) · `lineage-tree.test` 의 상류 전용 모듈 무조건 require →
  조건부 + **ship-manifest 누설 검사**(배송 파일→상류 전용 require = CLARIFY) · **template-update 의존 불일치 경고**(갱신 파일이 require 하는 보존 파일 → `--force <의존>` 제안).
- **PRO-28 답변**: A 3문 회수(비공개 `eval/private/pro28/`, gitignore). C 는 진행 중. 요지(익명): 통째로 안 읽음(frontmatter→목적→완료 기준→꼬리) · 헤딩 변형 3~5/의미 ·
  증거 절 0 → frontmatter 로 · 별칭 1:N+접두 · 불일치=CLARIFY · scaffold 수용(채번+부모 실존 확인 조건).

## 2. 변경 위치 (ID 목록 — Upward Fetching 진입점)
- 승인·원장: [PRO-22] [PRO-24] [PRO-25] [PRO-26] [PRO-27] v1.0 · [ADR-53] [ADR-54]. 오더(archived): [WO-27a-1]~[WO-27a-3] [WO-24b-1] [WO-22b-1] [WO-22b-2]
  [WO-25a-1] [WO-26a-1] [WO-24c-1] [WO-24c-2] · [ANL-00a].
- 이 세션 스크립트: ship-manifest(`topLevelRequires`·`requireLeaks`) · template-update(`staleDeps` · 보고 · `--json staleDeps`) · 테스트 4(health · test-catalog ·
  tools-index · lineage-tree). 카드 [TOOL-21] [TOOL-34] · CHANGELOG. 이전 세션 전체 목록은 git log(5bbd850~64cb44a).

## 3. 다음 작업 (단일 진입점)
→ **사람 몫**: ① push ② **C 회신 대기**(키트 → apply → PRO-28 3문). 그 뒤 에이전트 몫([WO-24c-2] 후속): **센서스 3회차**(A·C 계측기 → 10/10 기대, Δ 기록) →
  **PRO-28 초안**(절 계약 + 부분 인출, PRO-β 흡수 — 하류 헤딩 분포는 센서스가 기계로 센다; A·B·C 답변은 익명 집계만). 어답터 잔여는 각자 몫: A = dashboard.test
  (갱신된 dashboard ↔ 보존된 옛 handoff-linter → `--apply --force scripts/handoff-linter.js`) · 중복 ID 2쌍; B = dashboard 포크 · review 12 · 상류 전용 사본.
  상류 세션은 어답터 레포를 쓰지 않는다(검증은 scratchpad 그림자 사본).

## 4. 미해결 / 주의
- **AGENTS.md 예산 계측 이월 9회+** — 미착수. 설문 실측: 22KB > 한 도구의 규칙 주입 상한(~14.5KB). [PRO-13] §4-4 인간 판정.
- [PRO-23] A/B 런 비용(인간) · PRO-β → PRO-28 로 흡수 예정 · Jev 보류. [PRO-27] §7 미결 4건은 잠정값. [PRO-22] 단계 5 · [PRO-26] ⑤ 는 보류(최하).
- 키트 미지원 둘: `scripts/union-stack/` 하위 설치 · `init --drop-template-bits` 의 상류 전용 삭제. 의존 불일치 경고는 **로컬 본문의 require** 기준(신규 파일 제외).
- `receipts.md`: 로컬 suite 줄은 REJECT(fdt spike 귀속), CI 줄은 PASS — 영수증은 미화하지 않는다. `work-close` 는 `rcpt:` 인용을 묻는다.
- 공개 평면: 하류 이름·내부 사실·커밋·경로 금지. 설문 대상은 예시가 아니라 실어답터 — 답변 원문은 비공개, 결과는 익명 집계만 상류에. 라벨·경로는 비공개 메모리.
- **미커밋 유지**: `ref/` · `spike/SPIKE-fdt_canon_import_utility_analysis.md` → 로컬 누설·ref 테스트 상시 red. 목록 대조로 새 위반 확인([ADR-39]).
- 이월: [PRO-22] §5 훅 재제안 금지([ADR-08]) · [WO-10a-1] 인간 대기 · [LSN-17]. 재제안 금지 목록은 AGENTS.md blocks 블록 소유 — 복제 금지.

## 5. 검증 상태
- 수치는 frontmatter `verification:` 이 정본. 방법: `node --test "scripts/*.test.js"`(npm 래퍼는 이 머신에서 크래시) · lint 체인 개별 실행 · 누설 가드는
  **마지막 쓰기 뒤** 재실행([ADR-39]) · `node scripts/weakening-guard.js` · `node scripts/ship-manifest.js`. 실패 2건의 fdt 귀속은 ref-linter 출력과 누설 가드 목록(✗ fdt 1건)으로 확인.
