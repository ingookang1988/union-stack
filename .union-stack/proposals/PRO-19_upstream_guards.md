<!-- [Proposal] 승인 전 효력 없음. 발행 린트 + 로드맵 배선 + 인계 진입점 — 종료 의례([PRO-15])의 상류 대칭. 판정 어휘·표면은 승인 시 확정. -->
---
id: PRO-19
title: 상류 가드 셋 — WO 발행 린트 · 로드맵(PHASE) 배선 · HANDOFF 진입점
status: Approved
decided_by: ingookang1988 (chat approval, 2026-08-21)
reason: "§7 다섯 값 전부 제안 기본대로 확정 — ①발행 린트는 --table 일괄 ②PHASE 를 CONTEXT_DOMAINS 편입 ③staleness 는 health.js ④진입점 검사는 CLARIFY ⑤계보 불일치 검사 **포함**(ID 계보 기준이라 WO-10a-1 의 parent PRO-10 관례는 통과). 구현·검증 완료([ADR-43])."
version: 1.0
---

# [PRO-19] 상류 가드 셋 — 발행·로드맵·인계

## 1. 요지
[PRO-15]가 종료 의례를 세워 수명주기의 **하류**를 닫았다. 그런데 상류는 여전히 비대칭이다:

```text
발행(생성)     : 가드 0        ← 이 제안 ①
실행 진입      : Upward Fetching (읽기 의례) — 단, 로드맵(PHASE)은 수집 대상 밖  ← 이 제안 ②
종료           : work-close CLARIFY ([PRO-15]) — 완비
세션 인계      : handoff-linter 5부·예산만 — 진입점이 WO인지는 안 본다  ← 이 제안 ③
```

세 공백의 병인은 하나다 — **"상위 축이 죽지 않도록"이 종료 시점·일부 축에만 계측된다.**
WO는 무가드로 태어나고, 로드맵은 어느 방향(읽기/쓰기/관측)에도 연결돼 있지 않으며, HANDOFF의
다음-작업은 WO를 우회해 prose로 이월된다. 제안은 세 축 모두 **기존 스크립트 3개의 확장**이며
신규 스크립트 0, REJECT 0(전 판정 PASS/CLARIFY/정보)이다.

> 산문 규칙만으로 충분하지 않다는 것은 이 레포가 자기 데이터로 실측했다 — [PHASE-02] E3
> **의례 자발 수행률 0%**(`query.js` normEnforcement 주석). 규정이 있어도 계측이 없으면 죽는다.

## 2. 병인 (실측, 2026-08-21)

| 관측 | 사실 |
|---|---|
| WO 해부 린트 | `sprint/_GUIDE`는 *"smell-linter가 TOOL 카드를 강제하듯 강제"*라 쓰지만, `scripts/*.js`에서 `## 목표`·`## 수용 기준` 절을 검사하는 코드는 **0건**(유일한 매치가 `work-close.test.js`의 픽스처) — **문서-실재 드리프트** |
| `parent:` 실존 검증 | **0건.** `ref-linter`는 본문 브래킷만 보고 frontmatter를 안 본다. `work-close`는 값의 유무만 본다. 죽은/오타 parent가 발행·종료 어디서도 안 걸린다 |
| PHASE 읽기 방향 | `query.js`의 `CONTEXT_DOMAINS = {PLAN, FLOW, CON, ARCH, MTG}` — **PHASE 없음.** `roadmap/_GUIDE`는 스스로 *"plan·sprint의 macro-direction parent"*라 선언하는데 upward-fetch가 그 부모를 실어오지 않는다 |
| PHASE 쓰기/관측 방향 | `work-close`의 `TRACE_CANDIDATES`에 로드맵 없음(의도적일 수 있음 — §3.2). staleness를 재는 곳도 없음. **`sprint/` 전체에 PHASE/roadmap 언급 0건** |
| HANDOFF §3 진입점 | 규정은 *"start from `WO-01a-3`" 단일 진입점*(sprint/_GUIDE 예시)인데 현행본은 prose("context-budget.js 계측")로 **5세션째 이월** — [PRO-13]의 "3세션 생존 = 오라우팅" 기준을 본문이 자인한다 |
| handoff-linter | 5부 존재 + 예산만 검사. §3에 WO ID가 있는지는 안 본다 — 이월 prose가 구조적으로 통과한다 |

> **승격 경로 자체는 이미 한 번 작동했다.** [WO-10a-1]은 "HANDOFF 2세션 체류 → 3세션째 WO로
> 고정"([PRO-13] §4-4)의 산물이다. 문제는 경로의 부재가 아니라 **경로를 타는지 아무도 안 본다**는 것.

## 3. 제안 — 세 축

### 3.1 ① WO 발행 린트 (`work-close.js` 확장 — 신규 스크립트 0)

`work-close`는 이미 전체 WO의 frontmatter를 파싱한다(`--table` 경로). 같은 파스 결과에
**발행 계약 검사**를 얹는다 — 대상은 상태 무관 전체 활성 WO, 표면은 `--table` 실행 시 일괄:

| 검사 | 판정 |
|---|---|
| `## 목표` · `## 수용 기준` · `## 증거` 3절 부재 | CLARIFY — 해부 미충족(`sprint/_GUIDE` §Anatomy) |
| frontmatter `parent:` 부재 | CLARIFY |
| `parent:`가 가리키는 ID가 `zfs_index`에 없음 | CLARIFY — **죽은 부모** (오타 또는 미작성 상위 문서) |
| `parent:`와 자기 ID의 계보 불일치(`isDescendant` 위반) | CLARIFY — 계보 절단(플릿 파티션 [PRO-05]가 오분할된다) |

