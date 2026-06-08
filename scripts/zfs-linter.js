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
  'plan', 'feature/flow', 'sprint', 'architecture', 'verification',
  'reference/contracts', 'reference/lessons', 'reference/domain', 'project/roadmap', 'proposals',
].map(d => `${BASE}/${d}`);

// ZFS 규약에서 면제되는 고정 매니페스트/가이드 파일
const IGNORED = new Set([
  'README.md', '_GUIDE.md', 'DESIGN_RATIONALE.md',
  'next.md', 'prev.md', 'live.md', 'target.md', 'hold.md',
  'state.md', 'evidence.md', 'gap.md', 'HANDOFF.md', 'HISTORY.md',
]);
const IGNORED_SUFFIX = ['_GUIDE.md'];

/** 위반 목록을 반환하는 순수-ish 함수(출력·exit 없음). MCP/CLI 공유. */
function lint(root = path.resolve(__dirname, '..')) {
  const violations = [];
  function scan(dir) {
    if (!fs.existsSync(dir)) return;
    for (const entry of fs.readdirSync(dir)) {
      const full = path.join(dir, entry);
      if (fs.statSync(full).isDirectory()) { scan(full); continue; }
      if (!entry.endsWith('.md')) continue;
      if (IGNORED.has(entry) || IGNORED_SUFFIX.some(s => entry.endsWith(s))) continue;
      if (!isValidName(entry)) {
        const m = entry.match(ZFS_REGEX);
        let hint = null;
        if (m && !isValidDomain(m[1])) hint = `'${m[1]}'은 허용 도메인이 아님. 허용: ${[...VALID_DOMAINS].join(' ')}`;
        else {
          const idPart = (entry.split('_')[0] || '').replace(/^[A-Z]{2,6}-/, '');
          if (/[lo]/.test(idPart)) hint = "Luhmann ID에 'l'/'o' 금지(숫자 1/0과 혼동).";
        }
        violations.push({ file: full.replace(root + path.sep, '').split(path.sep).join('/'), hint });
      }
    }
  }
  TARGET_DIRS.forEach(d => scan(path.join(root, d)));
  return violations;
}

function run() {
  const violations = lint();
  if (violations.length) {
    violations.forEach(v => {
      console.error(`\n[ZFS] 규칙 위반: ${v.file}`);
      console.error(`      형식: [DOMAIN]-[LUHMANN_ID]_[slug].md`);
      if (v.hint) console.error(`      힌트: ${v.hint}`);
    });
    console.error('\nFail-close: ZFS 규약 위반 파일이 존재합니다.\n');
    return 1;
  }
  console.log('ZFS 네이밍 검사 통과.');
  return 0;
}

module.exports = { lint, run, TARGET_DIRS };

if (require.main === module) process.exit(run());
