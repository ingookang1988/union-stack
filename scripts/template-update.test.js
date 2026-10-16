// scripts/template-update.test.js
// 순수 함수 단위 테스트(네트워크 없음 — hermetic). 실행: node scripts/template-update.test.js
const fs = require('fs');
const os = require('os');
const path = require('path');
const { classifyPath, parseChangelogVersion, cmpVersions, gitBlobSha, gitBlobShas, buildPlan,
  classifySyncTargets, readAnchor, seedAnchor, migrationActions, ANCHOR_PATH } = require('./template-update');

let pass = 0, fail = 0;
function check(label, got, exp) {
  const ok = JSON.stringify(got) === JSON.stringify(exp);
  if (ok) pass++; else { fail++; console.error(`FAIL ${label}: got ${JSON.stringify(got)}, exp ${JSON.stringify(exp)}`); }
}

// --- classifyPath: sync / review / 불가침 ---
check('scripts → sync', classifyPath('scripts/health.js'), 'sync');
check('workflow → sync', classifyPath('.github/workflows/harness.yml'), 'sync');
check('CHANGELOG → sync', classifyPath('CHANGELOG.md'), 'sync');
check('AGENTS → review(규범)', classifyPath('AGENTS.md'), 'review');
check('가이드 → review', classifyPath('.union-stack/sprint/_GUIDE.md'), 'review');
check('어답터 콘텐츠 → 불가침', classifyPath('.union-stack/sprint/HANDOFF.md'), null);
check('어답터 원장 → 불가침', classifyPath('.union-stack/archive_ledger.md'), null);
check('어답터 소스 → 불가침', classifyPath('src/app.js'), null);
check('어답터 설정 → 불가침(상류 불간섭)', classifyPath('.union-stack/adapter.json'), null);
check('정합 앵커 매니페스트 → 불가침', classifyPath(ANCHOR_PATH), null);
check('스크립트 하위 디렉터리 → 불가침(1레벨만)', classifyPath('scripts/vendor/x.js'), null);

// --- parseChangelogVersion: Unreleased 건너뛰고 첫 릴리스 헤딩 ---
const CL = `# Changelog\n\n## [Unreleased]\n- foo\n\n## [6.1.0] — 2026-09-01\n- ⚠ tier 필드 도입 — 게이트 재실행 필요\n- 기타\n\n## [6.0.0] — 2026-06-15\n- ⚠ eval 표면 추가\n`;
check('최신 릴리스 버전', parseChangelogVersion(CL), '6.1.0');
check('헤딩 없음 → null', parseChangelogVersion('그냥 텍스트'), null);

// --- cmpVersions ---
check('동일', cmpVersions('6.0.0', '6.0.0'), 0);
check('로컬 구버전', cmpVersions('6.0.0', '6.1.0'), -1);
check('로컬 앞섬', cmpVersions('6.10.0', '6.9.9'), 1);
check('세그먼트 수 상이', cmpVersions('6.0', '6.0.1'), -1);

// --- gitBlobSha(s): git hash-object와 동일 + 개행 이형 흡수(양방향) ---
check('known blob sha ("test\\n")', gitBlobSha('test\n'), '9daeafb9864cf43055ae93beb0afd6c7d144bfa4');
check('LF 파일 → LF 후보 포함(+CRLF 변형)', gitBlobShas('test\n').includes('9daeafb9864cf43055ae93beb0afd6c7d144bfa4'), true);
check('CRLF 파일 → 원본+정규화 2후보(상류가 CRLF 블롭이든 LF 블롭이든 일치)',
  gitBlobShas('test\r\n').includes(gitBlobSha('test\r\n')) && gitBlobShas('test\r\n').includes('9daeafb9864cf43055ae93beb0afd6c7d144bfa4'), true);
check('개행만 다른 로컬 CRLF vs 상류 LF 블롭 → 드리프트 아님',
  buildPlan({ 'scripts/health.js': gitBlobShas('x\r\n') }, { 'scripts/health.js': gitBlobSha('x\n') }).changedSync, []);
check('개행만 다른 로컬 LF vs 상류 CRLF 블롭 → 드리프트 아님(harness.yml 실측 사례)',
  buildPlan({ 'scripts/health.js': gitBlobShas('x\n') }, { 'scripts/health.js': gitBlobSha('x\r\n') }).changedSync, []);

