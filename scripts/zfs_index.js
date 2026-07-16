// scripts/zfs_index.js
// 레포 전역에서 ZFS 문서를 수집해 인덱스로 반환한다.
// upward-fetch.js / blast-radius.js 가 공유하는 색인 계층.
const fs = require('fs');
const path = require('path');
const { parse } = require('./zfs_util');

// ZFS ID를 갖는 원자적 문서가 사는 디렉터리(.union-stack/ 격리 구조, 린터와 동일 집합).
const BASE = '.union-stack';
const SCAN_DIRS = [
  'plan', 'feature/flow', 'sprint', 'architecture', 'verification',
  'reference/contracts', 'reference/lessons', 'reference/domain', 'project/roadmap', 'proposals',
].map(d => `${BASE}/${d}`);

// frontmatter(선두 --- 블록)에서만 status를 추출. 없으면 null.
// 파일 전체 매칭은 본문 예시(`status: Live` 코드블록 등)를 잠금 상태로 오인해
// blast-radius 오차단(false Fail-close)을 일으킨다. 선두 HTML 주석은 건너뛴다.
function readStatus(full) {
  try {
    const txt = fs.readFileSync(full, 'utf8');
    const fm = txt.match(/^(?:\s|<!--[\s\S]*?-->)*---\r?\n([\s\S]*?)\r?\n---/);
    if (!fm) return null;
    const m = fm[1].match(/^\s*status:\s*(.+?)\s*$/m);
    return m ? m[1].trim() : null;
  } catch {
    return null;
  }
}

function collect(dir, root, out) {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) return;
  for (const entry of fs.readdirSync(abs)) {
    const full = path.join(abs, entry);
    const rel = `${dir}/${entry}`;
    if (fs.statSync(full).isDirectory()) { collect(rel, root, out); continue; }
    if (!entry.endsWith('.md')) continue;
    const parsed = parse(entry); // {domain, id, slug} 또는 null(가이드·매니페스트)
    if (!parsed) continue;
    out.push({ file: rel, ...parsed, status: readStatus(full) });
  }
}

/** 레포 루트 기준 전체 ZFS 문서 인덱스를 만든다. */
function buildIndex(root = path.resolve(__dirname, '..')) {
  const out = [];
  SCAN_DIRS.forEach(d => collect(d, root, out));
  return out;
}

module.exports = { buildIndex, readStatus, SCAN_DIRS };
