<!-- [Proposal] 교차 레포 도구의 전제 다섯 — 상류 ID 네임스페이스 · 상태 어휘 매핑+백필 · frontmatter 계보 1급 · health --root · ID 유일성.
     하류 검토 4건(eval/SURVEY-02_results.md §1)이 [PRO-24]·[PRO-25]·[PRO-26]·[PRO-22] 구현의 공통 선행으로 지목. 인간 결정(2026-10-15)으로 분리. 인간 판단 대기. -->
---
id: PRO-27
title: 교차 레포 전제 — 상류 도구가 어답터 평면을 올바로 읽기 위한 다섯 가지 (PRO-24·25·26 의 0단계)
status: Approved
decided_by: ingookang1988 (chat approval, 2026-10-15)
reason: "세 PRO(24·25·26)와 [PRO-22] 구현의 공통 전제 다섯을 분리 승인. 순서 ④⑤ → ① → ② → ③. 상류 도구 변경은 [WO-27a-1]부터, 어답터 적용(②)은 어답터 소유. 미결 4건은 잠정값으로 진행."
version: 1.0
---

# [PRO-27] 교차 레포 전제 (0단계)

## 1. 배경 — 세 PRO 가 같은 다섯 가지 위에 서 있었고, 어답터 3곳에서 그것이 성립하지 않았다

하류 검토 4건(`eval/SURVEY-02_results.md` §1)이 드러낸 것은 세 PRO 의 결함이 아니라 **전제의 부재**다. 전제는 규칙이 아니라 사실이라
각 PRO 안에 묻히면 세 번 중복되고, 승인 주체도 어긋난다(상류 도구 변경은 상류가, 백필·매핑 값은 어답터가). 그래서 분리한다.

| 전제 | 실태(어답터 A·B·C) | 깨지는 것 |
|---|---|---|
| 상류 ID ≠ 로컬 ID | **같은 공간.** C 의 strict 참조 린터가 상류 `[PRO-26]` 을 로컬 문서로 오해소, `[PRO-24]` 에서 Fail-close(설문 파일 자체가 걸림) | [PRO-24] ③(a) · [PRO-25] ④ · [PRO-26] ① · 배포되는 모든 상류 문서 |
| 상태 어휘 enum · frontmatter 존재 | A: WO 99/179 frontmatter 없음, 종결 어휘 `Done` · B: 로컬 PRO 17/17 YAML 없음, PLAN 비enum · C: status 38종 자유 문자열 | [PRO-24] census · [PRO-25] 트리거 전부 · [PRO-22] work-close |
| 계보 루트 = PLAN, ID 산술 | A: 루트 38 중 26 에 PLAN 없음, 레거시 번호대는 **도메인별 독립 채번** · C: ID 산술 루트 **0/438**(계보는 `plan:` 74%) | upward-fetch · [PRO-25] GC · [PRO-26] 상속 |
| 상류 health 가 어답터를 측정 | `--root` **미구현** — 플래그를 무시하고 상류 자신을 측정한 뒤 종료(상류 재현) | [PRO-24] ② 폴백 무효 · "0건 검사 = 통과" 클래스의 재위반 |
| ID 유일성 | A: 같은 도메인·같은 ID 파일 2쌍 · 상류 린터도 미검사(상류 확인) | 모든 ID 산술 |

## 2. 원리

1. **전제는 도구 쪽에서 닫는다.** 어답터에 "고쳐라"가 아니라, 도구가 어답터 현실(별칭·frontmatter 관계·독립 채번)을 **읽게** 한다. 어답터 소유
   작업(백필 적용·매핑 값)은 어답터가 하고, 상류는 스크립트와 dry-run 만 준다.
2. **차단 아님** — INFO/CLARIFY 로 시작([ADR-23]). 예외 둘: ID 중복 · 엉뚱한 루트 측정 = REJECT. 틀린 답을 통과로 내는 것은 [PRO-22] 2-bis 와
   같은 결함 클래스다.
3. 네임스페이스는 **표기 규약 + 도구 인식**이지 ID 변경이 아니다([ADR-25] 유지).

## 3. 채택안 — 새 도메인 0 · 설정 키 3 · 스크립트 1 · 기존 도구 수정 4

### ① 상류 ID 네임스페이스 `[up:ID]`
어답터 문서가 상류 문서를 가리킬 때 `[up:PRO-27]` 처럼 접두를 쓴다. `ref-linter`(strict 포함) · `upward-fetch` · `blast-radius` · census 는 `up:`
참조를 **로컬 색인에서 해소하지 않고** 외부 참조로 분류(INFO). 상류 자신의 문서는 접두 없음. 상류가 어답터로 **배포하는 문서**(설문·키트 안내·
template-update 가 옮기는 review 파일)는 배포 시 상류 ID 에 접두를 붙인다.

