<!-- [Wiki] 작업 지시. 상태 정본은 이 frontmatter `status:` 하나뿐이다([PRO-15]). -->
---
id: WO-27a-2
title: 교차 레포 전제 — ② 상태 어휘 매핑(adapter.json statusMap·evidenceFields) + frontmatter 백필 스크립트(dry-run 기본)
status: Closed
parent: PRO-27
evidence: "구현 완료(2026-10-16, 가드 먼저): adapter(statusMap·evidenceFields 파싱·경고 · mapStatus/fieldAliases) · zfs_index.buildIndex 가 매핑 status + rawStatus · work-close.parseWo 별칭·매핑 · scripts/frontmatter-backfill.js(dry-run 기본 · 본문 표식→종결 디렉터리→비움 · --apply 는 status: 한 줄 · --root) · 어답터 팔 형상 vocab(4 바 충족) · 상류 자신: adapter.json 부재에서 출력 동일 · 백필 대상 0. 카드 [TOOL-29] 신설 · [TOOL-21]·[TOOL-23]·[TOOL-26] 갱신 · MIGRATION/CHANGELOG. 잔여: [WO-27a-3](③) 발행 · rcpt:n/a — 소급 없음([PRO-22] 단계 2 이전 발행) · Closed 판정 2026-10-17(인간 승인)"
closed_by: [.union-stack/reference/tools/TOOL-26_adopter_arm.md, .union-stack/reference/tools/TOOL-29_frontmatter_backfill.md]
version: 1.0
---
# [WO-27a-2] 교차 레포 전제 — ② 상태 어휘 매핑 + 백필

## 목표
[PRO-27] v1.0 §3 ② 를 구현한다. 상류 도구가 어답터의 **로컬 상태 어휘**(`Done`·`Review`·산문 상태)와 **증거 필드 별칭**을 매핑으로 읽게 하고,
frontmatter 없는 WO·PRO 를 백필할 스크립트를 dry-run 기본으로 준다. 적용과 커밋은 어답터 몫([PRO-27] §5). [WO-27a-1] 의 후속이며
[WO-27a-3](③ 계보)과 [PRO-24] ② census · [PRO-25] 트리거의 전제다.

범위:
1. **`adapter.json` 키 2** — `statusMap`(로컬 → 상류 어휘 객체) · `evidenceFields`(상류 필드 → 로컬 별칭 배열). 알 수 없는 값·형식은 경고([ADR-29] 문법).
2. **읽기 시 매핑(로직 1벌)** — `zfs_index.buildIndex(root)` 와 `work-close.parseWo` 가 매핑된 `status` 와 원문 `rawStatus` 를 함께 낸다.
   소비처(query LOCKED · health · dashboard · roadmapWiring)는 손대지 않는다 — 색인이 매핑하면 전부 따라온다. 상류 enum 을 강제하지 않는다.
3. **`scripts/frontmatter-backfill.js`** — `status:` 없는 WO·PRO 를 나열(본문 표식 → 종결 디렉터리 → 비움+보고), `--apply` 는 추정값 있는 행에
   `status:` **한 줄만** 삽입. 로컬 어휘 그대로(매핑은 읽기 시). `--root` 지원. 새 게이트 계약([PRO-11]) — PASS/CLARIFY, REJECT 없음.
4. 어답터 팔([TOOL-26]) 형상 `vocab` — 로컬 어휘 WO + 별칭 증거 + frontmatter 없는 WO·PRO + 종결 디렉터리 문서. 성공 바: `Done` 이 Closed 로
   집계 · 별칭 증거 읽힘 · dry-run 목록 n 건 + 쓰기 0 · `--apply` 뒤 대상 0.

## 수용 기준
- 단위 테스트 **먼저**([ADR-40]): adapter(키 파싱·경고) · zfs_index(매핑·rawStatus) · work-close(parseWo 매핑·별칭) · frontmatter-backfill(추정 순서·삽입 위치·dry-run 무쓰기·apply).
- 상류 자신: 매핑 없음(`adapter.json` 부재)에서 모든 출력이 이전과 동일 · 백필 dry-run 대상 0.
- 카드 [TOOL-29] 신설 · [TOOL-23]·[TOOL-26] 행 갱신 · `MIGRATION.md` §Adopter configuration 키 2 추가 · CHANGELOG. AGENTS.md 는 tools-index 블록만 재생성.

## 절차
1. 테스트 먼저 → 2. adapter 키 → 3. zfs_index·work-close 매핑 → 4. 백필 스크립트 → 5. 팔 형상 `vocab` → 6. 카드·문서 → 7. [WO-27a-3](③) 발행.

## 증거
- 테스트: `scripts/frontmatter-backfill.test.js`(신설, 21) · adapter(+14) · zfs_index(+3) · work-close(+7) · adopter-arm(+4) — 전부 녹색.
  스위트 40 중 38 통과, 실패 2 = 미커밋 fdt spike 귀속(leakage·ref — 이전과 동일). lint 체인 15종 중 leakage 외 전부 exit 0.
- 어답터 팔 `vocab`: Done → Closed(work-close·색인) · 별칭 증거(evidence=abc123 · closed_by 1) · 백필 dry-run 3건 나열 + 쓰기 0 · `--apply` 뒤 대상 0,
  삽입값 Review 는 매핑으로 Verifying. 5 형상(env·data·legacy·serial·vocab) 성공 바 전부 충족.
- 상류 자신: `adapter.json` 부재 → statusMap {} 이라 모든 상태가 그대로(work-close 표·health·upward-fetch 출력 동일) · 백필 dry-run 대상 0 · PASS.
- 경계: 상류는 dry-run 과 스크립트까지([PRO-27] §5). `--apply` 는 추정값 있는 행만, 값은 로컬 어휘 그대로 — 매핑은 읽기 시.
