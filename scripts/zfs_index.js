// scripts/zfs_index.js
// 레포 전역에서 ZFS 문서를 수집해 인덱스로 반환한다.
// upward-fetch.js / blast-radius.js 가 공유하는 색인 계층.
const fs = require('fs');
const path = require('path');
const { parse } = require('./zfs_util');
const { walkFiles } = require('./fs_walk');

// ZFS ID를 갖는 원자적 문서가 사는 디렉터리(.union-stack/ 격리 구조, 린터와 동일 집합).
const BASE = '.union-stack';
const SCAN_DIRS = [
  'plan', 'feature/flow', 'sprint', 'architecture', 'verification',
  'reference/contracts', 'reference/lessons', 'reference/domain', 'reference/tools',
  'project/roadmap', 'proposals',
].map(d => `${BASE}/${d}`);

// frontmatter(선두 --- 블록)에서만 status·tier를 추출. 없으면 null.
// 파일 전체 매칭은 본문 예시(`status: Live` 코드블록 등)를 잠금 상태로 오인해
// blast-radius 오차단(false Fail-close)을 일으킨다. 선두 HTML 주석은 건너뛴다.
// tier(신뢰도 티어, [PRO-12]): draft | reviewed | ratified — 미기입은 null(기존 문서 = ratified 간주는
// 소비자(permission-guard) 몫이고, 색인은 관측만 한다).
function readFront(full) {
  try {
    const txt = fs.readFileSync(full, 'utf8');
    const fm = txt.match(/^(?:\s|<!--[\s\S]*?-->)*---\r?\n([\s\S]*?)\r?\n---/);
    if (!fm) return { status: null, tier: null };
    const g = k => { const m = fm[1].match(new RegExp('^\\s*' + k + ':\\s*(.+?)\\s*$', 'm')); return m ? m[1].trim() : null; };
    const tier = g('tier');
    return { status: g('status'), tier: tier ? tier.toLowerCase() : null };
  } catch {
    return { status: null, tier: null };
  }
}

function readStatus(full) { return readFront(full).status; }

function collect(dir, root, out) {
  walkFiles(root, dir, rel => {
    const entry = rel.split('/').pop();
    if (!entry.endsWith('.md')) return;
    const parsed = parse(entry); // {domain, id, slug} 또는 null(가이드·매니페스트)
    if (!parsed) return;
    const front = readFront(path.join(root, rel));
    out.push({ file: rel, ...parsed, status: front.status, tier: front.tier });
  });
}

/** 레포 루트 기준 전체 ZFS 문서 인덱스를 만든다. */
function buildIndex(root = path.resolve(__dirname, '..')) {
  const out = [];
  SCAN_DIRS.forEach(d => collect(d, root, out));
  return out;
}

module.exports = { buildIndex, readStatus, readFront, SCAN_DIRS };
