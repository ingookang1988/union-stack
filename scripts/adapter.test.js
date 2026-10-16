// scripts/adapter.test.js
// 어답터 설정 표면 — 순수 파서 + FS 로드 + 소비처 배선(zfs-linter 면제, health 강등).
// 실행: node scripts/adapter.test.js
const fs = require('fs');
const os = require('os');
const path = require('path');
const { parseConfig, load, isTemplateRepo, CONFIG_PATH } = require('./adapter');
const { lint, IGNORED } = require('./zfs-linter');
const { computeHealth } = require('./health');

let pass = 0, fail = 0;
function check(label, cond) { if (cond) pass++; else { fail++; console.error(`FAIL ${label}`); } }

// --- parseConfig: 정규화 + 경고 ---
const ok = parseConfig('{"private": true, "zfsIgnored": ["mechanism.md"]}');
check('private 파싱', ok.private === true);
check('zfsIgnored 파싱', JSON.stringify(ok.zfsIgnored) === '["mechanism.md"]');
check('정상 설정은 경고 0', ok.warnings.length === 0);

const bad = parseConfig('{ this is not json');
check('파싱 실패 → 기본값', bad.private === false && bad.zfsIgnored.length === 0);
check('파싱 실패 → 경고 1', bad.warnings.length === 1);

const typo = parseConfig('{"privte": true, "zfsIgnored": "mechanism.md"}');
check('알 수 없는 키 경고', typo.warnings.some(w => w.includes('privte')));
check('배열 아닌 zfsIgnored 경고', typo.warnings.some(w => w.includes('zfsIgnored')));
check('오타는 적용되지 않는다', typo.private === false && typo.zfsIgnored.length === 0);

const nonBool = parseConfig('{"private": "true"}');
check('boolean 아닌 private 경고 + 미적용', nonBool.private === false && nonBool.warnings.length === 1);

const withPath = parseConfig('{"zfsIgnored": [".union-stack/plan/mechanism.md"]}');
check('경로가 오면 basename 으로 정규화', JSON.stringify(withPath.zfsIgnored) === '["mechanism.md"]');
check('정규화는 경고를 동반', withPath.warnings.length === 1);

check('배열 최상위 → 기본값 + 경고', parseConfig('[1,2]').warnings.length === 1);

// --- load: 부재는 정상(경고 아님) ---
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'adapter-'));
fs.mkdirSync(path.join(tmp, '.union-stack'), { recursive: true });
const empty = load(tmp);
check('설정 부재 → present:false, 경고 0', empty.present === false && empty.warnings.length === 0);
fs.writeFileSync(path.join(tmp, CONFIG_PATH), '{"private": true, "zfsIgnored": ["mechanism.md"]}');
check('설정 존재 → present:true', load(tmp).present === true && load(tmp).private === true);

// --- 소비처 1: zfs-linter 면제 합산 (설정으로 sync 파일 포크가 0이 된다) ---
const planDir = path.join(tmp, '.union-stack/plan');
fs.mkdirSync(planDir, { recursive: true });
fs.writeFileSync(path.join(planDir, 'mechanism.md'), '# 어답터 고유 매니페스트\n');
fs.writeFileSync(path.join(planDir, 'not-a-zfs-name.md'), '# 규약 위반\n');
const violations = lint(tmp);
check('설정한 파일명은 면제', !violations.some(v => v.file.endsWith('mechanism.md')));
check('면제되지 않은 위반은 그대로 잡힌다', violations.some(v => v.file.endsWith('not-a-zfs-name.md')));
check('고정 면제 목록은 오염되지 않는다(설정은 합집합일 뿐)', !IGNORED.has('mechanism.md'));
fs.rmSync(path.join(tmp, CONFIG_PATH), { force: true });
check('설정을 지우면 다시 위반으로 잡힌다', lint(tmp).some(v => v.file.endsWith('mechanism.md')));
fs.rmSync(tmp, { recursive: true, force: true });

