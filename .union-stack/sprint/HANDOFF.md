<!-- [Wiki] 세션 이어달리기. 세션을 마치는 에이전트가 덮어쓴다. 최신 하나만 유효.
     다음 세션 부트스트랩 시 가장 먼저 읽힘. -->
---
session_id: adopter-issues-1to6-2026-08-20
date: 2026-08-20T00:00:00Z
author: agent
verification: "상류 35스위트 중 33 통과(실패 2 = 미커밋 fdt 귀속, 기준선 동일) · 어답터 시뮬레이터 33/33 전량 green · lint 7종 통과 · 렌더 본문 원문 마커 0 전수 확인"
version: 1.0
---

# Handoff → 다음 세션

## 1. 세션 요약 (1~3줄)
- **어답터가 올린 이슈 6건을 전부 이행했다**([ADR-29]~[ADR-33] + 후속 [ADR-35]). 앞 다섯 중 넷이 같은 뿌리다 —
  상류가 자기 형상만 실행해서, 어답터 형상에서만 참인 사실이 아무 데서도 관측되지 않았다.
- 가장 무거운 건 [ADR-29]: sync 의 전제("덮어써도 잃을 것이 없다")가 **거짓**이었다. 개조를 담을
  표면(`adapter.json`)과 덮어쓰기 보호(3-way 앵커)를 함께 넣었다 — 표면만 주면 기존 개조가 남고,
  보호만 주면 개조가 영구화된다.
- [ADR-30]으로 **어답터 시뮬레이터**(작업트리 사본 + `init --apply --drop-template-bits`)에서
  33스위트 전량 green 을 확보했다. [PRO-17] 어답터 팔의 수동 선행 실행이다(팔 자체는 승인 대기).
