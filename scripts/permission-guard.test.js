// scripts/permission-guard.test.js
// 순수 함수(classify, findViolations) 단위 테스트. git 비의존. 실행: node scripts/permission-guard.test.js
const { classify, findViolations } = require('./permission-guard');

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
check('append(ledger)', classify('.union-stack/archive_ledger.md'), 'append-only');
check('append(raw)', classify('.union-stack/mechanism/raw/evidence.md'), 'append-only');
check('other(feature)', classify('.union-stack/feature/live.md'), 'other');
check('other(scripts)', classify('scripts/zfs_util.js'), 'other');

// --- Check A: append-only 무결성 (항상) ---
check('append 삭제 → 위반',
  findViolations([{ path: '.union-stack/archive_ledger.md', added: 1, removed: 2 }]).length, 1);
check('append 순수추가 → 통과',
  findViolations([{ path: '.union-stack/archive_ledger.md', added: 3, removed: 0 }]).length, 0);
check('meetings 수정 → 위반',
  findViolations([{ path: '.union-stack/plan/meetings/MTG-01a_x.md', added: 0, removed: 1 }]).length, 1);

// --- Check B: Schema 승인 (strict에서만) ---
const schemaChange = [{ path: '.union-stack/architecture/ARCH-02_x.md', added: 5, removed: 1 }];
check('strict+에이전트+승인없음 → 위반',
  findViolations(schemaChange, { agentAuthored: true, approvedBy: false }, { strict: true })
    .some(v => v.rule === 'schema-approval'), true);
check('strict+승인있음 → schema 위반 없음',
  findViolations(schemaChange, { agentAuthored: true, approvedBy: true }, { strict: true })
    .some(v => v.rule === 'schema-approval'), false);
check('non-strict → schema 미검사(기본 false-positive 없음)',
  findViolations(schemaChange, { agentAuthored: true, approvedBy: false }, { strict: false })
    .some(v => v.rule === 'schema-approval'), false);
check('strict+인간작성 → 위반 없음',
  findViolations(schemaChange, { agentAuthored: false }, { strict: true })
    .some(v => v.rule === 'schema-approval'), false);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
