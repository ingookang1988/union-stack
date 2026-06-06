#!/usr/bin/env node
// scripts/zfs-linter.js
// ZFS 네이밍 규약을 강제하는 Fail-close 게이트. CI 최상단에 배치 권장.
// 실행: node scripts/zfs-linter.js
const fs = require('fs');
const path = require('path');
const { ZFS_REGEX, isValidDomain, isValidName, VALID_DOMAINS } = require('./zfs_util');

// ZFS ID를 갖는 원자적 문서가 사는 디렉터리 (.union-stack/ 격리 구조)
const BASE = '.union-stack';
const TARGET_DIRS = [
  'plan', 'feature/flow', 'sprint', 'architecture', 'mechanism', 'contracts', 'lessons',
  'project/roadmap', 'proposals',
].map(d => `${BASE}/${d}`);

// ZFS 규약에서 면제되는 고정 매니페스트/가이드 파일
const IGNORED = new Set([
  'README.md', '_GUIDE.md', 'DESIGN_RATIONALE.md',
  'next.md', 'prev.md', 'live.md', 'target.md', 'hold.md',
  'state.md', 'evidence.md', 'gap.md', 'HANDOFF.md', 'HISTORY.md',
]);
const IGNORED_SUFFIX = ['_GUIDE.md'];

let hasErrors = false;

function scan(dir) {
  if (!fs.existsSync(dir)) return;
  for (const entry of fs.readdirSync(dir)) {
    const full = path.join(dir, entry);
    if (fs.statSync(full).isDirectory()) { scan(full); continue; }
    if (!entry.endsWith('.md')) continue;
    if (IGNORED.has(entry) || IGNORED_SUFFIX.some(s => entry.endsWith(s))) continue;
    if (!isValidName(entry)) {
      hasErrors = true;
      console.error(`\n[ZFS] 규칙 위반: ${full}`);
      console.error(`      형식: [DOMAIN]-[LUHMANN_ID]_[slug].md`);
      const m = entry.match(ZFS_REGEX);
      if (m && !isValidDomain(m[1])) {
        // 구조는 맞으나 도메인이 화이트리스트 밖 — 가장 흔한 오타 경로
        console.error(`      힌트: '${m[1]}'은 허용 도메인이 아님.`);
        console.error(`            허용: ${[...VALID_DOMAINS].join(' ')}`);
      } else {
        const idPart = (entry.split('_')[0] || '').replace(/^[A-Z]{2,6}-/, '');
        if (/[lo]/.test(idPart)) {
          console.error(`      힌트: Luhmann ID에 'l'/'o'는 금지(숫자 1/0과 혼동).`);
        }
      }
    }
  }
}

const root = path.resolve(__dirname, '..');
TARGET_DIRS.forEach(d => scan(path.join(root, d)));

if (hasErrors) {
  console.error('\nFail-close: ZFS 규약 위반 파일이 존재합니다.\n');
  process.exit(1);
} else {
  console.log('ZFS 네이밍 검사 통과.');
  process.exit(0);
}
