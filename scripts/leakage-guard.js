#!/usr/bin/env node
// scripts/leakage-guard.js
// 누설 방지 트립와이어. 공개 템플릿(또는 공개 포크)에서 "더미여야 할 콘텐츠"가
// 표시(sanitize) 없이 커밋되는 것을 막는다.
//
// 한계(정직히): 임의의 실제 내용을 '이해'해서 잡지 못한다. 마커만 붙이면 통과하므로
//   우회 가능하다. 이 게이트는 "더미 표시를 깜빡함"을 잡는 트립와이어다.
//
// 동작: 콘텐츠 디렉터리의 모든 .md는 (a) 방법론 allowlist에 속하거나
//   (b) 더미 마커를 가져야 한다. 둘 다 아니면 Fail-close(exit 1).
//
// 실행: node scripts/leakage-guard.js   (CI 게이팅은 .github/workflows/template-guard.yml 참조)
const fs = require('fs');
const path = require('path');

// 실제 프로젝트 내용이 들어설 수 있는 칸/화살표 평면(.union-stack/ 격리, 재귀 스캔).
// project 를 재귀 스캔하므로 project/roadmap·HISTORY 도 포함된다.
const CONTENT_DIRS = [
  '.union-stack/project', '.union-stack/architecture', '.union-stack/plan',
  '.union-stack/feature', '.union-stack/reference',
  '.union-stack/sprint', '.union-stack/verification', '.union-stack/proposals',
  '.union-stack/spike',
];
// 콘텐츠를 담는 매니페스트(디렉터리 밖이지만 스캔 대상).
const ROOT_MANIFESTS = ['.union-stack/archive_ledger.md'];

// 마커 없이도 합법인 방법론 파일(명시 집합). 린터의 IGNORED와 같은 유지보수 방식.
// 새 방법론 파일을 추가하면 여기에도 등재한다.
const METHODOLOGY = new Set(['ARCH-00_zfs_naming.md']);

// 더미 표시 마커. 슬러그 또는 본문 어디든 있으면 sanitize된 것으로 간주.
const MARKER = /example|dummy|예시|더미/i;

/**
 * 파일이 "공개해도 안전(더미 표시됨 또는 방법론)"한지 판정.
 * 순수 함수 — FS 접근 없음(테스트 용이). relPath는 '/' 구분자 기준.
 */
function isSanitized(relPath, content) {
  if (/_GUIDE\.md$/.test(relPath)) return true;          // 방법론 가이드
  if (METHODOLOGY.has(path.posix.basename(relPath))) return true; // 명시 방법론
  return MARKER.test(relPath + '\n' + content);          // 더미 마커
}

function walk(dir, root, out) {
  const abs = path.join(root, dir);
  if (!fs.existsSync(abs)) return;
  for (const entry of fs.readdirSync(abs)) {
    const full = path.join(abs, entry);
    const rel = `${dir}/${entry}`;
    if (fs.statSync(full).isDirectory()) { walk(rel, root, out); continue; }
    if (entry.endsWith('.md')) out.push(rel);
  }
}

function collectFiles(root) {
  const out = [];
  CONTENT_DIRS.forEach(d => walk(d, root, out));
  ROOT_MANIFESTS.forEach(f => {
    if (fs.existsSync(path.join(root, f))) out.push(f);
  });
  return out;
}

function run(root = path.resolve(__dirname, '..')) {
  const violations = [];
  for (const rel of collectFiles(root)) {
    const content = fs.readFileSync(path.join(root, rel), 'utf8');
    if (!isSanitized(rel, content)) violations.push(rel);
  }
  if (violations.length) {
    console.error('\n[누설 가드] 더미 표시가 없는 콘텐츠 파일:');
    violations.forEach(v => console.error(`  ✗ ${v}`));
    console.error('\n각 파일을 더미로 정화하세요(슬러그/본문에 example·dummy·예시·더미 마커).');
    console.error('실제 방법론 파일이라면 scripts/leakage-guard.js 의 METHODOLOGY에 등재하세요.\n');
    return 1;
  }
  console.log('누설 가드 통과: 모든 콘텐츠 파일이 더미 표시됨.');
  return 0;
}

module.exports = { isSanitized, collectFiles, run, MARKER, METHODOLOGY, CONTENT_DIRS };

if (require.main === module) process.exit(run());
