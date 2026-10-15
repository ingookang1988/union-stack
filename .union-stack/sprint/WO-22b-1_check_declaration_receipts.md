<!-- [Wiki] 작업 지시. 상태 정본은 이 frontmatter `status:` 하나뿐이다([PRO-15]). -->
---
id: WO-22b-1
title: 검사 선언 + 실행 영수증 — [PRO-22] §3 단계 1·2 구현 (0건 검사 = 실패 포함)
status: Verifying
parent: PRO-22
evidence: "구현 완료(2026-10-16, 가드 먼저): scripts/receipts.js(순수: 러너 출력 파싱 · 2-bis 3분할 judge · 줄 스키마 · 나이 · --scan 초안 · 인용) + ci.js(선언 검사 실행 · 단계마다 영수증 1줄 scope=harness/product · --only-checks · --no-receipts · --scan) · adapter.json checks[](6분류·3비용·expected_zero_unless) · health receipts 절(차단 검사별 최신 포인터·나이, 선언 부재 무기입) · work-close rcpt: 인용 CLARIFY(소급 없음 — n/a 허용) · init 이 receipts.md 리셋 · 팔 nonjs 형상 4 바 충족. 도그푸딩: 상류 adapter.json 선언 1(suite) + 영수증 rcpt:suite@2133507(REJECT — 미커밋 fdt spike 귀속 실패 2를 정직하게 기록). [PRO-22] §3 단계 3~5 는 [WO-22b-2]부터"
closed_by: []
version: 1.0
---
# [WO-22b-1] 검사 선언 + 실행 영수증

## 목표
[PRO-22] v1.0 §3 의 단계 1(검사 선언)과 2(영수증)를 **한 루프**로 구현한다 — 선언은 "무엇이 막는가"를, 영수증은
"실제로 돌았는가"를 말하고, `health` 가 둘을 대조한다. 설문 9건(`eval/SURVEY-01_results.md` §5·§7)이 3/3 레포에서
확인한 결함 클래스 **"검사가 아무것도 안 보고 초록"**을 닫는 것이 핵심이다.

범위:
1. `adapter.json` `checks[]` 선언 — name · cmd · blocking · runs_on · covers + **kind**(정적·동작·재현·측정·수용·메타) ·
   **env**(환경 전제) · **cost**(push / nightly / manual-paid). 선언 초안 생성기 `ci.js --scan`(package.json·훅·워크플로에서).
2. `ci.js` 가 하네스 체인 뒤 선언 검사를 돌고 검사마다 영수증 1줄을 `verification/raw/` 에 append — 커밋 · dirty · 검사명 ·
   명령 · exit · 소요 · N/M · **검사 대상 수** · env 태그 · 생성자 · `harness:`/`product:`. 수기 경로 없음.
3. **0건 검사 = 실패 — 3분할**(하류 검토 4/4, `eval/SURVEY-02_results.md` §5): `targets=0` → REJECT 는 **`blocking: true` 전수 검사**에만 ·
   diff 조건부(권한 가드·lockfile·마이그레이션 동반, `kind: 메타`) → NOOP_PASS/INFO · env 조건부(DB·플래그 프로브·엔진 레인·`--passWithNoTests`)
   → CLARIFY + `skipped: N / reason: env`. 집계 단위 = **선언 행**(파일 단위 금지). 다중 레인은 부모-자식 영수증. 선언에 `expected_zero_unless`.
   추가 필드(2곳 이상 요구): 선언 `scope`(패키지·대상 목록) · `runner` · `prebuild` · `runs_on` 에 post-deploy/lane · 승인·권한 식별 — 영수증 `skipped` ·
   `range` · 러너 설정 해시. 못 채울 것은 비움 허용: `dirty`(컨테이너) · N/M(tsc·빌드·린터 → 파일 수) · `harness:/product:`(한 명령이 둘을 돌리면 러너가
   쪼갠다) · `kind: 수용` 영수증(사람 — 수기 허용 예외). **소급 없음** — 신규 WO 부터.
4. `health` — 차단 검사별 최신 영수증 포인터·나이 INFO. 선언 부재는 무기입(INFO), 크래시 0.
5. `work-close` — `evidence:` 가 영수증(커밋·검사명)을 인용하는지 CLARIFY.

## 수용 기준
- 단위 테스트가 **먼저** 고정돼 있다([ADR-40]): 0건 검사 → REJECT · 선언 부재 → INFO · 영수증 줄 스키마 · harness/product
  구분 · 영수증 나이 계산.
- 어답터 팔([TOOL-26])에 **비-JS 제품 형상** 1개를 추가하고 그 형상에서 ① 선언된 검사를 끄면 `health` 가 영수증 공백을
  표면화 ② 선언 부재 형상 크래시 0 ③ 0건 검사 형상 REJECT([PRO-22] §6 성공 바).
- 영수증은 러너만 쓴다 — 사람·에이전트가 타이핑하는 경로가 코드에 없다.
- 상류 자신에게 도그푸딩: 이 레포 `adapter.json` 에 선언 1개 이상 + raw 영수증 1줄 이상.
- [TOOL-04]·[TOOL-23]·[TOOL-27] 카드와 `verification/_GUIDE.md` 를 행 단위로 갱신. AGENTS.md 는 건드리지 않는다.

## 절차
1. 테스트 먼저(위 5종) → 2. `ci.js` 영수증·0건 가드 → 3. 선언 스키마 + `--scan` → 4. `health`·`work-close` 확장 →
5. 어답터 팔 비-JS 형상 → 6. 카드·가이드 → 7. [PRO-22] §3 단계 3~5 는 이 WO 종료 후 [WO-22b-2]부터 발행.

## 증거
- 테스트: `scripts/receipts.test.js`(신설, 28) · adapter(+7) · health(+8, dims 18) · work-close(+6) · adopter-arm(+3) — 전부 녹색. 스위트 42 중 40 통과,
  실패 2 = 미커밋 fdt spike 귀속(leakage·ref — 이전과 동일). lint 체인 15종 중 leakage 외 전부 exit 0.
- 어답터 팔 `nonjs`: 선언 4·영수증 0 → health 가 공백 표면화 / `ci.js --only-checks` → zero=REJECT · ok=PASS · guard=NOOP_PASS · probe=CLARIFY, 체인 exit 1 /
  영수증 4줄(scope=product · targets) / 영수증 뒤 health 포인터·나이. 6 형상 성공 바 전부 충족.
- 도그푸딩: `.union-stack/adapter.json` 에 `suite` 선언 1 · `verification/raw/receipts.md` 에 러너가 쓴 줄 1 — rcpt:suite@2133507, targets=42 passed=40 failed=2 →
  **REJECT**(exit 1). 영수증은 판정을 미화하지 않는다: 실패 2는 의도적 미커밋 spike 귀속이고, 그것이 이 줄에 그대로 적힌다. `health` receipts 절: suite 0d(REJECT · 42).
- 러너 외 쓰기 경로 0: receipts.append 는 ci.js 와 팔(픽스처 초기화)만 호출. CI 래퍼(harness.yml)는 evidence.md 와 함께 receipts.md 를 커밋한다.
- 결정: 하네스 단계도 영수증을 쓴다(scope=harness) — tests 단계는 node --test 출력에서 targets 를 읽는다. `work-close` 인용 규칙은 선언 검사가 있는 레포에서만,
  `rcpt:n/a — 이유` 로 소급 면제(기존 Verifying WO 4건은 Closed 판정 시 사람이 n/a 를 적는다).
