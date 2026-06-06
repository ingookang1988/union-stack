# .plan/ — 계약·행위 (전술 기획) 가이드
> **격자:** 계약(약속) × 행위. **권한:** Schema (인간 소유, 기획 격리).
> **변화 속도:** 자주 생멸 — 그래서 불변 규범과 분리되었다(엔트로피 격리).

## 싣는 것: "무엇을 하기로 약속했나". 기능 단위 요구사항·의도.
## 빼는 것: 불변 규범(→ .topology), 작업 추적(→ .sprint).
## 생명주기: Draft → Active → Verifying → Crystallized(삭제 후보).
##   Crystallized는 즉시 삭제가 아니다. 같은 계보의 후속 노드가 모두 종착이고
##   grace period가 지나야 GC가 archive_ledger로 결정화 후 제거(GC 가드).
## 파일: PLAN-* (ZFS). 부모-자식으로 기획을 계층화.
