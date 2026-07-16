#!/usr/bin/env node
// scripts/permission-guard.js
// 권한 규율 강제 게이트 — 선언으로만 있던 권한 tier를 코드로 검사한다(git diff 기반).
//
//  Check A (항상): append-only 무결성 — Raw/append 평면에서 기존 줄 삭제 금지(추가만).
//                  archive_ledger.md · verification/raw/ · plan/meetings/ · plan/analytics/ . 보편 안전(false-positive 없음).
//  Check B (--strict): Schema 무단 편집 — 에이전트 작성 변경이 Schema 평면을 건드리면
//                  커밋에 `Approved-by:` 트레일러 필수. 정책 의존이라 strict에서만(정직한 한계).
//
// 실행:
//   node scripts/permission-guard.js              # staged diff (pre-commit)
//   node scripts/permission-guard.js --range A..B # 커밋 범위 (CI)
//   node scripts/permission-guard.js --strict     # Schema 승인 트레일러까지 검사
const { execFileSync } = require('child_process');

// 경로 → tier 규칙 (AGENTS.md 규칙 2와 동기화).
const SCHEMA = [
  /^\.union-stack\/project\//,
  /^\.union-stack\/architecture\//,
  /^\.union-stack\/plan\/(?!meetings\/|analytics\/)/, // plan 본체는 Schema, meetings·analytics는 append-only(아래)
  /^\.union-stack\/reference\/contracts\//,
];
const APPEND_ONLY = [
  /^\.union-stack\/archive_ledger\.md$/,
  /^\.union-stack\/verification\/raw\//,
  /^\.union-stack\/plan\/meetings\//,
  /^\.union-stack\/plan\/analytics\//,
];

/** 변경 경로의 권한 성격 분류(순수). */
function classify(p) {
  if (APPEND_ONLY.some(r => r.test(p))) return 'append-only';
  if (SCHEMA.some(r => r.test(p))) return 'schema';
  return 'other';
}

/**
 * 삭제된 줄이 *실제 엔트리*인지 판정(순수). 헤더 주석·제목·표 구분선만 제외 —
 * 데이터가 담긴 표 행은 엔트리로 센다(원장·회의록 엔트리가 표 행이므로, `^\|` 일괄 제외는 사각지대).
 * 표머리 행 편집이 걸리는 false-positive는 감수한다(Fail-close 방향 — 인간이 확인).
 */
function isSubstantiveLine(t) {
  if (!t) return false;
  if (/^<!--|-->$|^#/.test(t)) return false;   // 주석·제목
  if (/^\|[\s|:-]*\|?$/.test(t)) return false; // 표 구분선(|---|---|)·빈 표 라인
  return true;
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
// 인자 배열로만 호출(execFile) — git이 보고한 파일명이 셸을 거치지 않는다(명령 주입 차단).
// core.quotepath=false: non-ASCII(한글 등) 경로의 octal-quote를 끄지 않으면 경로 매칭이 조용히 실패한다.
function git(args) {
  return execFileSync('git', ['-c', 'core.quotepath=false', ...args], { encoding: 'utf8' });
}

// append-only 위반은 *실제 엔트리* 삭제만 본다(판정은 isSubstantiveLine — 순수, 테스트됨).
function substantiveRemoved(range, file) {
  const args = ['diff', '--unified=0'];
  if (range) args.push(range); else args.push('--cached');
  args.push('--', file);
  let out = '';
  try { out = git(args); } catch { return 0; }
  return out.split('\n')
    .filter(l => l.startsWith('-') && !l.startsWith('---'))
    .map(l => l.slice(1).trim())
    .filter(isSubstantiveLine)
    .length;
}

function readChanges(range) {
  const args = ['diff', '--numstat'];
  if (range) args.push(range); else args.push('--cached');
  let out = '';
  try { out = git(args); } catch { return null; } // git 아님/실패 → 건너뜀
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
  try { body = git(['log', '-1', '--format=%B', tip]); } catch { return {}; }
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

module.exports = { classify, findViolations, isSubstantiveLine, run, SCHEMA, APPEND_ONLY };

if (require.main === module) process.exit(run());
