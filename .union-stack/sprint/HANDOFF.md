<!-- [Wiki] 세션 이어달리기. 세션을 마치는 에이전트가 덮어쓴다. 최신 하나만 유효.
     다음 세션 부트스트랩 시 가장 먼저 읽힘. -->
---
session_id: canary-b-first-apply-2026-10-17
date: 2026-10-18T05:00:00Z
author: agent
verification: "스위트 47 중 45 통과(실패 2 = leakage·ref 테스트, 미커밋 fdt spike 귀속 — 이전과 동일) · 어답터 모드 흉내 사본에서 가드 4 스위트 녹색 · lint 체인 18종 중 leakage 외 전부 exit 0 · ship-manifest 동기화 · handoff-linter 통과 · context budget 예산 내"
version: 1.0
---

# Handoff → 다음 세션

## 1. 세션 요약 (1~3줄)
- 하류 설문 2회(9+4건) → [PRO-22] 승인([ADR-53]) + [PRO-24]·[PRO-25]·[PRO-26]·[PRO-27] 일괄 승인([ADR-54]). 구현 WO 8건 Closed(인간 승인, `sprint/archived/`):
  [PRO-27] 전제 ①~⑤ · [PRO-22] 단계 1~4(선언·영수증·**0건 검사 = 실패**·약화 질문·예외 증가 red) · [PRO-24] ② 센서스(`eval/CENSUS.md` 1회차) ·
  [PRO-25] 회고 트리거(`retro.js` · [ANL-00a] 첫 회차 = PO 판정 묶음) · [PRO-26] ④ 파생 라벨. 설문 WO 둘 Closed · 어답터 spike 폐기.
- **[PRO-24] ①(b)(c) 배송층 최소분 — [WO-24c-1] Closed(인간 승인 2026-10-17).** `adapter.json localOwned` · `scripts/ship-manifest.json`([TOOL-34], @ship 태그 — 상류 전용 10종
  배송 제외) · template-update 가 로컬·상류 매니페스트를 각각 읽고 localForked 를 명명. 카나리아(B) 전 위험 둘(로컬 파일 오보·상류 전용 배송)을 닫았다.
- **카나리아 1차(어답터 B, 2026-10-17)**: 옛 template-update 로 `--apply` → 59 갱신 · localForked 7 보존 · 상류 전용이 한 번 더 배송 · 매니페스트 미배송(2차에서).
  B 자체 health exit 0 · 스위트 48 중 2 실패 = ① 상류 테스트의 상류 픽스처 의존(→ 가드 4건으로 수리) ② B 의 dashboard 포크 vs 새 테스트(B 결정).
  상류는 **retro due WARN**(평면 지연 50d = evidence 평면이 CI 미실행 기간) — push 가 접는다.

## 2. 변경 위치 (ID 목록 — Upward Fetching 진입점)
- 승인·원장: [PRO-22] [PRO-24] [PRO-25] [PRO-26] [PRO-27] v1.0 · [ADR-53] [ADR-54]. 오더(archived): [WO-27a-1] [WO-27a-2] [WO-27a-3] [WO-24b-1] [WO-22b-1]
  [WO-22b-2] [WO-25a-1] [WO-26a-1] [WO-24c-1] · [ANL-00a]. ci.js 선택 단계(스크립트 없으면 건너뜀 — 어답터 체인 보호) + ci.test 신설.
- 스크립트(신규): upstream-prefix · frontmatter-backfill · adopter-census · receipts · weakening-guard · retro · label · ship-manifest(+json). (변경): adapter · zfs_index ·
  query · upward-fetch · blast-radius · health · zfs-linter · ref-linter · work-close · ci · init · adopter-arm(형상 legacy·serial·vocab·nonjs) · mcp-server · template-update.
