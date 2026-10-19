<!-- [Raw/집계] 어답터 센서스([PRO-24] ②) — `node scripts/adopter-census.js --write` 가 회차를 마커 아래에 append 한다. 손으로 고치지 마라.
     익명 집계만: 레포 = 라벨(A·B·C — 입도는 인간 결정), 경로·제목·파일명 0, status 는 첫 토큰. 원자료(경로 포함)는 eval/private/(gitignore). -->
# Adopter Census

회수층([PRO-24] ②)의 기록. 상류가 이 머신의 형제 레포를 **읽기 전용**으로 재서(상류 도구를 `root` 인자로 — 어답터 스크립트 실행 0 ·
문서 본문 읽기 0 · 어답터 파일 쓰기 0) 익명 행을 남긴다. 사람 왕복 0. 주기: 상류 릴리스마다 + 설문 회수 시([PRO-24] §7-1 잠정).

열 읽는 법 — **버전/앵커**: CHANGELOG 헤딩 · `template-sync.json` ref 와 날짜(없음 = 손 이식·0회 동기화). **계측기**: 상류 도구 10종 중 존재 수.
**WO·상태**: 첫 토큰 분포(어답터 `statusMap` 적용 후). **백필 대상**: `status:` 없는 WO·PRO([TOOL-29]). **상류 ID 충돌**: 상류 색인과 같은 `DOMAIN-ID`
수([PRO-27] ① — `up:` 접두가 필요한 이유). **arithmeticFrom**: 현재 설정 → 제안(같은 번호에 PLAN·PRO 가 둘 다 있는 구간의 최댓값+1, [PRO-27] §7-3).
**upward-fetch**: 활성 WO 중 계보 맥락 0건(CLARIFY). **upstream_candidate**: `upstream_candidate: true` PRO 의 ID·개수만([PRO-24] ③(a)).
**필수 절 매칭(활성 WO)**: 활성 WO(statusMap 적용 뒤 Draft/Active/Verifying) 중 목표·수용 기준·증거가 별칭 맵·frontmatter evidence 로 해소된 비율과 3절 충족 수([WO-28a-4], [PRO-28] §6 성공 바 재료). 레거시 종결분은 대상 밖.
판정·점수 없음 — 다음 회차와의 Δ 가 신호다.

<!-- census:rows -->

### 2026-10-19 — 상류 6.0.0 @ 72e6590 · 레포 3

