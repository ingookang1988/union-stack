<!-- [Wiki] 작업 지시. 상태 정본은 이 frontmatter `status:` 하나뿐이다([PRO-15]). -->
---
id: WO-22b-2
title: 약화 표면화 + 기준선 만료 — [PRO-22] §3 단계 3·4 구현 (weakening-guard · known_failures · 예외 증가 red)
status: Verifying
parent: PRO-22
evidence: "구현 완료(2026-10-16, 가드 먼저): scripts/weakening-guard.js([TOOL-31], 계약 PASS/CLARIFY/REJECT) — 신호 6종 질문 한 줄(CLARIFY, 절대 차단 아님) · weakening: 사유 면제 · 단계 4 ⓑ 예외 순증 red + known_failures(id·reason·owner·until, 줄 단위 덮기) · 만료 REJECT · 자기언급 오염 방지(따옴표 안 마커 제외, [ADR-19]) · ci.js 체인 permission-guard 다음(차단) · 팔 nonjs 바 2(예외 +2 REJECT → known_failures 로 CLARIFY). 도그푸딩: 상류 작업트리·최근 커밋 범위 PASS. rcpt:n/a — 이 WO 의 검사는 하네스 스위트(harness 영수증)이지 제품 검사가 아니다"
closed_by: []
version: 1.0
---
# [WO-22b-2] 약화 표면화 + 기준선 만료

## 목표
[PRO-22] v1.0 §3 의 단계 3(약화 표면화)과 4(기준선 만료)를 **한 게이트**로 구현한다 — 같은 범위 diff 를 한 번 읽어 약화는 묻고, 예외 증가는 막는다.
[WO-22b-1](선언·영수증)의 후속이며 §3 단계 5(카탈로그 일반화, H5 최하)는 별건.

범위:
1. **`scripts/weakening-guard.js`**([TOOL-31], 새 게이트 계약 PASS/CLARIFY/REJECT) — 입력: 작업트리 vs HEAD · `--range` · `--diff <file>`. 신호 6종(테스트 삭제 ·
   skip/only 추가 · 단언 순감 · 스냅샷 **변경 필드 종류** · 러너 설정 · 숫자 리터럴 변경) → CLARIFY "질문 한 줄". 활성 WO evidence 의 `weakening: <사유>` 면 PASS(INFO).
   **약화 신호는 절대 차단하지 않는다**(v1.0 고정 — 차단이면 우회만 는다).
2. **단계 4 택일: ⓑ 예외 목록이 base 대비 늘면 red.** 예외 = skip/only · eslint-disable · @ts-ignore/@ts-expect-error · noqa · nolint · allowlist/holdout/baseline
   파일 항목. 순증은 `checks[].known_failures: [{id, reason, owner, until}]` 가 덮어야 하고(id 가 추가 줄에 보여야), 만료는 REJECT. ⓐ(WO 자동 등재)를 택하지
   않은 이유: 에이전트가 평면에 WO 를 쓰는 루프라 [ADR-12] 경계에 닿고, "만료일만 연장" 답을 막는 꼴은 red 뿐이라는 하류 3/3 답과도 맞다.
3. **`ci.js` 체인**에 `permission-guard` 다음 단계로(차단 — REJECT 는 예외 증가·만료뿐).
4. **어답터 팔 `nonjs`** 에 바 2: 합성 diff(테스트 삭제·skip·disable)로 REJECT · known_failures 가 덮으면 CLARIFY 로 내려온다.

## 수용 기준
- 단위 테스트 **먼저**([ADR-40]): diff 파싱 · 신호 6종 · 질문 한 줄 꼴 · 예외 순증 계수 · known_failures 덮기/만료/형식 · 사유 면제 · CLI 종료코드 0/3/1.
- 상류 자신: 작업트리 diff 에서 PASS(약화 0 · 예외 순증 0). 카드 [TOOL-31] 신설 · [TOOL-27] 체인 표 · MIGRATION(known_failures) · CHANGELOG. AGENTS.md 는 tools-index 블록만.

## 절차
1. 테스트 먼저 → 2. 게이트 → 3. 체인 편입 → 4. 팔 바 → 5. 카드·문서 → 6. §3 단계 5 는 [WO-22b-3](H5, 보류 가능).

## 증거
- 테스트: `scripts/weakening-guard.test.js`(신설, 27 — 파싱 · 신호 6종 · 질문 한 줄 꼴 · 예외 순증 · known_failures 활성/만료/형식/줄 덮기 · 사유 면제 · 문자열 안 마커 제외 ·
  CLI 0/3/1) · gate-contract(+3 게이트 계약 일괄 검사: weakening-guard·frontmatter-backfill·adopter-census). 스위트 43 중 41 통과, 실패 2 = 미커밋 fdt spike 귀속.
- 어답터 팔 `nonjs`: 합성 diff(pytest 파일 삭제 · @pytest.mark.skip · # noqa) → 신호 2 + 예외 +2 REJECT → known_failures(KF-ARM-1, owner·until) 등록 뒤 CLARIFY(덮인 예외 2).
  6 형상 성공 바 전부 충족.
- 도그푸딩: 상류 작업트리 diff(파일 10) PASS · `--range HEAD~1..HEAD`(26 파일) PASS. 체인 순서: zfs → history → permission → **weakening** → handoff → test-catalog → tests → health → arm → 선언 검사.
- 구현 중 잡은 자기언급 오염 2건([ADR-19] 클래스): ① 이 가드의 테스트·팔 픽스처(따옴표 안 `test.skip`·`eslint-disable`)가 가드를 울렸다 → 따옴표 안 마커 제외
  ② 팔 주석의 산문 "noqa" 가 예외로 잡혔다 → noqa/nolint 는 주석 머리(`#`·`//`)가 붙은 마커 꼴만. 둘 다 테스트로 고정.
- 결정: 단계 4 는 ⓑ(예외 증가 red)다. ⓐ(WO 자동 등재)는 에이전트가 평면에 WO 를 쓰는 루프라 [ADR-12] 경계에 닿고, 하류 3/3 의 "만료일만 연장" 답을 막는 꼴은 red 뿐이다.
