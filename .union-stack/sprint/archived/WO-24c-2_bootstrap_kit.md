<!-- [Wiki] 작업 지시. 상태 정본은 이 frontmatter `status:` 하나뿐이다([PRO-15]). -->
---
id: WO-24c-2
title: 어답터 연결 ① 배송층 — 부트스트랩 키트(손 이식 어답터의 사후 입장권, 의존 0 단일 파일) — [PRO-24] ①(a)
status: Closed
parent: PRO-24
evidence: "구현 완료(2026-10-17, 가드 먼저): scripts/union-stack-kit.js([TOOL-35], 의존 0 단일 파일 — 매니페스트 읽기 · 키트 8 파일 중 없는 것만 · 앵커 clone@<버전>(추정) 는 상류(--guess 태그·main)와 바이트 동일한 파일만 · 첫 실행 dry-run · --from-dir 오프라인) · template-update --seed [ref](명시적 전 파일 단언, 경고) · 팔 kit 형상 3 바 · 하위 디렉터리 옵션은 미지원 명시 · 드롭 목록 JSON 분리는 불필요(키트는 init 을 require 하지 않음). rcpt:n/a — 하네스 스위트 · Closed 판정 2026-10-17(인간 승인)"
closed_by: [.union-stack/reference/tools/TOOL-35_union_stack_kit.md, .union-stack/reference/tools/TOOL-21_template_update.md]
version: 1.0
---
# [WO-24c-2] 부트스트랩 키트

## 목표
`template-update` 도 앵커도 없는 어답터 2곳(센서스 A·C: 계측기 2/10·3/10, 동기화 0회)에 갱신 통로를 연다([PRO-24] ①(a) + §9 ①(a)). 카나리아 B 가 보여 준
경로(dry-run 보고 → `--apply` → 매니페스트 수신 → 오보 소멸)를 A·C 도 밟게 한다. 상류 세션은 어답터 레포를 쓰지 않는다 — 어답터가 끌어온다.

범위:
1. **`scripts/union-stack-kit.js`**([TOOL-35]) — 의존 0 단일 파일(fs·path·crypto·fetch 만). 상류 매니페스트를 읽어 template-update 의 require 폐포 8 파일 중 없는 것만 가져오고,
   앵커를 `clone@<버전>(추정)` 으로 심되 **상류(추정 클론 지점 태그 `--guess`, 기본 v<로컬 CHANGELOG 버전> · 그리고 main)와 바이트 동일한 파일만** 정합으로 기록한다.
   다른 파일은 unknown 으로 남아 3-way 보호가 지킨다. 첫 실행은 dry-run. `--from-dir` 로 오프라인(팔·테스트).
2. **`template-update --seed [ref]`** CLI — 사람이 "로컬 == 상류"를 **명시적으로** 단언할 때만 전 파일 앵커(경고 출력). 키트는 이것을 쓰지 않는다.
3. 어답터 팔 `kit` 형상 — 상류 사본에서 키트 파일 8 + 앵커 삭제 + 한 파일 로컬 패치 → 키트 dry-run 쓰기 0 · `--apply` 로 8 파일 복원 · 앵커는 동일 파일만(패치 파일 제외).
4. 하위 디렉터리 옵션(`scripts/union-stack/`)은 **미지원으로 명시** — 배송 분류 규칙이 1레벨이라 하위 경로가 템플릿 소유로 인식되지 않는다(별건, 요구가 생기면 PRO).
   드롭 목록 JSON 분리는 불필요해졌다 — 키트는 단일 파일이 *가져오는* 쪽이라 init 을 require 하지 않는다.

## 수용 기준
- 단위 테스트 **먼저**([ADR-40]): 해시 동일성(template-update 와) · planKit(없는 것만 · 동일 파일만 앵커 · unknown · missing) · 오프라인 실행(dry-run 무쓰기 · apply 8 파일 ·
  앵커 라벨·내용 · 재실행 시 앵커 보존 · 3-way 가 그 앵커를 그대로 읽음 · 평면 없는 곳 3).
- 팔 7 형상 전부 충족. 카드 [TOOL-35] 신설 · [TOOL-21]·[TOOL-26] 갱신 · MIGRATION §"Adopting without template-update" · CHANGELOG. AGENTS.md 는 tools-index 블록만.

## 절차
1. 테스트 먼저 → 2. 키트 → 3. `--seed` → 4. 팔 형상 → 5. 카드·문서 → 6. A·C 접촉(한 줄 명령 + PRO-28 질문 3개 — 인간 지시 후).

## 증거
- 테스트: `scripts/union-stack-kit.test.js`(신설, 18 — 해시 동일성 · planKit · 오프라인 dry-run 무쓰기 · apply 8 파일 · 앵커 라벨·동일 파일만 · 재실행 보존 · 3-way 가 그 앵커를 읽음 ·
  평면 없는 곳 3) · template-update(+2, --seed) · adopter-arm(+2). 스위트 48 중 46 통과, 실패 2 = 미커밋 fdt spike 귀속. lint 체인 leakage 외 exit 0.
- 어답터 팔 `kit`: 상류 사본에서 키트 8 + 앵커 삭제 + health 로컬 패치 → dry-run 쓰기 0 · `--apply` 8 파일 복원 · 앵커 `clone@6.0.0(추정)` 정합은 동일 파일만(health 제외) ·
  패치 보존. 7 형상 성공 바 전부 충족.
- 설계 결정: 앵커를 전부 정합으로 위조하지 않는다 — 손 이식 어답터의 개조(카나리아 B 는 7건)를 다음 `--apply` 가 덮어쓰는 [ADR-29] 사고의 재현을 막는다.
  대신 추정 클론 지점 태그(v6.0.0 실존)와 main 둘 다와 대조해 동일한 것만 정합으로 둔다. 전 파일 단언은 사람이 `template-update --seed` 로만.
- 다음 하류 접촉(인간 지시 후): A·C 에 한 줄 명령 + PRO-28 질문 3개. 상류 세션은 어답터 레포를 쓰지 않는다.
