<!-- [Wiki] 더미 E2E 계약. -->
---
id: FLOW-01a
title: (예시) 소셜 로그인 데이터 리니지
status: Active
version: 1.0
---
# [FLOW-01a] (예시) 데이터 리니지 계약
| Layer | Component | Payload | Ref |
|---|---|---|---|
| UI | (예시)LoginPage | provider: string | [PLAN-01a] |
| BE | (예시)AuthUseCase | LoginCommand | |
| DB | (예시)UserRepo | auth_provider | [EVD-01a] |

## 테스트 케이스 (층 3 — 통과 조건)
- [ ] (예시) 유효 provider로 로그인 성공
- [ ] (예시) 무효 provider 거부
> 도구(러너·mock 호출법 = 층 2)는 reference/contracts/ 카탈로그 참조.
