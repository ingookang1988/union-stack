// scripts/fs_walk.js
// 게이트·색인이 공유하는 단일 재귀 워커(로직 1벌, 표면 N개).
//
// 두 불변식:
//  1. **심볼릭 링크는 따라가지 않는다** — 자기참조 링크는 재귀 게이트를 스택 오버플로로 죽인다.
//     레포 관례상 컨트롤 평면 문서는 링크가 아니라 실파일이다(AGENTS.md도 심볼릭 대신 스텁 권장 —
//     Windows·git 환경에서 링크가 깨지기 때문). 따라서 링크는 조용히 건너뛴다.
//  2. **스캔 중 사라진 항목에 죽지 않는다** — Dirent 기반이라 별도 statSync가 없고(경합·깨진 링크
//     무해), readdir 실패는 해당 디렉터리만 건너뛴다.
const fs = require('fs');
const path = require('path');

/**
 * root 기준 relDir 아래를 재귀 순회하며 파일마다 onFile(relPath)을 호출한다('/' 구분자).
 * opts.skipDir(name, relPath) → true면 그 디렉터리를 통째로 건너뛴다.
 */
function walkFiles(root, relDir, onFile, opts = {}) {
  const abs = relDir ? path.join(root, relDir) : root;
  let entries;
  try { entries = fs.readdirSync(abs, { withFileTypes: true }); } catch { return; }
  for (const e of entries) {
    const rel = relDir ? `${relDir}/${e.name}` : e.name;
    if (e.isSymbolicLink()) continue;                       // 불변식 1
    if (e.isDirectory()) {
      if (opts.skipDir && opts.skipDir(e.name, rel)) continue;
      walkFiles(root, rel, onFile, opts);
    } else if (e.isFile()) {
      onFile(rel);
    }
  }
}

/** 편의: 조건에 맞는 상대경로 목록을 모아 반환. */
function collectFiles(root, relDir, filter = () => true, opts = {}) {
  const out = [];
  walkFiles(root, relDir, rel => { if (filter(rel)) out.push(rel); }, opts);
  return out;
}

module.exports = { walkFiles, collectFiles };
