<!-- [Wiki] 작업 지시. 상태 정본은 이 frontmatter `status:` 하나뿐이다([PRO-15]). scaffold 생성([TOOL-36]) — 선택 절(배경·설계·절차)은 필요할 때만 추가. -->
---
id: WO-28a-4
title: 절 계약 — 센서스 4회차: 필수 절 매칭률 열(활성 WO 기준, 읽기 전용) + 회차 기록 — [PRO-28] §6 성공 바
status: Verifying
parent: PRO-28
evidence: "구현 완료(2026-10-17, 가드 먼저): adopter-census measure.sections {active, goal, accept, evidence, complete}(work-close.parseWo 의 missingSections — 별칭 맵·evidence 충족 반영, 활성 WO = statusMap 적용 뒤 Draft/Active/Verifying) · 익명 열 '필수 절 매칭(활성 WO)' · 4회차 기록(eval/CENSUS.md). rcpt:n/a — 하네스 스위트(adopter-census 33) · 스위트 50 중 48(실패 2 = fdt spike 귀속) · 팔 7 형상 충족. 실측: A 활성 16 → 목표 88% · 수용 기준 88% · 증거 75% · B 활성 77 → 82/86/100% · C 활성 153 → 73/78/81%. 성공 바 90% 는 A·C 미달 — 판정은 사람"
closed_by: [.union-stack/reference/tools/TOOL-30_adopter_census.md, eval/CENSUS.md]
version: 1.0
---
# [WO-28a-4] 센서스 4회차 — 필수 절 매칭률

## 목표
[PRO-28] §6 성공 바("맵 적용 뒤 A·C 필수 절 매칭률 ≥90%")를 어답터 보고가 아니라 **센서스가 기계로** 잰다. 기준은 **활성 WO**(statusMap 적용 뒤 Draft/Active/Verifying — 레거시 종결분은 대상 밖,
어답터 A·C 왕복에서 합의). 읽기 전용([TOOL-30] 불변식) — `work-close.parseWo` 가 이미 별칭 맵·evidence 충족을 반영한 `missingSections` 를 그대로 센다.

범위: ① `adopter-census` measure 에 `sections {active, goal, accept, evidence, complete}` ② 익명 열 "필수 절 매칭(활성 WO)" (예시: `활성 150 · 목표 65% · 수용 기준 43% · 증거 63% · 3절 충족 79`)
③ 4회차 `--write` 기록 + 3회차 대비 Δ ④ 성공 바 판정은 사람([ADR-12] — 센서스는 숫자만).

## 수용 기준
- 테스트 먼저([ADR-40]): 픽스처(활성 1 · 3절 완비) 의 raw/익명 행. 4회차 행 3곳 기록. 카드 [TOOL-30] · CHANGELOG. 어답터 레포 쓰기 0.

## 증거
- 테스트: adopter-census.test +2(raw sections · 익명 열). 스위트 50 중 48(실패 2 = 미커밋 fdt spike 귀속). 팔 7 형상 충족.
- **4회차 실측(활성 WO 기준)**: A 16 → 목표 88% · 수용 기준 88% · 증거 75% · 3절 충족 10 | B 77 → 82% · 86% · 100% · 62 | C 153 → 73% · 78% · 81% · 80.
  3회차 대비 Δ: 계측기 3곳 9/9 유지 · C 상태 어휘 48종 → statusMap 49키로 Closed 269·Verifying 97·Active 30·Draft 26(미매핑은 (없음) 18 = status 부재) · A 자기 보고(14/16·14/16·12/16)와 일치 ·
  C 는 자기 보고(65/43/63%)보다 높다 — 첫 토큰 괄호 분리(df10583) 로 활성 집합이 150→153 이고 매칭 규칙이 C 측정 뒤 갱신됐기 때문.
- **성공 바 판정 재료**: 90% 는 A·C 미달(A 는 각 1건 — 헤딩 겸용·절 부재, 규칙 밖; C 는 별칭 후보 남음 + 상류 표기가 아닌 레거시 활성분). B(상류 표기)는 증거 100%·수용 기준 86%.
  판정은 사람 — 바를 85% 로 낮추는 것보다 "잔여 원인 분류(규칙 밖/별칭/문서)" 를 다음 회차 열로 두는 것이 정직하다는 의견.
- 읽기 전용 불변식 유지(측정 뒤 레포 파일 쓰기 0 — 테스트 스냅샷 검사).