| 레포 | 버전 / 앵커 | 동기화 지연(파일) | 계측기 | 문서 | WO · 상태(첫 토큰) | WO H2 헤딩(상위 8) | 필수 절 매칭(활성 WO) | 잔여 원인 | evidence | 백필 대상 | 중복 ID | 상류 ID 충돌 | arithmeticFrom | upward-fetch | upstream_candidate | adapter.json | health | ADR | 평면 KB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| A | 6.0.0 / 앵커 main @ 2026-10-19 | 지연 2 / 앵커 80 · 자기 확인 업데이트 있음 @ 2026-10-19 | 9/9 | 469 (WO 199 · ANL 111 · PRO 43 · MTG 34 · PLAN 32 · LSN 19) | 199 · frontmatter 없음 105 · Closed 57 · Completed 14 · Active 13 · Planned 6 · Verifying 3 · Review 1 | 검증 31 · 실행 기록 20 · 실행 체크리스트 18 · 목적·진입 조건 14 · 검증·실행 출발점 13 · 변경 owner·재사용 출발점 13 · 수행 범위 13 · 완료 기준 13 · 외 752종 1081건 | 활성 16 · 목표 88% · 수용 기준 88% · 증거 75% · 3절 충족 10 | H2 없음 1 · 절 부재 0 · 별칭 후보 2 · evidence 소급 4 — 미해소 헤딩: 2026-09-20 G0 완료(1) · 2026-09-20 G1 구현 완료(1) · 2026-09-20 G2 구현 완료(1) · 2026-09-20 G3 정본 등록 완료(1) · 2026-09-21 G4 등록 완료·G5 착수(1) · 2026-09-21 G4 진행(1) · 구현(1) · 다음 단계(1) · 외 3종 | 값 0 · none 0 · 없음 94 · closed_by 0 | 107 (추정 가능 9) | 2 (네이밍 위반 2) | 21 | 0 → 제안 67 (PLAN·PRO 동번호 5구간) | 3/16 공백 | 0 | statusMap 1 · evidenceFields 없음 | FAIL 2 (naming gate · leakage gate) | 0 | 6256 |
| B | 6.0.0 / 앵커 main @ 2026-10-19 | 지연 12 / 앵커 149 · 상류 삭제 10 · review 이력 밖 5(덮어쓰기 없음) · 자기 확인 업데이트 있음 @ 2026-10-19 | 9/9 | 482 (WO 257 · PLAN 85 · ANL 43 · MTG 37 · TOOL 20 · PRO 17) | 257 · frontmatter 없음 0 · Closed 202 · Verifying 31 · Active 13 · Draft 6 · Done 5 | 수용 기준 228 · 증거 228 · 목표 215 · 계보 82 · 범위 49 · 판단 기록 27 · 범위 밖 20 · 상위 축 (닫을 때 되쓸 곳) 15 · 외 124종 239건 | 활성 50 · 목표 86% · 수용 기준 94% · 증거 100% · 3절 충족 43 | H2 없음 0 · 절 부재 0 · 별칭 후보 7 · evidence 소급 0 — 미해소 헤딩: 계보(3) · 상위 축 (닫을 때 되쓸 곳)(3) · 범위 밖(2) · 현행(2) · 결정·구현(1) · 근거 (2026-08-21 실측)(1) · 남은 일 (Verifying → Closed)(1) · 방안(1) · 외 9종 | 값 250 · none 7 · 없음 0 · closed_by 207 | 17 (추정 가능 9) | 0 (네이밍 위반 0) | 43 | 0 → 제안 19 (PLAN·PRO 동번호 17구간) | 0/50 공백 | 0 | statusMap 0 · evidenceFields 없음 · private | FAIL 0 | 165 | 7269 |
| C | 6.0.0 / 앵커 main @ 2026-10-19 | 지연 0 / 앵커 91 · 자기 확인 업데이트 있음 @ 2026-10-19 | 9/9 | 644 (WO 440 · ANL 69 · PRO 47 · EVD 35 · PLAN 21 · MTG 15) | 440 · frontmatter 없음 0 · Closed 270 · Verifying 97 · Active 29 · Draft 26 · (없음) 18 | 수용 기준 203 · 비목표 133 · 진행 97 · 문제 56 · 검증 51 · 진행 기록 51 · 목적 49 · 상태 43 · 외 1293종 2166건 | 활성 152 · 목표 73% · 수용 기준 78% · 증거 82% · 3절 충족 80 | H2 없음 4 · 절 부재 0 · 별칭 후보 53 · evidence 소급 28 — 미해소 헤딩: 비목표(16) · 리스크 / 주의(9) · 배경(6) · 상태(6) · 진행 기록(5) · 비목표 / 잔여(4) · 추출 대상 (실측)(4) · 구현 (완료)(3) · 외 175종 | 값 248 · none 0 · 없음 192 · closed_by 0 | 18 (추정 가능 0) | 0 (네이밍 위반 0) | 28 | 999 → 제안 22 (PLAN·PRO 동번호 18구간) | 22/92 공백 | 0 | statusMap 49 · evidenceFields evidence · private | FAIL 0 | 1 | 5359 |


### 2026-10-17 — 상류 6.0.0 @ b08d93f · 레포 3

