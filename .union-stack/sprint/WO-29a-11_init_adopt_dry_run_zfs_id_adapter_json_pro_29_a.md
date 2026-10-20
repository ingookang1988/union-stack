<!-- [Wiki] 작업 지시. 상태 정본은 이 frontmatter `status:` 하나뿐이다([PRO-15]). scaffold 생성 — 선택 절(배경·설계·절차)은 필요할 때만 추가. -->
---
id: WO-29a-11
title: 이식기 ② init --adopt dry-run — 기존 문서 트리 → 매핑안(자리·ZFS ID·확신도) + adapter.json 초안 — [PRO-29] ③(a)
status: Verifying
parent: PRO-29
evidence: "구현 완료(2026-10-20, 테스트 먼저): adopt-map(매핑표 1:1 규칙 · 디렉터리3/파일명1/헤딩1 점수 · ID 부여 · adapter 초안 · 읽기 전용 스캔) + init --adopt [--out]. rcpt:n/a — adopt-map.test 36 · init.test 36(+6) · 스위트 52 중 50(실패 2 = fdt spike) · 팔 7 형상. 실측: 관례 디렉터리 74/74 · 평평한 docs high 1/6 → 임계 판정(high = 디렉터리+헤딩, 2026-10-20) 뒤 high 0 · medium 34/65 · adopt-map.test 40. OSS 레포 선정 대기"
closed_by: [.union-stack/reference/tools/TOOL-06_init.md, .union-stack/proposals/PRO-29_connection_closure.md]
version: 1.0
---
# [WO-29a-11] 이식기 ② init --adopt dry-run — 기존 문서 트리 → 매핑안(자리·ZFS ID·확신도) + adapter.json 초안 — [PRO-29] ③(a)

## 목표
[PRO-29] ③(a): union-stack 이 **없는** 기존 프로젝트를 이식할 때, 사람이 MIGRATION 매핑표를 손으로 채우는 대신 **채워진 안**을 받는다. 이 WO 는 dry-run 까지 — 파일을 옮기지도, 대상 레포에 쓰지도 않는다(적용은 ③(b)).
- `node scripts/init.js --adopt <repo>`: 대상 레포의 문서 트리(`docs/`·`*.md`·ADR 디렉터리 등)를 **경로·파일명·헤딩 줄만** 읽어(본문 0) 행마다
  `{ from, to, domain, proposedId, confidence: high|medium|low, why }` 를 낸다. 규칙의 정본은 MIGRATION.md 매핑표(문서화된 표와 코드가 갈라지지 않게 표를 읽거나 표와 대조 테스트).
- **확신도**(잠정 — §7-4): high = 경로 신호 + 헤딩 신호 둘 다 · medium = 하나 · low = 없음(매핑 안 함, 목록만). ZFS ID 는 도메인별 다음 번호(이식 순서 = 경로 정렬), 계보 산술은 ③(b) 에서 사람이 고친다.
- **adapter.json 초안**: `sections`(대상 WO·작업 문서의 H2 분포 → 필수 3절 별칭 후보, [PRO-28] 꼴) · `statusMap`(`status:` 값 분포 → 상류 어휘 후보) · `localOwned`(대상 `scripts/` 의 기존 파일).
- 출력: stdout 요약 + `--out <file>`(JSON). **대상 레포 쓰기 0.**

## 수용 기준
- 테스트 먼저([ADR-40]): 분류기 순수 함수(경로·헤딩 → 도메인·확신도) — MIGRATION 매핑표의 모든 행에 픽스처 1개 이상 · 표와 코드의 대응 테스트(표에 없는 규칙 = 실패) ·
  ID 부여(도메인별 연속 · 결정적) · adapter 초안(헤딩·status 분포 픽스처) · 대상 쓰기 0(git status 불변).
- 실측(성공 바 재료): 어답터 팔 형상 1개를 "이식 전" 꼴로 만든 사본(평면을 일반 docs/ 트리로 되돌림)에 dry-run → 원래 자리와의 일치율을 증거에(high 행 기준).
- **사람 판정 2건(§7-4)**: ① 확신도 임계(잠정값 유지 여부) ② 공개 OSS 시험 레포 선정 — 외부 레포 클론은 사람 승인 뒤. 판정 전에는 팔 사본 실측만으로 진행.
- 범위 밖: `--apply`(③(b)) · MIGRATION 재편(③(d)) · 하위 설치([WO-29a-10]). 카드 [TOOL-06] · CHANGELOG.

## 증거
- 테스트: adopt-map 신규 36(매핑표 17행 ↔ 규칙 1:1 양방향 · 분류 16꼴 · 디렉터리 > 파일명 3 · ID 연속·결정적·ZFS 유효·비ASCII · adapter 초안 3 · 실 git 스캔: 제외 디렉터리·헤딩만·본문 0·쓰기 0·.union-stack 거부) ·
  init +6(`--adopt` exit·요약 · --out JSON · 쓰기 0 · --name 불요 · 거부 · 인자 없음).
- **실측(이식 전 사본 — 상류 공개 평면 112문서를 ZFS ID 를 뗀 docs/ 트리로 되돌림, 채점 대상 = 규칙에 자리가 있는 도메인 74)**:
  (a) 관례 디렉터리(`docs/plans/`·`meetings/`…): 1차 high 48/53 · medium 21/21 → **디렉터리 > 파일명 가중 뒤 high 50/50 · medium 24/24(74/74)**. 1차 오답 5 은 전부 파일명 키워드+헤딩이 디렉터리를 이긴 꼴.
  (b) 평평한 `docs/`(헤딩만): high **1/6** · medium 33/59 · 채점 대상 low 9 — 헤딩만으로는 약하다. high 오답은 파일명+헤딩이 함께 엇나간 꼴(예: 인계 압축 제안 → HANDOFF).
- **사람 판정 재료(§7-4)**: ① 확신도 임계 — 잠정값(파일명|디렉터리 + 헤딩 = high)으로는 (b) 가 성공 바(high 사람 수정률 ≤ 20%)를 못 넘는다. 대안 = high 를 **디렉터리+헤딩**으로만 한정(평평한 트리는 high 0 · 전부 medium 검토).
  ② (a) 는 내가 고른 디렉터리 이름이라 자기충족적 — 실제 OSS 레포 1곳 실측이 필요하다(클론은 승인 뒤).
- **임계 판정 반영(2026-10-20)**: high = 디렉터리 + 헤딩만. 테스트 +4(README·평평한 handoff = medium · 디렉터리+헤딩 = high · 디렉터리+파일명 = medium). 재실측: (a) high 50/50 · medium 24/24 · (b) high **0/0** · medium 34/65 · low 9 — 평평한 트리는 전부 사람 검토로 간다.
