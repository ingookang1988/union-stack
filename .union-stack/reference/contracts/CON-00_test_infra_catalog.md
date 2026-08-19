<!-- [Schema/계약] 테스트 도구 카탈로그(층 2). 예시는 더미 도메인. -->
---
id: CON-00
title: 테스트 도구 카탈로그
status: Active
consumers: [FLOW-01a]
version: 1.0
---
# [CON-00] 테스트 도구 카탈로그 (층 2)
| 자산 | 경로(어디) | 호출법(어떻게) |
|---|---|---|
| (예시)테스트 러너 | `/test/runner` | `npm test` |
| (예시)공통 fixture | `/test/fixtures/example` | `loadExample()` |
| (예시)UserRepo mock | `/test/mocks/example` | `mockExampleRepo()` |
> 전부 가공 예시. 복제 후 실제 인프라로 교체(또는 자동 추출로 생성).

> **`consumers:` 동작 예시([PRO-16]).** 이 카탈로그(계보 `00`)의 호출 규약을 쓰는 테스트 케이스는
> `[FLOW-01a]`(계보 `01`) 옆에 산다 — **계보가 다르므로 계보 산술로는 안 보인다.** 선언해 두면
> `node scripts/blast-radius.js CON-00` 이 소비자와 그 자손을 영향권에 넣고, 소비자가 `Verifying`
> 이면 Fail-close 한다. 도구가 케이스를 생성한다는 §5.3의 관계가 그대로 간선이 된 것이다.
