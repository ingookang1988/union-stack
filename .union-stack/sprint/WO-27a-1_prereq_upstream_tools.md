<!-- [Wiki] 작업 지시. 상태 정본은 이 frontmatter `status:` 하나뿐이다([PRO-15]). -->
---
id: WO-27a-1
title: 교차 레포 전제 — 상류 도구 몫 구현 ([PRO-27] ④ health --root · ⑤ ID 유일성 · ① up: 네임스페이스 인식)
status: Active
parent: PRO-27
evidence: "none — 미착수(2026-10-15 발행). [ADR-40] 절차: 가드(테스트)를 먼저 물린다"
closed_by: []
version: 1.0
---
# [WO-27a-1] 교차 레포 전제 — 상류 도구 몫

## 목표
[PRO-27] v1.0 §3 중 **상류 단독으로 닫을 수 있는 셋**을 구현한다. 순서는 ④⑤ → ①. ②(statusMap·백필 스크립트)와 ③(frontmatter 계보)은
이 WO 종료 뒤 [WO-27a-2]·[WO-27a-3] 로 발행한다. 이것이 [PRO-24] ② census 의 전제다.

범위:
1. **④ `health.js --root <dir>`** — 인자 파싱 · 루트 검증(`.union-stack` 없으면 REJECT "측정 대상 아님") · 어답터 로컬 도메인·설정은 INFO.
   지금은 플래그를 무시하고 상류 자신을 측정한다(설문 재현) — "0건 검사 = 통과" 클래스.
2. **⑤ `zfs-linter` ID 유일성** — 같은 도메인·같은 ID 파일 ≥2 → REJECT(목록). 상류 자신부터 도그푸딩.
3. **① `[up:ID]` 인식** — `ref-linter`(strict 포함) · `upward-fetch` · `blast-radius` 가 `up:` 참조를 로컬 색인에서 해소하지 않고
   외부 참조(INFO)로 분류. 배포되는 상류 문서(설문 정본 `eval/SURVEY-0*.md` 의 배포 스크립트·키트 안내)는 배포 시 상류 ID 에 접두를 붙인다.
4. `upward-fetch` 빈 결과를 `(없음)` + exit 0 이 아니라 **CLARIFY** 로(③의 일부지만 비용이 0 이라 여기서).

## 수용 기준
- 단위 테스트가 **먼저** 고정돼 있다([ADR-40]): `--root` 유효/무효 · 중복 ID 픽스처 REJECT · `up:` 참조 외부 분류 · 빈 upward-fetch CLARIFY.
- 어답터 팔([TOOL-26])에 **"독립 채번 레거시"·"전역 일련번호 WO"** 두 형상을 추가하고, 그 사본에서 `health --root` 가 사본을 측정한다.
- 상류 자신: 린터 통과(중복 0) · `health --root .` 가 현재 출력과 같다.
- [TOOL-01]·[TOOL-02]·[TOOL-04] 카드 행 단위 갱신. AGENTS.md 는 건드리지 않는다.

## 절차
1. 테스트 먼저 → 2. ④ → 3. ⑤ → 4. ① + 배포 스크립트 접두 → 5. 어답터 팔 형상 2 → 6. 카드 갱신 → 7. [WO-27a-2](②) 발행.

## 증거
- 테스트 파일 · 어답터 팔 실행 출력 · 커밋.
