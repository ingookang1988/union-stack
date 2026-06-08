<!-- [Schema/당위] 인프라 규범 더미 예시. 당신의 인프라 결정으로 교체.
     규범·결정만 — 현재 상태는 verification/state, 도구 호출법은 reference/contracts. -->
---
id: INF-01
title: (예시) 배포 인프라 규범
status: Active
version: 1.0
---

# [INF-01] (예시) 배포 인프라 규범

## 배포 (예시 결정 + 근거)
- (예시) 컨테이너 오케스트레이션은 K8s. 근거: 다중 환경 표준화·롤백 용이.
- (예시) 환경: dev / stage / prod 3단. 승격은 게이트 통과 시.

## DB (예시 결정 + 근거)
- (예시) Postgres 채택. 근거: 트랜잭션 보장 + 팀 숙련도. (스키마/타입 = `[CON-01]`)

## 경계 (무엇이 여기 *안* 들어오나)
- 현재 배포 상태·마이그레이션 현황 → `verification/derived/state`.
- 러너·fixture·mock 호출법 → `reference/contracts/[CON-00]`.

> 전부 가공 예시. 실제 인프라 *규범*으로 교체하라(상태·도구는 다른 평면).