- 후속 [ADR-35](이슈 #6): 제품 축이 HANDOFF 산문을 마크다운 원문 그대로 노출했다 —
  **신설 축이 만든 새 표면에 새 표기 계약이 따라붙는다**는 것을 놓쳤다. `prose()` 로 닫았다.

## 2. 변경 위치 (ID 목록 — Upward Fetching 진입점)
- 신규: `scripts/adapter.js`·`adapter.test.js`(어답터 설정 표면) ·
  `.union-stack/adapter.json`(어답터가 만드는 파일 — 템플릿엔 없음) · `template-sync.json`(앵커)
- 코드: `template-update.js`(3-way 가드·앵커) · `init.js`(앵커 시딩) · `zfs-linter.js`·`health.js`
  (설정 소비) · `history-linter.js`(헤딩형 파서 + CLARIFY) · `handoff-linter.js`(5부 배정 수정) ·
  `dashboard.js`(제품 축 + `--sections` 확장점 + VIEWS/ROUTER_CSS 함수화) · `package.json`(test 글롭)
- 테스트: `check-prereqs`·`dashboard`·`ref-linter`·`history-linter`·`handoff-linter`·`template-update`
- 코드(후속): `dashboard.js` 의 `prose` 계열 4함수 + 인용 자리 12곳 배선
- 평면: 원장 `[ADR-29]`~`[ADR-33]`·`[ADR-35]` · `[TOOL-21]`·`[TOOL-25]` 카드 · CHANGELOG ·
  MIGRATION(3절 신설) · **[PRO-18] 원장 로테이션(신규, 승인 대기)**

## 3. 다음 작업 (단일 진입점)
→ **`context-budget.js` 에 AGENTS.md 계측 추가 — 착수/승격/드롭을 먼저 판정**.
  **5세션째 이월**이라 [PRO-13]의 "3세션 생존 = 오라우팅" 기준을 이미 넘었다. 상시 주입 파일 중
  최대인 AGENTS.md 가 예산 게이트 밖이다(대상은 project·profile·handoff뿐). 주의: AGENTS.md 는
  분할·압축이 불가한 단일 진입 파일이라 **상한 신설이 아니라 관측 표시**가 먼저인지 [PRO-13]의
  예산 문법에 맞춰 판단할 것. 이월을 한 번 더 하지 말 것.
  (원장 로테이션은 **[PRO-18]로 올라갔다** — 다음 행동은 구현이 아니라 인간의 승인 판정이다.)

## 4. 미해결 / 주의
- **[PRO-18] 승인 대기 — 원장 44KB**: 상한(30KB) 초과 상태가 **해소 불가**다(회전 = 줄 삭제 =
  Check A REJECT). 제안의 핵심은 append-only 의 불변식을 "줄"에서 **"항목"**으로 재정의하고,
  가드가 *이동임을 diff 에서 검증*(보존 검사)하게 하는 것이다. 승인 전까지 WARN 은 켜진 채다.
  ⚠ 실측 경고: **순진한 회전은 재제안 차단 목록을 전부 지운다**(차단 6건 → 0건, 이어서 평소의
  `blocks-index --write` 가 AGENTS.md ⛔ 블록을 `(없음)` 으로 덮어씀). 소비자 확대가 선행 조건이다.
- **[TOOL-25] 카드가 상한(4KB) 상시 밀착**: 기능 3건 얹으며 세 번 트리밍. 축이 더 늘면 축별 카드
  분할(`TOOL-25a` 등)이 다음 후보다.
- **[PRO-17] 승인 대기**: [ADR-30]의 시뮬레이터가 그 팔의 수동판이다 — 승인되면 `harness.yml`
  잡으로 고정한다(시뮬레이터는 아직 스크래치패드에만 있어 스크립트화 필요).
- **기존 어답터의 첫 `--apply` 는 `--force` 필요**(앵커 부재 → 전부 `unknown`). 도구가 안내하지만
  문구의 충분성은 실사용 관측 대상.
- **`package.json` 은 review 카테고리**라 `npm test` 글롭화가 어답터에 자동 전파되지 않는다.
- **미커밋 유지**: `ref/` 와 `spike/SPIKE-fdt_canon_import_utility_analysis.md`. 공개 여부는 인간 판단.
  이 파일이 `leakage` FAIL + 실패 테스트 2스위트의 원인이다(기준선과 동일 — 이번 변경과 무관).
  `adapter.json` 의 `private: true` 로 낮출 수 있으나 **공개 템플릿이라 켜지 않았다**(어답터의 선택).
- **이월 2건**: ①`ARCH-00` 인용 게이트가 `leakage-guard` 하나뿐 → 어답터에서 무게이트로 관측
  ②누설 가드 판정이 약하다(`MARKER` 가 본문 어디든 "예시" 한 단어면 통과).
- **[WO-10a-1] 인간 대기**: E6 10런은 top-level 세션 필요.
- 재제안 금지 목록은 **AGENTS.md의 `blocks-index` 블록**이 소유한다 — 여기 복제하지 말 것([ADR-18]).

## 5. 검증 상태
- **상류 정상 모드**: 35스위트 중 33 통과 · 2 실패(`leakage-guard`·`ref-linter` — 미커밋 fdt 귀속,
  **기준선과 동일**). lint 7종 통과.
- **표기 회귀 고정**: 렌더 본문(속성 제외)의 원문 `**`·백틱 **0건**을 전수 단언(필드별이 아니라
  출력 전체에 건다 — 다음에 추가될 인용 자리도 자동으로 덮인다).
- **어답터 모드**(작업트리 사본 + `init --apply --drop-template-bits`): `node --test "scripts/*.test.js"`
  **33/33 통과** · `health` 게이트 전부 통과 · `dashboard`·`lineage-tree` 렌더 정상.
- **설정 실동작**: `adapter.json` 의 `zfsIgnored` 로 위반 1건이 면제되고 파일 제거 시 다시 REJECT.
  `private: true` 로 leakage FAIL → `INFO 1 unmarked — private 어답터(강등)`, 제거 시 FAIL 복귀.
- **확장점 실동작**: `--sections` 로 기존 축 덧붙임 + 새 축(나브·라디오·CSS) 생성 확인. 경로 오타 시
  stderr 보고 + exit 1, 대시보드는 나머지로 렌더.
