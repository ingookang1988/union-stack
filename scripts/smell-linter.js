#!/usr/bin/env node
// scripts/smell-linter.js
// TOOL 카드 품질 린터(Fail-close) — [PRO-08] 2단계.
// 근거: 실측상 공개 SKILL.md의 99%+가 "skill smell"을 갖는다(arXiv 2607.01456 — 과소/과잉 명세·
//   안전장치 누락·컨텍스트 비대). 카탈로그의 가치는 큐레이션이므로, 카드가 사용 계약의
//   최소 해부(용도·부정 스코프·호출)를 갖추고 비대하지 않음을 기계로 강제한다.
// read-only·zero-dep. 실행: node scripts/smell-linter.js [--json]
const fs = require('fs');
const path = require('path');

const TOOLS_DIR = '.union-stack/reference/tools';
const MAX_CHARS = 4000; // 카드는 주입 컨텍스트 — 비대는 그 자체로 smell

/** 카드 텍스트 → smell 목록(순수). */
function findSmells(txt) {
  const s = [];
  const t = String(txt || '');
  if (!/^##\s*용도\s*$/m.test(t)) s.push({ code: 'no-purpose', msg: '"## 용도" 절 없음(과소 명세)' });
  if (!/^##\s*언제 쓰지 않나\s*$/m.test(t)) s.push({ code: 'no-negative-scope', msg: '"## 언제 쓰지 않나" 절 없음(안전장치/부정 스코프 누락)' });
  if (!/^##\s*호출\s*$/m.test(t)) s.push({ code: 'no-invocation', msg: '"## 호출" 절 없음(실행 계약 부재)' });
  const fm = t.match(/^(?:\s|<!--[\s\S]*?-->)*---\r?\n([\s\S]*?)\r?\n---/);
  if (!fm || !/^\s*kind:\s*\S/m.test(fm[1])) s.push({ code: 'no-kind', msg: 'frontmatter에 kind: 없음(script|skill|mcp|cli)' });
  if (t.length > MAX_CHARS) s.push({ code: 'bloat', msg: `카드 ${t.length}자 > ${MAX_CHARS}자(컨텍스트 비대 — 상세는 impl 쪽 문서로)` });
  return s;
}

function gather(root = path.resolve(__dirname, '..')) {
  const abs = path.join(root, TOOLS_DIR);
  if (!fs.existsSync(abs)) return [];
  return fs.readdirSync(abs)
    .filter(e => e.endsWith('.md') && !/_GUIDE\.md$/.test(e))
    .map(e => {
      let txt = ''; try { txt = fs.readFileSync(path.join(abs, e), 'utf8'); } catch { /* 읽기 실패 → 빈 텍스트 = smell */ }
      return { file: `${TOOLS_DIR}/${e}`, smells: findSmells(txt) };
    });
}

function run(root) {
  const cards = gather(root);
  const json = process.argv.includes('--json');
  const bad = cards.filter(c => c.smells.length);
  if (json) { console.log(JSON.stringify({ cards: cards.length, violations: bad }, null, 2)); return bad.length ? 1 : 0; }
  if (cards.length === 0) { console.log('smell 린터: TOOL-* 카드 없음 — 건너뜀.'); return 0; }
  if (bad.length) {
    console.error('\n[smell 린터] 사용 계약 해부 미달 카드:');
    bad.forEach(c => c.smells.forEach(x => console.error(`  ✗ ${c.file} — (${x.code}) ${x.msg}`)));
    console.error('\n카드 해부: 용도 / 언제 쓰나 / 언제 쓰지 않나 / 호출 (reference/tools/_GUIDE.md).\n');
    return 1;
  }
  console.log(`smell 린터 통과: ${cards.length}개 카드 전부 사용 계약 해부 충족.`);
  return 0;
}

module.exports = { findSmells, gather, MAX_CHARS };

if (require.main === module) process.exit(run());