- 평면·문서: `.union-stack/adapter.json`(상류 선언 1) · `verification/raw/receipts.md` · `eval/CENSUS.md` · 카드 [TOOL-01]~[TOOL-04] [TOOL-21] [TOOL-23] [TOOL-26]
  [TOOL-27] [TOOL-29]~[TOOL-34] · plan/analytics/_GUIDE(회고 템플릿) · [CON-00] 블록 · AGENTS.md tools/blocks 블록 · MIGRATION · CHANGELOG(⚠ init 이 receipts.md 리셋) · harness.yml.

## 3. 다음 작업 (단일 진입점)
→ **카나리아 2차(사람 몫, [WO-24c-1] 후속)**: ① **push**(가드·--force 경로 수정 포함, fast-forward) ② B 에서 `template-update --apply`(매니페스트·Dockerfile·compose + 수정된 테스트 수신) ③ B 의 dashboard 포크는 `--apply --force scripts/dashboard.js` 로 상류 수용 여부 결정 ④ B 스위트 녹색 확인 → 상류 세션이 센서스 2회차(`adopter-census --write`)로 Δ — CI 가 체인을 돌려 evidence·receipts 를 쌓고(`retro due` 접힘),
  상류 main 에 매니페스트가 올라 하류가 당길 원본이 생긴다. 그 뒤 **카나리아(어답터 B)**: B 에서 `template-update`(dry-run 보고 — localForked·상류 전용 사본·충돌) →
  사람 승인 → `--apply` → 센서스 2회차로 Δ. 그 뒤 [WO-24c-2](①(a) 키트: 의존 0 단일 파일 · 첫 실행 dry-run — A·C 용; ci 체인의 `adopter-arm` 단계를
  파일 없으면 건너뜀은 **완료**) · PRO-28(절 계약·부분 인출) 질문 3개는 카나리아 접촉에 얹는다. 상류 세션은 B 레포에 쓰지 않는다(읽기·실행 검증만).

## 4. 미해결 / 주의
- **회고 제안 — 평면 지연 50≥30**([PRO-25] ②, `node scripts/retro.js --proposal`): evidence 평면 마지막 2026-08-27(CI 미실행). 다음 회차 기준 = [ANL-00a].
- **AGENTS.md 예산 계측 이월 9회+** — 미착수. 설문 실측: 22KB > 한 도구의 규칙 주입 상한(~14.5KB). [PRO-13] §4-4 인간 판정.
- [PRO-23] A/B 런 비용(인간) · PRO-β → PRO-28 로 흡수 예정 · Jev 보류. [PRO-27] §7 미결 4건은 잠정값. [PRO-22] 단계 5 · [PRO-26] ⑤ 는 보류(최하).
- 상류 `receipts.md` 의 suite 줄은 **REJECT**(fdt spike 귀속 — 미화 없음; 그린 줄은 클린 트리 CI 에서). `work-close` 는 `rcpt:` 인용을 묻는다. `lineage-tree` 는 산술 부모만(별건).
- 공개 평면: 하류 이름·내부 사실·커밋·경로 금지. 설문 대상은 예시가 아니라 실어답터 — 결과는 익명 집계만 상류에. 센서스 라벨·경로는 비공개.
- **미커밋 유지**: `ref/` · `spike/SPIKE-fdt_canon_import_utility_analysis.md` → 로컬 누설·ref 테스트 상시 red. 목록 대조로 새 위반 확인([ADR-39]).
- 이월: [PRO-22] §5 훅 재제안 금지([ADR-08]) · [WO-10a-1] 인간 대기 · [LSN-17]. 재제안 금지 목록은 AGENTS.md blocks 블록 소유 — 복제 금지.

## 5. 검증 상태
- 수치는 frontmatter `verification:` 이 정본. 방법: `node --test "scripts/*.test.js"`(npm 래퍼는 이 머신에서 크래시) · lint 체인 개별 실행 · 누설 가드는
  **마지막 쓰기 뒤** 재실행([ADR-39]) · `node scripts/adopter-arm.js`(6 형상) · `node scripts/ci.js --only-checks`(영수증).
- 실패 2건의 fdt 귀속은 ref-linter 출력(미해소 전부 fdt 파일)과 누설 가드 목록(✗ fdt 1건)으로 확인.