이것은 새 규칙이 아니라 **이행**이다 — `sprint/_GUIDE`가 이미 "강제된다"고 쓴 것을 참으로
만든다(smell-linter의 해부 검사를 WO 도메인에 이식, [PRO-15] §4가 예고한 그대로).

### 3.2 ② 로드맵(PHASE) 배선 — 읽기 1줄 + 관측 2판정, 쓰기 강제는 없음

**(읽기)** `CONTEXT_DOMAINS`에 `PHASE` 추가 — diff 1단어. `ancestorChain('01a-1') → 01a → 01`이
이미 PHASE-01의 id와 만나므로 색인·계보 로직 변경 0. 이후 모든 Upward Fetching이 로드맵
문맥을 자동으로 싣는다(진입 의례가 "상위 로드맵 참조"를 공짜로 포함하게 된다).

**(관측)** `health.js`에 양방향 staleness 판정 2건:
- **로드맵 무연결 작업**: Active PLAN/WO 계보의 뿌리에 PHASE 문서가 없음 → 정보 — "이 작업은
  어느 마일스톤에도 속하지 않는다."
- **무활동 PHASE**: 어떤 활성 PLAN/WO 계보도 내려오지 않는 PHASE → 정보 — "이 마일스톤은
  정체 중이거나 종료 처리 누락이다."

**(종료)** `work-close <WO-ID>`의 정보 라인에 1건 추가: 계보에 PHASE가 있으면 *"[PHASE-XX]
exit criteria 검토 후보(강제 아님)"* — 기존 "부모 PLAN 전이 후보"와 동형.

**쓰기 방향을 강제하지 않는 근거**: roadmap은 **Schema(인간 소유)**다. 에이전트가 WO를 닫으며
PHASE를 되쓰게 하면 [PRO-09] 권한 경계를 깬다. 로드맵이 죽지 않게 하는 올바른 수단은
에이전트의 대필이 아니라 **정체의 표면화**다 — 갱신은 신호를 본 인간이 한다.

### 3.3 ③ HANDOFF 진입점 검사 (`handoff-linter` 확장)

§3(다음 작업)에 `[WO-*]` ID가 없고 명시적 `— 해당 없음`도 아니면:

> CLARIFY — 다음 작업이 WO를 가리키지 않는다. 이월 중인 prose라면 WO로 승격하라
> ([PRO-13] §4-4 — [WO-10a-1]이 그 경로의 선례).

`— 해당 없음`을 허용하는 이유는 [PRO-13]과 동일 — 미기입과 해당없음의 구별이 요구의 전부다.
이 검사 하나로 §2의 "5세션 이월"류가 매 세션 표면화된다: prose 이월은 이제 **침묵으로는 못 산다.**

## 4. 차단 정책 ([PRO-11] 4값)
**REJECT 0.** [PRO-15] §9의 논리가 그대로 상류에 적용된다 — *불완전한 발행이 발행 못 함보다
낫고, 불완전한 인계가 없는 인계보다 낫다.* 전 판정 PASS / CLARIFY / 정보.

## 5. 반증 조건
- **① 무시율**: 발행 CLARIFY가 반복 무시되면(3세션 연속 동일 항목 잔존으로 관측) 표면화 실패
  → 검사 철회. 강제로 올리지 **않는다**([ADR-08]).
- **② 소음**: 로드맵 무연결 작업이 정상 운영으로 판명되면(예: 실험·spike 계보) 판정 제거 또는
  화이트리스트. PHASE 주입으로 진입 의례 토큰이 유의미하게 늘면 요약 주입으로 축소.
- **③ 마찰**: next=WO 요구가 `session-friction` 기준 인계 왕복을 늘리면 CLARIFY → 정보로 강등.
- **의례화 일반**: 세 검사 모두 "통과를 위한 통과"(빈 절 생성, 형식적 `— 해당 없음`)가 관측되면
  해당 검사는 가치를 잃은 것 → 축소가 기본값, 강화가 아님.

## 6. Split-principle check
(a)/(b) 해당 없음 — **신규 도메인 0 · 신규 평면 0 · 신규 디렉터리 0 · 신규 스크립트 0.**
기존 스크립트 3개(`work-close` · `query`/`health` · `handoff-linter`)의 확장 + TOOL 카드 갱신뿐.
전부 기존 규칙의 이식이다: 해부 검사 = smell-linter, CLARIFY 표면화 = [PRO-11], 승격 경로 =
[PRO-13] §4-4, 정보 라인 = [PRO-15] §6, 정체 표면화 = health.js domain-utilization 패턴.

## 7. 승인 시 인간이 확정할 값
1. **① 발행 린트의 표면** — `--table` 실행 시 일괄(제안 기본) / 별도 `--lint` 플래그 / CI 스텝 포함 여부
2. **② PHASE의 `CONTEXT_DOMAINS` 편입** — 진입 의례 주입량 증가를 수용하는가(대안: ID만 표기하고 본문 미주입)
3. **② staleness 판정의 거처** — `health.js`(제안 기본) / dashboard 제품 축 병행
4. **③ 진입점 검사의 강도** — CLARIFY(제안 기본) / 정보로 완화
5. **계보 불일치 검사(①의 4행)** — 포함 / 제외(parent가 계보 밖 PRO를 가리키는 현행 관례([WO-10a-1] `parent: PRO-10`)를 허용할지, 허용한다면 어떤 어휘로)
