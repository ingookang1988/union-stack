<!-- [Schema] 에이전트에 부여된 Schema 편집 상시 권한(승인 스탬프) 원장. [PRO-09]
     grant 추가/삭제는 인간의 몫이다 — 에이전트가 *상시 스탬프로는* 이 파일을 편집할 수 없다(자기부여 방지).
     단 인간이 채팅에서 명시 승인하면 에이전트가 대신 기록할 수 있고 그 커밋은 `Approved-by: <이름>`을 남긴다(규칙 (a)).
     각 행 = 한 스코프에 대한 지속 편집 허가. 에이전트는 커밋에 `Approved-by: GRANT-id`로 인용하고
     그 스코프를 재승인 없이 계속 편집할 수 있다. 철회 = 행 삭제(과거 커밋 이력은 감사용으로 git에 남는다).
     검증: `node scripts/permission-guard.js --strict` (인용한 grant가 실제로 그 경로를 커버하는지 확인).
     예시 행은 `(예시)` 접두사가 있어 가드가 실 grant로 파싱하지 않는다. -->
# Schema Edit Grants — 승인 스탬프 원장

| Grant | Scope (glob) | Granted-by | Date | Rationale / 철회 |
|---|---|---|---|---|
| GRANT-01 | .union-stack/project/roadmap/** | ingookang1988 | 2026-07-24 | roadmap 갱신(PHASE·GATE) 위임 — E3 등 트랙 종료 표기를 에이전트가 수행. 철회하려면 이 행을 지운다 |
| GRANT-02 | .union-stack/**/_GUIDE.md | ingookang1988 | 2026-08-18 | 방법론 표면 갱신 위임 — Schema 파일 편집의 50%(실측 27/54, 최근 65커밋)가 `_GUIDE.md`다. `_GUIDE`는 어답터의 프로젝트 규범이 아니라 템플릿 방법론 표면이며, 다른 5개 게이트(zfs·leakage·ref·smell·tools-index)가 이미 별도 클래스로 취급하고 `template-update`는 review(상류 소유)로 분류한다 — 완화가 아니라 정합. 규범 문서(ARCH-00 등)는 스코프 밖. 철회하려면 이 행을 지운다 |
| (예시) GRANT-90 | .union-stack/example_scope/** | human-architect | 2026-01-01 | (예시) 형식 데모 — 스코프 최소·근거 명시. 이 행은 예시라 가드가 무시한다 |

> **스탬프 규율**
> 1. 스코프는 **최소**로(정확 경로 또는 좁은 글로브). 넓은 grant는 Schema 소유권을 통째로 넘기는 것과 같다.
> 2. **근거**를 남긴다(왜 상시 권한이 필요한가). 근거가 사라지면 철회 후보다.
> 3. 필요 없어지면 **행을 지운다**(철회). 이후 그 GRANT-id 인용은 가드에서 Fail-close 된다.
> 4. `**`는 슬래시 포함 임의 하위, `*`는 슬래시 제외 한 세그먼트. `.union-stack/`로 시작하는 행만 유효.
