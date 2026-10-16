#!/usr/bin/env node
// scripts/ship-manifest.js
// 배송 매니페스트([PRO-24] ①(c) · §9 ①) — 어답터에 가는 스크립트를 **상류가 열거**한다(화이트리스트). 나머지는 기본 로컬. [TOOL-34]
//
// 분류는 수기 목록이 아니라 **정의 지점 태그**에서 생성한다([PRO-21] `@test-asset` 문법):
//   // @ship upstream-only — <이유>   상류 자기 측정·평가 계층. 어답터에 가지 않는다(template-update 가 배송·보고에서 뺀다).
//   // @ship optional — <이유>        배송은 되지만 어답터가 끌 수 있는 것(leakage-guard·dashboard·hooks·ci·ledger 류). 정보만.
//   태그 없음                        배송(sync).
// `X.test.js` 는 `X.js` 의 분류를 따른다(상류 전용 스크립트의 테스트가 혼자 배송되면 require 가 깨진다).
// 산출: scripts/ship-manifest.json(생성 뷰 — 손으로 고치지 않는다). template-update 는 로컬·상류 매니페스트를 각각 읽는다.
//
// 실행: node scripts/ship-manifest.js            # 드리프트 검사: 0(동기화) / 3(드리프트·부재, 비차단)
//       node scripts/ship-manifest.js --write    # 매니페스트 재생성
//       node scripts/ship-manifest.js --json
const fs = require('fs');
const path = require('path');
const { withContract, OUTCOME } = require('./gate-contract');

const MANIFEST = 'scripts/ship-manifest.json';
const TAG_RE = /^\/\/\s*@ship\s+(upstream-only|optional)\b\s*(?:—|-|:)?\s*(.*)$/m;

const CONTRACT = {
  gate: 'Ship Manifest Gate (ship-manifest)',
  input: 'scripts/*.js 의 선두 @ship 태그 + 기존 scripts/ship-manifest.json',
  predicate: '생성 매니페스트 == 커밋된 매니페스트. 다르면(태그 변경·새 스크립트) CLARIFY — --write 후 커밋에 포함',
  scope: '태그와 파일 목록만 본다 — 스크립트가 실제로 어답터에서 동작하는지, 의존이 닫혀 있는지는 판정하지 않는다(어답터 팔 env 형상이 본다)',
  outcomes: ['PASS', 'CLARIFY'],
  failure_mode: '드리프트·부재 → CLARIFY(3, 비차단) + --write 안내',
};

/** 파일 텍스트 → 태그(순수). {kind: 'upstream-only'|'optional'|null, reason} */
function parseTag(txt) {
  const head = String(txt || '').split(/\r?\n/).slice(0, 12).join('\n'); // 선두 주석 블록만 — 본문 문자열 속 언급은 태그가 아니다([ADR-19])
  const m = head.match(TAG_RE);
  return m ? { kind: m[1], reason: (m[2] || '').trim() } : { kind: null, reason: '' };
}

/** 파일명 목록 + 태그 맵 → 매니페스트(순수). files: ['scripts/x.js', …], tags: {rel → kind|null} */
function build(files, tags) {
  const js = files.filter(f => /^scripts\/[^/]+\.js$/.test(f)).sort();
  const kindOf = rel => {
    const base = rel.replace(/\.test\.js$/, '.js');
    return tags[base] || null; // 테스트는 본체의 분류를 따른다
  };
  const upstreamOnly = js.filter(f => kindOf(f) === 'upstream-only');
  const optional = js.filter(f => kindOf(f) === 'optional');
  const shipped = js.filter(f => kindOf(f) !== 'upstream-only');
  if (!shipped.includes(MANIFEST)) shipped.push(MANIFEST);
  return { shipped: shipped.sort(), upstreamOnly, optional };
}

function render(manifest) {
  return JSON.stringify({ _comment: '생성 뷰 — node scripts/ship-manifest.js --write ([PRO-24] ①(c), [TOOL-34]). 손으로 고치지 않는다.', ...manifest }, null, 2) + '\n';
}

function scan(root = path.resolve(__dirname, '..')) {
  let names = [];
  try { names = fs.readdirSync(path.join(root, 'scripts')).filter(f => f.endsWith('.js')); } catch { names = []; }
  const files = names.map(f => `scripts/${f}`);
  const tags = {};
  for (const f of files) {
    if (f.endsWith('.test.js')) continue;
    try { tags[f] = parseTag(fs.readFileSync(path.join(root, f), 'utf8')).kind; } catch { tags[f] = null; }
  }
  return build(files, tags);
}

/** 매니페스트 읽기(없으면 null — 부재는 "규칙 폴백"이지 빈 화이트리스트가 아니다). 텍스트 입력 변형은 parseManifest. */
function parseManifest(txt) {
  try {
    const j = JSON.parse(String(txt));
    if (!j || !Array.isArray(j.shipped)) return null;
    return { shipped: j.shipped.map(String), upstreamOnly: Array.isArray(j.upstreamOnly) ? j.upstreamOnly.map(String) : [], optional: Array.isArray(j.optional) ? j.optional.map(String) : [] };
  } catch { return null; }
}
function readManifest(root = path.resolve(__dirname, '..')) {
  try { return parseManifest(fs.readFileSync(path.join(root, MANIFEST), 'utf8')); } catch { return null; }
}

function run(argv = process.argv.slice(2), root = path.resolve(__dirname, '..')) {
  const m = scan(root);
  const expected = render(m);
  if (argv.includes('--json')) { console.log(JSON.stringify(m, null, 2)); return OUTCOME.PASS; }
  const abs = path.join(root, MANIFEST);
  let current = null;
  try { current = fs.readFileSync(abs, 'utf8'); } catch { current = null; }
  if (argv.includes('--write')) {
    if (current !== expected) { fs.writeFileSync(abs, expected); console.log(`ship-manifest: ${MANIFEST} 재생성 — 배송 ${m.shipped.length} · 상류 전용 ${m.upstreamOnly.length} · 선택 ${m.optional.length}.`); }
    else console.log('ship-manifest: 이미 최신.');
    return OUTCOME.PASS;
  }
  if (current == null) { console.error(`ship-manifest: ${MANIFEST} 없음 — \`node scripts/ship-manifest.js --write\` 로 생성하라.`); return OUTCOME.CLARIFY; }
  if (current.replace(/\r\n/g, '\n') !== expected) { console.error('ship-manifest: 드리프트 — 태그·파일 목록과 매니페스트가 다르다. `node scripts/ship-manifest.js --write` 후 커밋에 포함하라.'); return OUTCOME.CLARIFY; }
  console.log(`ship-manifest 통과: 배송 ${m.shipped.length} · 상류 전용 ${m.upstreamOnly.length} · 선택 ${m.optional.length}, 매니페스트 동기화됨.`);
  return OUTCOME.PASS;
}

module.exports = { MANIFEST, TAG_RE, parseTag, build, render, scan, parseManifest, readManifest, run, CONTRACT };

if (require.main === module) process.exit(withContract(CONTRACT, argv => run(argv))());
