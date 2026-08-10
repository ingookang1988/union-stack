// scripts/template-update.test.js
// 순수 함수 단위 테스트(네트워크 없음 — hermetic). 실행: node scripts/template-update.test.js
const { classifyPath, parseChangelogVersion, cmpVersions, gitBlobSha, gitBlobShas, buildPlan, migrationActions } = require('./template-update');

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

// --- migrationActions: (from, to] 구간의 ⚠ 줄만 ---
check('구간 내 ⚠ 추출', migrationActions(CL, '6.0.0', '6.1.0'), ['- ⚠ tier 필드 도입 — 게이트 재실행 필요']);
check('from 버전 자체는 제외', migrationActions(CL, '6.0.0', '6.0.0'), []);
check('from 없음(신규 채택) → 전 구간', migrationActions(CL, null, '6.1.0').length, 2);
check('Unreleased는 제외', migrationActions(CL, '6.1.0', '6.1.0'), []);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
