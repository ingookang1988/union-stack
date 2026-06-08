#!/usr/bin/env node
// scripts/ref-linter.js
// 브래킷 ID 참조 무결성 — 본문의 [DOMAIN-id] 참조가 색인에 실제 존재하는지 검사한다.
// (union-stack은 상대경로 금지·브래킷 ID 참조라, 이것이 ZFS-네이티브 "깨진 링크" 검사다.)
// 기본 advisory(exit 0): 템플릿·실프로젝트엔 의도적 forward-ref가 흔하다. --strict 만 Fail-close.
// 실행: node scripts/ref-linter.js [--strict]
const fs = require('fs');
const path = require('path');
const { buildIndex } = require('./zfs_index');

const REF_RE = /\[([A-Z]{2,6})-([0-9][0-9a-z-]*)\]/g;

/** 텍스트에서 [DOMAIN-id] 참조 추출(순수). */
function extractRefs(text) {
  const out = [];
  let m;
  REF_RE.lastIndex = 0;
  while ((m = REF_RE.exec(text)) !== null) out.push({ domain: m[1], id: m[2], raw: `${m[1]}-${m[2]}` });
  return out;
}

/** knownSet(`DOMAIN-id`)에 없는 참조만 반환(중복 제거, 순수). */
function findBroken(refs, knownSet) {
  const seen = new Set();
  return refs.filter(r => {
    if (knownSet.has(r.raw) || seen.has(r.raw)) return false;
    seen.add(r.raw);
    return true;
  });
}

function gather(root = path.resolve(__dirname, '..')) {
  const known = new Set(buildIndex(root).map(d => `${d.domain}-${d.id}`));
  const broken = [];
  (function walk(dir) {
    const abs = path.join(root, dir);
    if (!fs.existsSync(abs)) return;
    for (const e of fs.readdirSync(abs)) {
      const rel = `${dir}/${e}`;
      const full = path.join(root, rel);
      if (fs.statSync(full).isDirectory()) { walk(rel); continue; }
      if (!e.endsWith('.md')) continue;
      for (const r of findBroken(extractRefs(fs.readFileSync(full, 'utf8')), known)) broken.push({ file: rel, ref: r.raw });
    }
  })('.union-stack');
  return broken;
}

function run(root) {
  const broken = gather(root);
  const strict = process.argv.includes('--strict');
  if (broken.length) {
    console.error(`\n[참조] 미해소 브래킷 ID ${broken.length}건 (advisory):`);
    broken.slice(0, 50).forEach(b => console.error(`  ? ${b.ref}  ← ${b.file}`));
    console.error('\n실제 문서가 아직 없거나(forward-ref) 오타일 수 있음. --strict 시 Fail-close.');
    return strict ? 1 : 0;
  }
  console.log('참조 무결성 통과: 모든 브래킷 ID가 해소됨.');
  return 0;
}

module.exports = { extractRefs, findBroken, gather, run };

if (require.main === module) process.exit(run());
