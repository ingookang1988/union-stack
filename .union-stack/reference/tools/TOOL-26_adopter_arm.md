<!-- 방법론 자산 카드(leakage-guard METHODOLOGY 등재) — 이 템플릿이 실제로 배송하는 도구. -->
---
id: TOOL-26
title: 어답터 팔 (같은 게이트를 다른 형상에서 한 번 더)
kind: cli
impl: scripts/adopter-arm.js
status: Active
version: 1.0
---

# [TOOL-26] 어답터 팔

## 용도
사본을 만들어 **형상을 바꾼 뒤 기존 도구를 그대로 돌린다**([PRO-17]). 새 게이트가 아니라 같은
게이트의 두 번째 실행이라 로직은 1벌이다. 상류가 자기 형상만 도는 사각지대([LSN-17])를 CI 로 닫는다.

네 축 — 축마다 **실측 결함이 근거**다(가공한 시나리오가 아니다):

| 축 | 사본에 하는 일 | 성공 바 | 근거 |
|---|---|---|---|
| `env` | `init --apply --drop-template-bits` | init 적용 · **상류 ADR 잔존 0** · 스위트 실패 0 · health exit 0 · **무JS 도달성** · **상류 전용 스크립트가 buildPlan 에서 빠진다**([TOOL-34]) | [ADR-26]·[ADR-27]·[ADR-28]·[ADR-30]·[ADR-36]① · [PRO-24] ①(c) |
| `data` | 평면 **내용의 모양**만 교체(표 13개·한국어 헤더·`**제목 — 부제**`·헤딩형 HISTORY) | 도구 3종 크래시 0 · **렌더 본문 원문 마커 0** · live 계수 정확 · HISTORY 분기점 계수 정확 | [ADR-31]·[ADR-35]·[ADR-37] |
| `legacy` | **독립 채번 레거시** — 같은 번호·다른 도메인(PLAN-36 ≠ PRO-36) · 같은 도메인 중복 파일 · `[up:…]` 를 담은 실콘텐츠 · `lineage.arithmeticFrom: 36` 아래 WO | 중복 ID → zfs-linter REJECT · **`[up:…]` strict 참조 린터 통과** · 상류 참조 INFO 계수 · **`health --root` 가 사본을 측정** · **arithmeticFrom 아래 WO 는 무관한 PLAN 상속 안 함 + 선언 부모 수집** · 파생 라벨([TOOL-33]): 선언 부모 mnemonic 상속 · 무관한 루트 mnemonic 금지 | [PRO-27] ①③⑤ · [PRO-26] ④ (SURVEY-02 어답터 실측) |
| `serial` | **전역 일련번호 WO** — 산술 조상 0, 계보는 `plan:` frontmatter 에만 + 부모 없는 고아 WO | **`plan:` 부모 수집 · exit 0** · 고아 WO 는 **CLARIFY(3)** · `health --root <없는 경로>` REJECT · `health --root <사본>` 크래시 0 | [PRO-27] ③④ (SURVEY-02 어답터 실측) |
| `nonjs` | **비-JS 제품 검사 선언** — `adapter.json checks[]` 4행(0건 전수·정상·메타·env 조건부), 영수증 0 에서 시작 | health 가 **영수증 공백 표면화** · ci.js 0건 검사 **3분할**(REJECT·NOOP_PASS·CLARIFY·PASS) · 영수증 선언 행마다 1줄 · 영수증 뒤 포인터·나이 · 약화 가드: 합성 diff 로 **예외 +2 REJECT → known_failures 가 덮으면 CLARIFY** | [PRO-22] §3 1~4 (SURVEY-01 3/3 "검사가 아무것도 안 보고 초록") |
| `kit` | **손 이식 어답터** — 키트 파일 8 + 앵커 삭제, 한 파일 로컬 패치 | 키트 dry-run **쓰기 0** · `--apply` 로 없는 것만 복원 · 앵커 `clone@…(추정)` 는 **동일 파일만**(패치 파일 제외) · 패치 보존 | [PRO-24] ①(a) · §9 ①(a) |
| `vocab` | **로컬 상태 어휘** — `status: Done`·별칭 증거 · frontmatter 없는 WO·PRO(본문 산문 상태) · 종결 디렉터리 문서 + `adapter.json statusMap/evidenceFields` | Done → Closed(work-close·색인) · 별칭 증거 읽힘 · **백필 dry-run 쓰기 0** · `--apply` 뒤 대상 0 · **센서스([TOOL-30])가 사본을 재고 행에 경로·제목 0 · 사본 변경 0** · 회고 트리거([TOOL-32]) 지표 7(mtime 폴백)·health retro due | [PRO-27] ② · [PRO-24] ② · [PRO-25] ① (SURVEY-02 어답터 실측) |

## 언제 쓰나
- CI 매 실행(`ci.js` 체인의 `adopter-arm` 단계 — [TOOL-27]). 로컬에선 배송 형상을 손으로 재현하기 전에.
- **어답터 형상에 닿는 것을 고친 직후** — 파서·렌더러·게이트의 의존, `init` 의 삭제·리셋 목록.
- 팔이 잡은 결함을 고친 뒤에는 그 형상을 `dataShape()` 에 **추가**한다(픽스처가 곧 회귀 고정).

## 언제 쓰지 않나
- **단위 검증** — 순수 함수의 옳음은 각 도구의 스위트가 소유한다. 팔은 *형상*만 본다.
- **어답터 데이터의 옳음** — 팔의 픽스처는 상류가 지어낸 대안 형상이지 실어답터 평면이 아니다.
  실데이터에서만 참인 사실은 여전히 하류 제보로 온다(그게 [LSN-17] 의 잔여 위험이다).
- **exit 0 요구(data 축)** — 주입 콘텐츠엔 더미 마커가 없어 누설 게이트가 FAIL 하는 것이 정상이다.
  팔이 보는 것은 **죽지 않는가**이지 판정이 무엇인가가 아니다([ADR-28] 문법).

## 설계 불변식
- **가드는 물어야 한다.** 새 바 전부 수리 전 코드에서 실패함을 확인하고 배선했다 — 마커 118건 ·
  live 계수 65 vs 52 · 분기점 **0** · 상류 ADR 잔존 24건. 단언이 1차 수리를 통과시킨 [ADR-26] 을
  반복하지 않으려면 **가드를 먼저 물려 봐야** 한다.
- **크래시 ≠ FAIL.** `crashed()` 는 스택·시그널만 크래시로 센다. `execFileSync` 래퍼 문구
  ("Command failed")를 자식 stderr 로 섞으면 모든 비영 종료가 크래시로 오판된다(실측).
- 픽스처는 **자기 정답을 안다**(주입한 행 수·항목 수). "표시가 아니라 숫자가 틀린" 부류는 정답
  없이는 못 잡는다.

## 호출
```bash
node scripts/adopter-arm.js                # 두 축 (exit 0 = 성공 바 전부 충족)
node scripts/adopter-arm.js --shape env    # 한 축만 (env|data|legacy|serial|vocab|nonjs|kit)
node scripts/adopter-arm.js --keep ./ws    # 워크스페이스 보존(디버깅)
node scripts/adopter-arm.js --json
```
