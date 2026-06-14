<!-- [Raw] 결정화된 ADR 영구 원장. Append-only.
     경계: *전술적* 결정(작업·ZFS 단위 ADR)만. 프로젝트 *전략적* 분기점은 project/HISTORY.md.
     전술 결정이 전략적 의미를 얻으면 HISTORY로 승격(압축). 라우팅 전체: DESIGN_RATIONALE §7. -->
# Architecture Decision Ledger
- (예시) [2026-01-01][ADR-01]: 결정화된 아키텍처 결정의 정수가 여기 1~2줄로 누적됨.
- [2026-06-14][ADR-02]: 효능 A/B 1회차(`eval/RESULTS.md`) — harness-on 3/3 vs off 1/3(+67%p). 시간축 평면(LSN·HISTORY)에서 델타 발생, 인라인 가시 계약(CON)은 델타 0. 결론: 구조 프록시는 효능 *상한*, 실현치는 지식이 *비국소*일 때 가장 큼. 근거: DESIGN_RATIONALE "두 빈칸" 중 시간축 평면이 핵심 페이오프 구간임을 실측 지지. N=1 파일럿(정식치 N=5는 후속).
