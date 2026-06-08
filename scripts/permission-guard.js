#!/usr/bin/env node
// scripts/permission-guard.js
// 권한 규율 강제 게이트 — 선언으로만 있던 권한 tier를 코드로 검사한다(git diff 기반).
//
//  Check A (항상): append-only 무결성 — Raw/append 평면에서 기존 줄 삭제 금지(추가만).
//                  archive_ledger.md · verification/raw/ · plan/meetings/ . 보편 안전(false-positive 없음).
//  Check B (--strict): Schema 무단 편집 — 에이전트 작성 변경이 Schema 평면을 건드리면
//                  커밋에 `Approved-by:` 트레일러 필수. 정책 의존이라 strict에서만(정직한 한계).
//
// 실행:
//   node scripts/permission-guard.js              # staged diff (pre-commit)
//   node scripts/permission-guard.js --range A..B # 커밋 범위 (CI)
//   node scripts/permission-guard.js --strict     # Schema 승인 트레일러까지 검사
const { execSync } = require('child_process');

// 경로 → tier 규칙 (AGENTS.md 규칙 2와 동기화).
const SCHEMA = [
  /^\.union-stack\/project\//,
  /^\.union-stack\/architecture\//,
  /^\.union-stack\/plan\/(?!meetings\/)/, // plan 본체는 Schema, plan/meetings는 append-only(아래)
  /^\.union-stack\/reference\/contracts\//,
];
const APPEND_ONLY = [
  /^\.union-stack\/archive_ledger\.md$/,
  /^\.union-stack\/verification\/raw\//,
  /^\.union-stack\/plan\/meetings\//,
];

/** 변경 경로의 권한 성격 분류(순수). */
function classify(p) {
  if (APPEND_ONLY.some(r => r.test(p))) return 'append-only';
  if (SCHEMA.some(r => r.test(p))) return 'schema';
  return 'other';
}

/**
 * 변경 목록 + 커밋 메타 → 위반 목록(순수, git 비의존 → 테스트 용이).
 * changes: [{path, added, removed}]  meta: {agentAuthored, approvedBy}  opts: {strict}
 */
function findViolations(changes, meta = {}, opts = {}) {
  const v = [];
  for (const c of changes) {
    const tier = classify(c.path);
    if (tier === 'append-only' && c.removed > 0) {
      v.push({ rule: 'append-only', path: c.path,
        msg: `append-only 평면에서 ${c.removed}줄 삭제·수정됨(추가만 허용)` });
    }
    if (opts.strict && tier === 'schema' && meta.agentAuthored && !meta.approvedBy) {
      v.push({ rule: 'schema-approval', path: c.path,
        msg: 'Schema를 에이전트가 변경 — 커밋에 `Approved-by:` 트레일러가 없음' });
    }
  }
  return v;
}

// --- git 어댑터 (얇음) ---
function sh(cmd) { return execSync(cmd, { encoding: 'utf8' }); }

// append-only 위반은 *실제 엔트리* 삭제만 본다 — 헤더 주석·제목·표머리/구분선 편집은 제외(거짓 양성 방지).
function substantiveRemoved(range, file) {
  const base = range ? `git diff --unified=0 ${range}` : 'git diff --cached --unified=0';
  let out = '';
  try { out = sh(`${base} -- "${file}"`); } catch { return 0; }
  return out.split('\n')
    .filter(l => l.startsWith('-') && !l.startsWith('---'))
    .map(l => l.slice(1).trim())
    .filter(t => t && !/^<!--|-->$|^#|^\|/.test(t)) // 주석·제목·표 라인 제외
    .length;
}

function readChanges(range) {
  const cmd = range ? `git diff --numstat ${range}` : 'git diff --cached --numstat';
  let out = '';
  try { out = sh(cmd); } catch { return null; } // git 아님/실패 → 건너뜀
  return out.split('\n').filter(Boolean).map(line => {
    const [a, r, ...rest] = line.split('\t');
    const p = rest.join('\t');
    let removed = r === '-' ? 0 : +r;
    if (removed > 0 && classify(p) === 'append-only') removed = substantiveRemoved(range, p);
    return { added: a === '-' ? 0 : +a, removed, path: p };
  });
}

function readMeta(range) {
  // strict 검사용 — 범위 끝 커밋의 메시지에서 트레일러를 읽는다.
  if (!range) return {}; // pre-commit 시점엔 커밋 메시지가 없음
  const tip = range.split('..').pop();
  let body = '';
  try { body = sh(`git log -1 --format=%B ${tip}`); } catch { return {}; }
  return {
    agentAuthored: /co-authored-by:\s*claude/i.test(body),
    approvedBy: /^\s*approved-by:\s*\S/im.test(body),
  };
}

function run(argv = process.argv.slice(2)) {
  const strict = argv.includes('--strict');
  const ri = argv.indexOf('--range');
  const range = ri >= 0 ? argv[ri + 1] : null;
  const changes = readChanges(range);
  if (changes === null || changes.length === 0) {
    console.log('권한 가드: 검사할 변경 없음 — 통과.');
    return 0;
  }
  const meta = readMeta(range);
  const violations = findViolations(changes, meta, { strict });
  if (violations.length) {
    console.error('\n[권한 가드] 권한 규율 위반:');
    violations.forEach(x => console.error(`  ✗ (${x.rule}) ${x.path} — ${x.msg}`));
    console.error('\nappend-only 평면은 추가만, Schema는 인간 소유(Approved-by 필요). AGENTS.md 규칙 2 참조.\n');
    return 1;
  }
  console.log('권한 가드 통과: append-only 무결성' + (strict ? ' + Schema 승인' : '') + ' OK.');
  return 0;
}

module.exports = { classify, findViolations, run, SCHEMA, APPEND_ONLY };

if (require.main === module) process.exit(run());
