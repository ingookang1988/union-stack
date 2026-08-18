<!-- 방법론 자산 카드(leakage-guard METHODOLOGY 등재) — 이 템플릿이 실제로 배송하는 도구. -->
---
id: TOOL-24
title: lineage-tree (계보 트리 렌더러)
kind: cli
impl: scripts/lineage-tree.js
status: Active
version: 1.0
---

# [TOOL-24] lineage-tree

## 용도
평면 전체를 루만 계보 포레스트로 그려 자기완결 HTML 1장(인라인 SVG)으로 낸다. 큰/낯선 평면에서의
방향 잡기용 — 스파이크 판정(2026-08-18)에서 첫 렌더가 CLI가 못 드러낸 구조 사실([ADR-25]의
좌표 앨리어싱)을 즉시 내서 승격됐다.

## 설계 불변식 (어답터 평면을 가정하지 않는다)
- 도메인 색은 문자열 해시 → 색상환 — 목록 하드코딩 0, 미지 도메인도 칠해진다.
- `status`·`tier` 부재를 무가정 처리 — `fetch-eval`의 101노드 적대 평면이 회귀 테스트로 고정.
- 부모는 **최근접 실존 조상** — 중간 세대가 비어도 `blast-radius`의 `isDescendant` 판정과 일치.
- 잠금 마커(🔒)는 `query.LOCKED` 소비 — status 어휘를 새로 정의하지 않는다.
- 새 계산 0: `zfs_index.buildIndex` + `zfs_util.ancestorChain` + `query.LOCKED`만 소비.
- id·slug·domain은 ZFS 정규식이 문자 집합을 닫아둬 인젝션 표면이 없다. `status`만 자유 문자열이라 이스케이프.
- 산출물(`lineage-tree.html`)은 **gitignore** — 커밋하면 드리프트 게이트가 하나 더 필요해진다.

## 언제 쓰나
- 세션 진입 시 낯선 평면(어답터 레포)의 전체 구조를 한눈에 잡을 때.
- 계보 리팩토링·플릿 파티션([PRO-05]) 전에 서브트리 경계와 잠금(🔒)을 훑을 때.

## 언제 쓰지 않나
- **특정 작업의 맥락 주입** — 그건 `upward-fetch`(계보 필터링 + LSN 경고)의 몫이다. 이 도구는 전역 뷰다.
- **끊어진 참조 시각화** — 스파이크에서 기각. 미해소 참조의 다수가 구조적 잡음이었고 정답은 상류 수정이었다([ADR-24]). 재탐색 금지.
- **PLAN×산출물 커버리지 히트맵** — 스파이크에서 보류. 재개 조건: 실평면 `PLAN` ≥ 5.

## 호출
```bash
node scripts/lineage-tree.js                 # 실평면 → lineage-tree.html (gitignored)
node scripts/lineage-tree.js --out <path>    # 출력 경로 지정
node scripts/lineage-tree.js --json          # 포레스트 구조를 JSON으로 (기계용)
```
