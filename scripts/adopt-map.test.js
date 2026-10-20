// scripts/adopt-map.test.js
// init --adopt 매핑안(순수 + 픽스처) — [WO-29a-11], [PRO-29] ③(a). 실행: node scripts/adopt-map.test.js
const fs = require('fs'), os = require('os'), path = require('path');
const { execFileSync } = require('child_process');
const { RULES, classify, assignIds, draftAdapter, scan, plan, migrationHomes, headingsOf } = require('./adopt-map');
const { isValidName } = require('./zfs_util');

let pass = 0, fail = 0;
function check(label, cond) { if (cond) pass++; else { fail++; console.error(`FAIL ${label}`); } }

// --- 규칙의 정본 = MIGRATION.md 매핑표: 표의 모든 자리에 규칙이 있고, 표에 없는 규칙은 없다 ---
const homes = migrationHomes(fs.readFileSync(path.join(__dirname, '..', 'MIGRATION.md'), 'utf8'));
check('매핑표 판독: 17행', homes.length === 17);
check('표의 모든 자리에 규칙 1개 이상', homes.every(h => RULES.some(r => r.home === h)));
check('표에 없는 규칙 없음', RULES.every(r => homes.includes(r.home)));

// --- 분류기: 경로 + 헤딩 → 도메인 · 확신도 ---
const C = (p, hs = []) => classify(p, hs);
check('ADR 디렉터리 + ADR 헤딩 → 원장 · high', C('docs/decisions/0007-db.md', ['Status', 'Context', 'Decision', 'Consequences']).home === '.union-stack/archive_ledger.md' && C('docs/decisions/0007-db.md', ['Decision']).confidence === 'high');
check('인프라 결정(경로 deploy) → INF', C('docs/deploy/database-choice.md', ['Database choice']).domain === 'INF');
check('회의록 → MTG · 헤딩 없으면 medium', C('docs/meetings/2026-01-kickoff.md').domain === 'MTG' && C('docs/meetings/2026-01-kickoff.md').confidence === 'medium');
check('요구사항 문서 → PLAN', C('docs/requirements/payments.md', ['Requirements', 'Goals']).domain === 'PLAN');
check('포스트모템 → LSN · high', C('docs/postmortems/outage.md', ['Root cause']).domain === 'LSN' && C('docs/postmortems/outage.md', ['Root cause']).confidence === 'high');
check('아키텍처 → ARCH', C('docs/architecture/layers.md', ['Layering rules']).domain === 'ARCH');
check('로드맵 → PHASE (plan 보다 먼저)', C('docs/roadmap.md', ['Roadmap', 'Milestones']).domain === 'PHASE');
check('README → IDENTITY 자리(ID 없음)', C('README.md', ['Overview']).home === '.union-stack/project/IDENTITY*.md' && C('README.md', ['Overview']).domain === null);
check('API 계약 → CON', C('docs/api/orders-schema.md', ['Interface']).domain === 'CON');
check('도메인 모델 → DOM', C('docs/domain/pricing-model.md', ['Pricing formula']).domain === 'DOM');
check('헤딩만 맞음 → medium', C('notes/x.md', ['Root cause analysis']).domain === 'LSN' && C('notes/x.md', ['Root cause analysis']).confidence === 'medium');
check('아무 신호 없음 → low · 자리 없음', C('misc/random.md', ['Hello']).confidence === 'low' && C('misc/random.md', ['Hello']).home === null);
// 실측(이식 전 사본): 파일명 키워드 + 헤딩이 디렉터리를 이겼다(proposals/handoff_compaction → HANDOFF) — 디렉터리 신호가 파일명보다 무겁다
check('디렉터리 > 파일명 키워드(proposals/handoff_x + 인계 헤딩 → PRO)', C('docs/proposals/handoff_compaction.md', ['인계 압축', 'handoff budget']).domain === 'PRO');
check('디렉터리 > 파일명 키워드(proposals/gate_contract_sync → PRO, CON 아님)', C('docs/proposals/gate_contract_sync.md', ['contract sync']).domain === 'PRO');
check('README 같은 파일명 규칙은 그대로(디렉터리 없음)', C('README.md', ['Overview']).home === '.union-stack/project/IDENTITY*.md');
// 확신도 임계(인간 판정 2026-10-20, [PRO-29] §7-4): high = **디렉터리 + 헤딩** 만. 파일명 + 헤딩은 medium — 평평한 트리 실측에서 high 1/6 이었다.
check('파일명+헤딩 → medium(README)', C('README.md', ['Overview']).confidence === 'medium');
check('파일명+헤딩 → medium(평평한 docs/handoff)', C('docs/handoff_notes.md', ['Handoff']).confidence === 'medium');
check('디렉터리+헤딩 → high', C('docs/meetings/kickoff.md', ['Attendees']).confidence === 'high');
check('디렉터리+파일명(헤딩 없음) → medium', C('docs/meetings/meeting_notes.md').confidence === 'medium');
// OSS 실측(nodejs/TSC): 하위 디렉터리의 README(votes/README.md)가 IDENTITY 로 갔다 — 정체성 README 는 레포 루트 하나뿐이다
check('하위 README → IDENTITY 아님', C('votes/README.md').home !== '.union-stack/project/IDENTITY*.md' && C('votes/initiateNewVote/README.md', ['How to start a vote']).home !== '.union-stack/project/IDENTITY*.md');
check('루트 README → IDENTITY(파일명 신호)', C('README.md').home === '.union-stack/project/IDENTITY*.md');
check('vision·scope·glossary 는 어디서든 IDENTITY', C('docs/vision.md').home === '.union-stack/project/IDENTITY*.md' && C('docs/glossary.md').home === '.union-stack/project/IDENTITY*.md');
check('하위 README 라도 디렉터리 규칙은 그대로(docs/meetings/README → MTG)', C('docs/meetings/README.md', ['Meeting notes index']).domain === 'MTG');
check('한국어 헤딩도 신호(회의·참석자)', C('docs/x.md', ['회의록', '참석자']).domain === 'MTG');

