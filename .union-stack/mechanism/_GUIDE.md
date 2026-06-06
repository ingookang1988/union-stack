# .mechanism/ — 화살표(검증) 가이드
> **층위:** 칸이 아니라 칸과 칸을 잇는 동적 검증 평면.
> **정의:** 외부 현실(입력)을 *받아서* 칸 간 정합성을 재고(처리), 어긋남만 기록(출력).
>   현실을 *생성하거나 영구 저장하지 않는다.*

## raw/ (입력) — 권한: Append-only, 시스템(CI/CD)만 작성, 에이전트 read-only
- 외부 신호의 임시 수신부. 테스트 로그·CI 결과. 에이전트는 위조 불가.

## derived/ (출력) — 권한: Wiki, 에이전트 작성
- gap.md: 규범(topology)↔현실 괴리(Drift).
- state.md: 관찰된 현재 코드 구조.

## 세 가지 검증 화살표
- 규범↔현실(Drift) → gap   | 계약↔현실(Contract) → FLOW self-correction | 약속↔결과(Promotion) → evidence
## 원칙: 입력(raw)과 출력(derived)을 절대 같은 폴더에 두지 않는다.
