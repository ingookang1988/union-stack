<!-- [Wiki] 작업 지시. 상태 정본은 이 frontmatter `status:` 하나뿐이다([PRO-15]). -->
---
id: WO-27a-1
title: 교차 레포 전제 — 상류 도구 몫 구현 ([PRO-27] ④ health --root · ⑤ ID 유일성 · ① up: 네임스페이스 인식)
status: Verifying
parent: PRO-27
evidence: "구현 완료(2026-10-15, 가드 먼저): 6 스위트에 회귀 고정(zfs-linter.test 신설 · ref-linter/query/health/adopter-arm/zfs_util 확장) → ④ health --root(루트 검증 · REJECT 측정 대상 아님) · ⑤ zfs-linter 중복 ID REJECT(상류 0) · ① [up:ID] 외부 참조(ref-linter·upward-fetch·blast-radius·MCP 가 INFO) + scripts/upstream-prefix.js(배포 접두) · 빈 upward-fetch CLARIFY(exit 3). 어답터 팔 형상 legacy·serial 추가 — 4 형상 성공 바 전부 충족. health --root . 출력 = 기본 출력. 카드 TOOL-01·02·03·04·26 갱신. 잔여: [WO-27a-2](②) · [WO-27a-3](③) 발행"
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
- 테스트: `scripts/zfs-linter.test.js`(신설) · ref-linter/query/health/adopter-arm/zfs_util `.test.js` 확장 — 스위트 39 중 37 통과,
  실패 2 = 미커밋 fdt spike 귀속(leakage·ref — 이전과 동일). lint 체인 13종 중 leakage 외 전부 exit 0. CON-00 카탈로그 블록 `--write` 재생성.
- 어답터 팔: `node scripts/adopter-arm.js` 4 형상(env·data·legacy·serial) 성공 바 전부 충족 — legacy: 중복 ID REJECT · `[up:…]` strict 통과 ·
  INFO 계수 +1 · `health --root` 가 사본 측정(PRO +2 · PLAN +1) / serial: 빈 upward-fetch CLARIFY(3) · 없는 경로 REJECT · 사본 크래시 0.
- 도그푸딩: 상류 zfs-linter 중복 0 · `health --root .` 와 기본 출력 동일(diff 0) · 상류 WO(PRO 부모)의 upward-fetch 는 **CLARIFY** —
  PRO 는 CONTEXT_DOMAINS 밖이라 산술 맥락이 0 인 것이 사실이고, 이것은 ③(frontmatter 계보, [WO-27a-3])이 닫는다. 훅은 query 직접 호출이라
  종료코드 영향 없음.
- 배포 접두는 `node scripts/upstream-prefix.js <file>` — 설문·키트 배포 스크립트(상류 밖)가 이걸 거친다.
