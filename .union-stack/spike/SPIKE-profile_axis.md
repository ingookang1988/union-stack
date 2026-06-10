<!-- [Wiki/ephemeral] profile 축 설계 탐색 스파이크. 자유 형식 — 결론 나면 출구로 옮기고 삭제.
     딥리서치(25개 주장 검증, 0 기각, 전부 1차 출처)를 증류함. 스키마 값은 모두 가공 예시. -->
# SPIKE: profile(행위자) 축 설계 탐색

## 0. 가설 / 질문
union-stack에 **"행위자(actor)" 축**을 추가한다. 기존 모든 pillar는 *작업물*에 관한 것이고,
profile은 처음으로 **"누가 관여하는가"** 를 다룬다. 두 갈래:
- **인간 측**: user ⊂ team ⊂ org (중첩 스코프)
- **에이전트 측**: agent (장차 agent team/org 확장)
- 담는 것: **서술형 통신·페르소나 선호** (존댓말 수준, 호칭, 방향·톤, 언어, verbosity).
- 권한: **선언적 표기만**. 실제 집행은 플랫폼(Claude Code/Codex)에 위임 — union-stack은 RBAC 엔진 아님.

---

## 1. 리서치 결론 (근거기반 — 출처 포함)

### (A) 인간 actor = 가산적(additive) 중첩 레이어 — SCIM 2.0이 최강 선례
- SCIM(RFC 7643)은 **core User / 최소 Group / EnterpriseUser 확장**으로 분리한다.
  - Group = `displayName`(필수) + `members[]`(각 멤버는 `value`=id, `$ref`=URI) — **임베딩이 아니라 참조**.
  - org 축 = `EnterpriseUser` 확장(organization·division·department·manager) — core에 박지 않고 **덧붙임**.
- → user⊂team⊂org 중첩을 **중복 없이 참조로** 모델링하는 직접 선례.
- 출처: https://www.rfc-editor.org/rfc/rfc7643.html

### (B) 호칭/존댓말 = 이름과 분리된 전용 필드 + 직교 축
- SCIM: `honorificPrefix`(Ms./Dr.), `nickName`("casual way to address, e.g. Bob instead of Robert"),
  `displayName`, `preferredLanguage`(RFC7231), `locale`(RFC5646), `timezone`(IANA) — 호칭을 **이름과 구조적으로 분리**.