### ② `adapter.json` `statusMap` · `evidenceFields` + 백필 스크립트
```jsonc
// (예시)
"statusMap": { "Done": "Closed", "Planned": "Draft", "Review": "Verifying", "Implemented": "Verifying" },
"evidenceFields": { "evidence": ["implementation_commit", "deployment_id"], "closed_by": ["surfaces"] }
```
상류 도구는 로컬 어휘를 매핑으로 읽고 어휘를 강제하지 않는다. `node scripts/frontmatter-backfill.js`(기본 dry-run)는 frontmatter 없는 WO·PRO 에
`status:` **한 줄만** 삽입할 목록과 추정값(본문 표식 → 종결 디렉터리 → 기본값 순)을 내고, 적용(`--apply`)과 커밋은 어답터가 한다.

### ③ frontmatter 계보 1급
`zfs_index` 가 `plan:`·`parent:` 를 읽어 조상 집합에 합산한다: 조상 = ID 산술 부모 ∪ frontmatter 부모. 레거시 독립 채번 구간은 어답터가
`adapter.json lineage.arithmeticFrom`(예시: `36` — 그 번호부터만 산술 상속, 그 아래는 frontmatter 만)으로 선언한다. 우산 WO(`WO-NN`)와 중간
PLAN(`PLAN-NNx`)을 계보 루트로 인정한다. upward-fetch 는 빈 결과를 `(없음)` + exit 0 이 아니라 **CLARIFY** 로 낸다.

### ④ `health.js --root <dir>`
인자 파싱 + 루트 검증(`.union-stack` 이 없으면 REJECT "측정 대상 아님"). 어답터 로컬 도메인·설정은 INFO 로만. [PRO-24] ② census 의 전제.

### ⑤ `zfs-linter` ID 유일성
같은 도메인·같은 ID 의 파일이 2개면 REJECT(목록 출력). 상류 자신부터 도그푸딩.

## 4. 분할원리 점검 ([PRO-04])
(a) 식별자 네임스페이스·어휘 매핑·루트 규칙은 모든 다중 레포 체계가 가진다 ✓ · (b) 기존 칸에 들어간다 ✓ — `adapter.json` 키 3([ADR-29] 설정 표면),
스크립트 1, 기존 도구 4 수정. 새 도메인·티어·파일 종류 0.

## 5. 하지 않는 것
- ⛔ **ID 변경·소급 리네임** — [ADR-25]. 네임스페이스는 참조 표기다.
- ⛔ **상류가 어답터 문서를 직접 고치는 것** — 백필은 dry-run 과 스크립트까지. 적용·커밋은 어답터.
- ⛔ **상태 어휘를 상류 enum 으로 강제** — 매핑으로 읽는다. 어답터의 `Done`·`Review` 는 그대로 산다.
- ⛔ **어답터 간 참조**(`adopter:`) — 범위 밖. 상류↔어답터만.

## 6. 성공 바
- ① C 꼴 형상(어답터 팔)에서 `[up:PRO-24]` 를 담은 문서가 strict 참조 린터를 통과하고, 접두 없는 `[PRO-24]` 는 로컬 문서로 해소된다.
- ② statusMap 으로 A 꼴 형상의 `Done` 57 이 종결로 집계된다 · 백필 dry-run 이 frontmatter 없는 99건을 추정값과 함께 나열하고 파일을 쓰지 않는다.
- ③ 전역 일련번호 형상에서 `upward-fetch WO-345` 가 `plan:` 부모를 반환하고, 독립 채번 형상에서 `arithmeticFrom` 아래 번호가 도메인 횡단 상속을
  하지 않는다. 빈 결과는 CLARIFY.
- ④ `health --root <어답터 팔 사본>` 이 그 사본을 측정하고, `--root <빈 디렉터리>` 는 REJECT.
- ⑤ 상류 린터가 가짜 중복 ID 픽스처에서 REJECT, 상류 자신은 통과.
- 어답터 팔([TOOL-26])에 **"독립 채번 레거시"**·**"전역 일련번호 WO"** 두 형상을 추가한다.

## 7. 미결 (인간 판단)
1. 접두 표기 — `up:` vs `union-stack:`. 잠정 `up:`(짧고 브래킷 안에서 읽힘).
2. 백필 기본값 — 본문 표식·종결 디렉터리가 없을 때 `Done`(종결)로 볼지 `Draft` 로 볼지. 잠정: 추정 불가면 **비움 + 목록 보고**(틀린 종결 표시가 더 해롭다).
3. `arithmeticFrom` 을 어답터가 알아낼 수 있는가 — census 가 "같은 번호에 PLAN/PRO 가 둘 이상인 구간"으로 추정해 제안.
4. PRO 상태(Proposed/Approved/Rejected + 로컬 Ratified·Draft…)도 statusMap 범위에 넣을지. 잠정: 넣는다(B 의 산문 status 는 백필 대상).

## 8. 순서
④⑤(상류 단독 — 즉시, 가드 먼저 [ADR-40]) → ①(상류 도구 + 배포 표기) → ②(스크립트 → 어답터 dry-run → 적용) → ③. 이후 [PRO-24] ② census 부터.
