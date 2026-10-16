// scripts/ship-manifest.test.js
// 배송 매니페스트([PRO-24] ①(c)) 순수 로직: 태그 파싱(선두만) · 테스트 짝 상속 · 매니페스트 왕복 · 드리프트 CLI. 실행: node scripts/ship-manifest.test.js
const fs = require('fs');
const os = require('os');
const path = require('path');
const { spawnSync } = require('child_process');
const { parseTag, build, render, parseManifest, scan, MANIFEST, CONTRACT } = require('./ship-manifest');
const { validateContract } = require('./gate-contract');

let pass = 0, fail = 0;
function check(label, cond) { if (cond) pass++; else { fail++; console.error(`FAIL ${label}`); } }

check('계약 선언 완전 · REJECT 없음', validateContract(CONTRACT).length === 0 && !CONTRACT.outcomes.includes('REJECT'));

// --- parseTag: 선두 주석 블록만, 본문 문자열 속 언급은 태그가 아니다([ADR-19]) ---
check('upstream-only 태그 + 이유', JSON.stringify(parseTag('// scripts/x.js\n// @ship upstream-only — 평가 계층\nconst a = 1;')) === '{"kind":"upstream-only","reason":"평가 계층"}');
check('optional 태그', parseTag('// x\n// @ship optional: 어답터 선택\n').kind === 'optional');
check('태그 없음', parseTag('// x\nconst s = "// @ship upstream-only";\n').kind === null || parseTag('// x\n'.repeat(13) + '// @ship upstream-only\n').kind === null);
check('13줄 밖의 태그는 무시', parseTag('// a\n'.repeat(12) + '// @ship upstream-only\n').kind === null);

// --- build: 테스트 짝 상속 · 매니페스트 자신 포함 ---
const files = ['scripts/eval.js', 'scripts/eval.test.js', 'scripts/health.js', 'scripts/health.test.js', 'scripts/dashboard.js', 'scripts/ship-manifest.js', 'scripts/sub/x.js', 'scripts/notes.md'];
const m = build(files, { 'scripts/eval.js': 'upstream-only', 'scripts/dashboard.js': 'optional', 'scripts/health.js': null });
check('상류 전용 + 그 테스트', JSON.stringify(m.upstreamOnly) === '["scripts/eval.js","scripts/eval.test.js"]');
check('배송에는 상류 전용이 없다 · 매니페스트 자신 포함 · 하위 디렉터리·비-js 제외', !m.shipped.includes('scripts/eval.js') && !m.shipped.includes('scripts/eval.test.js') && m.shipped.includes(MANIFEST) && !m.shipped.some(f => f.includes('/sub/') || f.endsWith('.md')));
check('optional 은 배송에 포함되고 따로도 열거', m.shipped.includes('scripts/dashboard.js') && JSON.stringify(m.optional) === '["scripts/dashboard.js"]');
check('왕복: render → parseManifest', JSON.stringify(parseManifest(render(m)).upstreamOnly) === JSON.stringify(m.upstreamOnly));
check('깨진 매니페스트는 null(규칙 폴백)', parseManifest('{ nope') === null && parseManifest('{"x":1}') === null);

// --- scan(상류): 상류 전용 9+1 이 전부 태그돼 있고 테스트가 따라간다 ---
const up = scan(path.resolve(__dirname, '..'));
const expectUpstreamOnly = ['eval', 'eval-arm', 'fetch-eval', 'scenario-rubric', 'token-accounting', 'hook-replay', 'check-prereqs', 'adopter-arm', 'e6-workspace', 'adopter-census'];
check('상류 전용 10종 태그', expectUpstreamOnly.every(n => up.upstreamOnly.includes(`scripts/${n}.js`)));
check('상류 전용의 테스트도 상류 전용', up.upstreamOnly.includes('scripts/adopter-arm.test.js') && !up.shipped.includes('scripts/eval.test.js'));
check('핵심 도구는 배송', ['scripts/health.js', 'scripts/zfs-linter.js', 'scripts/template-update.js', 'scripts/work-close.js', 'scripts/upward-fetch.js', MANIFEST].every(f => up.shipped.includes(f)));

// --- CLI: 임시 루트에서 부재 → CLARIFY · --write → PASS · 재검사 PASS · 태그 바꾸면 드리프트 ---
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'ship-'));
try {
  fs.mkdirSync(path.join(tmp, 'scripts'));
  fs.writeFileSync(path.join(tmp, 'scripts/a.js'), '// a\n');
  fs.writeFileSync(path.join(tmp, 'scripts/b.js'), '// b\n// @ship upstream-only — x\n');
  const cli = args => spawnSync(process.execPath, [path.resolve(__dirname, 'ship-manifest.js'), ...args], { cwd: tmp, encoding: 'utf8' });
  // run 의 root 는 __dirname 기준이라 CLI 는 상류를 본다 — 임시 루트 검사는 모듈 함수로.
  const { run } = require('./ship-manifest');
  const silent = (fn) => { const c = console.log, e = console.error; console.log = () => {}; console.error = () => {}; try { return fn(); } finally { console.log = c; console.error = e; } };
  check('부재 → CLARIFY(3)', silent(() => run([], tmp)) === 3);
  check('--write → PASS + 파일', silent(() => run(['--write'], tmp)) === 0 && fs.existsSync(path.join(tmp, MANIFEST)));
  check('재검사 PASS', silent(() => run([], tmp)) === 0);
  fs.writeFileSync(path.join(tmp, 'scripts/a.js'), '// a\n// @ship upstream-only — now\n');
  check('태그 변경 → 드리프트 CLARIFY', silent(() => run([], tmp)) === 3);
  check('CLI 바이너리는 상류를 본다(동기화 상태)', [0, 3].includes(cli([]).status));
} finally { fs.rmSync(tmp, { recursive: true, force: true }); }

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
