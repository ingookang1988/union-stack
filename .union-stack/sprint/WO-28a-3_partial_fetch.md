<!-- [Wiki] 작업 지시. 상태 정본은 이 frontmatter `status:` 하나뿐이다([PRO-15]). scaffold 생성([TOOL-36]) — 선택 절(배경·설계·절차)은 필요할 때만 추가. -->
---
id: WO-28a-3
title: 절 계약 ③ — upward-fetch --sections 부분 인출(부모 문서의 계약 절만 주입, 기본값 불변) — [PRO-28] ③
status: Verifying
parent: PRO-28
evidence: "구현 완료(2026-10-17, 가드 먼저 · 이 WO 자체가 scaffold 로 발행됐다): scripts/section-fetch.js(순수 — stripFrontmatter · splitSections(H2, ### 은 본문) · selectSections(계약 절 = sections 맵 해소 + 지정 이름 접두) · clipHead(절 없는 문서 머리 1,500 tok) · excerpt · renderExcerpt(생략 N절 · ~M tok: 헤딩(~tok) 최대 8) · fetchExcerpts) · upward-fetch --sections [이름,…](텍스트 '## 계약 절 발췌' + 주입/전문 비율 · --json excerpts · 플래그 없으면 불변) · MCP upward_fetch(sections, extra) → excerpts. rcpt:n/a — 하네스 스위트(section-fetch.test 27 · query 73 · mcp-server 13) · 스위트 50 중 48(실패 2 = fdt spike 귀속) · 팔 7 형상 충족 · 성공 바: 부모 PRO-28 기본 발췌 ~9/2017 tok(≤1/3)"
closed_by: [.union-stack/reference/tools/TOOL-02_upward_fetch.md, MIGRATION.md]
version: 1.0
---
# [WO-28a-3] upward-fetch --sections 부분 인출

## 목표
Upward Fetching 이 경로만 주어 에이전트가 40~80KB 부모 문서를 통째로 여는 지출(회신 2곳의 토큰 최다 지출처)을 **절 단위 주입**으로 바꾼다([PRO-28] ③).
"가장 작은 고신호 집합"을 도구가 내준다 — 요약·생성은 없다([ADR-12]). 기본값은 바꾸지 않는다([ADR-23] 관측 먼저).

범위:
1. `scripts/section-fetch.js`(순수): frontmatter 제거 → H2 분할(### 은 상위 절 본문) → **계약 절**(adapter.json `sections` 로 해소: 목표·수용 기준·증거) + `--sections <이름,…>`(정규화 뒤 접두) 선택 →
   나머지는 "생략 N절 · ~M tok: 헤딩(~tok) …"(최대 8) 한 줄 = 다음 인출의 좌표. 절 경계 없는 문서는 머리 **1,500 tok** 까지(HANDOFF·WO 와 같은 양자).
2. `upward-fetch.js --sections [이름,…]`: 맥락·LSN 문서의 발췌 블록을 "## 계약 절 발췌" 아래 출력 + 주입/전문 토큰 비율. `--json` 에 `excerpts`. 플래그 없으면 출력 불변.
3. MCP `upward_fetch(id, sections=true, extra="…")` — 같은 발췌를 `excerpts` 로.
4. 예시: `node scripts/upward-fetch.js WO-28a-3 --sections 채택안,성공 바` → 부모 PRO-28 의 그 두 절만 본문, 나머지 6절은 목차 한 줄.

## 수용 기준
- 단위 테스트 **먼저**([ADR-40]): 분할(frontmatter 제외·머리·H2 만·###) · 선택(맵 없음/있음/추가 이름/생략) · 발췌(토큰 < 전문 · 생략 요약 · 목차 캡 8 · 절 없는 문서 머리 1,500 · 짧은 문서 무절단) ·
  렌더(헤더 비율·선택 본문·생략 한 줄·서사 미포함) · fetchExcerpts(존재 파일만) · CLI(기본값 불변 · `--sections` · 이름 지정 · `--json excerpts`).
- 성공 바([PRO-28] §6): 부모 PRO 의 기본 발췌 토큰 ≤ 전문의 1/3(상류 자기 측정). 어답터 팔 7 형상 충족. 카드 [TOOL-02] 갱신 · MIGRATION · CHANGELOG · 매니페스트 재생성.

## 절차
1. 테스트 먼저 → 2. section-fetch.js → 3. upward-fetch·MCP 배선 → 4. 카드·문서 → 5. (다음) 센서스 4회차(맵 적용 뒤 매칭률).

## 증거
- 테스트: `scripts/section-fetch.test.js`(신설 27 — 분할 5 · 선택 4 · 발췌 8 · 렌더 4 · fetchExcerpts 1 · CLI 5). 배선 전 CLI 3건 red → 배선 후 전부 green. query 73 · mcp-server 13 불변.
  스위트 50 중 48(실패 2 = 미커밋 fdt spike 귀속). 팔 7 형상 충족.
- 성공 바 실측(상류): `upward-fetch WO-28a-3 --sections` → 부모 PRO-28 발췌 ~9/2017 tok(계약 절 0 — PRO 는 WO 어휘를 안 쓴다 → 머리 + 목차 8절), `--sections 채택안,성공 바` 로 두 절 본문 주입.
  관찰: 기본 발췌는 WO 어휘(목표·수용 기준·증거)가 있는 부모(WO·일부 PLAN)에서 본문이 되고, PRO·PLAN 은 **목차**가 된다 — 다음 인출의 좌표로 쓰는 것이 설계 의도. 도메인별 기본 절은 센서스 4회차 관측 뒤([ADR-23]).
- 설계 결정: 문장을 만들지 않는다(절 경계로만) · 기본값 불변 · 머리 예산은 1,500(세 번째 숫자를 만들지 않음) · 생략 목차 캡 8(센서스 DIST_CAP 과 같은 규약).
- 문서: 카드 [TOOL-02] · MIGRATION · CHANGELOG · ship-manifest(배송 87) · AGENTS.md tools-index 블록.