| 레포 | 버전 / 앵커 | 계측기 | 문서 | WO · 상태(첫 토큰) | WO H2 헤딩(상위 8) | 필수 절 매칭(활성 WO) | evidence | 백필 대상 | 중복 ID | 상류 ID 충돌 | arithmeticFrom | upward-fetch | upstream_candidate | adapter.json | health | ADR | 평면 KB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| A | 6.0.0 / 앵커 main @ 2026-10-16 | 9/9 | 436 (WO 180 · ANL 98 · PRO 43 · MTG 34 · PLAN 32 · LSN 18) | 180 · frontmatter 없음 100 · Closed 57 · Active 13 · Planned 6 · Verifying 3 · Review 1 | 검증 31 · 실행 기록 20 · 실행 체크리스트 18 · 목적·진입 조건 14 · 검증·실행 출발점 13 · 변경 owner·재사용 출발점 13 · 수행 범위 13 · 완료 기준 13 · 외 739종 1037건 | 활성 16 · 목표 88% · 수용 기준 88% · 증거 75% · 3절 충족 10 | 값 0 · none 0 · 없음 80 · closed_by 0 | 102 (추정 가능 9) | 2 (네이밍 위반 2) | 21 | 0 → 제안 67 (PLAN·PRO 동번호 5구간) | 3/16 공백 | 0 | statusMap 1 · evidenceFields 없음 | FAIL 2 (naming gate · leakage gate) | 0 | 6054 |
| B | 6.0.0 / 앵커 main @ 2026-10-17 | 9/9 | 468 (WO 244 · PLAN 85 · ANL 41 · MTG 37 · TOOL 22 · PRO 17) | 244 · frontmatter 없음 0 · Closed 162 · Verifying 49 · Active 15 · Draft 13 · Done 5 | 증거 211 · 수용 기준 208 · 목표 196 · 계보 81 · 범위 49 · 판단 기록 27 · 범위 밖 20 · 상위 축 (닫을 때 되쓸 곳) 15 · 외 121종 235건 | 활성 77 · 목표 82% · 수용 기준 86% · 증거 100% · 3절 충족 62 | 값 230 · none 14 · 없음 0 · closed_by 169 | 17 (추정 가능 9) | 0 (네이밍 위반 0) | 45 | 0 → 제안 19 (PLAN·PRO 동번호 17구간) | 0/77 공백 | 0 | statusMap 0 · evidenceFields 없음 · private | FAIL 0 | 165 | 7069 |
| C | 6.0.0 / 앵커 main @ 2026-10-17 | 9/9 | 644 (WO 440 · ANL 69 · PRO 47 · EVD 35 · PLAN 21 · MTG 15) | 440 · frontmatter 없음 0 · Closed 269 · Verifying 97 · Active 30 · Draft 26 · (없음) 18 | 수용 기준 203 · 비목표 133 · 진행 97 · 문제 56 · 검증 51 · 진행 기록 51 · 목적 49 · 상태 43 · 외 1292종 2165건 | 활성 153 · 목표 73% · 수용 기준 78% · 증거 81% · 3절 충족 80 | 값 247 · none 0 · 없음 193 · closed_by 0 | 18 (추정 가능 0) | 0 (네이밍 위반 0) | 27 | 999 → 제안 22 (PLAN·PRO 동번호 18구간) | 22/92 공백 | 0 | statusMap 49 · evidenceFields evidence · private | FAIL 0 | 1 | 5342 |


### 2026-10-16 — 상류 6.0.0 @ da9cf67 · 레포 3