// --- ID 부여: 도메인별 연속 · 결정적 · ZFS 이름 유효 ---
const rows = [
  { from: 'docs/meetings/b.md', ...C('docs/meetings/b.md') }, { from: 'docs/meetings/a.md', ...C('docs/meetings/a.md') },
  { from: 'docs/requirements/payments.md', ...C('docs/requirements/payments.md', ['Requirements']) },
  { from: 'README.md', ...C('README.md', ['Overview']) }, { from: 'misc/random.md', ...C('misc/random.md') },
];
const ided = assignIds(rows);
const byFrom = f => ided.find(r => r.from === f);
check('도메인별 연속 ID · 경로 정렬 순', byFrom('docs/meetings/a.md').proposedId === 'MTG-01' && byFrom('docs/meetings/b.md').proposedId === 'MTG-02' && byFrom('docs/requirements/payments.md').proposedId === 'PLAN-01');
check('to 파일명은 ZFS 유효', ided.filter(r => r.proposedId).every(r => isValidName(path.posix.basename(r.to))));
check('ID 없는 자리(IDENTITY)는 proposedId null · to = 그 자리', byFrom('README.md').proposedId === null && byFrom('README.md').to === '.union-stack/project/IDENTITY*.md');
check('low 행은 to 없음(매핑 안 함)', byFrom('misc/random.md').to === null);
check('결정적(같은 입력 → 같은 출력)', JSON.stringify(assignIds(rows)) === JSON.stringify(ided));
check('비ASCII 파일명도 유효한 slug', isValidName(path.posix.basename(assignIds([{ from: 'docs/meetings/킥오프.md', ...C('docs/meetings/킥오프.md') }])[0].to)));

