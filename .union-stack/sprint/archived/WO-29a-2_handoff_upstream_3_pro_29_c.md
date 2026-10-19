<!-- [Wiki] 작업 지시. 상태 정본은 이 frontmatter `status:` 하나뿐이다([PRO-15]). scaffold 생성 — 선택 절(배경·설계·절차)은 필요할 때만 추가. -->
---
id: WO-29a-2
title: 하류 제안 고리 닫기 — HANDOFF 린터 upstream 연결 + 어답터 3곳 실동기화 관측 — [PRO-29] ①(c)
status: Closed
parent: PRO-29
evidence: "상류 몫 완료(2026-10-19, 테스트 먼저): handoff-linter upstream-unrelayed(§3·§4 언급 검사 · 캐시만 · 상류 침묵) · adopter-census 동기화 지연 열(syncLag — 앵커 vs origin/main 블롭 · 후보 배열 · 상류 삭제 · 이력 밖 앵커 · 자기 확인). rcpt:n/a — handoff-linter.test 29(+8) · adopter-census.test 51(+14) · 스위트 50 중 48(실패 2 = fdt spike 귀속) · 팔 7 형상 충족. dry-run: A 지연 13/80 · B 55/120(상류 삭제 10 · 이력 밖 5) · C 4/91 · 자기 확인 3곳 없음. 사람 몫(어답터 3곳 적용 → 5회차 지연 0) — 5회차(2026-10-19): 3곳 health upstream 자기 확인 도달 · 자동 적용 가능 지연 3곳 0. 바 재정의(지연 0 → 자동 적용 가능 지연 0, PRO-29 §6 판정) 로 충족 · Closed 판정 2026-10-19(인간 승인)"
closed_by: [.union-stack/reference/tools/TOOL-30_adopter_census.md, .union-stack/proposals/PRO-29_connection_closure.md]
version: 1.0
---
# [WO-29a-2] 하류 제안 고리 닫기 — HANDOFF 린터 upstream 연결 + 어답터 3곳 실동기화 관측 — [PRO-29] ①(c)

## 목표
[PRO-29] ① 하류 제안 고리를 **닫는다** — 성공 바 "3곳 모두 최신 상류로 동기화된 상태가 census 로 관측된다".
- (c) **HANDOFF 린터 연결**: health `upstream` 이 "업데이트 있음"(캐시 기준, 네트워크 0)인데 HANDOFF §3 다음 작업·§4 미해결에 업데이트 제안이 없으면 CLARIFY 1줄
  (차단 아님 · 캐시 없음/상류 자신 = 침묵). 제안이 사람에게 닿았는지를 세션 종료 의례가 묻는다.
- **실동기화 관측**: 이 WO 의 상류 몫은 (1) 위 변경의 배송 (2) census 에 "동기화 지연" 열(로컬 버전·마지막 `--apply` 일자·`lastCheck.updates`, 읽기 전용 — 앵커 파일만 읽음).
  각 어답터의 적용은 **어답터 세션에서 그 사람이** 한다([PRO-24] §5 — 상류는 어답터 레포를 쓰지 않는다). 상류는 회차 행으로 결과만 본다.

## 수용 기준
- 테스트 먼저([ADR-40]): handoff-linter — 업데이트 있음 + 언급 없음 = CLARIFY · 언급 있음(`template-update`·`업데이트 제안` 등) = 통과 · 캐시 없음·self = 침묵 · 픽스처는 네트워크 없이.
  census — 동기화 지연 열(raw/익명) · 앵커 없음 = "판별 불가"(0 아님, [ADR-23]) · 어답터 쓰기 0 유지.
- 팔 7 형상 충족 · `--apply` 로 받는 두 파일(handoff-linter·template-update)의 의존 불일치 0(HOLD 0).
- **닫힘 조건(사람 몫 포함)**: 어답터 A·B·C 각 세션에서 health `upstream` → `--proposal` → 사람 승인 → `--apply` 를 1회씩 수행하고, 상류 census 5회차 행에서
  3곳 모두 "동기화 지연 0" 이 관측된다. 3곳 중 하나라도 보류하면 그 사유를 행에 남기고 이 WO 는 Verifying 에 머문다(위조 금지).
- 부산물: 적용 중 드러난 상류 결함은 이 WO 에서 고치지 않고 별 WO 로 발행(범위 고정). 카드 [TOOL-30] · handoff-linter 카드 · CHANGELOG.

## 증거
- 테스트: handoff-linter +8(언급 없음 CLARIFY · §3/§4 언급 통과 · §1만 = CLARIFY · 최신/캐시 없음/옵션 없음 침묵 · --proposal 안내) · census +14(판별 불가 · 지연/삭제 · 후보 배열 · foreign · 익명 열 · 쓰기 0).
- 발견 1(실측): 시딩 앵커는 후보 배열(B 120 중 100) — 첫 구현은 104 로 과대 집계. 배열 대조로 수정.
- 발견 2(실측): B 앵커 5건이 상류 이력 어디에도 없다 = 로컬 개조가 정합으로 시딩됨 → 다음 `--apply` 가 덮는다. 열에 ⚠ 로 표면화(②고리 규칙 이탈의 첫 실례).
- 카드: handoff-linter 전용 TOOL 카드는 없다(게이트 체인 소속) — 신설 안 함. 규칙은 CHANGELOG·코드 주석.
- **5회차(2026-10-19, 2회차 적용 뒤)**: 3곳 모두 health `upstream` 이 스스로 떴다(자기 확인 @ 2026-10-19) — 명령 기억 없이 도달 ✓. 자동 적용 가능 잔여 = 3곳 **0**
  (lastCheck sync − 분기 − 앵커 없음: A 14−4−10 · B 6−6−0 · C 4−2−2). 그런데 census 지연은 A 2 · B 12 · C 0 — **설계상 0 이 될 수 없는 것이 섞였다**:
  보존 포크(A upward-fetch·handoff-linter · B permission-guard·history-linter) · review 9(B — `--apply` 가 안 쓰니 앵커가 영영 안 움직인다) · 상류 전용 사본 · 거부 파일.
  같은 원인으로 health `upstream` 은 3곳 모두 상시 "업데이트 있음" — 실행할 것이 없는데 알린다(알림 피로). 바 "지연 0" 의 재정의가 필요 — 사람 판단.
- 남은 것(사람): A·B·C 세션에서 health upstream → --proposal → 승인 → --apply → 상류 census --write(5회차). B 는 이력 밖 앵커 5 를 먼저 확인(--force 대상에서 제외).
