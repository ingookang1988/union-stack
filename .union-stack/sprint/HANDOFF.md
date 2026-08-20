<!-- [Wiki] 세션 이어달리기. 세션을 마치는 에이전트가 덮어쓴다. 최신 하나만 유효.
     다음 세션 부트스트랩 시 가장 먼저 읽힘. -->
---
session_id: adopter-issues-1to5-2026-08-20
date: 2026-08-20T00:00:00Z
author: agent
verification: "상류 35스위트 중 33 통과(실패 2 = 미커밋 fdt 귀속, 기준선 동일) · 어답터 시뮬레이터 33/33 전량 green · lint 7종 통과"
version: 1.0
---

# Handoff → 다음 세션

## 1. 세션 요약 (1~3줄)
- **어답터가 올린 이슈 5건을 전부 이행했다**([ADR-29]~[ADR-33]). 다섯 중 넷이 같은 뿌리다 —
  상류가 자기 형상만 실행해서, 어답터 형상에서만 참인 사실이 아무 데서도 관측되지 않았다.
- 가장 무거운 건 [ADR-29]: sync 의 전제("덮어써도 잃을 것이 없다")가 **거짓**이었다. 개조를 담을
  표면(`adapter.json`)과 덮어쓰기 보호(3-way 앵커)를 함께 넣었다 — 표면만 주면 기존 개조가 남고,
  보호만 주면 개조가 영구화된다.
- [ADR-30]으로 **어답터 시뮬레이터**(작업트리 사본 + `init --apply --drop-template-bits`)에서
  33스위트 전량 green 을 확보했다. [PRO-17] 어답터 팔의 수동 선행 실행이다(팔 자체는 승인 대기).

## 2. 변경 위치 (ID 목록 — Upward Fetching 진입점)
- 신규: `scripts/adapter.js`·`adapter.test.js`(어답터 설정 표면) ·
  `.union-stack/adapter.json`(어답터가 만드는 파일 — 템플릿엔 없음) · `template-sync.json`(앵커)
- 코드: `template-update.js`(3-way 가드·앵커) · `init.js`(앵커 시딩) · `zfs-linter.js`·`health.js`
  (설정 소비) · `history-linter.js`(헤딩형 파서 + CLARIFY) · `handoff-linter.js`(5부 배정 수정) ·
  `dashboard.js`(제품 축 + `--sections` 확장점 + VIEWS/ROUTER_CSS 함수화) · `package.json`(test 글롭)
- 테스트: `check-prereqs`·`dashboard`·`ref-linter`·`history-linter`·`handoff-linter`·`template-update`
- 평면: 원장 `[ADR-29]`~`[ADR-33]` · `[TOOL-21]`·`[TOOL-25]` 카드 · CHANGELOG · MIGRATION(3절 신설)

## 3. 다음 작업 (단일 진입점)
→ **`archive_ledger.md` 로테이션 판정** (이번 세션이 만든 트립와이어 — 먼저 처리할 것).
  31KB(이미 상한 초과) → ADR 5건으로 **40KB**. `health` 의 file size 가 WARN 이고 크기 헤드룸
  절이 원장을 1위로 잡는다. `DESIGN_RATIONALE` §7 이 "분할 또는 회전"을 규정하지만 **도구가 없고**,
  회전은 `permission-guard` Check A(append-only 줄 삭제 금지)와 정면 충돌한다 — 즉 이건 구현이
  아니라 **[PRO-*] 감이다**(append-only 불변식의 예외를 어떤 형태로 열 것인가). 착수 전 판단:
  ①회전 프로토콜을 제안으로 올린다 ②상한을 원장에 한해 올린다 ③분할(연도별 자식 원장)한다.
  ⚠ 이월된 **`context-budget.js` 의 AGENTS.md 계측**은 이제 **5세션째**다([PRO-13] "3세션 생존 =
  오라우팅" 기준 초과). 위 로테이션 판정과 함께 **착수/승격/드롭을 판정**하고 더 미루지 말 것.

## 4. 미해결 / 주의
- **원장 40KB**: 위 §3 참조. 이번 세션이 5건을 append 해서 넘겼다 — 인지하고 넘긴 것이다(결정
  기록은 필수이고 회전은 승인이 필요한 별건).
- **[PRO-17] 승인 대기**: [ADR-30]의 시뮬레이터가 그 팔의 수동판이다. 승인되면 그 절차를
  `harness.yml` 잡으로 고정하면 된다(스크립트화 여지: 시뮬레이터는 아직 세션 스크래치패드에만 있다).
- **기존 어답터의 첫 `--apply` 는 `--force` 가 필요하다**(앵커 부재 → 전부 `unknown`). CHANGELOG ⚠에
  적었으나, 어답터가 CHANGELOG 를 읽지 않으면 "아무것도 갱신 안 됨"으로 보인다 — 도구가 그 자리에서
  안내 문구를 내지만 문구가 충분한지는 실사용 관측 필요.
- **`package.json` 은 review 카테고리**라 `npm test` 글롭화가 어답터에 자동 전파되지 않는다.
- **미커밋 유지**: `ref/` 와 `spike/SPIKE-fdt_canon_import_utility_analysis.md`. 공개 여부는 인간 판단.
  이 파일이 `leakage` FAIL + 실패 테스트 2스위트의 원인이다(기준선과 동일 — 이번 변경과 무관).
  참고: 이번에 넣은 `adapter.json` 의 `private: true` 로 그 FAIL 을 INFO 로 낮출 수 있으나,
  **이 레포는 공개 템플릿이므로 켜지 않았다** — 켜는 것은 어답터의 선택이다.
- **인용 공백(전 세션 이월)**: `ARCH-00` 을 인용하는 게이트가 `leakage-guard` 하나뿐이라 어답터에서
  ARCH-00 이 무게이트로 관측된다. 미해결.
- **누설 가드 판정 기준이 약하다(이월)**: `MARKER` 가 본문 어디든 "예시" 한 단어면 통과.
- **[WO-10a-1] 인간 대기**: E6 10런은 top-level 세션 필요.
- 재제안 금지 목록은 **AGENTS.md의 `blocks-index` 블록**이 소유한다 — 여기 복제하지 말 것([ADR-18]).

## 5. 검증 상태
- **상류 정상 모드**: 35스위트 중 33 통과 · 2 실패(`leakage-guard`·`ref-linter` — 미커밋 fdt 귀속,
  **기준선과 동일**). lint 7종 통과.
- **어답터 모드**(작업트리 사본 + `init --apply --drop-template-bits`): `node --test "scripts/*.test.js"`
  **33/33 통과** · `health` 게이트 전부 통과 · `dashboard`·`lineage-tree` 렌더 정상.
- **설정 실동작**: `adapter.json` 의 `zfsIgnored` 로 위반 1건이 면제되고 파일 제거 시 다시 REJECT.
  `private: true` 로 leakage FAIL → `INFO 1 unmarked — private 어답터(강등)`, 제거 시 FAIL 복귀.
- **확장점 실동작**: `--sections` 로 기존 축 덧붙임 + 새 축(나브·라디오·CSS) 생성 확인. 경로 오타 시
  stderr 보고 + exit 1, 대시보드는 나머지로 렌더.