// --- adapter.json 초안: sections(H2 별칭 후보) · statusMap(status 값) · localOwned(scripts/) ---
const ad = draftAdapter({
  workDocs: [{ headings: ['Objective', 'Acceptance criteria', 'Notes'] }, { headings: ['목적', '완료 기준', '검증'] }],
  statuses: ['Done', 'In progress', 'Todo', 'Done', 'Blocked'],
  scripts: ['scripts/build.sh', 'scripts/deploy.js'],
});
check('sections: 필수 3절 별칭 후보만(대상에 실재하는 헤딩)', JSON.stringify(ad.sections['목표'].sort()) === JSON.stringify(['Objective', '목적']) && ad.sections['수용 기준'].includes('완료 기준') && ad.sections['증거'].includes('검증') && !JSON.stringify(ad.sections).includes('Notes'));
check('statusMap: 알려진 어휘 → 상류 · 모르는 값은 제외하고 목록', ad.statusMap.Done === 'Closed' && ad.statusMap['In progress'] === 'Active' && ad.statusMap.Todo === 'Draft' && !('Blocked' in ad.statusMap) && ad.unmappedStatus.includes('Blocked'));
check('localOwned: 대상 scripts/ 기존 파일', JSON.stringify(ad.localOwned) === '["scripts/build.sh","scripts/deploy.js"]');

// --- 스캔·계획: 실 파일 트리 · 헤딩만 · 대상 쓰기 0 ---
check('headingsOf: # 줄만', JSON.stringify(headingsOf('# A\ntext\n## B\n```\n# not\n```\n### C\n')) === '["A","B","C"]');
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'adopt-'));
try {
  const w = (p, t) => { fs.mkdirSync(path.dirname(path.join(tmp, p)), { recursive: true }); fs.writeFileSync(path.join(tmp, p), t); };
  w('README.md', '# Overview\nsecret body text\n');
  w('docs/decisions/0001-use-postgres.md', '# Use Postgres\n## Status\n## Context\n## Decision\n');
  w('docs/meetings/kickoff.md', '# Kickoff\n## Attendees\n');
  w('docs/tasks/T-1.md', '---\nstatus: In progress\n---\n# T-1\n## Objective\n## Acceptance criteria\n');
  w('node_modules/pkg/README.md', '# vendored\n');
  w('scripts/build.sh', 'echo');
  execFileSync('git', ['init', '-q'], { cwd: tmp }); execFileSync('git', ['-c', 'core.autocrlf=false', 'add', '-A'], { cwd: tmp, stdio: 'ignore' });
  execFileSync('git', ['-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-qm', 'x'], { cwd: tmp });
  const before = execFileSync('git', ['status', '--porcelain'], { cwd: tmp, encoding: 'utf8' });
  const s = scan(tmp);
  check('scan: node_modules·.git 제외 · md 만', s.docs.map(d => d.file).sort().join(',') === 'README.md,docs/decisions/0001-use-postgres.md,docs/meetings/kickoff.md,docs/tasks/T-1.md');
  const p = plan(tmp);
  check('plan: 행마다 from·to·domain·proposedId·confidence·why', p.rows.length === 4 && p.rows.every(r => 'from' in r && 'to' in r && 'confidence' in r && 'why' in r));
  check('plan: 본문은 결과에 없다(헤딩만)', !JSON.stringify(p).includes('secret body text'));
  check('plan: 작업 문서 → WO · adapter 초안에 sections·statusMap', p.rows.find(r => r.from === 'docs/tasks/T-1.md').domain === 'WO' && p.adapter.statusMap['In progress'] === 'Active' && p.adapter.sections['목표'].includes('Objective'));
  check('plan: 요약 수(high·medium·low)', p.summary.high + p.summary.medium + p.summary.low === 4);
  check('대상 쓰기 0(git status 불변)', execFileSync('git', ['status', '--porcelain'], { cwd: tmp, encoding: 'utf8' }) === before);
  check('.union-stack 이 이미 있으면 거부(이식 대상 아님)', (() => { fs.mkdirSync(path.join(tmp, '.union-stack')); try { plan(tmp); return false; } catch (e) { return /이미/.test(e.message); } })());
} finally { fs.rmSync(tmp, { recursive: true, force: true }); }

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