// --- 소비처 2: health 의 leakage 강등 (판정만 바뀌고 게이트 자체는 그대로) ---
const base = { index: [], domainsDefined: ['PLAN'], guideCount: 1, namingViolations: 0, historyViolations: 0 };
const leakOf = r => r.dims.find(d => d.name === 'leakage gate');
const publicRepo = computeHealth({ ...base, leakageViolations: 2 });
check('설정 없으면 누설 위반은 FAIL', leakOf(publicRepo).status === 'FAIL' && publicRepo.fails === 1);
const privateRepo = computeHealth({ ...base, leakageViolations: 2, adapter: { private: true } });
check('private 어답터는 INFO 로 강등', leakOf(privateRepo).status === 'INFO');
check('강등은 FAIL 계수에서 빠진다', privateRepo.fails === 0);
check('강등해도 실측치는 보존된다(위조 금지)', leakOf(privateRepo).value.includes('2 unmarked'));
const dropped = computeHealth({ ...base, leakageViolations: null, adapter: { private: true } });
check('가드 부재는 여전히 "해당 없음"(강등과 구분)', leakOf(dropped).value.includes('해당 없음'));
const cleanPrivate = computeHealth({ ...base, leakageViolations: 0, adapter: { private: true } });
check('private + 위반 0 도 INFO(판정 일관)', leakOf(cleanPrivate).status === 'INFO');

// --- isTemplateRepo: package.json name 이 기계 판별자 ---
// ⚠ 실레포(`isTemplateRepo()`)를 단언하지 않는다 — 그 단언 자체가 어답터에서 깨지는 부류다.
const tmp2 = fs.mkdtempSync(path.join(os.tmpdir(), 'adapter2-'));
fs.writeFileSync(path.join(tmp2, 'package.json'), '{"name":"union-stack"}');
check('상류 이름이면 템플릿', isTemplateRepo(tmp2) === true);
fs.writeFileSync(path.join(tmp2, 'package.json'), '{"name":"lifesaju"}');
check('init 후 어답터는 템플릿 아님', isTemplateRepo(tmp2) === false);
fs.rmSync(path.join(tmp2, 'package.json'));
check('package.json 부재 → 템플릿 아님(추측 금지)', isTemplateRepo(tmp2) === false);
fs.rmSync(tmp2, { recursive: true, force: true });

// --- [PRO-27] ② statusMap · evidenceFields — 로컬 어휘를 매핑으로 읽는다(강제하지 않는다) ---
const { mapStatus, fieldAliases } = require('./adapter');
const vocab = parseConfig('{"statusMap": {"Done": "Closed", "Review": "Verifying"}, "evidenceFields": {"evidence": ["implementation_commit"], "closed_by": ["surfaces"]}}');
check('statusMap 파싱', vocab.statusMap.Done === 'Closed' && vocab.warnings.length === 0);
check('evidenceFields 파싱', JSON.stringify(vocab.evidenceFields.evidence) === '["implementation_commit"]');
check('mapStatus: 매핑 있으면 상류 어휘', mapStatus(vocab, 'Done') === 'Closed');
check('mapStatus: 매핑 없으면 그대로(강제 아님)', mapStatus(vocab, 'Active') === 'Active');
check('mapStatus: null 은 null', mapStatus(vocab, null) === null);
check('mapStatus: 산문 status 는 첫 토큰으로 매핑(Done (2026-01-01) → Closed)', mapStatus(vocab, 'Done (2026-01-01)') === 'Closed');
check('mapStatus: 첫 토큰도 없으면 그대로', mapStatus(vocab, 'Shipped v2') === 'Shipped v2');
check('fieldAliases: 상류 필드가 먼저, 별칭이 뒤', JSON.stringify(fieldAliases(vocab, 'evidence')) === '["evidence","implementation_commit"]');
check('fieldAliases: 설정 없으면 필드 하나', JSON.stringify(fieldAliases(parseConfig('{}'), 'closed_by')) === '["closed_by"]');
const vocabBad = parseConfig('{"statusMap": ["Done"], "evidenceFields": {"evidence": "x", "foo": ["y"]}}');
check('statusMap 객체 아님 → 경고 + 미적용', Object.keys(vocabBad.statusMap).length === 0 && vocabBad.warnings.some(w => w.includes('statusMap')));
check('evidenceFields 값이 배열 아님 → 경고', vocabBad.warnings.some(w => w.includes('evidence')));
check('evidenceFields 알 수 없는 상류 필드 → 경고', vocabBad.warnings.some(w => w.includes('foo')));
check('load 기본값에 statusMap·evidenceFields', (() => { const d = load(require('os').tmpdir()); return d.present === false && typeof d.statusMap === 'object' && typeof d.evidenceFields === 'object'; })());

