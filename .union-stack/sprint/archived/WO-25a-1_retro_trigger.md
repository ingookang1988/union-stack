<!-- [Wiki] 작업 지시. 상태 정본은 이 frontmatter `status:` 하나뿐이다([PRO-15]). -->
---
id: WO-25a-1
title: 회고 트리거 — [PRO-25] ①②④ 구현 (health retro due 관측 · HANDOFF §4 제안 한 줄 · ANL-00<x> 회차 기록 초안)
status: Closed
parent: PRO-25
evidence: "구현 완료(2026-10-17, 가드 먼저): scripts/retro.js([TOOL-32], 계약 PASS/CLARIFY) — 지표 7(v0.2) · git log 1회 날짜(없으면 mtime) · 직전 회고 스냅샷 Δ · adapter.json retro: 임계·off · --proposal · --record --write(ANL-00<x>, 체크리스트 8, 어답터 --adopter → up:PRO-25) · health retro due 절(WARN = PRO 의 CLARIFY) · 팔 vocab 바 1(mtime 폴백·크래시 0). 도그푸딩: 첫 회차 기록 ANL-00a_retro_20261016(오늘의 PO 판정 묶음 6건 = 체크리스트 1·2·3·8 수행, 4 해당 없음, 5~7 보류·후보 기재) · 상류 retro due = WARN(평면 지연 50≥30 — evidence 평면이 08-27 이후 CI 미실행) → HANDOFF §4 제안 한 줄. rcpt:n/a — 하네스 스위트 · Closed 판정 2026-10-17(인간 승인)"
closed_by: [.union-stack/reference/tools/TOOL-32_retro.md, .union-stack/plan/analytics/ANL-00a_retro_20261016.md]
version: 1.0
---
# [WO-25a-1] 회고 트리거

## 목표
[PRO-25] v1.0 §3 의 ①(트리거) ②(제안 경로) ④(회차 기록)를 **v0.2 지표**(§8 ①: 발행 ≥30 · 정체 일수 · 가장 낡은 평면 · 증분 · 원장 크기)로 구현한다.
③(체크리스트)은 `plan/analytics/_GUIDE.md` 의 템플릿과 기록 초안에 싣는다. 회고는 **정리 기계**다 — 트리거는 관측, 실행은 사람이 연 PO 판정 묶음 세션.
자동 증류·승격이 아니므로 [ADR-12] 재개가 아니다.

범위:
1. **`scripts/retro.js`**([TOOL-32], 계약 PASS/CLARIFY) — 지표 7(issuance · archiveDebt · stale · gcPlans · planeLag · distill · ledgerKb)을 파일 + git 날짜
   (한 번의 `git log --name-only`, 없으면 mtime)로 계산. 직전 회고 기록(`ANL-00<x>_retro_*` frontmatter `snap_*`·`wo_total`)과의 **Δ**. `adapter.json retro:` 임계·`off`.
2. **`health` 차원 `retro due`** — 초과면 WARN(사유), 아니면 INFO 현재 값. 등급 매핑: PRO 의 "CLARIFY" = health 의 WARN(비차단 표면화, §8 ④).
3. **제안 경로** — `retro.js --proposal` 이 HANDOFF §4 한 줄을 낸다. 에이전트는 그 한 줄만 쓴다.
4. **회차 기록** — `retro.js --record [--write]` 가 `plan/analytics/ANL-00<x>_retro_<yyyymmdd>.md`(메타 계보 00 · `parent: PRO-25`, 어답터는 `--adopter` → `up:PRO-25`)
   초안을 낸다: frontmatter 스냅샷 + 체크리스트 8(v0.2: 2 = PO 판정 묶음 · 4 = 일괄 2a 승인) + Δ + 후보 자리. append-only.
5. 상류 도그푸딩: 2026-10-17 의 PO 판정 묶음(WO 6건 Closed)이 **첫 회고의 실체**다 — `ANL-00a_retro_20261017.md` 를 쓰고 체크리스트 1·2 를 수행으로 채운다.

## 수용 기준
- 단위 테스트 **먼저**([ADR-40]): 지표 7 · 기준 없음 처리 · 임계 덮어쓰기/off · Δ · 스냅샷 파싱 · 회차 글자(l·o 제외) · 기록 렌더(스냅샷 7 · 체크리스트 8) · CLI 0/3.
- health dims 20(`retro due` 추가) · 어답터 팔 `vocab` 에 바 1(사본에서 `retro --json` 지표 7 · health `retro due` 절 존재 · 크래시 0).
- 카드 [TOOL-32] 신설 · [TOOL-04] 행 · `plan/analytics/_GUIDE.md` 회고 템플릿 절 · MIGRATION(`retro:`) · CHANGELOG. AGENTS.md 는 tools-index 블록만.

## 절차
1. 테스트 먼저 → 2. retro.js → 3. health 차원 → 4. 팔 바 → 5. 가이드·카드·문서 → 6. 첫 회차 기록(도그푸딩) → 7. HANDOFF §4 제안 한 줄(사유가 있을 때만).

## 증거
- 테스트: `scripts/retro.test.js`(신설, 24) · adapter(+4) · health(+5, dims 19) · gate-contract(+1 retro) — 전부 녹색. 스위트 44 중 42 통과, 실패 2 = 미커밋 fdt spike 귀속.
  lint 체인 17종 중 leakage 외 전부 exit 0(retro 는 CLARIFY 3 — 회고 제안, 비차단).
- 어답터 팔 `vocab`: 사본(git 없음)에서 mtime 폴백으로 지표 7 · health `retro due` WARN · 크래시 0 — 6 형상 성공 바 전부 충족.
- 첫 회차 기록 `plan/analytics/ANL-00a_retro_20261016.md` — 스냅샷 7 + WO 분포 + 체크리스트(1 보관 6건 ✓ · 2 PO 판정 6건 ✓ · 3 흔적 6/6 ✓ · 4 해당 없음 · 5~7 보류 + §3 후보:
  LSN 후보 "자기언급 오염 3회째" · 오래된 PRO [PRO-23]) · 8 ✓. 다음 회차부터 발행 증분·Δ 가 이 스냅샷을 기준으로 선다.
- 상류 판정: `retro due` WARN — 평면 지연 50일(evidence 평면 마지막 2026-08-27 = CI 미실행 기간; live·gap 은 날짜 무기입). 사실이다: 이 기간 상류는 로컬 커밋만 했고 push 가 없었다.
  제안 한 줄은 HANDOFF §4. 열고 안 열고는 사람.
- 경계: retro.js 는 WO 도 LSN 도 쓰지 않는다. 기록 초안은 사람이 채우는 표다(이번 회차는 오늘 실제로 수행된 판정 묶음을 적었다).
