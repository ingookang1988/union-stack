<!-- [Wiki] 작업 지시. 상태 정본은 이 frontmatter `status:` 하나뿐이다([PRO-15]). -->
---
id: WO-26a-1
title: 파생 라벨 뷰 — [PRO-26] ④ + ① 선택적 mnemonic override (next.md · list_docs · label CLI)
status: Verifying
parent: PRO-26
evidence: "구현 완료(2026-10-17, 가드 먼저): scripts/label.js([TOOL-33] — deriveLabel 순수: mnemonic override → 선언 부모 체인 → 산술 조상(arithmetic 적용 시) → 자기 slug 2 토큰(stopword 제거) → 직계 부모 slug · labelMap · renderId · CLI 생성 표) · zfs_index mnemonic 파싱 · next.md 작업대 행 [WO-id · label] · MCP list_docs label 필드 · 팔 legacy 바 1(선언 부모 indep 상속 · 무관한 PLAN-12 wrongroot 금지). ARCH-00·파일명·ID 무변경. rcpt:n/a — 하네스 스위트"
closed_by: []
version: 1.0
---
# [WO-26a-1] 파생 라벨 뷰

## 목표
[PRO-26] v1.0(축소 개정) 의 ④ 뷰 렌더와 ① 선택적 `mnemonic:` override 를 구현한다. 파일명·ID 는 바꾸지 않고([ADR-25]), ARCH-00 은 개정하지 않는다.
라벨은 **파생**(자기 slug 첫 1~2 토큰 → 직계 부모 slug)이고 `mnemonic:` 은 어디서나 허용되는 override 로, frontmatter 부모 → ID 산술 조상 순으로 상속된다.
레거시 독립 채번 구간(`arithmetic:false`, [PRO-27] ③)은 산술 상속을 하지 않는다 — 냉독 반례(거짓 라벨)를 기계로 막는다.

범위:
1. **`scripts/label.js`**([TOOL-33]) — `deriveLabel(doc, index)` 순수 · `labelMap` · `renderId` · CLI(전체 표 = 루트별 니모닉 표의 생성 뷰).
2. **`zfs_index`** 가 frontmatter `mnemonic:` 을 레코드에 싣는다.
3. **렌더 자리**(ID 단독인 곳만): `sprint/next.md` 작업대 행 `[WO-27a-1 · prereq_upstream]` · MCP `list_docs` 의 `label` 필드. upward-fetch·blast-radius·
   디렉터리(파일명이 보임)와 HANDOFF(예산)는 넣지 않는다.
4. **어답터 팔 `legacy`** 바 1: `arithmeticFrom: 36` 아래 WO-12a-1 이 무관한 PLAN-12 의 `mnemonic` 을 상속하지 않고 선언 부모 PRO-36 의 mnemonic 을 받는다.

## 수용 기준
- 단위 테스트 **먼저**([ADR-40]): slug 토큰·stopword · override 우선 · 선언/산술 상속 · 레거시 횡단 금지 · 부모 폴백 · 순환 안전 · 형식 위반 무시 · 렌더.
- work-close 표가 라벨을 싣고 기존 테스트(라벨 없는 레코드)는 그대로 통과. 상류 `next.md` 재생성에 라벨 표시.
- 카드 [TOOL-33] 신설 · [TOOL-23] 행 · MIGRATION(`mnemonic:`) · CHANGELOG. AGENTS.md 는 tools-index 블록만. ARCH-00 무변경.

## 절차
1. 테스트 먼저 → 2. label.js → 3. zfs_index mnemonic → 4. next.md·list_docs 렌더 → 5. 팔 바 → 6. 카드·문서 → 7. [PRO-26] ⑤ `--next` 는 최하 우선순위(별건·보류).

## 증거
- 테스트: `scripts/label.test.js`(신설, 17) · zfs_index(+2) · work-close(+2). 스위트 45 중 43 통과, 실패 2 = 미커밋 fdt spike 귀속. lint 체인 17종 중 leakage 외 exit 0(retro CLARIFY = 회고 제안).
- 어답터 팔 `legacy`: WO-12a-1(arithmetic:false, parent PRO-36) → 라벨 `indep ← mnemonic:PRO-36`, PLAN-12 의 `wrongroot` 미상속 — 6 형상 성공 바 전부 충족.
- 상류 `next.md`: 활성 WO 행이 `[WO-01a-1 · auth_wiring]` 꼴(예시 토큰 제거) · `[WO-10a-1 · e6_scenario]`. 파일명이 보이는 upward-fetch·blast-radius 는 그대로.
- 결정: 라벨은 2 토큰(1 토큰은 `status`·`check` 처럼 뜻이 안 선다) · stopword(example·dummy·test…) 제거 · mnemonic 형식 `[a-z0-9][a-z0-9_-]{1,15}` 밖은 무시.
  [PRO-26] ⑤ `--next` 는 보류(하류 0/3 실수). 잔여 미결(루트 slug 와 자손 주제가 갈라진 계보)은 `mnemonic:` override 가 답이며 강제 없음.