// --- buildPlan ---
const local = { 'scripts/health.js': 'aaa', 'AGENTS.md': 'ccc', 'scripts/gone.js': 'x', '.union-stack/sprint/HANDOFF.md': 'zzz' };
const upstream = {
  'scripts/health.js': 'bbb',            // 변경(sync)
  'AGENTS.md': 'ddd',                    // 변경(review)
  'scripts/new-tool.js': 'e',            // 신규(sync)
  'scripts/leakage-guard.js': 'f',       // TEMPLATE_BITS — 로컬 부재 시 재추가 금지
  '.union-stack/sprint/HANDOFF.md': 'q', // 불가침 — 계획에 안 들어감
  'src/theirs.js': 'r',                  // 템플릿 소유 아님
};
const plan = buildPlan(local, upstream);
check('변경 sync', plan.changedSync, ['scripts/health.js']);
check('변경 review', plan.changedReview, ['AGENTS.md']);
check('신규 sync', plan.newSync, ['scripts/new-tool.js']);
check('drop된 템플릿 비트 재추가 금지', plan.dropped, ['scripts/leakage-guard.js']);
check('상류에서 사라진 파일', plan.removedUpstream, ['scripts/gone.js']);
check('불가침 콘텐츠는 어떤 목록에도 없음',
  JSON.stringify(plan).includes('HANDOFF'), false);

// --- classifySyncTargets: 3-way 로컬 개조 보호 ---
// 실측 사고: sync 파일에 반복 재적용 중이던 로컬 패치 2건을 `--apply` 가 조용히 덮어써
// 게이트 2개가 즉시 FAIL 했다. 앵커와 대조해 개조를 골라내는 것이 그 사고의 회귀 고정이다.
const A = gitBlobSha('anchor content\n');
const localFiles = {
  'scripts/health.js': gitBlobShas('anchor content\n'),   // 손대지 않음 → clean
  'scripts/zfs-linter.js': gitBlobShas('local patch\n'),  // 개조 → modified
  'scripts/query.js': gitBlobShas('whatever\n'),          // 앵커에 없음 → unknown
};
const anchor = { 'scripts/health.js': A, 'scripts/zfs-linter.js': A };
const g = classifySyncTargets(
  ['scripts/health.js', 'scripts/zfs-linter.js', 'scripts/query.js', 'scripts/brand-new.js'],
  localFiles, anchor);
check('앵커와 같으면 clean', g.clean.includes('scripts/health.js'), true);
check('앵커와 다르면 modified(개조 보존 대상)', g.modified, ['scripts/zfs-linter.js']);
check('앵커 없으면 unknown(통과로 위조 금지)', g.unknown, ['scripts/query.js']);
check('로컬에 없는 상류 신규는 clean(잃을 것이 없다)', g.clean.includes('scripts/brand-new.js'), true);
check('세 목록은 서로소 + 전수', g.clean.length + g.modified.length + g.unknown.length, 4);
check('앵커 전무 → 전부 unknown(첫 --apply 가 조용히 덮어쓰지 않는다)',
  classifySyncTargets(['scripts/health.js'], localFiles, {}).unknown, ['scripts/health.js']);
// 앵커가 배열(init 시딩)이든 문자열(--apply 기록)이든 같은 판정이어야 한다.
check('배열 앵커도 동일 판정',
  classifySyncTargets(['scripts/health.js'], localFiles, { 'scripts/health.js': gitBlobShas('anchor content\n') }).clean,
  ['scripts/health.js']);
check('개행만 다른 로컬은 개조가 아니다',
  classifySyncTargets(['x'], { x: gitBlobShas('anchor content\r\n') }, { x: A }).clean, ['x']);

// --- readAnchor / seedAnchor: 매니페스트 왕복 ---
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tu-'));
check('앵커 파일 없음 → 빈 앵커(예외 아님)', readAnchor(tmp), {});
fs.mkdirSync(path.join(tmp, '.union-stack'), { recursive: true });
fs.writeFileSync(path.join(tmp, ANCHOR_PATH), '{ broken json');
check('깨진 앵커 → 빈 앵커(도구가 죽지 않는다)', readAnchor(tmp), {});
fs.mkdirSync(path.join(tmp, 'scripts'), { recursive: true });
fs.writeFileSync(path.join(tmp, 'scripts/health.js'), 'seeded\n');
seedAnchor(tmp, 'clone@6.0.0');
const seeded = readAnchor(tmp);
check('시딩된 앵커가 로컬 해시를 담는다',
  (seeded['scripts/health.js'] || []).includes(gitBlobSha('seeded\n')), true);
