<!-- 방법론 자산 카드(leakage-guard METHODOLOGY 등재) — 이 템플릿이 실제로 배송하는 도구. -->
---
id: TOOL-04
title: Health 조견표 (게이트 + 구조 지표)
kind: script
impl: scripts/health.js
status: Active
version: 1.0
---

# [TOOL-04] Health 조견표

## 용도
전 게이트 상태(naming·history·leakage·크기·ref·context budget·잠금 노출)와 구조 지표(도메인 분포)를 한 번에 보고한다.
관측 4절(plane sync·lessons lifecycle·**effect surface**·tier distribution)은 전부 INFO — 판정·점수를 만들지 않는다([PRO-11] §4).
`effect surface`는 평면 밖 권한 allowlist(`.claude/settings*.json`)를 계수한다 — 비가역 외부 효과의 유일한 통제면이라 관측만 붙였다([ADR-23]).
`retro due` 절([PRO-25] ①)은 회고 지표 7(발행 증분·보관 부채·정체 WO·GC 가능 PLAN·평면 지연·증류 정체·원장 크기)을 싣고 하나라도 임계를 넘으면 **WARN**(= PRO 의 CLARIFY, 비차단)이다 — 에이전트는 HANDOFF §4 에 제안 한 줄만([TOOL-32]).
`receipts` 절([PRO-22] 단계 2)은 `adapter.json checks[]` 의 **차단 검사별 최신 영수증 포인터·나이**(INFO)다 — 영수증이 끊기면 꺼진 CI 가 여기서 보인다. 선언 부재는 무기입.

## 언제 쓰나
- 세션 마무리·커밋 전 자기 점검, 하네스 구조 변경 직후.

## 언제 쓰지 않나
- 단일 게이트만 볼 때(각 린터를 직접 — 더 빠르고 exit 코드가 명확).

## 호출
```bash
node scripts/health.js
node scripts/health.js --root <어답터 레포 또는 팔 사본>
```
- `--root <dir>` 는 **그 레포를** 측정한다([PRO-27] ④). `.union-stack` 이 없으면 REJECT "측정 대상 아님" — 플래그를 무시하고 상류 자신을 재던 결함(하류 실측, "0건 검사 = 통과" 클래스)의 수리. 어답터 로컬 설정은 INFO.
