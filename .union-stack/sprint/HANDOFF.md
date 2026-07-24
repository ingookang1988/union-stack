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
- → **잔여 백로그 중 택1** (E3는 종료 — [ADR-08]로 훅 미설치 확정):
  ① context-budget의 한글 토큰 과소평가(char/4 → CJK 계수) — 리뷰 P2 잔여,
  ② MEMORY.md ↔ `reference/lessons` 이중 저장소 라우팅 규칙(where-to-record 분기 추가),
  ③ 재귀 워커 5곳 symlink 순환 가드.
- (인간 몫) `project/roadmap/PHASE-02`는 Schema라 에이전트가 못 고침 — E3 트랙 종료 표기는 인간이
  ("라이브 전환은 미완이 아니라 선택하지 않은 길" — [ADR-08]).
- **[PRO-08] 구현 완료**(2026-07-17 승인): `reference/tools/`(TOOL-*) 신설 — 카탈로그-only(Wiki),
  `tool-linter.js` 드리프트 게이트(+test), VALID_DOMAINS/SCAN_DIRS/ARCH-00/가이드/README(EN·KO)/CHANGELOG 반영.
- **[PRO-08] 1단계(리서치 기반) 완료**: ① `tools-index.js`(+test) — 카드 한 줄 요약을 AGENTS.md 마커
  블록에 생성·주입하는 상시 인덱스(check=드리프트 게이트, lint 체인 등재. 근거: Vercel 온디맨드 56% 미호출
  실측 — 인덱스가 항상 보여야 카탈로그가 작동). ② 셀프 카탈로그 6장(TOOL-02~07: upward-fetch·blast-radius·
  health·mcp-server·init·tools-index) — 실도구라 leakage-guard METHODOLOGY 등재.
- **[PRO-08] 2단계 완료**(승인 2026-07-23): ① `check-prereqs.js` — 진입 전제 게이트(IDENTITY·HANDOFF 5부
  + 계보 전거, Spec Kit 패턴). ② `transcript-stats.js` — 세션 관측기(도구 빈도 + **의례 자발 수행률** = E3 지표).
  ③ `smell-linter.js` — 카드 사용 계약 해부 검사(2607.01456 smell 대응, lint 체인 등재). 카드 TOOL-08~10.
  **E3 기준선 실측(스모크)**: 전체 로컬 188세션 중 편집 세션 184개, 첫 편집 전 의례 수행 **20%(37/184)**
  — 단 union-stack 외 레포 포함 하한치. E3 본측정은 이 레포 세션만 필터해 재실행할 것.
- **[PRO-08] 3단계 완료**: adopt 카드 3장(TOOL-11 Repomix·12 ccusage·13 Context7 — `impl: npx:/https:` 외부
  형식, tool-linter 확장) + TOOL-14 worktree 헬퍼 build(`scripts/worktree.js`, [PRO-05] 물리 격리).
  카탈로그 14장 완성 — 리서치 제안 12후보 중 10개 반영(보류 2: git 가드 훅=E3와 함께, 메모리 통합기=이중
  저장소 라우팅 선행 필요). PRO-08 트랙 종료.
- **_GUIDE 전수 점검(21개) 후 8건 수정**: ①roadmap의 `GATE-*` 안내 삭제(화이트리스트에 없어 가이드대로
  하면 zfs-linter Fail-close — 실동작 모순이었음), ②reference 서문 "two pillars"→4멤버·domain 권한 줄 추가,
  ③contracts↔tools 경계 명문화(+architecture·infra 라우팅 2건), ④proposals 등재/폐기 대상에 tools 추가,
  ⑤feature의 미존재 target/hold 안내 정정, ⑥sprint의 `prev.md` 롤링 규율 삭제(파일이 존재한 적 없고
  아무 세션도 수행 안 함 — git 히스토리로 일원화), ⑦AGENTS.md 규칙 2 Wiki 목록에 reference/tools.
  점검 중 **tools-index 오탐 버그 발견·수정**: 블록을 LF 고정 주입해 CRLF 레포에서 다른 도구가 파일을
  정규화할 때마다 거짓 Fail-close. 이제 파일의 지배적 개행을 따르며 CRLF 멱등(회귀 3건 추가).
- **[E3] 본측정 완료**(RESULTS §E3, [ADR-06]·[ADR-07]): 의례 자발 수행률 **자기 레포 0%**(전체 15%),
  enforce 재생 **6% 차단**(122편집 중 7, 전부 schema, lock 0). 신규 도구 `hook-replay.js`(TOOL-15) —
  훅 설치 없이 enforce 경제성 측정. **계측 오염 수정**: transcript-stats가 문서 *내용*의 "blast-radius"를
  수행으로 오집계(100%→0% 반전) → 실행 표면만 보도록 한정(회귀 3건).
- **[ADR-08] 훅 미설치 확정**: 하네스 권한 최소화 — 훅은 문서화만(`HOOKS.md` §기본 입장), `.claude/`에
  아무것도 넣지 않는다. 근거: 강제력↑ → 마찰↑(실측 차단 7건 중 4건이 승인된 배치의 반복 차단),
  통제는 사후 게이트+문서 규율 2층으로 이미 다층. **향후 "훅을 켜자" 재제안 금지**(재검토 조건은 ADR에).

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
