// scripts/adopter-census.test.js
// 순수 함수 + 임시 어답터 픽스처 측정(읽기 전용 불변식 · 익명성). 실행: node scripts/adopter-census.test.js
const fs = require('fs');
const os = require('os');
const path = require('path');
const { statusHead, estimateArithmeticFrom, isUpstreamCandidate, measure, anonymize, render, appendSection, CONTRACT, COLS, INSTRUMENTS } = require('./adopter-census');
const { validateContract } = require('./gate-contract');

let pass = 0, fail = 0;
function check(label, cond) { if (cond) pass++; else { fail++; console.error(`FAIL ${label}`); } }

check('계약 선언 완전', validateContract(CONTRACT).length === 0);
check('계약에 REJECT 없음(관측)', !CONTRACT.outcomes.includes('REJECT'));

// --- 순수 ---
check('statusHead: 첫 토큰', statusHead('Done (2026-01-01, 배포됨)') === 'Done' && statusHead('  Review  ') === 'Review');
check('statusHead: null 은 null', statusHead(null) === null && statusHead('') === null);
check('statusHead: 괄호·대시 직결도 첫 토큰(어답터 C 실측 6건)', statusHead('Diagnosed(정정)') === 'Diagnosed' && statusHead('완료(로컬 검증)') === '완료' && statusHead('Active—x') === 'Active');
const { DIST_CAP } = require('./adopter-census');
const many = anonymize({ label: 'M', measured: 'd', version: { changelog: null }, anchor: { present: false }, instruments: { present: [], missing: [] }, docs: { total: 0, byDomain: {} },
  wo: { total: 20, malformed: 0, statusDist: Object.fromEntries(Array.from({ length: 12 }, (_, i) => [`S${i}`, 12 - i])), evidence: { value: 0, none: 0, missing: 0 }, closedBy: 0 },
  backfill: { targets: 0, estimable: 0 }, naming: { duplicates: 0, violations: 0 }, collisions: 0, arithmeticFrom: { current: 0, suggested: 0, colliding: [] }, fetch: { active: 0, vacuous: 0 },
  candidates: [], adapter: { present: false }, health: { fails: 0, dims: [] }, ledger: { adrs: 0 } });
check(`상태 분포는 상위 ${DIST_CAP}종 + 나머지 요약`, (many.wo.match(/S\d+ \d+/g) || []).length === DIST_CAP && /외 4종 10건/.test(many.wo));
const est = estimateArithmeticFrom([
  { domain: 'PLAN', id: '12' }, { domain: 'PRO', id: '12' }, { domain: 'PLAN', id: '20a' }, { domain: 'PRO', id: '20' },
  { domain: 'PLAN', id: '36' }, { domain: 'WO', id: '36a-1' }, { domain: 'FLOW', id: '12a' },
]);
check('arithmeticFrom 추정: PLAN·PRO 동번호 구간 12·20 → 제안 21', JSON.stringify(est.colliding) === '[12,20]' && est.suggested === 21);
check('충돌 없으면 0', estimateArithmeticFrom([{ domain: 'PLAN', id: '01' }, { domain: 'WO', id: '01a-1' }]).suggested === 0);
check('upstream_candidate: frontmatter 만', isUpstreamCandidate('---\nupstream_candidate: true\n---\n# x') && !isUpstreamCandidate('# x\nupstream_candidate: true\n'));

