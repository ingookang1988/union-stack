<!-- [Wiki] 작업 지시. 상태 정본은 이 frontmatter `status:` 하나뿐이다([PRO-15]). scaffold 생성 — 선택 절(배경·설계·절차)은 필요할 때만 추가. -->
---
id: WO-29a-10
title: 하위 설치(보류) — scripts/union-stack/ 에 하네스 설치 · 루트 탐색 헬퍼 · scriptsDir 배송 매핑 — [PRO-29] ③(c) 잔여
status: Draft
parent: PRO-29
evidence: "none — 보류(착수 조건 미도래: ③(a) 이식의 localOwned 로 안 되는 scripts/ 충돌 실례 대기)"
closed_by: []
version: 1.0
---
# [WO-29a-10] 하위 설치(보류) — scripts/union-stack/ 에 하네스 설치 · 루트 탐색 헬퍼 · scriptsDir 배송 매핑 — [PRO-29] ③(c) 잔여

## 목표
**보류(인간 판정 2026-10-20) — 착수 조건이 오기 전까지 Draft 로 둔다.**
- **착수 조건(트리거)**: [PRO-29] ③(a) `init --adopt` 이식에서 대상 레포의 `scripts/` 와 하네스가 충돌하고, 그 충돌이 `adapter.json localOwned`·`localForked`·`upstreamIgnored` 로 흡수되지 않는 실례 1건.
- 내용: 하네스를 `scripts/union-stack/` 하위에 설치할 수 있게 한다([PRO-24] §9 ①(a) 어답터 요청). [WO-29a-9] ② 에서 옮겨 왔다.
- 규모(실측 2026-10-20): 루트 계산 `path.resolve(__dirname, '..')` 60곳·43파일(+ 변형 2 · `require('../package.json')` 1) · 형제 스크립트 경로 문자열 66곳
  (ci.js 게이트 체인 · health 의 template-update 호출 · 키트·ship-manifest · 카드 `impl:` · 훅 · package.json · 워크플로).

## 수용 기준
- 착수 시 다시 쓴다(트리거 실례의 충돌 꼴이 설계를 정한다). 그때까지의 골격: 루트 탐색 헬퍼 1개(위로 `.union-stack/` 탐색, 없으면 `..` 폴백) → 60곳 기계적 치환 1커밋 ·
  경로 문자열 66곳은 `scriptsDir`(adapter.json, 기본 `scripts`) 경유 · template-update·키트 배송 매핑(상류 `scripts/<f>` ↔ 로컬 `<scriptsDir>/<f>`, 앵커는 로컬 경로) · 팔 subdir 형상(형상 8).
- 착수 전 이 WO 를 Active 로 올리지 않는다 — 트리거 실례를 증거 절에 먼저 적는다.

## 증거
- 닫을 때 frontmatter `evidence:` 에 값 또는 `none — 이유`(선언 검사가 있으면 `rcpt:<name>@<sha>`). 상위 축 흔적은 `closed_by:`.
