#!/usr/bin/env node
// scripts/upward-fetch.js
// 작업 진입 의식(Upward Fetching)을 자동화한다.
// 단말 ID를 받아 (1) 부모 계보의 PLAN/FLOW/CON/ARCH = 공간 맥락,
// (2) 같은 계보의 LSN = 시간축 함정(과거 반복 실패)을 모아 출력한다.
// 실행: node scripts/upward-fetch.js WO-01a1-2   (순수 ID 01a1-2 도 가능)
const { parseId, ancestorChain, isDescendant } = require('./zfs_util');
const { buildIndex } = require('./zfs_index');

const arg = process.argv[2];
if (!arg) {
  console.error('사용법: node scripts/upward-fetch.js <ID|파일명>');
  process.exit(2);
}
const id = parseId(arg);
if (!id) {
  console.error(`ZFS ID를 해석할 수 없음: ${arg}`);
  process.exit(2);
}

const chain = ancestorChain(id);          // [self, ...조상]
const ancestors = new Set(chain);
const index = buildIndex();

// 공간 맥락: 계보(자기+조상) ID를 가진 맥락 도메인 문서.
const CONTEXT_DOMAINS = new Set(['PLAN', 'FLOW', 'CON', 'ARCH', 'MTG']);
const context = index
  .filter(d => CONTEXT_DOMAINS.has(d.domain) && ancestors.has(d.id))
  .sort((a, b) => a.domain.localeCompare(b.domain));

// 시간축: 대상이 자손인 LSN(= 계보 위에 얹힌 교훈).
const lessons = index.filter(d => d.domain === 'LSN' && isDescendant(d.id, id));

console.log(`# Upward Fetching: ${id}`);
console.log(`계보(조상 역산): ${chain.join(' → ')}\n`);

console.log('## 공간 맥락 (부모 PLAN/FLOW/CON/ARCH/MTG)');
if (context.length) context.forEach(d => console.log(`  [${d.domain}-${d.id}] ${d.file}`));
else console.log('  (없음)');

console.log('\n## 시간축 경고 (같은 계보의 LSN — 과거 반복 실패)');
if (lessons.length) lessons.forEach(d => console.log(`  ⚠ [${d.domain}-${d.id}] ${d.file}`));
else console.log('  (없음)');
