<!-- [Wiki] 세션 이어달리기. 세션을 마치는 에이전트가 덮어쓴다. 최신 하나만 유효.
     다음 세션 부트스트랩 시 가장 먼저 읽힘. -->
---
session_id: scenario-layer-2026-07-25
date: 2026-07-25T00:00:00Z
author: agent
verification: "24스위트 360단언 0 fail · 전 게이트 그린 · 부트스트랩 2184/4000. npm 래퍼는 이 머신에서 크래시 — node 직접 실행으로 검증."
version: 1.0
---

# Handoff → 다음 세션

## 1. 세션 요약 (1~3줄)
- 외부 리뷰에서 시작해 **P0 경화 → 주장 톤 축소 → E5 해악팔 → [PRO-07] → [PRO-08] tool축 → E3 종료 →
  리뷰 P2 3건 종결**까지 완주. 자기진화 루프(측정→제안→승인→반영→재측정)가 여러 번 실전 완주.
- 이후 **새 방향 둘 착수**: 세션 종료 증류 루프([ADR-12][ADR-13])와 그 상위층인 **시나리오 층**([PRO-10]).

## 2. 변경 위치 (ID 목록 — Upward Fetching 진입점)
- 제안: `[PRO-07]`(Fail-close 스코프) `[PRO-08]`(tool축) `[PRO-09]`(Schema grant) `[PRO-10]`(시나리오 층)
- 결정: `[ADR-05]`~`[ADR-15]` (원장) · 측정: `eval/RESULTS.md` §E3·E5 · 프로토콜: `eval/PROTOCOL.md` §3-bis
- 카탈로그: `TOOL-01`~`TOOL-17`(예시1·셀프6·build6·adopt3·시나리오1)
- 스크립트 신규 9: tools-index · tool-linter · smell-linter · check-prereqs · transcript-stats ·
  hook-replay · worktree · session-friction · fs_walk (+각 test)
- 권한: `project/GRANTS.md`(GRANT-01 = roadmap 위임) · 로드맵: `PHASE-02` Crystallized

## 3. 다음 작업 (단일 진입점)
→ **E6 1사이클**(`eval/PROTOCOL.md` §3-bis): `TOOL-17` 결함수정 시나리오의 **①무시나리오 vs ②강제** A/B.
   과제는 이 레포 실결함 3~5건(과거 수정 커밋에서 역산), N=5/팔, 기계 루브릭.
   성공 바 = 의도당 턴 또는 토큰 유의미 감소 **AND** 품질 비악화. 델타를 카드 `evidence[]`에 고정하고
   그때만 `status: Draft → Active`. (③자가선택 팔은 시나리오 2개 이상일 때.)

## 4. 미해결 / 주의
- **[ADR-08] 훅 미설치 확정 — "켜자" 재제안 금지**(재검토 조건은 ADR에). E3는 답이 났다: 의례 자발
  수행률 **0%**, enforce 차단 **6%**.
- **시나리오 층 반증 조건**([ADR-15]): 시나리오 3개가 모두 기준선을 못 이기면 **층 폐기**. 첫 대상
  `fix`는 Feedback-Bandwidth상 **효과 없음이 예보되는 자리** — 그래서 고른 것이다(위험한 시험 우선).
- **증류 루프 규율**([ADR-12]): 채굴은 P₁까지만(귀납 금지). 미검증 후보는 사적 계층([ADR-11]).
  자가생성 스킬은 실측 −1.8pp, 자동승격 안전 후보 0/133 — **제거 기계이지 생성 기계가 아니다.**
- **계측기 오염 주의**([ADR-07]): 자기 도메인 용어를 문서에 쓰는 레포에서 문자열 매칭 계측은 자기
  언급에 오염된다(100%→0% 반전 전례). 새 계측기는 *실행 표면*만 보게 설계할 것.
- append-only 평면은 표머리 행 편집도 위반으로 잡힌다(의도된 Fail-close 방향).
- HANDOFF가 누설 가드를 통과하는 건 본문에 마커 단어가 *우연히* 있기 때문이다(이번 세션에 실제로 걸림).
  HANDOFF는 init RESET 대상이라 채택자에게 상속되진 않는다 — 가드 적용 방식은 재검토 여지.

## 5. 검증 상태
- 게이트 전부 그린: naming·history·leakage·permission(+strict)·tool·smell·tools-index·size·lock·budget.
- 테스트 **24스위트 360단언 0 fail**. 부트스트랩 2184/4000 tok.
- 원격 main = `ec9a74c`, 트리 클린, 미푸시 0.
