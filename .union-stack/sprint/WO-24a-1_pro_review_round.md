<!-- [Wiki] 작업 지시. 상태 정본은 이 frontmatter `status:` 하나뿐이다([PRO-15]). -->
---
id: WO-24a-1
title: 초안 검토 회수(어답터 3곳 · claude 3 + antigravity 1) → [PRO-24]·[PRO-25]·[PRO-26] 미결 판정 입력 + 판단층 비용 실측
status: Verifying
parent: PRO-24
evidence: "답변 4/4 회수(2026-10-15, claude×3 + antigravity×1) → eval/SURVEY-02_results.md(익명 집계 · 상류 재검증 5건) · [PRO-24]·[PRO-25]·[PRO-26] v0.2 §8/§9 반영 · 전제 0단계 [PRO-27] 분리 · [WO-22b-1] 0건 3분할 반영 · 비용 실측(세션 4 · 에이전트 90분 · 당일 회수). 절차 3 완료: 네 PRO 일괄 승인([ADR-54], 2026-10-15) + [WO-27a-1] 발행. 잔여: 하류 spike 처분(인간 지시)"
closed_by: []
version: 1.0
---
# [WO-24a-1] 초안 검토 회수

## 목표
[PRO-24]·[PRO-25]·[PRO-26] 초안과 [PRO-22] v1.0 스키마에 대해 **받는 쪽(어답터 3곳)의 실측과 반론**을 받아 각 PRO §7 미결의
판정 입력으로 쓴다. 정본은 `eval/SURVEY-02_pro_review.md`. 이 회차는 [PRO-24] ③ 판단층(제안 환류·단축 설문)의 **첫 실행**이므로
사람 왕복 수·소요 시간을 함께 기록해 PRO-24 의 비용 주장을 검증한다. 도구는 claude(상주) 3곳 + antigravity 1곳(인간 결정
2026-10-15 — 설계 검토는 그 레포를 아는 쪽이, 니모닉의 냉독 효과는 처음 보는 쪽이 유리). 대상은 예시 아님 — 실어답터 3곳이며
이름은 비공개 메모리에만 있다([ADR-11]). 답변은 입력이지 승인이 아니다([ADR-12]).

> **왜 WO인가.** 답변 주체가 각 레포의 상주 에이전트이고 실행은 사람이 세션을 여는 일이다([WO-22a-1] 과 같은 이유).

## 수용 기준
- 답변 4건: 3곳의 `…pro_review.answer.claude.md`(§1 실측 표 · §5 종합 필수) + 인간이 지정한 1곳의 `…answer.antigravity.md`(§2 필수).
- [PRO-25] §7-1 임계 기본값이 3곳 실측으로 정해졌다(표 갱신).
- [PRO-26] §7-2 루트 없는 계보 처리와 니모닉 충돌 사례가 기록됐다.
- [PRO-24] §3 `localOwned` 초기 글롭·배송 제외 목록·`upstream_candidate` 후보가 익명 집계로 기록됐다.
- [PRO-22] §3 스키마의 추가/불가 필드와 "0건 = 실패" 오탐 사례가 [WO-22b-1] 에 반영됐다.
- 비용 실측(세션 수 · 분 · 턴)이 [PRO-24] §6 또는 `eval/SURVEY-02_results.md` 에 남았다.
- 어답터 쪽 spike 는 증류 뒤 어답터 쪽에서 폐기(인간 지시 후).

## 절차
1. 인간이 각 레포에서 claude 세션을 열고: "`.union-stack/spike/SPIKE-harness_pro_review.md` 를 읽고 `…answer.claude.md` 에 답해줘".
2. 상류 세션이 3건을 읽어 `eval/SURVEY-02_results.md`(익명 집계) + 세 PRO 의 §7 갱신 + [WO-22b-1] 반영.
3. 인간이 세 PRO 를 승인/기각/개정.

## 증거
- 답변 3건(어답터 로컬 — 옮기지 않음) + `eval/SURVEY-02_results.md` + PRO 3건 개정 커밋.
