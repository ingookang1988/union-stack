<!-- [Wiki] 세션 이어달리기. 세션을 마치는 에이전트가 덮어쓴다. 최신 하나만 유효.
     다음 세션 부트스트랩 시 가장 먼저 읽힘. -->
---
session_id: contract-consumer-edge-2026-08-19
date: 2026-08-19T00:00:00Z
author: agent
verification: "34스위트 중 32 통과 · 2 실패(미커밋 fdt_canon 귀속) · lint 7종 통과 · query 23 + zfs_index 17단언"
version: 1.0
---

# Handoff → 다음 세션

## 1. 세션 요약 (1~3줄)
- **[PRO-16] 계약의 계보 밖 간선** — "계약이 축인가" 물음에 [PRO-04] 분할원리를 적용해 **기둥은 기각**하고
  (CON이 이미 계약×상태 칸), 실측된 구조 공백 둘을 닫았다. 계약은 격자에서 **유일하게 트리가 아니라
  그래프인 자산**이다 — 포함관계 아닌 당사자끼리 공유되므로 소비자는 늘 다른 계보에 산다.
- 이어 **축별 세부 페이지 설계 착수 — 당위(ARCH)부터**. 목록이 아니라 "규범이 무엇이고 지켜지는지
  누가 보는가"를 낸다(이 축의 짝은 verification 첫 화살표). 부수: [TOOL-24]·[TOOL-25] 상륙.
## 2. 변경 위치 (ID 목록 — Upward Fetching 진입점)
- 규칙: `[PRO-16]` 계약 소비자 간선 + FLOW/CON 경계 판별식 · `[ADR-25]` ID 공간 · `[ADR-24]` 행 정본
- 코드: `zfs_index.parseConsumers` 신설 · `query.blastRadius`가 **계보 자손 ∪ 선언된 소비자·그 자손**을
  영향권으로 냄(잠금 검사도 합집합 위) · `blast-radius` CLI가 간선 출처와 미해소 소비자를 표기
- 평면: `contracts/_GUIDE`·`feature/_GUIDE`에 판별식(GRANT-02) · `CON-00`에 동작 예시(계보 00→01 횡단)
  · `CON-01`·`FLOW-01a` 더미 갱신(관찰 대 약속 분리)
- 도구: `[TOOL-24]` lineage-tree(`npm run tree`) · `[TOOL-25]` dashboard v1.3(타일 4 + 카드 9절,
  `contract edges`·`norm enforcement` 관측 신설 — health 차원 + 대시보드 절, `npm run dash`)
- 작업: `[WO-10a-1]` E6 A/B(Draft) — 인간 실행 대기
## 3. 다음 작업 (단일 진입점)
→ **`context-budget.js`에 AGENTS.md 계측 추가** — 상시 주입 파일 중 최대인 AGENTS.md가 예산
  게이트 밖이다(대상은 project·profile·handoff뿐). 3세션째 이월되는 계측 공백이며 독립적인 소품.
  주의: AGENTS.md는 예산 3종과 성격이 다르다(분할·압축 불가한 단일 진입 파일) — 상한 신설이 아니라
  **관측 표시**가 먼저인지 [PRO-13]의 예산 문법에 맞춰 판단하고 시작할 것.
## 4. 미해결 / 주의
- **[PRO-16] 반증 관측**(계기 완비): `health`의 `contract edges` 절과 대시보드 계약 카드가 채택·무결성을
  본다. 6개월간 어느 *실*계약에도 안 달리면 수요가 없는 것 → 필드 폐기.
  정당한 계약 편집이 반복 차단되면 자손 포함을 철회하고 선언된 노드만 잠근다([ADR-08] 마찰 논리).
- **[PRO-16] §4 보류**: 호환성 의미론(breaking/additive·CDC 연동)은 실계약 3건 + 깨진 변경 1회 실측 후.
  현재 CON 2건이 **둘 다 더미**라 지금 지으면 YAGNI 위반이다.
- **누설 가드가 약하다(실사례 발생)**: `MARKER`가 본문 어디든 "예시" 한 단어면 통과라, 이번 세션에
  HANDOFF 문장을 고치자 우연히 있던 마커가 사라져 FAIL이 떴다. 실콘텐츠 판정을 단어 우연에
  기대는 구조다 — 별건으로 다룰 것(METHODOLOGY 등재 대상 확대 또는 판정 기준 교체).
- **미커밋 유지**: `ref/`와 `spike/SPIKE-fdt_canon_import_utility_analysis.md`. 공개 여부는 인간 판단.
  이 파일이 `leakage` FAIL + `ref-linter --strict` 게이팅 + 실패 테스트 2스위트의 원인이다(사본 실증 2회).
- **[WO-10a-1] 인간 대기**: E6 10런은 top-level 세션 필요. 에이전트가 세션 내 실행 불가.
- **[PRO-04] `concern:` 채택 관측**: 승인 후 **사용 0**. 당위 절이 계기다 — 6개월 뒤에도 0이면
  오버레이 자체의 수요를 재검토할 것(`consumers:`와 같은 문법).
- **규범↔현실 화살표 미발사**: `gap`·`state` 무기입이라 규범 3건 중 **0건이 현실과 대조된 적 없다**.
  당위 절이 이를 표면화한다. verification 평면을 살릴지는 별도 판단.
- **관측 지표 셋**: `tier distribution` `draft:` 0 이탈 · `effect surface` deny 0·ask 0([ADR-23]) ·
  [ADR-25] 재개 조건은 `lock exposure`가 트립와이어 · 크기 헤드룸에서 `archive_ledger` 27/30KB.
- 재제안 금지 목록은 **AGENTS.md의 `blocks-index` 블록**이 소유한다 — 여기 복제하지 말 것([ADR-18]).
## 5. 검증 상태
- 테스트 **34스위트 중 32 통과 · 2 실패**(`leakage-guard`·`ref-linter` — 미커밋 fdt 귀속).
  신규: `query.test.js` 39단언(계약 8 + 전수 7 + 당위 9) · `dashboard.test.js` 57단언 · `health.test.js` 27단언 ·
  `zfs_index.test.js` 17단언(consumers 파싱 5건).
- lint 7종 통과 · `permission-guard --strict` 범위 통과 · 부트스트랩 1967/4000 tok.
- 실동작 확인: `node scripts/blast-radius.js CON-00` → 계보 `00`에서 계보 `01`의 소비자 5건을 영향권에
  포함(더미 예시 기준). 같은 계보 소비자는 간선이 무의미하다는 것도 실측 확인.