check('시딩 직후에는 개조 0(클론 == 상류)',
  classifySyncTargets(['scripts/health.js'], { 'scripts/health.js': gitBlobShas('seeded\n') }, seeded).modified, []);
fs.writeFileSync(path.join(tmp, 'scripts/health.js'), 'seeded\n// 어답터 패치\n');
check('시딩 후 손대면 modified 로 잡힌다',
  classifySyncTargets(['scripts/health.js'], { 'scripts/health.js': gitBlobShas('seeded\n// 어답터 패치\n') }, seeded).modified,
  ['scripts/health.js']);
fs.rmSync(tmp, { recursive: true, force: true });

// --- migrationActions: (from, to] 구간의 ⚠ 줄만 ---
check('구간 내 ⚠ 추출', migrationActions(CL, '6.0.0', '6.1.0'), ['- ⚠ tier 필드 도입 — 게이트 재실행 필요']);
check('from 버전 자체는 제외', migrationActions(CL, '6.0.0', '6.0.0'), []);
check('from 없음(신규 채택) → 전 구간', migrationActions(CL, null, '6.1.0').length, 2);
check('Unreleased는 제외', migrationActions(CL, '6.1.0', '6.1.0'), []);

// --- [PRO-24] ①(b)(c) 글롭 · ctx 분류 · 매니페스트 화이트리스트 · buildPlan ctx ---
const { matchGlob, ownedConflicts } = require('./template-update');
check('glob: * 는 구간 안', [matchGlob('scripts/*-linter.js', 'scripts/zfs-linter.js'), matchGlob('scripts/*-linter.js', 'scripts/sub/x-linter.js')], [true, false]);
check('glob: ** 는 횡단 · ? 한 글자 · 역슬래시 정규화', [matchGlob('scripts/docker-ci/**', 'scripts/docker-ci/a/b.sh'), matchGlob('scripts/v?.js', 'scripts/v1.js'), matchGlob('scripts\\verify.sh', 'scripts/verify.sh')], [true, true, true]);
check('glob: 점은 리터럴', matchGlob('scripts/verify.sh', 'scripts/verifyXsh'), false);
const MF = { shipped: ['scripts/health.js', 'scripts/zfs-linter.js', 'scripts/ship-manifest.json'], upstreamOnly: ['scripts/eval.js', 'scripts/adopter-arm.js'], optional: [] };
const CTX = { manifest: MF, localOwned: ['scripts/verify.sh', 'scripts/*-linter.js'] };
check('ctx 없음 = 규칙 폴백(구버전)', classifyPath('scripts/eval.js'), 'sync');
check('상류 전용 → null(배송 제외)', classifyPath('scripts/eval.js', CTX), null);
check('매니페스트 밖 로컬 스크립트 → null(기본 로컬)', classifyPath('scripts/their-tool.js', CTX), null);
check('열거된 파일 → sync', classifyPath('scripts/health.js', CTX), 'sync');
check('localOwned 글롭 → null(어답터 소유)', classifyPath('scripts/verify.sh', CTX), null);
check('글롭이 열거 파일과 겹치면 sync 우선', classifyPath('scripts/zfs-linter.js', CTX), 'sync');
check('충돌 목록', ownedConflicts(MF, CTX.localOwned), ['scripts/zfs-linter.js']);
check('비스크립트는 규칙대로(글롭 없으면)', [classifyPath('AGENTS.md', CTX), classifyPath('ci/Dockerfile', CTX)], ['review', 'sync']);
const localCtxT = { manifest: { shipped: ['scripts/health.js', 'scripts/ship-manifest.json'], upstreamOnly: ['scripts/eval.js'], optional: [] }, localOwned: ['scripts/verify.sh'] };
const upCtxT = { manifest: { shipped: ['scripts/health.js', 'scripts/new-tool.js', 'scripts/ship-manifest.json'], upstreamOnly: ['scripts/eval.js', 'scripts/adopter-arm.js'], optional: [] }, localOwned: ['scripts/verify.sh'] };
const planC = buildPlan(
  { 'scripts/health.js': 'a', 'scripts/eval.js': 'e', 'scripts/verify.sh': 'v', 'scripts/their-tool.js': 't' },
  { 'scripts/health.js': 'b', 'scripts/eval.js': 'e2', 'scripts/adopter-arm.js': 'n', 'scripts/new-tool.js': 'z', 'scripts/ship-manifest.json': 'm' },
  { local: localCtxT, upstream: upCtxT });
