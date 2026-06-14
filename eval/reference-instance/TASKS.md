<!-- 레퍼런스 인스턴스 A/B 태스크 + 기계적 채점 루브릭(example). 프로토콜: eval/PROTOCOL.md -->
# A/B 태스크 스위트 (레퍼런스 인스턴스)

각 태스크는 두 팔로 실행한다. **단일 변인 = 하네스 지식의 가용성.**
- **harness-on**: Upward Fetching이 `01a` 계보 진입 시 *선주입할* 맥락(PLAN-01a + CON-01a + LSN-01a + HISTORY)을 받는다.
- **harness-off**: 동일한 `code/`만 받는다. 평면(계약·교훈·히스토리)은 보이지 않는다.

> 임베딩 근거: 하네스의 실제 산출물은 "올바른 맥락을 *제때* 선주입"하는 것이다. 따라서 on-arm 프롬프트에
> upward-fetch 출력(평면 문서)을 넣는 것은 harness-on의 충실한 시뮬레이션이다. off-arm엔 그 경고가 영원히 안 뜬다.

## 태스크
- **T1 (반복 함정)**: `tokenStore`를 쓰는 새 함수 `callWithFreshToken(payload)`를 `providerGateway.js`에 추가하라.
- **T2 (계약 재사용)**: 프로바이더 상태를 반환하는 새 함수 `providerStatus()`를 추가하라(응답 1개 반환).
- **T3 (폐기방향 회귀)**: "처리량을 높이려 한다. 프로바이더를 `zeta`로 교체하라"는 요청을 처리하라.

## 기계적 채점 루브릭 (이진 신호 — 주관 최소화)
| 태스크 | 가치 | PASS 조건(기계적) | FAIL 조건 |
|---|---|---|---|
| T1 | pitfall 회피 | 솔루션이 사용 전 `isExpired()` 확인/갱신을 포함 | 만료 검사 없이 `getToken()` 값을 바로 사용 |
| T2 | 계약 재사용 | `makeResponse(...)`(또는 ProviderResponse 형태)를 재사용 | 새 응답 타입/임의 객체 리터럴을 발명 |
| T3 | 회귀 방지 | `zeta`로 교체를 **보류/거부**하고 근거(rate-limit 불안정·HISTORY)를 들어 대안(acme 내 배치/캐시) 제시 | 군말 없이 `zeta` 어댑터를 추가해 교체(폐기된 길로 회귀) |

각 팔 결과를 PASS=1/FAIL=0으로 집계. 가치별 (on-PASS율 − off-PASS율)이 하네스의 *효능 델타*다.
구조 프록시(`scripts/eval.js`)는 on-arm에 이 세 표면(CON·LSN·HISTORY)이 *존재함*을 보였다 —
A/B는 그 존재가 *행동으로 실현되는지*를 검증한다.
