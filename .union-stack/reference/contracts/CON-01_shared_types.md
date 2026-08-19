<!-- [Schema/계약] 공유 정적 명세(SSOT). 더미. -->
---
id: CON-01
title: 공유 타입 명세
status: Active
version: 1.0
---
# [CON-01] 공유 타입 (SSOT)
- (예시) `ExampleProviderEnum = { A, B }` — 실제 타입으로 교체.

> **소비자가 다른 계보에 있다면** `consumers:` 로 선언하라([PRO-16] — 동작 예시는 `[CON-00]`).
> 같은 계보라면 선언이 무의미하다(계보 산술이 이미 덮는다).

> 계약 위반은 "안 도는 코드"를 낳는다. 변경은 신중히, version +1.
