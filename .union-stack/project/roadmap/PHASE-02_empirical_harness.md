<!-- [Schema/당위·행위] 마일스톤. 태스크·ID(T1·WO-01a 등)는 가공 예시(example). 설계 근거: eval/PROTOCOL.md·eval/RESULTS.md -->
---
id: PHASE-02
title: Empirical Harness — "그럴듯하게 효과적" → "방어 가능하게 효과적" + "실전 검증"
status: Active
version: 1.0
---
# [PHASE-02] Empirical Harness (v5.15 → v6.0)

## 테제
v5.x는 하네스가 구조적으로 건전(격자 연역·게이트 코드화)하고 자기 일관적(`health` green)이며
*그럴듯하게* 효과적(파일럿 +67%p, `eval/RESULTS.md`)임을 보였다. Phase E는 마지막 셋을
*주장 가능*에서 *방어 가능*으로, 그리고 *실전 검증됨*으로 끌어올린다. 종착점: **값싼 연속 효능
신호(프록시)를 주기적 A/B로 앵커링하는 루프 + 실전에서 단련된 런타임 강제.**

## 워크스트림 (각 반증 가능 가설 + exit gate)
### E1 — 효능 A/B v2 (방어 가능한 주장)
- H1(비국소성): 계약(CON)을 코드에서 떼면 재사용 델타 > 0. *(파일럿 잔여 가설 — 최우선)*
- H2(안정성): N=5/셀에서 시간축 태스크(T1·T3) 델타 ≥ +0.6 유지.
- H3(토큰 순이득): on의 선주입 비용 < off의 재작업 비용(놓친 함정 수정까지).
- H4(모델 의존): sonnet·haiku·opus 3티어 — "약한 모델에 더 큰 이득 vs 강한 모델의 조향".
- Exit: 반증 가능·복제된 효능 표(`eval/RESULTS.md` v2).

### E2 — 발견 메커니즘 검증 (규모에서 upward-fetch 정확도)
- 50~100노드·다계보 합성 평면에서 upward-fetch precision/recall + 예산 준수 측정.
- H: 평면이 커져도 precision 유지 & 주입이 토큰 예산 내.
- Exit: 100노드 평면 precision ≥ 임계 & 예산 내. 산출물 `scripts/fetch-eval.js`.

### E3 — 런타임 강제 도그푸딩 (거짓양성 경제학)
- `UNION_STACK_HOOK=enforce` 실작업 운용 → 정당한 편집 차단 빈도 수집·튜닝.
- 워크플로 스코프 확보 시 CI 스텝(ref --strict + npm test) 재착륙.
- Exit: enforce를 기본값으로 권할 FP율 — 아니면 *왜 warn이 기본인지* 근거 문서화.

### E4 — 프록시→효능 캘리브레이션 루프 (엔드게임)
- E1 데이터로 `eval.js` 프록시가 A/B 효능을 예측하는지 검증(파일럿의 "상한 관계").
- 확인 시 프록시=연속 회귀신호, A/B=재앵커링 전용. 재실행 정책 명문화.
- Exit: 프록시 델타 ↔ 실현 델타의 명시된·근거 있는 관계.

## 시퀀싱
E1(앵커·선행) → E4(E1 데이터 의존). E2 병렬 가능. E3는 실사용 필요 → 백그라운드 도그푸딩 즉시 시작.
전부 exit gate 통과 시 **v6.0 "Empirical Harness"** 승격.

## 리스크(정직)
- 모델 A/B는 비싸고 노이즈↑ → 기계 루브릭·블라인드·N=5로 완화, 절대수치 비이식.
- 합성 평면 ≠ 실도메인 → E2/E3는 가능하면 실어댑터 1곳 교차검증.
- E4 캘리브레이션은 데이터 적으면 과적합 → "상한 관계"라는 약한 주장에서 출발.

## 진행 상태
- [E1-H1] ✅ 비국소성 법칙 확인(2회차). [E1-H2] ✅ 순수 태스크 7/7 vs 0/7 분산0(3회차).
  [E1-H4] ✅ 효과 모델-무관(+1.0 haiku=sonnet=opus) — "crutch for weak" 반증, "steering wheel for strong" 지지.
- 미결: 시간축 태스크(T1·T3) 순수 측정용 **instrument v2**(isExpired 은닉·zeta 사소 전환) → N=5 재측정 → [E4] 캘리브레이션. [E2]·[E3] 대기.
