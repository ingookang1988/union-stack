#!/usr/bin/env node
// scripts/ci.js
// 게이트 체인 — **CI 제공자 비의존 정본**. [TOOL-27]
//
// 왜 스크립트인가: 게이트 순서·차단 정책이 `harness.yml` 의 YAML 안에 살면 그 지식은
// **GitHub Actions 안에만** 존재한다. 어답터가 다른 CI 를 쓰거나(대개 private 레포라
// Actions 분당 과금 대상이다) 로컬에서 같은 검사를 돌리려면 YAML 을 손으로 번역해야 하고,
// 번역본은 곧 원본과 어긋난다(로직 2벌 = 드리프트). 그래서 **본문을 여기로 옮기고**
// 워크플로는 이 스크립트를 부르는 얇은 래퍼로 남긴다 — 워크플로를 지워도 게이트는 산다.
//
// 차단 정책은 [PRO-11] 4값을 그대로 따른다:
//   0 PASS · 1 REJECT(차단) · 3 CLARIFY(경고) · 4 HOLD(경고)
// 즉 **exit 1 만 빌드를 깬다.** 3·4 는 사람이 읽을 주석으로 표면화하고 통과시킨다.
//
// 실행:
//   node scripts/ci.js                    # 전체 체인
//   node scripts/ci.js --range A..B       # permission-guard 의 diff 범위 지정
//   node scripts/ci.js --skip adopter-arm # 단계 제외(쉼표 구분)
//   node scripts/ci.js --json
//
// 컨테이너: `docker compose run --rm harness` 가 이 스크립트를 부른다([TOOL-27]).
const { spawnSync } = require('child_process');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// [PRO-11] 4값. 여기 없는 코드(2·5…)는 알 수 없는 실패라 차단으로 취급한다.
const OUTCOME = { 0: 'PASS', 1: 'REJECT', 3: 'CLARIFY', 4: 'HOLD' };
const BLOCKING = new Set([1]);

/** 한 단계 실행. 죽어도 던지지 않는다 — 종료 코드 자체가 판정 재료다. */
function step(name, args, { blocking = true } = {}) {
  const r = spawnSync(process.execPath, args, { cwd: ROOT, encoding: 'utf8' });
  // spawnSync 가 프로세스를 못 띄운 경우(r.error)는 코드가 null 이다 — 알 수 없는 실패.
  const code = r.error ? -1 : (r.status === null ? -1 : r.status);
  const outcome = OUTCOME[code] || 'UNKNOWN';
  // 비차단 단계는 REJECT 도 경고로 낮춘다(handoff-linter 는 REJECT 자체가 없다 — [PRO-13] §5).
  const failed = blocking && (BLOCKING.has(code) || outcome === 'UNKNOWN');
  return { name, args: args.join(' '), code, outcome, failed, stdout: r.stdout || '', stderr: r.stderr || '' };
}

/**
 * 체인 정의 — **순서가 계약이다.** 싼 게이트가 먼저 온다(네이밍 위반은 테스트를 돌릴 값어치도 없다).
 * blocking:false 는 "판정은 내되 빌드는 안 깬다" — [PRO-11] 의 CLARIFY/HOLD 를 CI 에서 이행하는 방식.
 */
function chain({ range = null } = {}) {
  return [
    { name: 'zfs-linter', args: ['scripts/zfs-linter.js'] },
    { name: 'history-linter', args: ['scripts/history-linter.js'] },
    // permission-guard: 범위가 없으면 자기 기본값(작업트리)을 쓴다. CI 는 --range 를 준다.
    { name: 'permission-guard', args: ['scripts/permission-guard.js', ...(range ? ['--range', range] : [])], blocking: false },
    { name: 'handoff-linter', args: ['scripts/handoff-linter.js'], blocking: false },
    // 생성 뷰 드리프트([PRO-21] 2단계) — CLARIFY 만 내는 비차단 게이트([TOOL-28]).
    { name: 'test-catalog', args: ['scripts/test-catalog.js'], blocking: false },
    { name: 'tests', args: ['--test', ...testFiles()] },
    { name: 'health', args: ['scripts/health.js'] },
    { name: 'adopter-arm', args: ['scripts/adopter-arm.js'] },
  ];
}

/** 스위트 목록은 glob 없이 디렉터리에서 읽는다 — 셸(및 셸 없는 컨테이너)에 의존하지 않기 위해. */
function testFiles() {
  const fs = require('fs');
  return fs.readdirSync(path.join(ROOT, 'scripts'))
    .filter(f => f.endsWith('.test.js')).sort()
    .map(f => `scripts/${f}`);
}

function main(argv = process.argv.slice(2)) {
  const json = argv.includes('--json');
  const rangeIdx = argv.indexOf('--range');
  const range = rangeIdx >= 0 ? argv[rangeIdx + 1] : (process.env.CI_RANGE || null);
  const skipIdx = argv.indexOf('--skip');
  const skip = new Set((skipIdx >= 0 ? argv[skipIdx + 1] || '' : '').split(',').filter(Boolean));

  const results = [];
  for (const s of chain({ range })) {
    if (skip.has(s.name)) { if (!json) console.log(`- ${s.name}: 건너뜀(--skip)`); continue; }
    const r = step(s.name, s.args, { blocking: s.blocking !== false });
    results.push(r);
    if (!json) {
      const mark = r.failed ? '✗' : (r.outcome === 'PASS' ? '✓' : '!');
      console.log(`${mark} ${r.name} — ${r.outcome} (exit ${r.code})`);
      if (r.failed || r.outcome !== 'PASS') {
        const body = (r.stdout + r.stderr).trimEnd();
        if (body) console.log(body.split('\n').map(l => `    ${l}`).join('\n'));
      }
    }
    // 차단 단계가 깨지면 즉시 멈춘다 — 뒤 단계의 출력이 원인을 덮지 않게.
    if (r.failed) break;
  }

  const failed = results.filter(r => r.failed);
  const warned = results.filter(r => !r.failed && r.outcome !== 'PASS');
  if (json) { console.log(JSON.stringify({ results, failed: failed.length, warned: warned.length }, null, 2)); }
  else {
    console.log('');
    if (failed.length) console.log(`게이트 ${failed.length}건 차단 — ${failed.map(r => r.name).join(', ')}`);
    else console.log(`게이트 전부 통과${warned.length ? ` · 경고 ${warned.length}건(${warned.map(r => `${r.name}=${r.outcome}`).join(', ')})` : ''}`);
  }
  return failed.length ? 1 : 0;
}

if (require.main === module) process.exit(main());
module.exports = { chain, step, testFiles, OUTCOME, BLOCKING };
