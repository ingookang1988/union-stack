<!-- [append-only / 심의 raw] profile 축 신설 심의. 과거 회의는 고쳐쓰지 않는다 — 새 회의는 새 MTG.
     스키마 값은 가공 예시. -->
---
id: MTG-02a
title: profile(행위자) 축 신설 심의
date: 2026-06-09T00:00:00Z
participants: [human-architect, agent]
produces: PRO-03
status: Logged
version: 1.0
---

# [MTG-02a] profile(행위자) 축 신설 심의

## 입력
- 탐색: `SPIKE-profile_axis.md` (딥리서치 25주장 검증·0기각·전부 1차 출처 증류).
- 범위 사전 확정: 권한은 **선언적 표기만**, 실제 집행은 플랫폼(Claude Code/Codex) 위임.

## 논의된 선택지와 결정
1. **위치** — 신규 최상위 pillar `.union-stack/profile/` ☑ 결정
   - 근거: actor는 기존 모든 pillar(작업물)와 결이 다른 첫 "누가" 축. project/(프로젝트 정체성)와 혼동 방지.
2. **네이밍 모델** — 비-ZFS 평탄 레지스트리(`feature/live.md` 방식) ☑ 결정
   - 근거: profile은 분해 트리가 아니라 행위자 레지스트리. Luhmann 계보(부모-자식)가 의문상 안 맞음
     (user는 team의 "자식 작업"이 아님). linter `IGNORED` 등록으로 면제. **도메인 신설 불필요.**
3. **한국어 존댓말·호칭 어휘** — CLDR 직교 축 + 한국어 enum + 호칭맵 ☑ 결정
   - `formality`(formal/informal) · `usage`(addressing 부를때 / referring 가리킬때) 위에
     `koreanSpeechLevel`(해요체/하십시오체/반말) + 관계별 `호칭` 맵을 얹음. 구조=표준 차용, 값=자체 정의.

## 합의된 캐스케이드
- 선호 스칼라: **user > team > org**(가장 구체적인 게 이김). 객체는 키 단위 deep-merge.
- `org.policy.*` 가드레일만 **org-wins**(역전). 출처 합성: git/VS Code/Claude + SCIM/IAM 가드레일.

## 미결 (PRO 또는 후속 스파이크로 이월)
- PII gitignore / example-vs-real 분리 → 리서치 갭(검증된 주장 0건). **별도 후속 스파이크** 안건으로 분리.
- agent-team/org 모델(A2A `provider.organization`으로 충분 vs 전용 그룹 리소스) → PRO에서 최소안으로, 확장은 후속.
- 부트스트랩 소비 순서(IDENTITY 직후 활성 user profile 읽기) → PRO에서 AGENTS.md 갱신안에 포함.

## 산출 (→ 정착)
- → `[PRO-03]` profile pillar 신설 제안으로 정착. 승인 후 구현.

> 이 회의록은 PRO의 raw 입력이다. 결정은 PRO로, 회의록은 append-only로 남는다.
> (참고: 본 MTG는 PLAN이 아닌 PRO를 produces — 하네스 변경 심의이므로 meeting 패턴을 proposal 트랙에 적용.)