// --- [PRO-27] ③ lineage.arithmeticFrom — 레거시 독립 채번 구간은 산술 상속을 끈다 ---
const { arithmeticApplies } = require('./adapter');
const lin = parseConfig('{"lineage": {"arithmeticFrom": 36}}');
check('lineage 파싱', lin.lineage.arithmeticFrom === 36 && lin.warnings.length === 0);
check('arithmeticApplies: 경계 포함(36 이상)', arithmeticApplies(lin, '36a-1') === true && arithmeticApplies(lin, '40') === true);
check('arithmeticApplies: 아래 번호는 산술 아님', arithmeticApplies(lin, '12a-1') === false && arithmeticApplies(lin, '01') === false);
check('기본값 0 = 전부 산술', arithmeticApplies(parseConfig('{}'), '01') === true && arithmeticApplies(null, '01') === true);
const linBad = parseConfig('{"lineage": {"arithmeticFrom": "36", "foo": 1}}');
check('정수 아닌 arithmeticFrom → 경고 + 기본값', linBad.lineage.arithmeticFrom === 0 && linBad.warnings.some(w => w.includes('arithmeticFrom')));
check('알 수 없는 lineage 하위 키 → 경고', linBad.warnings.some(w => w.includes('foo')));
check('lineage 객체 아님 → 경고', parseConfig('{"lineage": 36}').warnings.some(w => w.includes('lineage')));

// --- [PRO-22] §3-1 checks[] 선언 — 닫힌 어휘(kind·cost·expected_zero_unless)와 필수 필드 ---
const { CHECK_KINDS } = require('./adapter');
const chk = parseConfig('{"checks": [{"name": "unit", "cmd": "pnpm test", "blocking": true, "kind": "동작", "cost": "push", "runs_on": ["pre-push"], "env": ["TZ=UTC"], "expected_zero_unless": "env"}, {"name": "lint", "cmd": "eslint ."}]}');
check('checks 파싱 2건 · 기본 blocking false', chk.checks.length === 2 && chk.checks[0].blocking === true && chk.checks[1].blocking === false && chk.warnings.length === 0);
check('checks 필드', chk.checks[0].kind === '동작' && chk.checks[0].cost === 'push' && chk.checks[0].expected_zero_unless === 'env' && chk.checks[0].env[0] === 'TZ=UTC');
const chkBad = parseConfig('{"checks": [{"name": "x"}, {"name": "y", "cmd": "z", "kind": "기타", "cost": "free", "expected_zero_unless": "always"}]}');
check('cmd 없는 선언은 무시 + 경고', chkBad.checks.length === 1 && chkBad.warnings.some(w => w.includes('checks[0]')));
check('닫힌 어휘 밖 값은 경고 + null', chkBad.checks[0].kind === null && chkBad.checks[0].cost === null && chkBad.checks[0].expected_zero_unless === null && chkBad.warnings.filter(w => w.includes('checks[1]')).length === 3);
check('checks 배열 아님 → 경고', parseConfig('{"checks": {}}').warnings.some(w => w.includes('checks')));
check('CHECK_KINDS 6분류', CHECK_KINDS.size === 6 && CHECK_KINDS.has('수용') && CHECK_KINDS.has('메타'));
check('load 기본값에 checks []', Array.isArray(load(require('os').tmpdir()).checks));

// --- [PRO-25] ① retro 임계 키 ---
const rc = parseConfig('{"retro": {"issuance": 20, "planeLagDays": 45, "off": ["ledger"], "bogus": 1, "staleDays": "x"}}');
check('retro 숫자 키 파싱 + off', rc.retro.issuance === 20 && rc.retro.planeLagDays === 45 && JSON.stringify(rc.retro.off) === '["ledger"]');
check('retro 알 수 없는 키·비숫자 → 경고', rc.warnings.some(w => w.includes('retro.bogus')) && rc.warnings.some(w => w.includes('retro.staleDays')) && rc.retro.staleDays === undefined);
check('retro 객체 아님 → 경고', parseConfig('{"retro": 3}').warnings.some(w => w.includes('retro')));
check('load 기본값에 retro {}', typeof load(require('os').tmpdir()).retro === 'object');

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
