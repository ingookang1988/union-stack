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
  check('익명 행: 헤딩 분포(빈도순 · 상위 캡)', /목표 2 · 수용 기준 2 · 증거 2/.test(row.headings) || /^(목표|수용 기준|증거) 2 · (목표|수용 기준|증거) 2 · (목표|수용 기준|증거) 2$/.test(row.headings));
  const md = render([row, { label: 'X', measured: '2026-10-16', error: '.union-stack 없음' }], { date: '2026-10-16', upstreamVersion: '6.0.0', sha: 'abc1234' });
  check('렌더: 헤딩 + 표 + 측정 실패 행', md.startsWith('### 2026-10-16 — 상류 6.0.0 @ abc1234 · 레포 2') && md.includes('| T |') && md.includes('측정 실패'));
  check('렌더: 열 수 일치', md.split('\n').filter(l => l.startsWith('| T |'))[0].split('|').length - 2 === COLS.length);
  check('append: 마커 아래에 최신 회차', appendSection('# h\n\n<!-- census:rows -->\n\n### old\n', '### new\n').indexOf('### new') < appendSection('# h\n\n<!-- census:rows -->\n\n### old\n', '### new\n').indexOf('### old'));
  check('append: 마커 없으면 null', appendSection('# h\n', '### new\n') === null);
  check('측정 대상 아님은 error 행', measure(path.join(tmp, 'nope'), 'N').error && anonymize(measure(path.join(tmp, 'nope'), 'N')).error);
} finally { fs.rmSync(tmp, { recursive: true, force: true }); }

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
