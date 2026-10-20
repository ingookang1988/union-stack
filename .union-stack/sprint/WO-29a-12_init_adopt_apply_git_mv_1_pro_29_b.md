<!-- [Wiki] 작업 지시. 상태 정본은 이 frontmatter `status:` 하나뿐이다([PRO-15]). scaffold 생성 — 선택 절(배경·설계·절차)은 필요할 때만 추가. -->
---
id: WO-29a-12
title: 이식기 ③ init --adopt --apply — 사람이 고친 매핑안을 git mv 로 적용 · 평면 골격 · 앵커 시딩 · 린트 1회 — [PRO-29] ③(b)
status: Draft
parent: PRO-29
evidence: "none — 착수 전"
closed_by: []
version: 1.0
---
# [WO-29a-12] 이식기 ③ init --adopt --apply — 사람이 고친 매핑안을 git mv 로 적용 · 평면 골격 · 앵커 시딩 · 린트 1회 — [PRO-29] ③(b)

## 목표
[PRO-29] ③(b): [WO-29a-11] 의 매핑안을 사람이 고친 뒤 **대상 레포에서 그 사람이** 적용한다. 이식 직후 레포가 ① 고리(health upstream · template-update)에 바로 들어오는 것이 끝점이다.
- 실행 주체: 이식 대상 레포의 사람(그 레포 안에서). 상류 세션은 남의 레포를 쓰지 않는다([PRO-24] §5) — 실측은 scratchpad 사본에서만.
- `init --adopt <repo> --plan plan.json [--apply]`: 기본은 **적용 계획 출력**(dry-run), `--apply` 로만 쓴다. 대상의 git 작업 트리가 깨끗하지 않으면 거부.
- **적용 행 규칙**: high 는 적용 · medium 은 행에 `"approved": true` 가 있을 때만 · low·`to: null` 은 건너뛰고 목록만. 사람이 `to`·`proposedId` 를 고쳤으면 고친 값을 쓴다(ZFS 유효성 재검사, 무효 = 그 행 거부).
- 적용 내용: ① 하네스 배송(템플릿의 sync 범주 — 키트·template-update 와 같은 목록, 상류 전용 제외) ② 평면 골격(`.union-stack/` 디렉터리·`_GUIDE` · next.md 마커) ③ **`git mv`**(이력 보존) — `kind: id/dir` 행
  ④ `kind: file` 행(원장·HISTORY·IDENTITY·HANDOFF)은 옮기지 않고 그 파일에 **원문 경로 링크 목록**을 남긴다(여러 문서를 한 파일에 합치는 건 사람 몫 — 자동 재작성 금지, [ADR-12])
  ⑤ `adapter.json` 초안 기록 ⑥ 정합 앵커 시딩(배송한 파일 = 상류와 동일) ⑦ 린트 1회(zfs-linter · work-close --table).

## 수용 기준
- 테스트 먼저([ADR-40]): 적용 행 선택(high · approved medium · low 제외 · 사람 수정값 우선 · 무효 이름 거부) · 깨끗하지 않은 트리 거부 · dry-run 쓰기 0 · git mv 로 이력 보존(`git log --follow`) ·
  file 행은 링크 목록 · 재실행 멱등(이미 옮긴 행은 건너뜀) — 실 git 픽스처.
- **성공 바([PRO-29] §6 ③)**: TSC 사본(scratchpad)에 `--apply` 뒤 ZFS 린트·발행 린트 CLARIFY 0 · 앵커 존재 · `template-update` dry-run 성공 · health 크래시 0. 빈 레포(`init`)·키트 경로 회귀 0(팔 7 형상).
- 범위 밖: MIGRATION "세 경로" 재편(③(d)) · 냉독 완주 · 하위 설치([WO-29a-10]). 카드 [TOOL-06] · CHANGELOG.

## 증거
- 닫을 때 frontmatter `evidence:` 에 값 또는 `none — 이유`(선언 검사가 있으면 `rcpt:<name>@<sha>`). 상위 축 흔적은 `closed_by:`.