| 레포 | 버전 / 앵커 | 계측기 | 문서 | WO · 상태(첫 토큰) | WO H2 헤딩(상위 8) | evidence | 백필 대상 | 중복 ID | 상류 ID 충돌 | arithmeticFrom | upward-fetch | upstream_candidate | adapter.json | health | ADR | 평면 KB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| A | 6.0.0 / 앵커 main @ 2026-10-16 | 9/9 | 435 (WO 179 · ANL 98 · PRO 43 · MTG 34 · PLAN 32 · LSN 18) | 179 · frontmatter 없음 99 · Done 57 · Active 13 · Planned 6 · Verifying 3 · Review 1 | 검증 31 · 실행 기록 20 · 실행 체크리스트 18 · 목적·진입 조건 14 · 검증·실행 출발점 13 · 변경 owner·재사용 출발점 13 · 수행 범위 13 · 완료 기준 13 · 외 737종 1035건 | 값 0 · none 0 · 없음 80 · closed_by 0 | 101 (추정 가능 9) | 2 (네이밍 위반 2) | 21 | 0 → 제안 67 (PLAN·PRO 동번호 5구간) | 3/16 공백 | 0 | 없음 | FAIL 2 (naming gate · leakage gate) | 0 | 6052 |
| B | 6.0.0 / 앵커 main @ 2026-10-16 | 9/9 | 454 (WO 233 · PLAN 83 · ANL 41 · MTG 36 · TOOL 22 · PRO 17) | 233 · frontmatter 없음 0 · Closed 151 · Verifying 49 · Active 15 · Draft 13 · Done 5 | 증거 201 · 수용 기준 198 · 목표 186 · 계보 77 · 범위 49 · 판단 기록 27 · 범위 밖 20 · 상위 축 (닫을 때 되쓸 곳) 15 · 외 118종 232건 | 값 219 · none 14 · 없음 0 · closed_by 162 | 17 (추정 가능 9) | 0 (네이밍 위반 0) | 45 | 0 → 제안 19 (PLAN·PRO 동번호 17구간) | 0/77 공백 | 0 | statusMap 0 · evidenceFields 없음 · private | FAIL 0 | 165 | 7000 |
| C | 6.0.0 / 앵커 main @ 2026-10-16 | 9/9 | 643 (WO 439 · ANL 69 · PRO 47 · EVD 35 · PLAN 21 · MTG 15) | 439 · frontmatter 없음 0 · Complete 75 · Verified-local 59 · Verified 40 · Published 28 · Proposed 19 · Closed 19 · (없음) 18 · Implemented 17 · 외 48종 164건 | 수용 기준 203 · 비목표 133 · 진행 97 · 문제 56 · 검증 51 · 진행 기록 51 · 목적 49 · 상태 43 · 외 1289종 2161건 | 값 247 · none 0 · 없음 192 · closed_by 0 | 18 (추정 가능 0) | 1 (네이밍 위반 0) | 26 | 999 → 제안 22 (PLAN·PRO 동번호 18구간) | 0/2 공백 | 0 | statusMap 0 · evidenceFields evidence · private | FAIL 1 (naming gate) | 1 | 5317 |


### 2026-10-16 — 상류 6.0.0 @ 703470a · 레포 3

| 레포 | 버전 / 앵커 | 계측기 | 문서 | WO · 상태(첫 토큰) | evidence | 백필 대상 | 중복 ID | 상류 ID 충돌 | arithmeticFrom | upward-fetch | upstream_candidate | adapter.json | health | ADR | 평면 KB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| A | CHANGELOG 없음 / 앵커 없음 | 2/10 — 없음: health · work-close · template-update · ci · frontmatter-backfill · transcript-stats · session-friction · adopter-arm | 435 (WO 179 · ANL 98 · PRO 43 · MTG 34 · PLAN 32 · LSN 18) | 179 · frontmatter 없음 99 · Done 57 · Active 13 · Planned 6 · Verifying 3 · Review 1 | 값 0 · none 0 · 없음 80 · closed_by 0 | 101 (추정 가능 9) | 2 (네이밍 위반 2) | 21 | 0 → 제안 67 (PLAN·PRO 동번호 5구간) | 3/16 공백 | 0 | 없음 | FAIL 2 (naming gate · leakage gate) | 0 | 6052 |
| B | 6.0.0 / 앵커 main @ 2026-10-16 | 10/10 | 450 (WO 229 · PLAN 83 · ANL 41 · MTG 36 · TOOL 22 · PRO 17) | 229 · frontmatter 없음 0 · Closed 147 · Verifying 49 · Active 15 · Draft 13 · Done 5 | 값 215 · none 14 · 없음 0 · closed_by 158 | 17 (추정 가능 9) | 0 (네이밍 위반 0) | 45 | 0 → 제안 19 (PLAN·PRO 동번호 17구간) | 0/77 공백 | 0 | statusMap 0 · evidenceFields 없음 · private | FAIL 0 | 165 | 6974 |
| C | CHANGELOG 없음 / 앵커 없음 | 3/10 — 없음: work-close · template-update · ci · frontmatter-backfill · transcript-stats · session-friction · adopter-arm | 642 (WO 438 · ANL 69 · PRO 47 · EVD 35 · PLAN 21 · MTG 15) | 438 · frontmatter 없음 0 · Complete 75 · Verified-local 59 · Verified 40 · Published 27 · Proposed 19 · Closed 19 · (없음) 18 · Implemented 17 · 외 48종 164건 | 값 0 · none 0 · 없음 438 · closed_by 0 | 18 (추정 가능 0) | 1 (네이밍 위반 0) | 26 | 0 → 제안 22 (PLAN·PRO 동번호 18구간) | 0/2 공백 | 0 | 없음 | FAIL 2 (naming gate · leakage gate) | 1 | 5301 |


