<!-- [Wiki] 더미 예시 — agent-team 리소스(SCIM-Group 구조 차용). [PRO-06] 승인. 실팀은 *.local.md. -->
---
id: team-example
displayName: 예시 빌드 플릿
lead: 예시-builder-agent        # 오케스트레이션 진입점(리드, members 중 하나)
members:                        # 참조만 — agent_* id, 임베드 금지(SCIM Group)
  - 예시-builder-agent
  - agent-example
overrides:                      # 팀 단위 interactionStyle 기본값 — 멤버 자신의 값이 이김
  formality: formal
  verbosity: concise
authority: "작업 계보-분해·위임은 리드 단독, Schema·proposals 승격은 인간 승인"   # advisory only
---

# (예시) agent team — 빌드 플릿

- (예시) 리드 에이전트가 작업을 ZFS 계보 서브트리로 분해해 멤버에 위임한다([PRO-05] 파티션 키).
- (예시) `members[]`는 에이전트 카드 id 참조일 뿐 — 카드를 임베드하지 않는다(SCIM Group 규율).
- (예시) `overrides`는 팀 기본 선호이며, 멤버 자신의 `interactionStyle`이 항상 이긴다(user-wins류 캐스케이드).
- (예시) 실제 서브에이전트 기동은 플랫폼(Claude Code `Agent` 툴/Workflow) 몫 — 이 평면은 spawn하지 않는다.