// --- 임시 어답터 픽스처: 측정 + 읽기 전용 + 익명 ---
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'census-'));
try {
  const w = (rel, txt) => { const abs = path.join(tmp, rel); fs.mkdirSync(path.dirname(abs), { recursive: true }); fs.writeFileSync(abs, txt); };
  w('.union-stack/adapter.json', JSON.stringify({ statusMap: { Done: 'Closed' }, evidenceFields: { evidence: ['implementation_commit'] } }));
  w('.union-stack/plan/PLAN-07_secret_product_name.md', '---\nstatus: Active\n---\n# (예시) 비밀 제품명\n');
  w('.union-stack/plan/PLAN-12_legacy.md', '---\nstatus: Active\n---\n# (예시)\n');
  w('.union-stack/proposals/PRO-12_legacy.md', '---\nstatus: Proposed\nupstream_candidate: true\n---\n# (예시)\n');
  w('.union-stack/sprint/WO-345_serial.md', '---\nstatus: Done (2026-01-01)\nplan: PLAN-07\nimplementation_commit: "abc"\n---\n## 목표\n## 수용 기준\n## 증거\n');
  w('.union-stack/sprint/WO-346_orphan.md', '---\nstatus: Active\nevidence: "none — x"\n---\n## 목표\n## 수용 기준\n## 증거\n');
  w('.union-stack/sprint/WO-347_nofm.md', '# (예시)\n**Status:** Review\n');
  w('CHANGELOG.md', '# C\n\n## [5.9.0]\n- x\n');
  w('scripts/health.js', '// stub — 실행되면 안 된다\nprocess.exit(99);\n');
  const snapshot = () => JSON.stringify(require('./fs_walk').collectFiles(tmp, '').map(r => [r, fs.statSync(path.join(tmp, r)).size, fs.readFileSync(path.join(tmp, r), 'utf8')]));
  const before = snapshot();
  const raw = measure(tmp, 'T', new Set(['PLAN-07']));
  check('측정: 레포 파일 쓰기 0(읽기 전용)', snapshot() === before);
  check('측정: 어답터 스크립트를 실행하지 않는다(계측기 존재만)', raw.instruments.present.includes('health.js') && raw.health && !raw.health.error === (raw.health.fails != null));
  // 3회차 실측: 상류 전용 adopter-arm 이 계측기 목록에 남아 사본 없는 A·C 가 9/10 으로 오보 — 계측기는 배송 도구만.
  check('계측기 목록에 상류 전용·키트 없음(배송 계측기 9)', !INSTRUMENTS.includes('adopter-arm.js') && !INSTRUMENTS.includes('union-stack-kit.js') && INSTRUMENTS.length === 9);
  check('headingDist: 선두 번호는 표기 변형(합산) · 공백 정규화', JSON.stringify(require('./adopter-census').headingDist(['## 1. 목표\n## 목표  \n## 2) 수용  기준'])) === JSON.stringify({ '목표': 2, '수용 기준': 1 }));
  // WO H2 헤딩 분포([PRO-28] 재료 — 어답터 답변: 한 의미에 표기 3~5종). 본문은 헤딩 줄만 센다.
  check('WO H2 헤딩 분포', raw.headings && raw.headings['목표'] === 2 && raw.headings['수용 기준'] === 2 && raw.headings['증거'] === 2 && Object.keys(raw.headings).length === 3);
  // [PRO-28] §6 성공 바 — 필수 절 매칭률은 **활성 WO 기준**(statusMap 적용 뒤 Draft/Active/Verifying; 레거시 종결분은 대상 밖). 픽스처: 345 는 Done→Closed, 346 만 활성·3절 완비.
  check('필수 절 매칭률: 활성 1 · 3절 100% · 완비 1', JSON.stringify(raw.sections) === JSON.stringify({ active: 1, goal: 1, accept: 1, evidence: 1, complete: 1 }));
  // [PRO-28] §6 판정(2026-10-17): 바 유지 + 잔여 원인 — 미해소 절을 규칙 밖(H2 없음 · 절 부재)/별칭 후보(미해소 헤딩 있음)/evidence 소급 으로 분류
  check('잔여 원인: 완비 레포는 전부 0', JSON.stringify(raw.residual) === JSON.stringify({ noH2: 0, absent: 0, alias: 0, evidence: 0, unresolved: [] }));
  // 활성 WO 셋: H2 없음 · 헤딩은 있으나 맵에 안 걸림(별칭 후보) · evidence 없음
  w('.union-stack/sprint/WO-348_noh2.md', '---\nstatus: Active\nevidence: "x"\n---\n본문만\n');
  w('.union-stack/sprint/WO-349_alias.md', '---\nstatus: Active\nevidence: "x"\n---\n## 목적·진입 조건\n## 완료 기준\n');
  w('.union-stack/sprint/WO-350_noev.md', '---\nstatus: Active\n---\n## 목표\n## 수용 기준\n');
  const raw2 = measure(tmp, 'T');
  check('잔여 원인 분류: H2 없음 1 · 별칭 후보 1(헤딩 2) · evidence 소급 1 · 절 부재 0', JSON.stringify({ ...raw2.residual, unresolved: raw2.residual.unresolved.map(u => u.heading) }) === JSON.stringify({ noH2: 1, absent: 0, alias: 1, evidence: 1, unresolved: ['목적·진입 조건', '완료 기준'] }));
  const row2 = anonymize(raw2);
  check('익명 행: 잔여 원인 열', /H2 없음 1 · 절 부재 0 · 별칭 후보 1 · evidence 소급 1 — 미해소 헤딩: 목적·진입 조건\(1\) · 완료 기준\(1\)/.test(row2.residual));
  for (const f of ['WO-348_noh2.md', 'WO-349_alias.md', 'WO-350_noev.md']) fs.rmSync(path.join(tmp, '.union-stack/sprint', f));
  check('WO 상태 첫 토큰 + statusMap 매핑(Done → Closed)', raw.wo.statusDist.Closed === 1 && raw.wo.statusDist.Active === 1 && raw.wo.malformed === 1);
  check('evidence 별칭 읽힘 + none 구별', raw.wo.evidence.value === 1 && raw.wo.evidence.none === 1 && raw.wo.evidence.missing === 0);
  check('백필 대상 1(추정 가능)', raw.backfill.targets === 1 && raw.backfill.estimable === 1);
  check('상류 ID 충돌 1(PLAN-07)', raw.collisions === 1);
  check('arithmeticFrom 제안 13(PLAN·PRO 12)', raw.arithmeticFrom.suggested === 13 && raw.arithmeticFrom.current === 0);
  check('upward-fetch 공백: 고아 1/활성 1', raw.fetch.active === 1 && raw.fetch.vacuous === 1);
  check('upstream_candidate ID 만', JSON.stringify(raw.candidates) === '["PRO-12"]');
  check('버전 헤딩', raw.version.changelog === '5.9.0' && raw.anchor.present === false);
  const row = anonymize(raw);
  const flat = JSON.stringify(row);
  check('익명 행: 경로 없음', !flat.includes(tmp) && !flat.includes(path.basename(tmp)));
  check('익명 행: 제목·파일명 없음', !flat.includes('secret_product_name') && !flat.includes('비밀 제품명') && !flat.includes('.md'));
  check('익명 행: 라벨·집계만', row.label === 'T' && /Closed 1/.test(row.wo) && row.collisions === '1' && /제안 13/.test(row.arithmeticFrom));
  check('익명 행: 필수 절 매칭률 열(활성 N · 절별 % · 3절 충족)', /활성 1 · 목표 100% · 수용 기준 100% · 증거 100% · 3절 충족 1/.test(row.sections));
  check('익명 행: 헤딩 분포(빈도순 · 상위 캡)', /목표 2 · 수용 기준 2 · 증거 2/.test(row.headings) || /^(목표|수용 기준|증거) 2 · (목표|수용 기준|증거) 2 · (목표|수용 기준|증거) 2$/.test(row.headings));
  const md = render([row, { label: 'X', measured: '2026-10-16', error: '.union-stack 없음' }], { date: '2026-10-16', upstreamVersion: '6.0.0', sha: 'abc1234' });
  check('렌더: 헤딩 + 표 + 측정 실패 행', md.startsWith('### 2026-10-16 — 상류 6.0.0 @ abc1234 · 레포 2') && md.includes('| T |') && md.includes('측정 실패'));
  check('렌더: 열 수 일치', md.split('\n').filter(l => l.startsWith('| T |'))[0].split('|').length - 2 === COLS.length);
  check('append: 마커 아래에 최신 회차', appendSection('# h\n\n<!-- census:rows -->\n\n### old\n', '### new\n').indexOf('### new') < appendSection('# h\n\n<!-- census:rows -->\n\n### old\n', '### new\n').indexOf('### old'));
  check('append: 마커 없으면 null', appendSection('# h\n', '### new\n') === null);
  check('측정 대상 아님은 error 행', measure(path.join(tmp, 'nope'), 'N').error && anonymize(measure(path.join(tmp, 'nope'), 'N')).error);
} finally { fs.rmSync(tmp, { recursive: true, force: true }); }

