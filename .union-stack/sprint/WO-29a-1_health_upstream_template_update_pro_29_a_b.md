<!-- [Wiki] 작업 지시. 상태 정본은 이 frontmatter `status:` 하나뿐이다([PRO-15]). scaffold 생성 — 선택 절(배경·설계·절차)은 필요할 때만 추가. -->
---
id: WO-29a-1
title: 하류 제안 고리 — health upstream 차원 + template-update 제안문 — [PRO-29] ①(a)(b)
status: Draft
parent: PRO-29
evidence: "none — 착수 전"
closed_by: []
version: 1.0
---
# [WO-29a-1] 하류 제안 고리 — health upstream 차원 + template-update 제안문 — [PRO-29] ①(a)(b)

## 목표
[PRO-29] ① 하류 제안 고리의 (a)(b). 하류 세션이 **명령을 기억하지 않아도** 상류에 새 버전이 있다는 걸 알고, 사람이 읽고 결정할 **제안문**을 받는다.
- (a) **확인 캐시**: `template-update` 확인 모드가 결과 요약(상류·로컬 버전 · sync/review/HOLD/localForked 수 · ⚠ 마이그레이션 수 · 확인 시각)을
  `template-sync.json` 의 별도 키(`lastCheck`)에 쓴다 — 앵커(블롭 sha)는 건드리지 않는다.
- (a) **health 차원 `upstream`**: health 는 동기라 네트워크를 직접 쓰지 않는다. 캐시를 읽고, 24h 초과·부재면 `template-update` 확인을 자식 프로세스로 1회
  (타임아웃 상한) 돌려 갱신한다. 실패·오프라인 = INFO(판정 아님), 업데이트 있음 = INFO + 제안 명령 1줄.
- (b) **`template-update --proposal`**: 사람용 제안문(stdout, 파일 쓰기 0) — 로컬 버전 이후 CHANGELOG 항목 요약 · ⚠ 항목과 MIGRATION 절 · HOLD·localForked·review 목록 ·
  적용 명령 1줄. 하류 에이전트는 이를 사람에게 보이고 **승인 뒤** `--apply`([ADR-12]).

## 수용 기준
- 테스트 먼저([ADR-40]): 캐시 읽기·쓰기(앵커 보존) · 24h 경계 · 네트워크 실패 = INFO · `--proposal` 순수 렌더(버전 동일 = "최신", ⚠ 포함, HOLD 목록) — 픽스처는 네트워크 없이.
- 상류 자신(템플릿)에서 `upstream` 차원은 INFO "해당 없음"(자기 자신과 대조 안 함). 캐시 없음·차원 실패가 health 종료 코드를 바꾸지 않는다(회귀 0).
- 어답터 팔([TOOL-26]) env·kit 형상에서 health 가 `upstream` 차원을 보이고 `--proposal` 이 도는지 확인.
- 배송: 두 파일은 이미 sync 대상 — `@ship` 분류 확인. 카드 [TOOL-21]·[TOOL-04] · MIGRATION("업데이트 알림 읽는 법") · CHANGELOG.
- 범위 밖: ①(c) HANDOFF 린터 연결 · 어답터 3곳 실동기화(다음 WO — 이 WO 의 제안문으로 진행).

## 증거
- 닫을 때 frontmatter `evidence:` 에 값 또는 `none — 이유`(선언 검사가 있으면 `rcpt:<name>@<sha>`). 상위 축 흔적은 `closed_by:`.
