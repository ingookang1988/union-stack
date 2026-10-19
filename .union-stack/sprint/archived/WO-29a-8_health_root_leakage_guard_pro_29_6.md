<!-- [Wiki] 작업 지시. 상태 정본은 이 frontmatter `status:` 하나뿐이다([PRO-15]). scaffold 생성 — 선택 절(배경·설계·절차)은 필요할 때만 추가. -->
---
id: WO-29a-8
title: health --root 누설 게이트 — 측정 대상에 leakage-guard 가 없으면 해당 없음 — [PRO-29] ② 6회차 오탐
status: Closed
parent: PRO-29
evidence: "구현 완료(2026-10-20, 테스트 먼저): health.gather — 측정 대상에 scripts/leakage-guard.js 가 없으면 누설 게이트 해당 없음. rcpt:n/a — health.test 86(+3) · 스위트 51 중 49(실패 2 = fdt spike) · 팔 7 형상. census 재계산: A gate:leakage gate 소멸(남은 이탈 A naming·sync · B sync · C blocks-missing·sync — 전부 실제) · Closed 판정 2026-10-20(인간 승인)"
closed_by: [.union-stack/reference/tools/TOOL-04_health.md, .union-stack/proposals/PRO-29_connection_closure.md]
version: 1.0
---
# [WO-29a-8] health --root 누설 게이트 — 측정 대상에 leakage-guard 가 없으면 해당 없음 — [PRO-29] ② 6회차 오탐

## 목표
census 6회차 A 의 `gate:leakage gate` 는 오탐이다. A 는 템플릿 전용 게이트인 `scripts/leakage-guard.js` 를 뺐는데(`init --drop-template-bits` 와 같은 상태), census 는 **상류** health 를 `root` 로 돌리고
상류 health 는 **자기** leakage-guard 모듈을 로드해 A 를 판정했다. 누설 게이트의 해당 여부는 **측정 대상 레포**가 그 게이트를 갖는지로 정해야 한다.
- `health.gather(root)`: 측정 대상(`root`)에 `scripts/leakage-guard.js` 가 없으면 `leakageViolations = null` → INFO "해당 없음 — 템플릿 전용 게이트"(어답터 자기 실행과 같은 결과).
- 측정 대상에 가드가 있으면 현행(판정은 상류 모듈로, private 어답터 강등도 현행).

## 수용 기준
- 테스트 먼저([ADR-40]): 가드 없는 root 픽스처 → leakage 차원 INFO "해당 없음" · fails 에 안 셈 / 가드 있는 root → 현행 판정 / 상류 자신 → 현행.
- census 재계산: A `gate:leakage gate` 소멸 · B·C 불변. 팔 7 형상(특히 env·kit 형상 — 가드 없는 사본) · 스위트 회귀 0 · 카드 [TOOL-04] · CHANGELOG.

## 증거
- 테스트 픽스처 함정 2(구현 중 발견): ① 픽스처 본문에 "더미" 라는 말을 쓰면 가드가 표시로 읽는다(마커 단어) ② 팔 env 형상엔 health 자신의 가드 모듈이 없다 — 판정 단언은 현 레포의 가드 유무에 맞춘다(현 레포 가정 금지, [LSN-17]).
