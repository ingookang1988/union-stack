<!-- [Wiki] 작업 지시. 상태 정본은 이 frontmatter `status:` 하나뿐이다([PRO-15]). -->
---
id: WO-24b-1
title: 어답터 연결 ② 회수층 — adopter-census(형제 레포 읽기 전용 계측 → eval/CENSUS.md 익명 행) 구현 + 1회차 실측
status: Verifying
parent: PRO-24
evidence: "구현 완료 + 1회차 실측(2026-10-16): scripts/adopter-census.js([TOOL-30], 새 게이트 계약 PASS/CLARIFY · 상류 도구를 root 인자로 · 어답터 스크립트 실행 0 · 본문 읽기 0 · 쓰기 0) → eval/CENSUS.md 1회차 레포 3 행(익명) + eval/private/census/ 원자료(gitignore). 테스트 26(읽기 전용 스냅샷 · 익명성 · 추정 순수) · 팔 vocab 바 2(경로·제목 0 · 사본 변경 0). 1회차 발견: 산문 status(Done (날짜))가 statusMap 을 비껴가 첫 토큰 폴백 추가 · 상태 어휘 60종 레포가 있어 분포 상위 8종으로 캡. [PRO-24] §7 입력: 주기 = 릴리스마다+설문 시, 원자료 = gitignored eval/private/"
closed_by: []
version: 1.0
---
# [WO-24b-1] 어답터 연결 ② 회수층 — adopter-census

## 목표
[PRO-24] v1.0 §3 ② 를 구현한다. [PRO-27] 다섯 전제([WO-27a-1·2·3])가 갖춰졌으므로 상류 도구를 `root` 인자로 형제 레포에 돌려 **익명 집계 행**을
`eval/CENSUS.md` 에 남긴다. 사람 왕복 0 · 어답터 변경 0(§6 성공 바 첫 줄).

범위:
1. **`scripts/adopter-census.js`** — 입력: 비공개 목록 `eval/private/census-repos.json`(gitignore, `{repos:[{label,path}]}`). 읽는 것: health(gather) ·
   CHANGELOG 헤딩 · `template-sync.json` · 계측기 존재(실행 0) · WO status 첫 토큰 분포(statusMap 적용) · evidence 기입률(별칭 적용) · 백필 대상 ·
   중복 ID · 상류 ID 충돌 · arithmeticFrom 추정([PRO-27] §7-3) · upward-fetch 공백률 · `upstream_candidate` PRO(ID·개수). 출력: 원자료 JSON(비공개) +
   `eval/CENSUS.md` 회차 append(마커 아래 최신 위). 새 게이트 계약 PASS/CLARIFY.
2. **결정(§3 ② 대비 강화)**: 어답터의 `scripts/health.js` 를 **실행하지 않는다** — PRO 원문은 "있으면 그 레포의 health" 였으나 읽기 전용 원칙을
   기계로 지키려면 상류 도구만 돌리는 편이 맞다(존재는 계측기 열에 기록).
3. **익명성 불변식**: 행에 경로·제목·파일명 0(파일명이 제품명 — §9 ②). 테스트와 어답터 팔이 기계로 검사.
4. **1회차 실측**: 이 머신의 어답터 3곳(라벨 A·B·C — 비공개 메모리의 매핑)을 재서 첫 회차를 남긴다.

## 수용 기준
- 단위 테스트 **먼저**([ADR-40]): 순수(statusHead · arithmeticFrom 추정 · upstream_candidate · 렌더 · append) + 임시 어답터 픽스처 측정(읽기 전용 스냅샷 동일 ·
  어답터 스크립트 미실행 · 익명 행에 경로·제목·파일명 0).
- 어답터 팔([TOOL-26]) `vocab` 형상에 바 2: 사본을 센서스가 재고 행에 사본 경로·제목 0 · 센서스 뒤 사본 변경 0.
- 1회차: `eval/CENSUS.md` 에 레포 3 행. 카드 [TOOL-30] · [TOOL-26] 갱신 · `.gitignore` 에 `eval/private/` · CHANGELOG.

## 절차
1. 테스트 먼저 → 2. 스크립트 → 3. 팔 바 → 4. 카드·문서·gitignore → 5. 1회차 실측(`--write`) → 6. 결과를 [PRO-24] §7 미결(주기·원자료 보관)에 입력.

## 증거
- 테스트: `scripts/adopter-census.test.js`(신설, 26) · adapter(+2, 첫 토큰 폴백). 스위트 41 중 39 통과, 실패 2 = 미커밋 fdt spike 귀속(이전과 동일).
  lint 체인 15종 중 leakage 외 전부 exit 0.
- 어답터 팔 `vocab`: 센서스가 사본을 재고 행에 사본 경로·제목·파일명 0 · 센서스 뒤 사본 변경 0 — 5 형상 성공 바 전부 충족.
- 1회차(`eval/CENSUS.md`): 레포 3 행, 사람 왕복 0, 어답터 변경 0([PRO-24] §6 첫 바). 공개 행에 레포 이름·경로 0(스캔). 설문 사실과 일치 —
  A: frontmatter 없음 99/179 · 계측기 2/10 · 앵커 없음 / B: 앵커 main@2026-08-20 · evidence 값 214 / C: 상태 어휘 60종 · evidence 키 0/438.
  새로 보인 것: 상류 ID 충돌 A 21 · B 45 · C 26([PRO-27] ① 필요성의 수치) · arithmeticFrom 제안 A 67 · B 19 · C 22 · 백필 대상 A 101 · B 17 · C 18.
- 1회차가 고친 것 둘: `mapStatus` 첫 토큰 폴백(산문 status) · 상태 분포 상위 8종 캡(어휘 자체의 누설 표면). 둘 다 테스트로 고정.
