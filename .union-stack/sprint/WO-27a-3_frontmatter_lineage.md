<!-- [Wiki] 작업 지시. 상태 정본은 이 frontmatter `status:` 하나뿐이다([PRO-15]). -->
---
id: WO-27a-3
title: 교차 레포 전제 — ③ frontmatter 계보 1급(plan:/parent: ∪ ID 산술 · lineage.arithmeticFrom · 우산 WO/중간 PLAN 루트)
status: Verifying
parent: PRO-27
evidence: "구현 완료(2026-10-16, 가드 먼저): adapter lineage.arithmeticFrom + arithmeticApplies · zfs_index parents(parent:∪plan:, 스칼라·인라인·블록·끝 주석·up: 제외)+arithmetic 플래그 · query.lineageAncestors(산술 ∪ 선언 폐포) → upwardFetch(선언 부모 도메인 무관, via:frontmatter)·blastRadius(선언 자식 폐포, viaParent)·roadmapWiring(합산 도달) · work-close lineage-break 는 산술 구간만 · 팔 serial(plan: 부모 수집 exit 0 + 고아 CLARIFY)·legacy(arithmeticFrom 36 아래 무관 PLAN 상속 차단) 상향. 상류 PRO-부모 WO 5건 upward-fetch 전부 exit 0. 카드 TOOL-02·03·26 · MIGRATION · CHANGELOG. 잔여: lineage-tree 뷰는 산술 부모만(관측 뷰, 별건)"
closed_by: []
version: 1.0
---
# [WO-27a-3] 교차 레포 전제 — ③ frontmatter 계보 1급

## 목표
[PRO-27] v1.0 §3 ③ 를 구현한다. 조상 = **ID 산술 부모 ∪ frontmatter 부모**(`parent:`·`plan:`). 레거시 독립 채번 구간은 어답터가
`adapter.json lineage.arithmeticFrom`(그 번호부터만 산술 상속)으로 선언하고, 그 아래는 frontmatter 만 본다. 우산 WO(`WO-NN`)·중간 PLAN(`PLAN-NNx`)은
선언 부모로 지목되면 계보 루트다. [WO-27a-1] 이 남긴 "상류 PRO-부모 WO 의 upward-fetch CLARIFY"를 이것이 닫는다.

하류 실측(SURVEY-02): 어답터 C 는 ID 산술 루트 **0/438**(계보는 `plan:` 74%), A 는 루트 38 중 26 에 PLAN 없음 + 레거시 번호대 도메인별 독립 채번.
상류 자신도 WO 의 부모가 PRO 라 산술 맥락이 0 이었다.

범위:
1. **`adapter.json` `lineage.arithmeticFrom`**(음 아닌 정수, 기본 0 = 전부 산술). `arithmeticApplies(cfg, id)` 순수.
2. **`zfs_index`** — `parent:`·`plan:`(스칼라·인라인 목록·블록, 끝 주석 제거, `up:` 외부 참조 제외) → 레코드 `parents` · `arithmetic` 플래그.
3. **`query.upwardFetch`** — 조상 = (산술 체인, 플래그 true 일 때) ∪ 선언 부모 폐포(순환 가드). 선언 부모는 **도메인 무관**하게 맥락에 싣고 `via: frontmatter`
   표식. LSN 은 합산 조상 ID 기준. `blastRadius` — 선언 부모로 이 계보를 가리키는 문서(폐포)를 영향권에 합산(`viaParent`), 잠금 검사 포함.
   `roadmapWiring` — PHASE 도달 판정에 합산 조상 사용.
4. **`work-close.checkIssuance`** — `lineage-break` 는 산술이 적용되는 구간에서만.
5. **어답터 팔** — `serial`: `upward-fetch WO-345` 가 `plan:` 부모를 맥락으로 싣고 exit 0(바 상향) + 부모 없는 WO 는 여전히 CLARIFY. `legacy`:
   `arithmeticFrom: 36` 아래 `WO-12a-1`(parent PRO-36)이 무관한 PLAN-12 를 **상속하지 않고** PRO-36 만 싣는다.

## 수용 기준
- 단위 테스트 **먼저**([ADR-40]): adapter(lineage 파싱·경고·arithmeticApplies) · zfs_index(parents 꼴 4종·주석·up: 제외·arithmetic 플래그) · query(선언 부모 맥락 ·
  산술 차단 · 선언 자식 영향권 · PHASE 도달) · work-close(산술 비적용 시 lineage-break 없음) · CLI `upward-fetch WO-27a-2` → PRO-27 포함 · exit 0.
- 어답터 팔 5 형상 성공 바 전부 충족(serial·legacy 바 상향 포함). 상류 자신: `upward-fetch` 가 PRO-부모 WO 4건 전부 exit 0.
- 카드 [TOOL-02]·[TOOL-03]·[TOOL-26] 갱신 · `MIGRATION.md` 키 추가 · CHANGELOG. AGENTS.md 는 건드리지 않는다.

## 절차
1. 테스트 먼저 → 2. adapter 키 → 3. zfs_index parents → 4. query 셋 → 5. work-close → 6. 팔 형상 → 7. 카드·문서 → 8. [PRO-24] ② census 는 별도 WO.

## 증거
- 테스트: adapter(+7) · zfs_index(+9) · query(+17, CLI 포함) · work-close(+2) · adopter-arm(+3) — 전부 녹색. 스위트 40 중 38 통과, 실패 2 = 미커밋 fdt spike
  귀속(leakage·ref — 이전과 동일). lint 체인 15종 중 leakage 외 전부 exit 0.
- 어답터 팔 5 형상 성공 바 전부 충족 — serial: `upward-fetch WO-345` 가 PLAN-07 을 `← frontmatter 부모` 로 싣고 exit 0 · 고아 WO-346 은 CLARIFY(3) /
  legacy: `arithmeticFrom: 36` 아래 WO-12a-1 이 무관한 PLAN-12 를 상속하지 않고 PRO-36 만 수집.
- 도그푸딩: 상류 WO 5건(PRO 부모) `upward-fetch` 전부 exit 0 · PRO 가 `← frontmatter 부모` 로 실림 — [WO-27a-1] 이 남긴 CLARIFY 가 닫혔다.
  `blast-radius PRO-27` 영향권에 선언 자식 WO-27a-1·2·3 포함. 상류 자신은 `adapter.json` 없음 → arithmeticFrom 0 → 산술 전부 그대로.
- 발견: 패치 도구의 `String.replace` 가 치환문의 `$'` 를 "매치 뒤 본문"으로 해석해 파일을 복제했다 — 세션 메모(도구 사용 교훈, 평면 밖).
