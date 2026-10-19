<!-- 방법론 자산 카드(leakage-guard METHODOLOGY 등재) — 이 템플릿이 실제로 배송하는 도구. -->
---
id: TOOL-30
title: adopter-census (형제 레포 읽기 전용 계측 → 익명 집계 행)
kind: cli
impl: scripts/adopter-census.js
status: Active
version: 1.0
---

# [TOOL-30] adopter-census

## 용도
이 머신의 형제 레포(어답터)를 **읽기 전용**으로 재서 `eval/CENSUS.md` 에 익명 행을 남긴다([PRO-24] ② 회수층). 상류 도구(health·work-close·
frontmatter-backfill·zfs-linter·upward-fetch)를 `root` 인자로 돌린다 — 어답터 스크립트는 **실행하지 않고** 존재만 세며, 코드·문서 본문은 읽지 않고,
어답터에 파일을 쓰지 않는다. 사람 왕복 0 · 어답터 변경 0 — 갱신 도구가 없는 어답터도 즉시 관측된다.

## 언제 쓰나
- 상류 릴리스마다 · 설문 회수 시([PRO-24] §7-1 잠정) → `--write`. 전 회차와의 Δ 가 신호다(판정·점수 없음).
- [PRO-27] 전제 상태 확인: 상류 ID 충돌 수(`up:` 필요), 백필 대상, `arithmeticFrom` 제안, upward-fetch 공백률.
- **WO H2 헤딩 분포**(상위 8 + 나머지 종·건수): 절 계약·별칭 맵([PRO-28])의 재료 — 어답터 답변("한 의미에 표기 3~5종")을 기계로 센다.
- **필수 절 매칭(활성 WO)**: [PRO-28] §6 성공 바(맵 적용 뒤 ≥90%)를 `work-close.parseWo` 의 `missingSections`(별칭 맵·evidence 충족 반영)로 센다 — 활성 WO(statusMap 적용 뒤
  Draft/Active/Verifying)만 대상, 레거시 종결분은 밖. 판정은 사람([ADR-12]).
- **잔여 원인**([PRO-28] §6 판정): 미해소 절을 **H2 없음 · 절 부재**(규칙 밖) / **별칭 후보**(미해소 헤딩이 있다 — 상위 8 헤딩을 함께) / **evidence 소급**(frontmatter 없음)으로 센다.
  헤딩 줄만 읽고 본문은 읽지 않는다. **동기화 지연**([PRO-29] ①): 어답터 앵커(`template-sync.json` 의 받은 상류 블롭)를 상류 `origin/main` 블롭과 대조한 지연을 **5분류**([WO-29a-4]):
  **적용 가능**(바 = 0, [PRO-29] §6) · 보존 포크(로컬 해시 ≠ 앵커 — 해시만) · review · 상류 전용 · 거부(`upstreamIgnored`) ·
  상류 삭제 · **이력 밖 앵커**(상류 어느 이력에도 없는 sha — 로컬 개조가 정합으로 시딩됨. ⚠ 는 sync 경로만 — 다음 `--apply` 가 덮는다. review 경로는 가드가 쓰지 않아 INFO) · 어답터 자기 확인(`lastCheck`). git 읽기만, 앵커 없음 = 판별 불가. 계측기 열은 **배송 도구만**(상류 전용 adopter-arm 은 3회차에 제외 — 사본 없는 어답터가 9/10 으로 오보됐다).

- **규칙 이탈(신규)**([PRO-29] ②, [WO-29a-5]): 고정 4종 — `gate:<차원>`(health FAIL) · `rule:blocks-missing|blocks-stale|gate-contract-fork` · `weak:<종류>`·`weak:exceptions`
  (직전 회차 HEAD 이후 diff 를 상류 weakening-guard 로 — 상류 현재본과 같은 파일·상류 전용 사본 삭제는 제외, 제외 수는 원자료에) · `sync:applicable`. 직전 원자료와 대조해 **신규 / 지속 / 해소** — 같은 이탈은 다시 "신규"가 되지 않는다.
  `--delta` 는 레포별 1줄 요약. `--raw-dir <dir>` 로 원자료 위치를 분리한다(주입 실험용). 표면([WO-29a-6], 상류만): 대시보드 "어답터 이탈(신규)" 카드 · health `adopter census`(7일) · handoff-linter.

## 언제 쓰지 않나
- **어답터 변경** — 읽기만. 백필 적용·설정은 어답터 몫([PRO-27] §5).
- **자동 승격** — `upstream_candidate` 는 ID·개수만 목록화, 검토는 사람([ADR-12]).
- **원자료 커밋** — 경로·상세는 `eval/private/`(gitignore)에만. 익명 행에는 경로·제목·파일명이 없다([ADR-11]).

## 호출
```bash
node scripts/adopter-census.js                 # dry-run: 표 출력 (목록 없음 → 3)
node scripts/adopter-census.js --write         # eval/CENSUS.md 에 회차 append + eval/private/census/ 원자료
node scripts/adopter-census.js --repos <json>  # 목록 파일 지정: { "repos": [{ "label": "A", "path": "…" }] }
node scripts/adopter-census.js --json          # 기계 판독 (--contract 로 계약 출력)
node scripts/adopter-census.js --delta         # 레포별 규칙 이탈 신규·지속·해소 1줄(--write 와 함께 쓰면 회차 기록)
node scripts/adopter-census.js --handoff       # 최신 회차 → 상류 HANDOFF §4 한 줄(측정 없음 · 쓰기 0). 미언급이면 handoff-linter 가 묻는다
```
