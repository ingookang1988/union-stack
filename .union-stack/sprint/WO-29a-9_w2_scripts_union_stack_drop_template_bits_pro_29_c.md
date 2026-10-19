<!-- [Wiki] 작업 지시. 상태 정본은 이 frontmatter `status:` 하나뿐이다([PRO-15]). scaffold 생성 — 선택 절(배경·설계·절차)은 필요할 때만 추가. -->
---
id: WO-29a-9
title: 이식기 ① 키트 미지원 2건 — scripts/union-stack/ 하위 설치(루트 탐색) + drop-template-bits 의 상류 전용 삭제 — [PRO-29] ③(c)
status: Draft
parent: PRO-29
evidence: "none — 착수 전"
closed_by: []
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
- 닫을 때 frontmatter `evidence:` 에 값 또는 `none — 이유`(선언 검사가 있으면 `rcpt:<name>@<sha>`). 상위 축 흔적은 `closed_by:`.