// --- [WO-29a-2] 동기화 지연 열([PRO-29] ①) — 앵커(받은 상류 블롭) vs 상류 origin/main 블롭. 읽기 전용 · 네트워크 0 ---
{
  const { syncLag } = require('./adopter-census');
  const tree = { 'scripts/a.js': 'A2', 'scripts/b.js': 'B1', 'CHANGELOG.md': 'C2' };
  check('앵커 없음 → 판별 불가(0 아님)', JSON.stringify(syncLag(null, tree)) === JSON.stringify({ anchor: false }));
  const lag = syncLag({ ref: 'main', blobs: { 'scripts/a.js': 'A1', 'scripts/b.js': 'B1', 'scripts/gone.js': 'G1' }, lastCheck: { at: '2026-10-19T00:00:00Z', updates: true } }, tree);
  check('지연 = 앵커 블롭 ≠ 상류 블롭 · 상류에서 사라진 파일은 따로', lag.anchor === true && lag.files === 3 && lag.behind === 1 && lag.removed === 1);
  check('자기 확인(lastCheck) 병기', lag.lastCheck.updates === true && lag.lastCheck.at === '2026-10-19T00:00:00Z');
  check('시딩 앵커의 후보 배열(gitBlobShas) — 하나라도 일치하면 지연 아님(어답터 실측: 120 중 100 이 배열)',
    syncLag({ blobs: { 'scripts/a.js': ['X', 'A2'], 'scripts/b.js': ['Y', 'Z'] } }, tree).behind === 1);
  const lagF = syncLag({ blobs: { 'scripts/a.js': 'A1', 'scripts/b.js': 'LOCAL' } }, { 'scripts/a.js': 'A2', 'scripts/b.js': 'B1' }, new Set(['A1', 'A2', 'B1']));
  check('상류 이력에 없는 앵커(foreign) — 지연과 따로(로컬 개조가 정합으로 시딩됨 → 다음 --apply 가 덮는다)', lagF.behind === 1 && lagF.foreign === 1);
  check('익명 열: foreign 표기', /이력 밖 앵커 1/.test(anonymize({ label: 'F', measured: 'd', version: { changelog: null }, anchor: { present: true }, instruments: { present: [], missing: [] }, docs: { total: 0, byDomain: {} },
    wo: { total: 0, malformed: 0, statusDist: {}, evidence: { value: 0, none: 0, missing: 0 }, closedBy: 0 }, backfill: { targets: 0, estimable: 0 }, naming: { duplicates: 0, violations: 0 }, collisions: 0,
    arithmeticFrom: { current: 0, suggested: 0, colliding: [] }, fetch: { active: 0, vacuous: 0 }, candidates: [], adapter: { present: false }, health: { fails: 0, dims: [] }, ledger: { adrs: 0 }, sync: lagF }).sync));
  // [WO-29a-3] B 실측 꼴: 이력 밖 앵커 5건이 전부 review — 3-way 가드는 sync 후보의 앵커만 쓰고 review 는 --apply·--force 어느 쪽도 쓰지 않는다 → 경보 아님
  const revPaths = ['AGENTS.md', 'README.md', 'package.json', '.union-stack/plan/_GUIDE.md', '.union-stack/sprint/_GUIDE.md'];
  const lagR = syncLag({ blobs: Object.fromEntries(revPaths.map(p => [p, 'LOCAL'])) }, Object.fromEntries(revPaths.map(p => [p, 'UP'])), new Set(['UP']));
  check('review 이력 밖 앵커 → foreign 0 · foreignReview 5 · 지연에서도 뺀다', lagR.foreign === 0 && lagR.foreignReview === 5 && lagR.behind === 0);
  const colR = anonymize({ label: 'R', measured: 'd', version: { changelog: null }, anchor: { present: true }, instruments: { present: [], missing: [] }, docs: { total: 0, byDomain: {} },
    wo: { total: 0, malformed: 0, statusDist: {}, evidence: { value: 0, none: 0, missing: 0 }, closedBy: 0 }, backfill: { targets: 0, estimable: 0 }, naming: { duplicates: 0, violations: 0 }, collisions: 0,
    arithmeticFrom: { current: 0, suggested: 0, colliding: [] }, fetch: { active: 0, vacuous: 0 }, candidates: [], adapter: { present: false }, health: { fails: 0, dims: [] }, ledger: { adrs: 0 }, sync: lagR }).sync;
  check('익명 열: review 이력 밖은 ⚠ 없이 INFO 표기', !colR.includes('⚠') && /review 이력 밖 5\(덮어쓰기 없음\)/.test(colR));
  // [WO-29a-4] 지연 5분류 — 바 = 적용 가능 0([PRO-29] §6 판정 2026-10-19)
  {
    const { gitBlobShas } = require('./template-update');
    const lagTree = { 'scripts/app.js': 'U1', 'scripts/fork.js': 'U2', 'AGENTS.md': 'U3', 'scripts/eval.js': 'U4', '.github/workflows/harness.yml': 'U5' };
    const anchor5 = { blobs: { 'scripts/app.js': 'A1', 'scripts/fork.js': 'A2', 'AGENTS.md': 'A3', 'scripts/eval.js': 'A4', '.github/workflows/harness.yml': 'A5' } };
    const localShas = { 'scripts/app.js': ['A1'], 'scripts/fork.js': gitBlobShas('local edit'), 'AGENTS.md': ['L3'], 'scripts/eval.js': ['A4'], '.github/workflows/harness.yml': ['A5'] };
    const k = syncLag(anchor5, lagTree, null, { upstreamOnly: new Set(['scripts/eval.js']), ignored: ['.github/workflows/harness.yml'], localShas });
    check('5분류: 적용 가능 1 · 보존 포크 1 · review 1 · 상류 전용 1 · 거부 1 · 합 = behind', JSON.stringify(k.kinds) === JSON.stringify({ applicable: 1, forked: 1, review: 1, upstreamOnly: 1, refused: 1 }) && k.behind === 5);
    check('로컬 파일 없음(sha 후보 없음)은 적용 가능(--apply 가 다시 받는다)', syncLag({ blobs: { 'scripts/app.js': 'A1' } }, { 'scripts/app.js': 'U1' }, null, { localShas: {} }).kinds.applicable === 1);
    check('ctx 없음(구 호출) → kinds 없음(회귀 0)', syncLag(anchor5, lagTree).kinds === undefined);
    const BASE5 = { label: 'K', measured: 'd', version: { changelog: null }, anchor: { present: true }, instruments: { present: [], missing: [] }, docs: { total: 0, byDomain: {} },
      wo: { total: 0, malformed: 0, statusDist: {}, evidence: { value: 0, none: 0, missing: 0 }, closedBy: 0 }, backfill: { targets: 0, estimable: 0 }, naming: { duplicates: 0, violations: 0 }, collisions: 0,
      arithmeticFrom: { current: 0, suggested: 0, colliding: [] }, fetch: { active: 0, vacuous: 0 }, candidates: [], adapter: { present: false }, health: { fails: 0, dims: [] }, ledger: { adrs: 0 } };
    const col5 = anonymize({ ...BASE5, sync: k }).sync;
    check('익명 열: 적용 가능이 맨 앞 + 나머지 갈래', /^적용 가능 1 \/ 앵커 5 · 보존 포크 1 · review 1 · 상류 전용 1 · 거부 1/.test(col5));
    check('익명 열: 적용 가능 0 이면 그렇게 쓴다', /^적용 가능 0 /.test(anonymize({ ...BASE5, sync: syncLag({ blobs: { 'AGENTS.md': 'A3' } }, { 'AGENTS.md': 'U3' }, null, { localShas: {} }) }).sync));
  }
  check('상류 트리 없음 → 비교 불가(behind null)', syncLag({ blobs: { 'scripts/a.js': 'A1' } }, null).behind === null);
  const base = { label: 'S', measured: 'd', version: { changelog: '6.0.0' }, anchor: { present: true, ref: 'main', date: '2026-10-19' }, instruments: { present: [], missing: [] }, docs: { total: 0, byDomain: {} },
    wo: { total: 0, malformed: 0, statusDist: {}, evidence: { value: 0, none: 0, missing: 0 }, closedBy: 0 }, backfill: { targets: 0, estimable: 0 }, naming: { duplicates: 0, violations: 0 }, collisions: 0,
    arithmeticFrom: { current: 0, suggested: 0, colliding: [] }, fetch: { active: 0, vacuous: 0 }, candidates: [], adapter: { present: false }, health: { fails: 0, dims: [] }, ledger: { adrs: 0 } };
  check('익명 열: 지연 N 파일 · 앵커 · 자기 확인', /지연 1 \/ 앵커 3 · 상류 삭제 1 · 자기 확인 업데이트 있음 @ 2026-10-19/.test(anonymize({ ...base, sync: lag }).sync));
  check('익명 열: 지연 0', /^지연 0 \/ 앵커 2/.test(anonymize({ ...base, sync: syncLag({ blobs: { 'scripts/b.js': 'B1', 'CHANGELOG.md': 'C2' } }, tree) }).sync));
  check('익명 열: 앵커 없음 = 판별 불가', /판별 불가/.test(anonymize({ ...base, sync: { anchor: false } }).sync));
  check('익명 열: 구 원자료(sync 없음) → —', anonymize(base).sync === '—');
  check('익명 열: 파일명 없음', !/scripts\//.test(anonymize({ ...base, sync: lag }).sync));
  check('COLS 에 동기화 지연', COLS.some(c => c[0] === 'sync'));
  // measure: 앵커 파일만 읽고 쓰지 않는다
  const tmpS = fs.mkdtempSync(path.join(os.tmpdir(), 'census-sync-'));
  try {
    fs.mkdirSync(path.join(tmpS, '.union-stack/sprint'), { recursive: true });
    const anchorTxt = JSON.stringify({ ref: 'main', blobs: { 'scripts/a.js': 'A1' } });
    fs.writeFileSync(path.join(tmpS, '.union-stack/template-sync.json'), anchorTxt);
    const r = measure(tmpS, 'S', new Set(), { upstreamTree: tree });
    check('measure: sync 원자료', r.sync && r.sync.behind === 1 && r.sync.files === 1);
    check('measure: 어답터 쓰기 0(앵커 파일 불변)', fs.readFileSync(path.join(tmpS, '.union-stack/template-sync.json'), 'utf8') === anchorTxt);
  } finally { fs.rmSync(tmpS, { recursive: true, force: true }); }
}

// --- [WO-29a-5] 규칙 이탈 4종 + 델타([PRO-29] ②(a)(b)) ---
{
  const { deviations, deltaOf } = require('./adopter-census');
  const R = (o = {}) => ({ health: { fails: 0, dims: [] }, rules: { blocks: 'ok', gateContractFork: false }, weakening: { kinds: [], exceptionsNet: 0 }, sync: { anchor: true, kinds: { applicable: 0 } }, ...o });
  check('이탈 없음 → []', JSON.stringify(deviations(R())) === '[]');
  check('① 게이트 red → gate:<차원>', JSON.stringify(deviations(R({ health: { fails: 1, dims: [{ name: 'naming gate', status: 'FAIL' }, { name: 'x', status: 'WARN' }] } }))) === '["gate:naming gate"]');
  check('② 규칙 파일: blocks 없음/낡음 · gate-contract 포크', JSON.stringify(deviations(R({ rules: { blocks: 'stale', gateContractFork: true } }))) === '["rule:blocks-stale","rule:gate-contract-fork"]'
    && deviations(R({ rules: { blocks: 'missing', gateContractFork: false } }))[0] === 'rule:blocks-missing');
  check('③ 약화: 종류별 1키 + 예외 순증', JSON.stringify(deviations(R({ weakening: { kinds: ['test-deleted', 'test-deleted', 'skip-added'], exceptionsNet: 2 } }))) === '["weak:exceptions","weak:skip-added","weak:test-deleted"]');
  check('④ 동기화: 적용 가능 > 0', JSON.stringify(deviations(R({ sync: { anchor: true, kinds: { applicable: 3 } } }))) === '["sync:applicable"]');
  check('관측 불가(약화 null · blocks absent)는 이탈이 아니다', JSON.stringify(deviations(R({ weakening: null, rules: { blocks: 'absent', gateContractFork: false } }))) === '[]');
  check('구 원자료(필드 없음) 호환 → 게이트만', JSON.stringify(deviations({ health: { fails: 0, dims: [] } })) === '[]');
  const d1 = deltaOf(null, ['gate:a', 'weak:b']);
  check('델타: 직전 없음 = 첫 회차 · 전부 신규', d1.first === true && d1.new.length === 2 && !d1.persist.length);
  const d2 = deltaOf(['gate:a', 'weak:b'], ['gate:a', 'sync:applicable']);
  check('델타: 신규 · 지속 · 해소', JSON.stringify([d2.new, d2.persist, d2.resolved]) === JSON.stringify([['sync:applicable'], ['gate:a'], ['weak:b']]) && d2.first === false);
  check('델타: 같은 이탈 재보고 = 지속(신규 0)', deltaOf(['gate:a'], ['gate:a']).new.length === 0);
  const BASED = { label: 'D', measured: 'd', version: { changelog: null }, anchor: { present: false }, instruments: { present: [], missing: [] }, docs: { total: 0, byDomain: {} },
    wo: { total: 0, malformed: 0, statusDist: {}, evidence: { value: 0, none: 0, missing: 0 }, closedBy: 0 }, backfill: { targets: 0, estimable: 0 }, naming: { duplicates: 0, violations: 0 }, collisions: 0,
    arithmeticFrom: { current: 0, suggested: 0, colliding: [] }, fetch: { active: 0, vacuous: 0 }, candidates: [], adapter: { present: false }, health: { fails: 0, dims: [] }, ledger: { adrs: 0 } };
  check('익명 열: 신규 키 · 지속·해소 수', /^신규 1 \(sync:applicable\) · 지속 1 · 해소 1$/.test(anonymize({ ...BASED, delta: d2 }).deviation));
  check('익명 열: 첫 회차', /^첫 회차 — 2 \(gate:a · weak:b\)$/.test(anonymize({ ...BASED, delta: d1 }).deviation));
  check('익명 열: 델타 없음(구 원자료) → —', anonymize(BASED).deviation === '—');
  check('COLS 에 이탈(신규)', COLS.some(c => c[0] === 'deviation'));
  // measure: 실제 git 레포 픽스처 — 약화(테스트 삭제)·blocks 없음 · 어답터 쓰기 0
  const { execFileSync } = require('child_process');
  const tmpD = fs.mkdtempSync(path.join(os.tmpdir(), 'census-dev-'));
  try {
    const g = (...a) => execFileSync('git', a, { cwd: tmpD, stdio: ['ignore', 'pipe', 'ignore'] }).toString().trim();
    fs.mkdirSync(path.join(tmpD, '.union-stack/sprint'), { recursive: true });
    fs.mkdirSync(path.join(tmpD, 'scripts'));
    fs.writeFileSync(path.join(tmpD, 'scripts/a.test.js'), "check('x', 1)\n");
    fs.writeFileSync(path.join(tmpD, 'AGENTS.md'), '# agents\n');
    g('init', '-q'); g('-c', 'user.email=t@t', '-c', 'user.name=t', 'add', '-A'); g('-c', 'user.email=t@t', '-c', 'user.name=t', 'commit', '-qm', 'base');
    const head0 = g('rev-parse', 'HEAD');
    const r0 = measure(tmpD, 'D');
    check('measure: head 기록 · 첫 회차 약화 범위 = 작업 트리', r0.head === head0 && r0.weakening && r0.weakening.range === 'HEAD');
    check('measure: AGENTS.md 에 blocks 마커 없음 → missing', r0.rules.blocks === 'missing');
    fs.rmSync(path.join(tmpD, 'scripts/a.test.js'));
    const before = g('status', '--porcelain');
    const r1 = measure(tmpD, 'D', new Set(), { prevHead: head0 });
    check('measure: 직전 HEAD 이후 테스트 삭제 → weak:test-deleted', deviations(r1).includes('weak:test-deleted') && r1.weakening.range === head0);
    check('measure: 어답터 쓰기 0(git 상태 불변)', g('status', '--porcelain') === before);
  } finally { fs.rmSync(tmpD, { recursive: true, force: true }); }
}

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
