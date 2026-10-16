<!-- [Wiki] 작업 지시. 상태 정본은 이 frontmatter `status:` 하나뿐이다([PRO-15]). -->
---
id: WO-28a-1
title: 절 계약 ① — adapter.json `sections` 별칭 맵(1:N + 접두) + ② 발행 린트가 맵으로 해소(매칭 실패 = CLARIFY) — [PRO-28] ①②
status: Verifying
parent: PRO-28
evidence: "구현 완료(2026-10-17, 가드 먼저): adapter.json sections(키 = 상류 의미 3 · 값 = 별칭 배열 · 알 수 없는 키/배열 아님 경고) · normalizeHeading(선두 번호·꼬리 콜론·공백) · resolveSection(정확 → 접두, 맵 없음 = 상류 표기 현행) · missingSections(H2 만) · work-close parseWo 가 맵으로 해소 + frontmatter evidence: 가 있으면 증거 절 불요 · anatomy-missing CLARIFY 에 맵 안내 한 줄 · 부수 수리: 대시보드 카드 제목의 코드 스팬·볼드 렌더(실측: 이 WO 제목의 `sections` 가 본문에 백틱으로 샘). rcpt:n/a — 하네스 스위트(adapter 77 · work-close 63 · dashboard 186) · 스위트 48 중 46(실패 2 = fdt spike 귀속) · 팔 7 형상 충족"
closed_by: [.union-stack/reference/tools/TOOL-23_work_close.md, MIGRATION.md]
version: 1.0
---
# [WO-28a-1] sections 별칭 맵 + 절 계약 린트

## 목표
어답터 평면의 헤딩 변형(센서스 3회차: 한 의미에 표기 3~5종, `## 증거` 0건)을 **문서를 고치지 않고** 발행 계약([PRO-19] 3절)에 붙인다([PRO-28] ①②, [ADR-29] — 포크 아닌 설정).

범위:
1. `adapter.json` **`sections`** — 키는 상류 의미 3(목표·수용 기준·증거), 값은 로컬 표기 별칭 배열(예시: 목적·완료 기준·검증). 알 수 없는 키·배열 아님은 경고 후 무시.
2. 절 해소 헬퍼(순수, adapter.js): `normalizeHeading`(선두 번호·꼬리 콜론·공백) · `resolveSection`(정확 → 접두, 맵 없음 = 상류 표기 현행) · `missingSections`(H2 만).
3. `work-close` 발행 린트(`parseWo` → `anatomy-missing`)가 맵으로 해소. **증거는 frontmatter `evidence:` 가 있으면 충족**(회신 2곳 일치). 매칭 실패는 CLARIFY 에 맵 안내 한 줄.
4. [PRO-28] §7 잠정값 채택: 접두는 로컬 표기가 의미/별칭의 접두를 *가질* 때만(역방향 없음) · 증거는 frontmatter 만으로 충족.

## 수용 기준
- 단위 테스트 **먼저**([ADR-40]): adapter(파싱·경고·정규화·해소·누락 계산 — 맵 없음/있음/H3 제외) · work-close(별칭 WO 누락 0 · 맵 없음 현행 유지 · evidence 충족 · 발행 점검 이슈 0 · 안내 문구).
- 상류 자신은 맵 없음 = 현행과 동일(회귀 0). 어답터 팔 7 형상 충족. 카드 [TOOL-23] · MIGRATION §"Adopter configuration" · CHANGELOG.

## 절차
1. 테스트 먼저 → 2. adapter `sections` + 헬퍼 → 3. work-close 연결 → 4. 카드·문서 → 5. 센서스 4회차(어답터가 맵을 선언한 뒤 매칭률 관측 — 별건).

## 증거
- 테스트: adapter.test +11(SECTION_KEYS · 파싱·경고 2 · 정규화 · 해소 맵 없음/정확/접두+번호/서사 제외 · 누락 맵/무맵/H3) · work-close.test +7(별칭 3절 누락 0 · 무맵 현행 ·
  evidence 충족/미충족 · 발행 점검 이슈 0 · 안내 문구) + 기존 1건 기대값 갱신(픽스처의 evidence 가 증거를 충족) · dashboard.test +3(제목 코드 스팬·볼드 렌더 · 마커 0 · HTML 이스케이프 유지).
  스위트 48 중 46 통과(실패 2 = 미커밋 fdt spike 귀속). 팔 7 형상 전부 충족. `work-close --table` 동기화.
- 상류 회귀 0: 맵 없는 상류 자신의 발행 린트는 현행 `^##\s*목표` 접두 의미와 동일(`resolveSection(null, '목표 및 범위') === '목표'`).
- 설계 결정: 증거 절을 요구하지 않는다 — 회신 2곳 모두 `## 증거` 0건이고 증거를 frontmatter 에 적는다. 서사 절(`진행 기록`)은 별칭으로 주어져도 의미 키가 아니면 경고·무시.
- 부수 수리(실측): 대시보드 스프린트·규범 카드 제목을 `proseInline` 으로 — 이 WO 의 제목이 상류 대시보드 '원문 마커 0' 회귀를 즉시 깨뜨렸다(상류 형상에서만 참인 사실의 네 번째 사례).
- 다음([PRO-28] 순서): ④ scaffold(`--next` 채번 + parent 실존) → ③ `upward-fetch --sections` → 센서스 4회차.