check('상류 신규 중 전용(adopter-arm)은 제외 · 열거된 신규(new-tool · 매니페스트)는 배송', planC.newSync, ['scripts/new-tool.js', 'scripts/ship-manifest.json']);
check('상류 전용 변경(eval)은 갱신 안 함 · 열거 변경(health)은 갱신', planC.changedSync, ['scripts/health.js']);
check('로컬 사본(eval)은 upstreamOnlyLocal 로', planC.upstreamOnlyLocal, ['scripts/eval.js']);
check('localOwned·매니페스트 밖 로컬은 "사라진 파일" 오보 없음', planC.removedUpstream, []);
check('옛 로컬 매니페스트로 상류 신규를 거르지 않는다(상류 ctx 로 분류)', planC.newSync.includes('scripts/new-tool.js'), true);

// --- 상류 매니페스트 부재(구버전 상류): shipped null = 규칙 폴백 + 상류 전용 제외 · 남은 사본은 FS 기준 ---
const FB = { manifest: { shipped: null, upstreamOnly: ['scripts/eval.js', 'scripts/adopter-arm.js'], optional: [] }, localOwned: [] };
check('shipped null: 상류 전용은 제외', classifyPath('scripts/eval.js', FB), null);
check('shipped null: 그 외 스크립트는 규칙 폴백(sync)', classifyPath('scripts/anything.js', FB), 'sync');
const planFb = buildPlan({ 'scripts/health.js': 'a' }, { 'scripts/health.js': 'b', 'scripts/eval.js': 'e', 'scripts/adopter-arm.js': 'n' },
  { local: { manifest: { shipped: ['scripts/health.js'], upstreamOnly: ['scripts/eval.js', 'scripts/adopter-arm.js'], optional: [] }, localOwned: [], presentUpstreamOnly: ['scripts/eval.js'] }, upstream: FB });
check('구버전 상류에서도 전용 스크립트는 신규로 둔갑하지 않는다', planFb.newSync, []);
check('남은 사본은 FS(presentUpstreamOnly) 기준으로 보고', planFb.upstreamOnlyLocal, ['scripts/eval.js']);

// --- --force 경로 지정: 그 파일만 보호 해제, 나머지 개조는 보존(카나리아 실측 — localForked 7건 중 1건만 상류 수용) ---
const { forceTargets } = require('./template-update');
const G = { clean: ['a.js'], modified: ['dash.js', 'hist.js'], unknown: ['q.js'] };
check('force 없음: clean 만', forceTargets(G, false), { targets: ['a.js'], skipped: ['dash.js', 'hist.js', 'q.js'], unmatched: [] });
check('force 전부', forceTargets(G, true).targets, ['a.js', 'dash.js', 'hist.js', 'q.js']);
check('force 경로 1건: 그것만 + 나머지 보존 + 대상 아님 표기', forceTargets(G, ['dash.js', 'nope.js']), { targets: ['a.js', 'dash.js'], skipped: ['hist.js', 'q.js'], unmatched: ['nope.js'] });

// --- --seed [ref]: 네트워크 없이 전 파일 앵커(명시적 단언) ---
const { spawnSync: spawnTU } = require('child_process');
const seedTmp = fs.mkdtempSync(path.join(os.tmpdir(), 'tu-seed-'));
try {
  fs.mkdirSync(path.join(seedTmp, 'scripts'), { recursive: true });
  fs.mkdirSync(path.join(seedTmp, '.union-stack'), { recursive: true });
  fs.writeFileSync(path.join(seedTmp, 'scripts/health.js'), 'x\n');
  // run 은 __dirname 기준 root 라 CLI 는 상류를 본다 — 함수로 검증(seedAnchor 는 위에서 이미), CLI 는 상류 자신에 --seed 가 **쓰지 않게** 하기 위해 여기선 호출하지 않는다.
  seedAnchor(seedTmp, 'manual-test');
  const sa = JSON.parse(fs.readFileSync(path.join(seedTmp, ANCHOR_PATH), 'utf8'));
  check('seed: ref 라벨 + 로컬 해시', sa.ref === 'manual-test' && (sa.blobs['scripts/health.js'] || []).includes(gitBlobSha('x\n')), true);
} finally { fs.rmSync(seedTmp, { recursive: true, force: true }); }
check('--seed 는 main 의 분기(네트워크 전)에 있다', /argv\.indexOf\('--seed'\)/.test(fs.readFileSync(path.join(__dirname, 'template-update.js'), 'utf8')) && typeof spawnTU === 'function', true);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
