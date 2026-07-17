<!-- 방법론 문서: union-stack 런타임 강제 훅 사용법. 내용은 가공 예시(example)만. -->
# 런타임 강제 훅 (의례의 사전 집행)

게이트(`zfs-linter`·`permission-guard`·`history-linter`)는 **사후**(커밋·CI)에 작동한다. 그러나 AGENTS.md가
정직한 한계로 남긴 문장 — *"작업 진입 의례 수행 자체는 런타임 훅 없이는 완전 강제 불가"* — 의 간극은
**에이전트가 행동하기 직전**에 작동하는 훅으로만 닫힌다. 이 디렉터리의 두 어댑터가 그 역할을 한다.

| 훅 시점 | 스크립트 | 하는 일 |
|---|---|---|
| `PreToolUse` (Edit/Write/MultiEdit) | `scripts/hook-pretool.js` | 편집 직전 **Schema 읽기전용**·**Blast-Radius 잠금**을 검사해 위반 시 도구 호출을 차단(exit 2) |
| `UserPromptSubmit` | `scripts/hook-userprompt.js` | 프롬프트의 ZFS 작업 ID를 감지해 **Upward Fetching**(부모 맥락+같은 계보 LSN)을 컨텍스트에 자동 선주입 |

순수 결정 로직은 `scripts/hooks.js`(`decideEdit`·`extractWorkId`)에 있고 `scripts/hooks.test.js`로 검증된다.
어댑터는 stdin JSON을 읽는 얇은 껍데기다(기존 CLI·MCP·skill과 같은 "로직 1벌·표면 N개" 패턴).

## 모드 (환경변수 `UNION_STACK_HOOK`)
- `warn` (기본) — Schema 편집은 경고만, **Blast-Radius 잠금은 차단**(이미 `blast-radius.js`가 Fail-close하는 불변식).
- `enforce` — Schema 편집까지 **차단**. 인간이 직접 Schema를 쓰는 경우 일시적으로 `off`/`warn`로 낮춘다.
- `off` — 훅 무간섭.

## 활성화 (사용자가 직접 수행 — 명령 실행 훅이므로 신뢰 레포에서만)
훅은 임의 명령을 실행하므로, 에이전트가 시작 설정을 자동 설치하지 않는다. 아래를 직접
`.claude/settings.json`(또는 `.claude/settings.local.json`)에 넣어라(예시 값 그대로 사용 가능):

```json
{
  "hooks": {
    "PreToolUse": [
      { "matcher": "Edit|Write|MultiEdit",
        "hooks": [ { "type": "command", "command": "node scripts/hook-pretool.js" } ] }
    ],
    "UserPromptSubmit": [
      { "hooks": [ { "type": "command", "command": "node scripts/hook-userprompt.js" } ] }
    ]
  }
}
```

## 훅이 주입하는 문구의 설계 원칙 (E5 실측 교훈 — [PRO-07], RESULTS 5회차)
1. **모순·이중 명령 금지** (3회차): "파일 수정 금지" + "함수를 추가하라" 같은 조합은 약한 모델을 거부/재질의로 몰아넣는다.
2. **간접 참조 금지** (5회차): "이 파일을 읽고 시키는 대로 하라"식 문구는 에이전트의 주입 방어(injection defense)에 걸린다(실측 10/10 거부). 주입할 내용은 인라인으로.
3. **Fail-close 스코프 유지** ([PRO-07]): 주입 문구가 "계보 문서에 없는 작업은 멈춰라"로 읽히게 쓰지 마라 — 인간의 직접 요청은 모호함이 아니며, 멈춤은 규범·계약·HISTORY와의 *충돌*에만 해당한다.

> 다른 도구: 같은 두 스크립트를 해당 도구의 pre-edit / prompt 훅 지점에 가리키면 된다(로직은 tool-agnostic).
> 빠른 점검: `echo '{"tool_input":{"file_path":".union-stack/architecture/ARCH-00_zfs_naming.md"}}' | UNION_STACK_HOOK=enforce node scripts/hook-pretool.js; echo "exit=$?"` → Schema 차단(exit 2) 확인.