- CLDR PersonNames(UTS#35 Part8)의 **직교 축**이 호칭/존댓말 어휘로 거의 그대로 쓸 수 있다:
  - `formality`: formal / informal
  - `usage`: **addressing**(상대를 부름/호격) vs **referring**(상대를 가리킴/주격) vs monogram
  - `length`: long / medium / short
  - → "에이전트가 사용자를 *부를 때*"와 "*가리킬 때*"를 구분, formality로 존댓말 레벨 인코딩.
- 출처: https://www.unicode.org/reports/tr35/tr35-personNames.html
- ⚠️ **갭**: SCIM·CLDR 모두 한국어 존댓말(해요체/하십시오체/반말)을 네이티브로 모델링 안 함 —
  **구조 패턴만 차용**하고 한국어 값 어휘는 union-stack이 직접 정의해야 함.

### (C) 에이전트 actor = 선언적 매니페스트("카드") — A2A Agent Card가 정석
- A2A Agent Card: `.well-known/agent-card.json`에 제공되는 JSON. 식별 필드 =
  `name`, `description`, `version`, `provider{organization, url}`.
- `provider.organization`이 **agent-team/agent-org 그룹화의 기존 훅**.
- 출처: https://a2a-protocol.org/latest/specification/
- ⚠️ 빠르게 변하는 2024–2025 스펙(v0.3.0) — 필드명 유동적일 수 있음.

### (D) 캐스케이드 = "가장 구체적인 스코프가 이긴다(last-wins)"
- git config(system→global→local, 나중 값 우선), VS Code 설정, Claude Code 메모리 **만장일치**.
- 머지 의미는 **타입 의존**: 스칼라·배열은 통째 교체, **객체는 키 단위 deep-merge**(VS Code).
- 마크다운 자유텍스트는 **concatenation/append**(Claude Code 메모리: 모두 이어붙임, 구체적인 것 나중에).
- ⚠️ **긴장**: org-chart는 org⊃team⊃user 포함을 함의하지만, 모든 캐스케이드 선례(VS Code/Copilot/Claude)는
  **user/personal을 최고 우선**으로 둔다. → 합성 권고: **선호는 user-wins, 하드 가드레일만 org-wins**.
- 출처: https://git-scm.com/docs/git-config · https://code.visualstudio.com/docs/configure/settings · https://code.claude.com/docs/en/memory

### (E) 선언적 권한 = 문서화하되 집행 안 함 — CODEOWNERS + "CLAUDE.md는 context" 패턴
- CODEOWNERS = advisory 소유 메타데이터, 고정 위치 규약(.github/ → root → docs/, 첫 발견 사용).
- Claude Code: "메모리/마크다운은 context이지 강제 설정이 아님". 실제 차단은 PreToolUse 훅·permissions.deny가 담당.
- → union-stack이 원하는 정확한 분리: **선언 필드는 의도를 문서화, 플랫폼이 집행**.
- 출처: https://docs.github.com/.../about-code-owners · https://code.claude.com/docs/en/memory

---

## 2. 합성 권고: 최소 스키마 (값은 전부 가공 예시)

> tier 제안: **Wiki**(서술형 선호 — 본인 소유·자주 갱신·행 단위). 권한 필드는 **advisory만**.

### user profile (예시)
```yaml
id: usr-karians
displayName: 예시-인구
nickName: 인구            # 캐주얼 호칭
honorificPrefix: 님       # 호칭 접사
preferredLanguage: ko
locale: ko-KR
timezone: Asia/Seoul
verbosity: concise
address:                  # CLDR 직교 축 차용
  formality: formal       # 존댓말
  koreanSpeechLevel: 하십시오체   # union-stack 자체 정의(갭 B)
  usage_addressing: "인구님"      # 부를 때
  usage_referring: "인구님께서"   # 가리킬 때
```

### team profile (예시)
```yaml
id: team-core
displayName: 예시-코어팀
members: [usr-karians, usr-example2]   # 참조(임베딩 X)
overrides: { verbosity: normal }       # 팀 기본값(user가 덮어씀)
```

### org profile (예시)
```yaml
id: org-acme
displayName: 예시-ACME
teams: [team-core]
policy:                    # 하드 가드레일(org-wins)
  language_floor: ko
```

### agent profile (예시 — A2A Agent Card 차용)
```yaml
name: 예시-builder-agent
description: union-stack 빌더 에이전트
version: 0.1.0
provider: { organization: 예시-ACME, url: "" }
interactionStyle: { formality: formal, language: ko }
```

### 캐스케이드 규칙
- 스칼라: **user > team > org**(선호는 가장 구체적인 게 이김).
- `org.policy.*`(가드레일): **org-wins**(역전).
- 객체: 키 단위 deep-merge. 자유텍스트 페르소나: concatenation(구체적인 것 나중).

---

## 3. union-stack 매핑 (meeting에서 확정할 열린 선택지)
- **위치**: 신규 최상위 pillar `.union-stack/profile/` (하위 `human/` + `agent/`) ↔ 대안: project/ 하위.
- **도메인**: 단일 `PRF` (하위 폴더로 종류 구분) ↔ 분리 `USR`/`TM`/`ORG`/`AGT`(4개 신설). ※ l/o 제외 규칙 OK.
- **tier**: 선호=Wiki, 권한=advisory 표기. (Schema 미접촉 — 도메인 신설만 PRO 필요)
- **부트스트랩 소비**: AGENTS.md 부트스트랩이 활성 user profile을 읽어 존댓말/호칭/톤 적응 — 순서상 IDENTITY 직후 후보.
- **PII/템플릿**: 실프로필은 gitignore(`*.local.md` 또는 `profile/**/real/`), 배포본은 더미 예시만. → **별도 스파이크 필요(갭)**.

---

## 4. 미해결 / 갭 (meeting 안건)
1. **한국어 존댓말·호칭 값 어휘** — 어느 선례도 네이티브 미지원. enum(해요체/하십시오체/반말) + 관계별 호칭 맵을
   CLDR formality/usage 축 위에 얹을지?
2. **org⊃team⊃user 포함 vs "user-wins" 캐스케이드 충돌** — 어떤 필드가 org-overridable 'policy'(org-wins)이고
   어떤 게 personal-preference(user-wins)인지. 필드 단위 precedence 태그 필요할 수도.
3. **agent-team/org** — A2A `provider.organization`으로 충분한가, 아니면 SCIM Group 유사 전용 리소스 필요한가?
4. **PII gitignore / example-vs-real 분리** — 리서치 항목6이었으나 검증된 주장 0건. **자체 스파이크 필요**.

## 5. 출구 — ✅ 해소됨 (2026-06-10)
- [x] **성공 → 승격 완료**: `[MTG-02a]` 심의 → `[PRO-03]` 승인 → v5.14 구현.
  내구 지식은 `profile/_GUIDE.md` 3종에 증류됨. 이 파일은 기록용 — 삭제 가능(ephemeral).
- [ ] 실패 → `LSN-*`로 증류
- [ ] 무가치 → 폐기

> 이 파일은 거버넌스 밖 샌드박스다. 다음 단계: 이 스파이크를 입력으로 **meeting 심의** → `PRO-*` 제안 → 구현.
> 리서치 통계: 5각도 / 21소스 / 99주장 추출 / 25검증 / 25확정 / 0기각.
