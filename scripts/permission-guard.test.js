// scripts/permission-guard.test.js
// 순수 함수(classify, findViolations) 단위 테스트. git 비의존. 실행: node scripts/permission-guard.test.js
const { classify, findViolations, isSubstantiveLine, globToRe } = require('./permission-guard');

let pass = 0, fail = 0;
function check(label, got, exp) {
  const ok = JSON.stringify(got) === JSON.stringify(exp);
  if (ok) pass++; else { fail++; console.error(`FAIL ${label}: got ${JSON.stringify(got)}, exp ${JSON.stringify(exp)}`); }
}

// --- classify ---
check('schema(project)', classify('.union-stack/project/IDENTITY_example.md'), 'schema');
check('schema(architecture)', classify('.union-stack/architecture/ARCH-01_x.md'), 'schema');
check('schema(plan 본체)', classify('.union-stack/plan/PLAN-01_x.md'), 'schema');
check('schema(contracts)', classify('.union-stack/reference/contracts/CON-01_x.md'), 'schema');
check('append(meetings)', classify('.union-stack/plan/meetings/MTG-01a_x.md'), 'append-only');
check('append(analytics)', classify('.union-stack/plan/analytics/ANL-01a_x.md'), 'append-only');
check('append(ledger)', classify('.union-stack/archive_ledger.md'), 'append-only');
check('append(raw)', classify('.union-stack/verification/raw/evidence.md'), 'append-only');
check('other(feature)', classify('.union-stack/feature/live.md'), 'other');
check('other(scripts)', classify('scripts/zfs_util.js'), 'other');

// --- Check A: append-only 무결성 (항상) ---
check('append 삭제 → 위반',
  findViolations([{ path: '.union-stack/archive_ledger.md', added: 1, removed: 2 }]).length, 1);
check('append 순수추가 → 통과',
  findViolations([{ path: '.union-stack/archive_ledger.md', added: 3, removed: 0 }]).length, 0);
check('meetings 수정 → 위반',
  findViolations([{ path: '.union-stack/plan/meetings/MTG-01a_x.md', added: 0, removed: 1 }]).length, 1);
check('analytics 수정 → 위반',
  findViolations([{ path: '.union-stack/plan/analytics/ANL-01a_x.md', added: 0, removed: 1 }]).length, 1);

// --- isSubstantiveLine: 엔트리 삭제 판정 ---
check('표 데이터 행 삭제 = 실질(사각지대 회귀 방지)',
  isSubstantiveLine('| 2026-06-15 | ADR-03 v6.0 승격 | 근거 |'), true);
check('표 구분선 = 비실질', isSubstantiveLine('|---|---|---|'), false);
check('정렬 구분선 = 비실질', isSubstantiveLine('| :--- | ---: |'), false);
check('제목 = 비실질', isSubstantiveLine('# Architecture Decision Ledger'), false);
check('주석 = 비실질', isSubstantiveLine('<!-- [Raw] append-only -->'), false);
check('빈 줄 = 비실질', isSubstantiveLine(''), false);
check('본문 줄 = 실질', isSubstantiveLine('결정: zeta 어댑터 폐기'), true);

// --- Check B: Schema 승인 (strict에서만) — [PRO-09] grant 모델 ---
const schemaChange = [{ path: '.union-stack/architecture/ARCH-02_x.md', added: 5, removed: 1 }];
const hasSchemaViol = (meta, opts) => findViolations(schemaChange, meta, { strict: true, ...opts }).some(v => v.rule === 'schema-approval');

check('reference/domain도 Schema로 분류', classify('.union-stack/reference/domain/DOM-01_x.md'), 'schema');

check('strict+에이전트+승인없음 → 위반', hasSchemaViol({ agentAuthored: true, approvals: [] }), true);
check('(a) 인간 명시 승인 → 통과', hasSchemaViol({ agentAuthored: true, approvals: ['ingookang1988 (chat, 2026)'] }), false);
check('non-strict → schema 미검사',
  findViolations(schemaChange, { agentAuthored: true, approvals: [] }, { strict: false }).some(v => v.rule === 'schema-approval'), false);
check('strict+인간작성 → 위반 없음', hasSchemaViol({ agentAuthored: false, approvals: [] }), false);

// (b) 상시 스탬프: 커버하는 grant를 인용하면 재승인 없이 통과, 아니면 위반
const grantArch = [{ id: 'GRANT-01', scopeRe: globToRe('.union-stack/architecture/**') }];
const grantOther = [{ id: 'GRANT-02', scopeRe: globToRe('.union-stack/reference/tools/**') }];
check('스탬프 인용 + 커버 → 통과',
  findViolations(schemaChange, { agentAuthored: true, approvals: ['GRANT-01'] }, { strict: true, grants: grantArch }).length === 0, true);
check('스탬프 인용하나 스코프 밖 → 위반',
  findViolations(schemaChange, { agentAuthored: true, approvals: ['GRANT-02'] }, { strict: true, grants: grantOther })
    .some(v => v.rule === 'schema-approval'), true);
check('등록 안 된 스탬프 인용 → 위반',
  hasSchemaViol({ agentAuthored: true, approvals: ['GRANT-99'] }, { grants: grantArch }), true);
check('위반 메시지가 스코프 불일치를 구분',
  findViolations(schemaChange, { agentAuthored: true, approvals: ['GRANT-02'] }, { strict: true, grants: grantOther })[0].msg.includes('커버하지 않음'), true);

// globToRe: ** vs *
check('** 는 슬래시 포함', globToRe('.union-stack/plan/**').test('.union-stack/plan/a/b/PLAN-01_x.md'), true);
check('* 는 슬래시 제외', globToRe('.union-stack/plan/*').test('.union-stack/plan/a/b.md'), false);
check('정확 경로 매칭', globToRe('.union-stack/project/HISTORY.md').test('.union-stack/project/HISTORY.md'), true);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
