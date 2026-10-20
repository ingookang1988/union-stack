<!-- [Wiki] 작업 지시. 상태 정본은 이 frontmatter `status:` 하나뿐이다([PRO-15]). scaffold 생성 — 선택 절(배경·설계·절차)은 필요할 때만 추가. -->
---
id: WO-29a-9
title: 이식기 ① 키트 미지원 2건 — scripts/union-stack/ 하위 설치(루트 탐색) + drop-template-bits 의 상류 전용 삭제 — [PRO-29] ③(c)
status: Verifying
parent: PRO-29
evidence: "① 구현 완료(2026-10-20, 테스트 먼저): init --drop-template-bits 가 상류 전용 스크립트(ship-manifest upstreamOnly)·그 TOOL 카드를 지우고 tools-index 재생성. rcpt:n/a — init.test 30(+5) · 드롭 사본 스위트 39/39 · 스위트 51 중 49(실패 2 = fdt spike) · 팔 7 형상(env 바 강화). ② 하위 설치는 규모 실측(루트 60곳 · 경로 문자열 66곳) 뒤 인간 판정으로 [WO-29a-10] 보류"
closed_by: [.union-stack/reference/tools/TOOL-06_init.md, .union-stack/proposals/PRO-29_connection_closure.md]
version: 1.0
---
# [WO-29a-9] 이식기 ① 키트 미지원 2건 — scripts/union-stack/ 하위 설치(루트 탐색) + drop-template-bits 의 상류 전용 삭제 — [PRO-29] ③(c)

## 목표
[PRO-29] ③ 이식기 고리의 첫 단계(§8 순서: (c) → (a) → (b) → (d)). 이식기가 만들 어답터가 처음부터 **갱신 통로 위에** 서도록, 키트·init 의 미지원 2건을 먼저 닫는다.
1. **`drop-template-bits` 의 상류 전용 삭제**: `init --drop-template-bits` 는 `TEMPLATE_BITS`(누설 가드 등 4개)만 지운다. 상류 전용 스크립트 20개(`ship-manifest.json upstreamOnly` —
   eval·adopter-arm·adopter-census 등)는 남는다 → 어답터에 "지워도 된다" INFO 로 영구히 남고(B 미결 1건), census 약화 판별의 오탐 재료가 됐다([WO-29a-7]).
   매니페스트의 upstreamOnly 를 함께 지운다(매니페스트 없으면 현행).
2. **`scripts/union-stack/` 하위 설치**: 어답터 자체 `scripts/` 와 섞이지 않게 하네스를 하위 디렉터리에 둘 수 있게 한다(어답터 요청, [PRO-24] §9 ①(a)).
   지금 스크립트 33곳이 `path.resolve(__dirname, '..')` 로 루트를 잡는다 → 한 단계 깊어지면 전부 틀린다. **루트 탐색 헬퍼 1개**(위로 올라가며 `.union-stack/` 을 찾는다)로 바꾸고,
   키트·template-update 가 하위 경로를 배송 경로로 쓰게 한다(`adapter.json scriptsDir`, 기본 `scripts`).

## 수용 기준
- 테스트 먼저([ADR-40]): 루트 탐색 — `scripts/x.js` · `scripts/union-stack/x.js` 둘 다 같은 루트 · `.union-stack/` 없음 = 현행 폴백(`..`). drop-template-bits — 매니페스트 upstreamOnly 삭제 · 매니페스트 없음 = 현행.
- 하위 설치 팔: 어답터 팔([TOOL-26])에 **subdir 형상** 추가 — 사본의 하네스를 `scripts/union-stack/` 로 옮기고 같은 게이트(health·work-close·zfs-linter·template-update dry-run)를 돌려 형상 독립을 본다(형상 8).
- template-update: `scriptsDir` 이 있으면 상류 `scripts/<f>` ↔ 로컬 `<scriptsDir>/<f>` 로 대조·배송 · 앵커 경로는 로컬 경로 · 기본값 회귀 0. 키트도 같은 규칙.
- 범위 밖: `init --adopt` 매핑(③(a)) · MIGRATION 재편(③(d)). 33곳 치환은 기계적이므로 한 커밋 · 약화 가드 0 확인.
- 카드 [TOOL-06]·[TOOL-21]·[TOOL-35]·[TOOL-26] · MIGRATION("하위 설치") · CHANGELOG.

## 증거
- **범위 축소(인간 판정 2026-10-20)**: 이 WO 는 ① drop-template-bits 만으로 닫는다. ② 하위 설치는 [WO-29a-10] 으로 보류 — 트리거 = ③(a) 이식에서 `localOwned` 로 흡수되지 않는 `scripts/` 충돌.
- ① 테스트: init +5(상류 전용 삭제 · drop 없으면 유지 · 매니페스트 없음 현행 · 그 카드 삭제(배송 도구 카드 유지) · 중복 삭제 1회). 드롭 사본 실측: 삭제 54 · 스위트 39/39 · tool-linter·tools-index 통과 · template-update 상류 전용 사본 INFO 0.
- ① 구현 중 발견 2: 상류 전용 도구의 **카드**가 남아 tool-linter red → 카드도 삭제 · AGENTS.md tools-index 생성 블록이 낡음 → 드롭 적용 뒤 재생성(앵커 시딩 전).
- 팔 갱신: env 형상 바 "로컬 사본은 INFO" 가 사본 > 0 을 요구했다 → "드롭 뒤 사본 0" + "심은 사본 1 = INFO" 로 강화(손 이식 어답터 경로 유지).
- **② 규모 실측(착수 전 중단의 근거)**: 루트 계산 `path.resolve(__dirname, '..')` **60곳 · 43파일**(+ mcp-server·upward-fetch 변형 2 · `require('../package.json')` 1) ·
  형제 스크립트 경로 문자열(`'scripts/x.js'` · `join(root, 'scripts', …)`) **66곳** — ci.js 게이트 체인 · health 의 template-update 호출 · 키트·ship-manifest 경로 · 카드 `impl:`(tool-linter) · 훅 · package.json · 워크플로.
  루트 헬퍼 + 60곳 치환은 기계적이지만 66곳 + 배송 매핑(`scriptsDir`)은 배송 표면 대부분을 건드린다. 현 어답터 3곳의 충돌은 localOwned·localForked·upstreamIgnored 로 이미 흡수.
