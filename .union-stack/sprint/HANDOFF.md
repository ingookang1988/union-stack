<!-- [Wiki] 세션 이어달리기. 세션을 마치는 에이전트가 덮어쓴다. 최신 하나만 유효.
     다음 세션 부트스트랩 시 가장 먼저 읽힘. -->
---
session_id: review-p0-tools-e3-2026-07-24
date: 2026-07-24T00:00:00Z
author: agent
verification: "전 게이트 그린 + 22스위트 0 fail. npm 래퍼는 이 머신에서 크래시 — node 직접 실행으로 검증."
version: 1.0
---

# Handoff → 다음 세션

## 1. 세션 요약 (1~3줄)
- 외부 리뷰(장점·차별점·보완점 + 2026 트렌드 대조) → **P0 6건 경화** → **주장 톤 축소** →
  **E5 해악 팔** → **[PRO-07]** 완주 → **[PRO-08] tool 축**(카드 15장·게이트 3종) → **[E3] 측정·종료**.
- 이 레포의 자기진화 루프(측정→제안→승인→반영→재측정)가 두 번(PRO-07·E3) 실전 완주.

## 2. 변경 위치 (ID 목록 / 파일 — 탐색 진입점)
- `[PRO-07]` Fail-close 스코프 한정(승인·반영·검증) · `[PRO-08]` reference/tools 신설(승인·3단계 구현)
- `[ADR-05]`~`[ADR-08]` — 결정 4건(원장). `eval/RESULTS.md` §E5·E5후속·E3 — 측정 3회차분
- `reference/tools/TOOL-01~15` — 카탈로그(셀프 6·build 5·adopt 3·예시 1)
- `scripts/` 신규 6: tools-index · tool-linter · smell-linter · check-prereqs · transcript-stats ·
  hook-replay · worktree (+각 test). 경화 5: permission-guard · hooks · zfs_index · init · context-budget
- `_GUIDE` 8건 갱신(전수 점검) · `AGENTS.md` 규칙 1·2 + tools 인덱스 블록

## 3-bis. 새 방향 — 세션 종료 증류 루프 (착수됨)
- **목표**: 단발 핑퐁을 프로세스/거버넌스로 흡수해 의도당 왕복 비용을 낮춘다("눈빛만 봐도 아는 팀").
- **골격**: 포퍼 4단계 P₁→TT→EE→P₂. 진보는 P₂와 P₁의 *거리*로 측정(P₂≡P₁이면 진보 없음).
  **귀납 금지** — 채굴은 P₁ 발견까지만, 승격은 별도 추측+생성자 아닌 검증자의 가혹한 시험을 통과해야.
- **결정 3건**([ADR-12]): CNJ 도메인 거부 · 미검증 후보는 사적 계층([ADR-11] 확장) · 계측기 선행.
- **완료**: `session-friction.js`(TOOL-16) + 기준선 실측([ADR-13]).
- **다음**: P₁ 후보 1건만 골라 TT→EE 전 과정 시연(살아남지 못해도 성공 — 제거 기계의 정상 동작).
  유력 후보는 `fix/수정`(동형성 1.00, n=8, 12건/2세션). **프로그램 반증 조건**: 3사이클에 승격 0건이고
  P₂가 P₁과 구별 불가면 이 방향을 접는다(Cursor가 실제로 접은 전례).

## 3. 다음 작업 (단일 진입점)
- → 사용자 지정 대기. 잔여 백로그: 3단계 보류분(파괴적 git 가드 훅 — [ADR-08] 훅 미설치 입장과 정합 필요).
- (인간 몫) `project/roadmap/PHASE-02`는 Schema — E3 트랙 종료 표기.
  **이제 상시 스탬프로 인간이 특정 Schema 스코프를 에이전트에 위임 가능**([PRO-09] — `project/GRANTS.md`에
  행 추가 후 에이전트가 `Approved-by: GRANT-id` 인용). 예: roadmap 갱신을 에이전트에 맡기려면 GRANT 부여.

## 4. 미해결 / 주의
- **[ADR-08] 훅 미설치 확정**: 하네스 권한 최소화 — 훅은 `HOOKS.md` 문서화만. **"켜자" 재제안 금지**
  (재검토 조건은 ADR에). E3의 두 질문은 답 났음: 의례 자발 수행률 **0%**, enforce 차단 **6%**.
- **계측기 오염 주의**([ADR-07]): 자기 도메인 용어를 문서에 쓰는 레포에서 문자열 매칭 계측은 자기 언급에
  오염된다(100%→0% 반전 전례). 새 계측기는 *실행 표면*만 보게 설계할 것.
- **표머리 행 편집이 append-only 위반으로 잡힘**(의도된 Fail-close 방향 — 데이터 행 사각지대와 맞바꿈).
- `npm` 래퍼가 이 머신에서 크래시(exit -1073741819) — `node scripts/*.test.js` 직접 실행.

## 5. 검증 상태
- 게이트 전부 그린: naming·history·leakage·permission(+strict)·tool·smell·tools-index·size·lock·budget.
- 테스트 **22스위트 0 fail**. context-budget은 CJK 계수 도입 후 재측정치(아래).
