<!-- [Schema] 에이전트에 부여된 Schema 편집 상시 권한(승인 스탬프) 원장. [PRO-09]
     인간만 편집한다 — 이 파일 자체도 Schema라, 에이전트가 여기에 grant를 추가하는 것은 자기부여로 금지된다.
     각 행 = 한 스코프에 대한 지속 편집 허가. 에이전트는 커밋에 `Approved-by: GRANT-id`로 인용하고
     그 스코프를 재승인 없이 계속 편집할 수 있다. 철회 = 행 삭제(과거 커밋 이력은 감사용으로 git에 남는다).
     검증: `node scripts/permission-guard.js --strict` (인용한 grant가 실제로 그 경로를 커버하는지 확인).
     더미 예시 — 실제 grant로 교체. 예시 행은 `(예시)` 접두사가 있어 가드가 실 grant로 파싱하지 않는다. -->
# Schema Edit Grants — 승인 스탬프 원장

| Grant | Scope (glob) | Granted-by | Date | Rationale / 철회 |
|---|---|---|---|---|
| (예시) GRANT-01 | .union-stack/example_scope/** | human-architect | 2026-01-01 | (예시) 이 스코프 상시 편집 허가 — 근거를 남긴다. 철회하려면 이 행을 지운다 |

> **스탬프 규율**
> 1. 스코프는 **최소**로(정확 경로 또는 좁은 글로브). 넓은 grant는 Schema 소유권을 통째로 넘기는 것과 같다.
> 2. **근거**를 남긴다(왜 상시 권한이 필요한가). 근거가 사라지면 철회 후보다.
> 3. 필요 없어지면 **행을 지운다**(철회). 이후 그 GRANT-id 인용은 가드에서 Fail-close 된다.
> 4. `**`는 슬래시 포함 임의 하위, `*`는 슬래시 제외 한 세그먼트. `.union-stack/`로 시작하는 행만 유효.
