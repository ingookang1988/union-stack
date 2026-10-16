<!-- [Wiki] 작업 지시. 상태 정본은 이 frontmatter `status:` 하나뿐이다([PRO-15]). -->
---
id: WO-24c-1
title: 어답터 연결 ① 배송층 최소분 — localOwned·localForked + @ship 매니페스트(배송 범주 축소) — [PRO-24] ①(b)(c)
status: Closed
parent: PRO-24
evidence: "구현 완료(2026-10-17, 가드 먼저): adapter.json localOwned(글롭·정규화) · scripts/ship-manifest.js([TOOL-34] — @ship 태그 → scripts/ship-manifest.json, 테스트 짝 상속, 드리프트 CLARIFY) · 상류 전용 10종 태그(테스트 포함 20 파일) · template-update: matchGlob · classifyPath(ctx: 매니페스트 화이트리스트 · 상류 전용 제외 · 매니페스트 밖 스크립트 기본 로컬 · localOwned → 불가침 · 글롭 충돌 sync 우선+경고) · buildPlan(local/upstream ctx 분리 · upstreamOnlyLocal) · 보고에 localForked 명명 · ci 체인 ship-manifest(비차단) · 팔 env 바(상류 전용이 buildPlan 에서 빠짐). 상류 template-update 실보고: 상류 main(미push, 매니페스트 없음)과 대조 → 로컬 변경 27·신규 2(ci/Dockerfile·compose), 상류 전용 스크립트가 신규로 둔갑하지 않음(규칙 폴백+전용 제외 보강), exit 3. rcpt:n/a — 하네스 스위트 · Closed 판정 2026-10-17(인간 승인)"
closed_by: [.union-stack/reference/tools/TOOL-34_ship_manifest.md, .union-stack/reference/tools/TOOL-21_template_update.md]
version: 1.0
---
# [WO-24c-1] 배송층 최소분 — localOwned · localForked · @ship

## 목표
하류 카나리아(어답터 1곳의 `template-update` 적용) 전에 열려 있는 두 위험을 닫는다([PRO-24] ①(b)(c) + §9 ①): ① sync 가 어답터 로컬 파일을
"상류에서 사라진 파일"로 오보하거나 로컬 발명을 건드리는 것, ② 상류 전용 스크립트(평가 계층 등)가 어답터에 배송되는 것. ①(a) 키트는 [WO-24c-2] 로 분리.

범위:
1. **`adapter.json localOwned`**(글롭 배열) — 어답터 고유 파일 선언. `classifyPath`·`localTemplateFiles` 가 제외 → 오보 0, `--apply` 가 건드리지 않음.
2. **배송 매니페스트**(`scripts/ship-manifest.json`, [TOOL-34]) — `// @ship upstream-only|optional` 태그에서 생성. 상류가 열거한 것만 배송, 매니페스트 밖
   스크립트는 기본 로컬, 글롭이 매니페스트 항목과 충돌하면 **sync 우선**(상류가 열거한 파일은 계속 받는다) + 경고. 로컬·상류 매니페스트를 각각 읽는다
   (옛 로컬 매니페스트로 상류 신규를 거르지 않게). 상류 전용 10종 태그(9 + adopter-census). 테스트 파일은 본체를 따른다.
3. **`localForked` 범주** — 3-way `modified` 를 보고에서 "동명 파일의 로컬 분기"로 이름 붙여 안내(`--apply` 건너뜀은 기존대로). 상류 전용 스크립트의
   로컬 사본은 "배송 제외 — 남은 사본"으로 INFO.
4. `ci.js` 체인에 `ship-manifest` 드리프트 검사(비차단). 어답터 팔 `env` 바 1: init 뒤 사본에서 상류 전용 스크립트가 `buildPlan` 에 안 들어간다([PRO-24] §6).

## 수용 기준
- 단위 테스트 **먼저**([ADR-40]): 글롭 매칭 · classifyPath(ctx: localOwned → 불가침 · 매니페스트 밖 스크립트 → 로컬 · upstreamOnly → 제외 · 글롭 충돌 → sync) ·
  buildPlan(상류 신규 전용 제외 · removedUpstream 에 로컬 파일 없음 · upstreamOnlyLocal) · 매니페스트 생성·짝 상속·드리프트 · adapter 파싱.
  기존 template-update 테스트(ctx 없음 = 규칙 폴백)는 그대로 통과.
- 상류 자신: `ship-manifest` 동기화 PASS · `template-update`(네트워크) 보고가 돌고 로컬이 앞섬 판정. 팔 6 형상 충족.
- 카드 [TOOL-34] 신설 · [TOOL-21]·[TOOL-26] 갱신 · MIGRATION(`localOwned`) · CHANGELOG. AGENTS.md 는 tools-index 블록만.

## 절차
1. 테스트 먼저 → 2. 글롭·classifyPath ctx → 3. 매니페스트 생성기 + 태그 10종 → 4. buildPlan·보고 → 5. 체인·팔 바 → 6. 카드·문서 → 7. [WO-24c-2](키트) 발행은 카나리아 뒤.

## 증거
- 테스트: `scripts/ship-manifest.test.js`(신설, 18) · template-update(+19: 글롭 4 · ctx 분류 8 · buildPlan ctx 5 · 충돌) · adapter(+3). 기존 template-update 테스트(ctx 없음 =
  규칙 폴백) 그대로 통과. 스위트 46 중 44 통과, 실패 2 = 미커밋 fdt spike 귀속. lint 체인 18종 중 leakage 외 exit 0(retro CLARIFY = 회고 제안).
- 매니페스트: 배송 80 · 상류 전용 20(스크립트 10 + 테스트 10) · 선택 0. 상류 전용 = eval · eval-arm · fetch-eval · scenario-rubric · token-accounting · hook-replay ·
  check-prereqs · adopter-arm · e6-workspace · adopter-census([PRO-24] §9 ①(c) 확정 목록 + 센서스).
- 어답터 팔 `env`: init 뒤 사본에서 합성 상류 맵(eval·adopter-arm·adopter-census·health)으로 buildPlan → 상류 전용 누출 0 · health 갱신 · 남은 사본 INFO. 6 형상 전부 충족.
- 상류 `template-update`(네트워크, 읽기 전용): 상류 main(미push, 매니페스트 없음)과 대조 → 로컬 변경 27·신규 2(ci/Dockerfile·compose), 상류 전용 스크립트가 신규로 둔갑하지 않음(규칙 폴백+전용 제외 보강), exit 3. 상류 main 에는 아직 매니페스트가 없어(미push) 규칙 폴백이 보고에 표시된다 — push 뒤 첫 카나리아에서 화이트리스트가 선다.
- 결정: `init --drop-template-bits` 의 상류 전용 삭제는 이 WO 밖([TOOL-34] 카드에 명시). ci.js 체인의 `adopter-arm` 단계는 어답터에서 파일 부재 → UNKNOWN 차단이 될 수 있어
  **삭제를 넣지 않았다** — 체인의 선택 단계(파일 없으면 건너뜀)가 선행 조건이며 [WO-24c-2](키트)와 함께 다룬다.
