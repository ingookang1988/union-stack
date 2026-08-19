<!-- [Wiki] 더미 E2E 계약. -->
---
id: FLOW-01a
title: (예시) 소셜 로그인 데이터 리니지
status: Active
version: 1.0
---
# [FLOW-01a] (예시) 데이터 리니지 기록

> 이 표는 페이로드가 *지금 이렇게 흐른다*는 **관찰**이다. 양쪽 코드가 함께 깨지는 *약속*(타입·enum)은
> `[CON-01]`이 정본이며 여기서 다시 정의하지 않는다 — 경계 판별식은 [PRO-16].

| Layer | Component | Payload | Ref |
|---|---|---|---|
| UI | (예시)LoginPage | provider: `[CON-01]` | [PLAN-01a] |
| BE | (예시)AuthUseCase | LoginCommand | |
| DB | (예시)UserRepo | auth_provider | [EVD-01a] |

## 테스트 케이스 (층 3 — 통과 조건)
- [ ] (예시) 유효 provider로 로그인 성공
- [ ] (예시) 무효 provider 거부
> 도구(러너·mock 호출법 = 층 2)는 reference/contracts/ 카탈로그 참조.
