<!-- [Wiki] 작업 지시. 상태 정본은 이 frontmatter `status:` 하나뿐이다([PRO-15]). scaffold 생성 — 선택 절(배경·설계·절차)은 필요할 때만 추가. -->
---
id: WO-29a-5
title: 상류 이탈 알림 고리 ① — census --delta(직전 회차 대비 신규/해소) + 규칙 이탈 4종 분류 — [PRO-29] ②(a)(b)
status: Verifying
parent: PRO-29
evidence: "구현 완료(2026-10-19, 테스트 먼저): census 규칙 이탈 4종(gate·rule·weak·sync) + 직전 원자료 대비 델타(신규·지속·해소) · --delta · --raw-dir · 이탈(신규) 열. rcpt:n/a — adopter-census.test 76(+18) · 스위트 50 중 48(실패 2 = fdt spike) · 팔 7 형상 · 주입 실험 4/4 신규 → 재실행 신규 0 → 되돌림 해소"
closed_by: [.union-stack/reference/tools/TOOL-30_adopter_census.md, .union-stack/proposals/PRO-29_connection_closure.md]
version: 1.0
---
# [WO-29a-5] 상류 이탈 알림 고리 ① — census --delta(직전 회차 대비 신규/해소) + 규칙 이탈 4종 분류 — [PRO-29] ②(a)(b)

## 목표
[PRO-29] ② 상류 이탈 알림 고리의 (a)(b): 하류가 **규칙에서 어긋나면** 상류가 그것을 **새로 생긴 것만** 집어낸다. 이 WO 는 판별까지다. 표면(대시보드·HANDOFF 한 줄)·트리거(세션 종료·7일)는 다음 WO.
- (b) **규칙 이탈 4종**(고정, 본문 읽기 0 — [TOOL-30] 불변식):
  1. **게이트 red**: 어답터 health(상류 도구를 root 로) 의 FAIL 차원 이름.
  2. **규칙 파일 분기**: AGENTS.md `blocks-index` 마커 블록 · `_GUIDE`·`gate-contract` 의 상류 대비 블롭 불일치(§7-2 잠정 = blocks 블록만 — 블록 **해시만** 비교, 본문 출력 0).
  3. **약화 신호**: 어답터 레포에 상류 `weakening-guard` 를 root 로 돌린 신호 수 · 예외 순증(코드 본문은 결과에 나가지 않는다).
  4. **동기화 지연**: 적용 가능 지연 > 0([PRO-29] §6 재정의 바) · 마지막 `--apply`(앵커 파일 날짜) 이후 일수.
- (a) **델타**: 비공개 원자료(`eval/private/census/`)의 직전 회차 레포별 JSON 과 대조 → 이탈 항목별 **신규 / 지속 / 해소**. 같은 이탈의 재보고 = "지속"(신규 0).

## 수용 기준
- 테스트 먼저([ADR-40]): 4종 각각의 판별(픽스처) · 델타 3상태 · 직전 회차 없음 = 전부 "신규"(첫 회차 표기) · 원자료 구 꼴(이탈 필드 없음) 호환.
- **주입 실험**(성공 바): 어답터 팔([TOOL-26]) 사본에 4종을 하나씩 심고 census `--delta` → **4/4 신규 검출**, 그대로 한 번 더 → **신규 0**(지속 4), 되돌리면 → 해소 4.
- 익명성: 이탈 열에는 차원명·종류·개수·상류 파일명만(어답터 경로·제목·본문 0, [ADR-11]). 어답터 쓰기 0(앵커·캐시 포함). 상류 weakening-guard 를 남의 레포에 돌릴 때 git 읽기만.
- `--delta` 는 dry-run 출력에 신규/지속/해소 요약 1줄/레포 · `--write` 는 CENSUS 행에 "이탈(신규)" 열 추가. 팔 7 형상 · 스위트 회귀 0 · 카드 [TOOL-30] · CHANGELOG.
- 범위 밖: 대시보드 카드 · HANDOFF 한 줄 · 7일 health INFO([PRO-29] ②(c)(d) — 다음 WO).

## 증거
- 테스트: census +18(4종 각각 · 관측 불가 = 이탈 아님 · 구 원자료 호환 · 델타 3상태·첫 회차·재보고 = 지속 · 익명 열 3 · 실 git 픽스처: head 기록·blocks missing·테스트 삭제 검출·쓰기 0).
- **주입 실험**(어답터 형상 사본 · `--raw-dir` 분리 · 상류 CENSUS.md 원복): 주입 → 신규 4종 전부(+ `gate:leakage gate` — 주입한 잘못된 이름 파일이 더미 표식도 없어 같은 주입이 두 게이트를 깼다, 정당한 검출) ·
  그대로 재실행 → **신규 0** · 지속 5 · 되돌림 → **해소 5**. 성공 바 4/4 · 재보고 0 충족.
- 실데이터 첫 델타(dry-run, 직전 = 2026-10-19 원자료 — 규칙·약화 필드 없는 구 꼴): A 신규 sync:applicable · weak:numeric-change · B 신규 sync:applicable ·
  C 신규 rule:blocks-missing(AGENTS.md 에 차단 블록 마커 없음 — [PRO-14] 이전 미완) · sync:applicable · weak 3종(커밋 안 된 작업 트리). sync:applicable 은 오늘 push 분.
- 설계 판단: 규칙 파일 분기는 "상류와 다름"이 아니라 **자기 원장 대비 낡음**으로 본다 — 어답터 차단 블록은 자기 원장에서 생성되므로 상류와 늘 다르다(비교 무의미).
