<!-- [Wiki] 작업 지시. 상태 정본은 이 frontmatter `status:` 하나뿐이다([PRO-15]). -->
---
id: WO-28a-2
title: 절 계약 ④ — scaffold 뼈대 생성기(전역 다음 번호 제안 + parent 실존 확인 + 필수 3절, ≤400 tok) — [PRO-28] ④
status: Verifying
parent: PRO-28
evidence: "구현 완료(2026-10-17, 가드 먼저): scripts/scaffold.js([TOOL-36]) — proposeId(산술: 글자 끝 부모 `01a-N` · 숫자 끝 부모 `28a-N` · --lineage · l·o 금지 / 레거시: 도메인 전역 최대+1) · findParent(도메인+ID 실존) · sectionNames(sections 맵 첫 별칭) · slugOf(ZFS 문법, 비ASCII 제목은 --slug 요구) · renderBody(frontmatter + 3절 + 안내 1줄, 뼈대 ≤400 tok) · plan/run(dry-run 기본 · --write · --json · --contract · 파일 존재·ID 충돌·죽은 parent·도메인 미지원 = CLARIFY). rcpt:n/a — 하네스 스위트(scaffold.test 39) · 스위트 49 중 47(실패 2 = fdt spike 귀속) · 팔 7 형상 충족 · 상류 dry-run: PRO-28 아래 28a-3 제안"
closed_by: [.union-stack/reference/tools/TOOL-36_scaffold.md, .union-stack/sprint/_GUIDE.md]
version: 1.0
---
# [WO-28a-2] scaffold 뼈대 생성기

## 목표
새 WO 를 직전 WO 복사 + 손 수정으로 만들어 생긴 변종·중복 ID·빈 status(회신 2곳 · 센서스 3회차)를 **발생원에서** 막는다([PRO-28] ④). 린트(사후)보다 생성(사전)이 싸다.

범위:
1. `scripts/scaffold.js WO --parent <DOMAIN-ID> [--title …] [--slug …] [--lineage b] [--id …] [--write] [--json]` — 기본은 dry-run(계획 + 본문 출력), `--write` 만 파일을 만든다.
2. **채번 제안**: 산술 범위면 부모 아래 다음 자식(글자 끝 부모 `01a` → `01a-N`, 숫자 끝 부모 `28` → `28a-N`, 계보 글자는 `--lineage`(예시: `--lineage b` → `28b-1`), l·o 금지), 레거시 구간(`lineage.arithmeticFrom` 아래)이면 도메인 전역 최대 번호 + 1.
3. **parent 실존 확인**: ZFS 색인에서 도메인+ID 일치 — 없으면 CLARIFY 로 끝내고 파일을 만들지 않는다. 같은 파일이 있으면 거부.
4. **뼈대**: frontmatter(id·title·status Draft·parent·evidence `none — 착수 전`·closed_by []·version) + 필수 3절(어답터 표기는 `sections` 맵의 **첫 별칭**, 없으면 상류 표기 — [PRO-28] §7 잠정) + 선택 절 안내 주석 1줄. 성공 바 **≤400 tok**.
5. slug 는 ZFS 문법(`[a-z][a-z0-9_]*`): `--slug` 우선, 없으면 ASCII 제목에서 파생, 비ASCII 제목만이면 묻는다(CLARIFY). WO 외 도메인은 미지원 명시(요구가 생기면 확장).

## 수용 기준
- 단위 테스트 **먼저**([ADR-40]): 채번(산술 4 · 레거시 1) · parent 실존 3 · 절 이름 2 · slug 4 · 뼈대(상한·필드·발행 린트 통과 맵 유무) · 임시 루트 CLI(dry-run 무쓰기 · --write · 네이밍 통과 · 다음 번호 · 재작성 거부 · 죽은 parent · 비ASCII · 도메인 미지원 · --json · --contract).
- 상류 자신에서 `--parent PRO-28` 제안이 기존 ID 와 안 겹친다. 어답터 팔 7 형상 충족. 카드 [TOOL-36] 신설 · `sprint/_GUIDE` 발행 절 · MIGRATION · CHANGELOG · 매니페스트·tools-index 블록 재생성.

## 절차
1. 테스트 먼저 → 2. scaffold.js → 3. 카드·문서·생성 블록 → 4. (다음 WO) `upward-fetch --sections` → 센서스 4회차.

## 증거
- 테스트: `scripts/scaffold.test.js`(신설 39 — 계약 · proposeId 산술 4/레거시 1 · findParent 4 · sectionNames 2 · slugOf 4 · renderBody 상한/필드/발행 린트/별칭 맵 · 임시 루트 CLI 11 · 상류 제안 1).
  기대값 1건은 작성 중 정정 — 뼈대의 frontmatter `evidence:` 가 맵 없이도 증거 절을 충족하는 것이 맞다([WO-28a-1] 규칙). 스위트 49 중 47(실패 2 = 미커밋 fdt spike 귀속). 팔 7 형상 충족.
- 상류 dry-run: `scaffold WO --parent PRO-28` → `28a-3` 제안(산술, 기존 28a-1·28a-2 와 안 겹침), 뼈대 ≪400 tok.
- 설계 결정: 번호는 **제안**이지 예약이 아니다(동시 발행은 사람이 조정) · 본문은 비워 둔다([ADR-12]) · 상류 자신의 실제 WO 는 누설 가드 마커 관행을 따로 지킨다(뼈대는 마커를 넣지 않는다 — 어답터는 private 로 강등).
- 문서: 카드 [TOOL-36] · `sprint/_GUIDE` §Anatomy 에 "복사 말고 scaffold" · MIGRATION §Adopter configuration · CHANGELOG · ship-manifest(배송 85) · AGENTS.md tools-index 블록.
- 다음([PRO-28] 순서): ③ `upward-fetch --sections` 부분 인출 → 센서스 4회차(맵 적용 뒤 매칭률).
