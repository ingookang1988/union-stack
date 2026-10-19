<!-- [Wiki] 작업 지시. 상태 정본은 이 frontmatter `status:` 하나뿐이다([PRO-15]). scaffold 생성 — 선택 절(배경·설계·절차)은 필요할 때만 추가. -->
---
id: WO-29a-1
title: 하류 제안 고리 — health upstream 차원 + template-update 제안문 — [PRO-29] ①(a)(b)
status: Verifying
parent: PRO-29
evidence: "구현 완료(2026-10-19, 테스트 먼저): template-update checkSummary·lastCheck 캐시(앵커 보존)·isFresh(24h, 실패 시각 포함)·changelogSince(미릴리스 포함 옵션)·renderProposal · --proposal(쓰기 0)·--refresh-cache / health upstream 차원(INFO 전용) · gatherUpstream 기본 읽기 전용(CLI 자기 레포만 갱신). rcpt:n/a — template-update.test 111(+19) · health.test 75(+13) · 스위트 50 중 48(실패 2 = fdt spike 귀속) · 팔 7 형상 충족 · 실네트워크 스모크(어답터 형상 사본): 1회차 갱신 → 2회차 캐시 1.9s · 제안문 쓰기 0"
closed_by: [.union-stack/reference/tools/TOOL-21_template_update.md, .union-stack/reference/tools/TOOL-04_health.md]
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
- 테스트: template-update +19(요약·캐시 앵커 보존·실패 병합·TTL 경계·미릴리스·줄바꿈 …·15건 상한·앵커 없음 안내) · health +13(차원 6상태·fails/warns 불변·self·읽기 전용 기본·gather 쓰기 0).
- 설계 정정 1(구현 중 발견): 처음엔 `gather()` 가 만료 시 갱신했다 → census([TOOL-30])가 어답터 레포에 **쓰게** 되고 팔 env 형상 스위트가 red. 갱신을 CLI·자기 레포 opt-in 으로 옮겼다.
- 설계 정정 2(스모크에서 발견): 상류는 릴리스 헤딩 없이 `[Unreleased]` 에 쌓는다 → 같은 6.0.0 어답터의 "바뀐 것"이 비었다. 파일 드리프트가 있으면 미릴리스 항목을 싣는다.
- 남은 것(다음 WO): ①(c) HANDOFF 린터 연결 · 어답터 3곳 실동기화(이 제안문으로) · CHANGELOG 릴리스 헤딩 절단(6.0.0 이후 미릴리스 누적 — 사람 판단).