### 2026-10-16 — 상류 6.0.0 @ 4bfaf4f · 레포 3

| 레포 | 버전 / 앵커 | 계측기 | 문서 | WO · 상태(첫 토큰) | evidence | 백필 대상 | 중복 ID | 상류 ID 충돌 | arithmeticFrom | upward-fetch | upstream_candidate | adapter.json | health | ADR | 평면 KB |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| A | CHANGELOG 없음 / 앵커 없음 | 2/10 — 없음: health · work-close · template-update · ci · frontmatter-backfill · transcript-stats · session-friction · adopter-arm | 435 (WO 179 · ANL 98 · PRO 43 · MTG 34 · PLAN 32 · LSN 18) | 179 · frontmatter 없음 99 · Done 57 · Active 13 · Planned 6 · Verifying 3 · Review 1 | 값 0 · none 0 · 없음 80 · closed_by 0 | 101 (추정 가능 9) | 2 (네이밍 위반 2) | 21 | 0 → 제안 67 (PLAN·PRO 동번호 5구간) | 3/16 공백 | 0 | 없음 | FAIL 2 (naming gate · leakage gate) | 0 | 6052 |
| B | 6.0.0 / 앵커 main @ 2026-08-20 | 8/10 — 없음: ci · frontmatter-backfill | 448 (WO 228 · PLAN 83 · ANL 41 · MTG 36 · TOOL 22 · PRO 17) | 228 · frontmatter 없음 0 · Closed 146 · Verifying 49 · Active 15 · Draft 13 · Done 5 | 값 214 · none 14 · 없음 0 · closed_by 157 | 17 (추정 가능 9) | 0 (네이밍 위반 0) | 45 | 0 → 제안 19 (PLAN·PRO 동번호 17구간) | 0/77 공백 | 0 | statusMap 0 · evidenceFields 없음 · private | FAIL 0 | 165 | 6964 |
| C | CHANGELOG 없음 / 앵커 없음 | 3/10 — 없음: work-close · template-update · ci · frontmatter-backfill · transcript-stats · session-friction · adopter-arm | 642 (WO 438 · ANL 69 · PRO 47 · EVD 35 · PLAN 21 · MTG 15) | 438 · frontmatter 없음 0 · Complete 75 · Verified-local 59 · Verified 40 · Published 27 · Proposed 19 · Closed 19 · (없음) 18 · Implemented 17 · 외 48종 164건 | 값 0 · none 0 · 없음 438 · closed_by 0 | 18 (추정 가능 0) | 1 (네이밍 위반 0) | 26 | 0 → 제안 22 (PLAN·PRO 동번호 18구간) | 0/2 공백 | 0 | 없음 | FAIL 2 (naming gate · leakage gate) | 1 | 5301 |

