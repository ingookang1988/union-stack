<!-- [Wiki] 세션 이어달리기. 세션을 마치는 에이전트가 덮어쓴다. 최신 하나만 유효.
     다음 세션 부트스트랩 시 가장 먼저 읽힘. -->
---
session_id: review-p0-hardening-2026-07-15
date: 2026-07-15T00:00:00Z
author: agent
verification: "전 게이트 그린 + 테스트 15스위트 230단언 0 fail(신규 회귀 15개 포함). E2E 재현: 표 행 삭제·한글 파일명 삭제 차단, 순수 append 통과. npm 래퍼는 이제 PowerShell에서도 segfault(-1073741819) — node 직접 실행으로 검증."
version: 1.0
---

# Handoff → 다음 세션

## 1. 세션 요약 (1~3줄)
- **외부 리뷰 수행**(장점·차별점·보완점 + 2026-07 하네스 트렌드 대조) → 검증된 P0 6건을 즉시 수정.
- **가드 계층 경화**: 명령 주입 제거(execFile)·한글 경로(quotepath)·표 행 사각지대(permission-guard),
  작업 ID 도메인 화이트리스트 대조(hooks), status frontmatter 스코핑(zfs_index), init 재실행 Fail-close, CI zero-SHA 폴백.
- **P1 톤·드리프트 해소**: README(EN/KO) 측정 박스에 82× 모델링 단서 + E3 미완 명시, CHANGELOG v6.0 범위 주석,
  RATIONALE 제목 버전 표기 제거(단일 출처=CHANGELOG), v5.5 모순 해소(설계-전용 변경으로 각주), HISTORY에 실분기점 2건 등재(인간 승인).
- **E5 해악 팔 측정 완료**(RESULTS 5회차): 국소 과제 3종 × on/off × N=5(sonnet-5, 30런). H1 델타 **−0.8**
  (Fail-close 과적용 — 전거 약한 요청을 모호함으로 재분류), H2·H3 델타 0(과일반화 유혹 전부 정확히 스코핑).
  처방 → **[PRO-07] Fail-close 스코프 한정** 제안(Proposed — 인간 결정 대기).

## 2. 변경 위치 (ID 목록 / 파일 — 탐색 진입점)
- ZFS 평면 문서 변경 **없음** (전부 scripts/ + CI — Wiki/Schema 무접촉)
- `scripts/permission-guard.js`(+test) — `git()` execFile 어댑터 + `isSubstantiveLine()` 순수 판정 export
- `scripts/hooks.js`(+test) — `extractWorkId`·`decideEdit` 둘 다 `isValidDomain` 대조(UTF-8→`8` 오인 차단)
- `scripts/zfs_index.js`(+test) — `readStatus` frontmatter 블록 한정(본문 `status: Live` 오차단 방지), export 추가
- `scripts/init.js` — IDENTITY_example 부재 시 조기 return(신규 `--force` 없이는 매니페스트 재리셋 불가)
- `.github/workflows/harness.yml` — permission-guard base가 zero-SHA/부재면 직전 커밋(없으면 빈 트리) 폴백

## 3. 다음 작업 (단일 진입점)
- → **[PRO-07] 인간 결정**(승인/거부). 승인 시: AGENTS.md 규칙 1 문안 반영(Approved-by) 후
  **E5-H1 재측정**(델타 −0.8 → ≥ −0.2 회복 + T3 on 5/5 유지가 성공 조건 — PRO-07 §4).

## 4. 미해결 / 주의
- **[E3] enforce 도그푸딩 = PHASE-02 마지막 1개**(불변) — 훅 활성화는 사용자 행위, enforce FP율은 실사용 누적.
- **표머리 행 편집이 이제 append-only 위반으로 잡힘**(의도된 Fail-close 방향 — 데이터 행 사각지대와 맞바꿈. 구분선·주석·제목은 계속 제외).
- **리뷰 P2 이월**: context-budget char/4의 한글 2~4배 과소평가(CJK 계수 필요), 재귀 워커 symlink 순환 가드,
  "해악 팔"(비국소 지식 불필요 과제) 평가 부재, Claude Code auto-memory ↔ lessons 이중 저장소 라우팅 규칙.
- **커밋·push 미실행** — 사용자 요청 없었음. 주의: `.github/workflows/` 변경 포함 → push 시 workflow 스코프 없으면 거부(메모리 기록). 커밋 분리 권장.

## 5. 검증 상태
- 게이트 전부 그린: naming·history·leakage·permission(append-only)·ref·size·lock·context budget·domain.
- 테스트 15스위트 **230단언 0 failed**(회귀 15개 신규: 표 행 7·ID 오매칭 5·frontmatter 3).
- E2E(스크래치패드 임시 레포): 표 데이터 행 삭제 + 한글 파일명 줄 삭제 → exit 1 차단, 순수 append → exit 0 통과.
