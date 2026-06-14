// scripts/hooks.test.js
// 순수 결정 로직(decideEdit, extractWorkId) 단위 테스트. 실행: node scripts/hooks.test.js
const { decideEdit, extractWorkId, toRel } = require('./hooks');

let pass = 0, fail = 0;
function check(label, cond) { if (cond) pass++; else { fail++; console.error(`FAIL ${label}`); } }

const root = process.cwd();

// --- 색인 스텁(순수 테스트 — FS 비의존) ---
const IDX = [
  { domain: 'PLAN', id: '01a', file: '.union-stack/plan/PLAN-01a_x.md', status: 'Verifying' },
  { domain: 'WO', id: '01a-1', file: '.union-stack/sprint/WO-01a-1_x.md', status: 'Done' },
  { domain: 'PLAN', id: '02', file: '.union-stack/plan/PLAN-02_y.md', status: 'Draft' },
];

// --- toRel ---
check('toRel keeps rel', toRel('.union-stack/plan/PLAN-02_y.md', root) === '.union-stack/plan/PLAN-02_y.md');

// --- decideEdit: off 모드는 항상 통과 ---
check('off = no block', decideEdit('.union-stack/architecture/ARCH-00.md', IDX, 'off', root).block === false);

// --- Schema tier: warn=경고(비차단), enforce=차단 ---
const sWarn = decideEdit('.union-stack/architecture/ARCH-00_zfs_naming.md', IDX, 'warn', root);
check('schema warn: issue present, not blocked', sWarn.block === false && sWarn.issues.some(i => i.kind === 'schema'));
const sEnf = decideEdit('.union-stack/architecture/ARCH-00_zfs_naming.md', IDX, 'enforce', root);
check('schema enforce: blocked', sEnf.block === true && sEnf.issues.some(i => i.kind === 'schema' && i.block));

// --- Wiki/other tier: Schema 이슈 없음 ---
const other = decideEdit('.union-stack/feature/live.md', IDX, 'enforce', root);
check('wiki not schema-blocked', !other.issues.some(i => i.kind === 'schema'));

// --- Blast-Radius 잠금: 부모(02, Draft) 편집인데 자손 잠금 없으면 통과 ---
const noLock = decideEdit('.union-stack/plan/PLAN-02_y.md', IDX, 'warn', root);
check('no locked descendant → no lock issue', !noLock.issues.some(i => i.kind === 'lock'));

// --- Blast-Radius 잠금: 01(부모) 편집 시 자손 PLAN-01a(Verifying) → 차단(모드 무관) ---
const locked = decideEdit('.union-stack/plan/PLAN-01_z.md', IDX, 'warn', root);
check('locked descendant → blocked even in warn', locked.block === true && locked.issues.some(i => i.kind === 'lock'));

// --- extractWorkId ---
check('extract WO id', extractWorkId('please implement WO-01a1-2 now') === '01a1-2');
check('extract plain', extractWorkId('context for PLAN-03b') === '03b');
check('no id → null', extractWorkId('just chatting, no ids here') === null);
check('ignore lowercase', extractWorkId('the wo-01 thing') === null);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
