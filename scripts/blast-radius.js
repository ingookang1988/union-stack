#!/usr/bin/env node
// scripts/blast-radius.js
// 수정·삭제 안전 게이트(Blast Radius). 대상 ID의 계보(자기+모든 자손)를 색인하고,
// 그중 잠금 상태(Verifying/Live) 노드가 있으면 Fail-close(exit 1)한다.
// 교차 규칙(zfs_util.isDescendant) 덕에 01a1 이 01a10 을 자손으로 오인하지 않는다.
// 실행: node scripts/blast-radius.js PLAN-01a   (순수 ID 01a 도 가능)
const { parseId, isDescendant } = require('./zfs_util');
const { buildIndex } = require('./zfs_index');

// 건드리면 되돌리기 어려운 잠금 상태(ARCH-00 규약).
const LOCKED = new Set(['Verifying', 'Live']);

const arg = process.argv[2];
if (!arg) {
  console.error('사용법: node scripts/blast-radius.js <ID|파일명>');
  process.exit(2);
}
const id = parseId(arg);
if (!id) {
  console.error(`ZFS ID를 해석할 수 없음: ${arg}`);
  process.exit(2);
}

const index = buildIndex();
// 영향권: 대상 자신과 모든 자손.
const affected = index
  .filter(d => isDescendant(id, d.id))
  .sort((a, b) => a.id.localeCompare(b.id));

console.log(`# Blast Radius: ${id}`);
console.log(`영향권 노드 ${affected.length}개:`);
affected.forEach(d => console.log(`  [${d.domain}-${d.id}] ${d.status || '?'}  ${d.file}`));

const locked = affected.filter(d => LOCKED.has(d.status));
if (locked.length) {
  console.error(`\nFail-close: 잠금 상태(${[...LOCKED].join('/')}) 노드가 영향권에 있음 — 변경 보류.`);
  locked.forEach(d => console.error(`  ✗ [${d.domain}-${d.id}] ${d.status}  ${d.file}`));
  console.error('인간 확인 후 진행하세요.');
  process.exit(1);
}
console.log('\n잠금 상태 노드 없음 — 변경 가능.');
process.exit(0);
