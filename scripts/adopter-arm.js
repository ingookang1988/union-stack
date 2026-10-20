#!/usr/bin/env node
// scripts/adopter-arm.js
// @ship upstream-only — 어답터 팔 — 상류가 어답터 형상을 돈다([PRO-24] ①(c))
// 어답터 팔([PRO-17]) — **상류가 자기 형상만 도는 것**을 구조로 닫는다([LSN-17]).
//
// 새 게이트가 아니라 **기존 게이트를 다른 형상에서 한 번 더 돌리는 것**이다(로직 1벌 원칙).
// 사본을 만들고 형상을 바꾼 뒤, 이미 있는 도구(`health`·`dashboard`·스위트)를 그대로 실행한다.
//
// 네 축(축마다 실측 결함이 근거다 — 가공한 시나리오가 아니다):
//
//   env  : `init --apply --drop-template-bits` 를 실제로 적용한 사본.
//          픽스처 부재·모듈 부재·스크립트 미실행 뷰어를 견디는가.
//          근거 [ADR-26](무JS 도달 불가) · [ADR-27]·[ADR-30](상류 픽스처 단언) · [ADR-28](하드 require).
//
//   data : 평면 **내용의 모양**만 바꾼 사본(문서 개수·표 개수·마크다운 관례).
//          `init` 을 돌리지 않는다 — 축을 섞지 않기 위해서다.
//          근거 [ADR-31](HISTORY 헤딩형 → 분기점 0) · [ADR-35]·[ADR-37](마커 원문 노출 · 헤더 오계수).
//
//   legacy : **독립 채번 레거시** — 같은 번호가 도메인마다 다른 문서(PLAN-36 ≠ PRO-36), 같은 도메인·같은 ID 중복 파일,
//            상류 참조 `[up:…]` 를 담은 실콘텐츠. 근거 [PRO-27] ①⑤ (SURVEY-02: ID 충돌 3/3 · 중복 2쌍 · strict 린터 오해소).
//
//   serial : **전역 일련번호 WO** — 산술 조상이 0 인 WO(계보는 frontmatter `plan:` 에만). 빈 upward-fetch 가 조용히
//            exit 0 하던 것과, `health --root` 가 플래그를 무시하던 것. 근거 [PRO-27] ③④ (SURVEY-02).
//
//            ③ 뒤: plan: 부모가 맥락으로 실리고(exit 0) 부모 없는 고아 WO 만 CLARIFY. legacy 는 arithmeticFrom 아래 도메인 횡단 상속 차단.
//
//   nonjs  : **비-JS 제품 검사 선언** — adapter.json checks[] 4행(0건 전수·정상·메타·env 조건부), 영수증 0 에서 시작.
//            health 가 영수증 공백을 표면화하는가, ci.js 가 0건 검사를 3분할로 판정하고 영수증을 선언 행마다 쓰는가. 근거 [PRO-22] §3 1·2·2-bis.
//
//   kit    : **손 이식 어답터** — 키트 파일 8 + 앵커를 지우고 한 파일을 로컬 패치한 사본. 키트 dry-run 이 쓰지 않는가, --apply 가 없는 것만 가져오는가,
//            앵커가 동일 파일만 담는가(패치 파일 제외 → 3-way 가 보호). 근거 [PRO-24] ①(a) · §9 ①(a)(의존 0 · 첫 실행 dry-run).
//
//   vocab  : **로컬 상태 어휘** — `status: Done`·`Review`, 별칭 증거 필드, frontmatter 없는 WO·PRO(본문 산문 상태), 종결 디렉터리 문서.
//            statusMap·evidenceFields 로 읽히는가, 백필 dry-run 이 쓰지 않는가, --apply 뒤 대상 0 인가. 근거 [PRO-27] ② (SURVEY-02:
//            WO 99/179 frontmatter 없음 · PRO 17/17 YAML 없음 · status 38종 자유 문자열).
//
// **왜 data 축이 따로 필요한가**: env 팔의 사본은 `init` 만 돌린 것이라 여전히 *상류의 데이터*를
// 쓴다. [PRO-17] §5 는 형상 매트릭스를 "형상 하나를 통과했는데 실어답터가 깨진 사례가 나오면"
// 으로 보류했고, [ADR-31]·[ADR-37]이 정확히 그 사례다 — 재개 조건이 충족되어 축을 하나 늘렸다.
//
// 종료 코드: 0 = 성공 바 전부 충족 · 1 = 하나라도 미충족(차단).
//
// 실행:
//   node scripts/adopter-arm.js                 # 두 축 전부
//   node scripts/adopter-arm.js --shape env     # 한 축만 (env|data|legacy|serial|vocab|nonjs|kit)
//   node scripts/adopter-arm.js --keep <dir>    # 워크스페이스 보존(디버깅)
//   node scripts/adopter-arm.js --json
const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { copyTree } = require('./fs_walk');
const { read: readLedger } = require('./ledger');
const receipts = require('./receipts');

const ROOT = path.resolve(__dirname, '..');

/** 사본에서 node 를 돌린다. 죽어도 던지지 않는다 — 크래시 여부 자체가 판정 재료다. */
function run(cwd, args) {
  try {
    const stdout = execFileSync(process.execPath, args, { cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] });
    return { code: 0, stdout, stderr: '', signal: null };
  } catch (e) {
    // ⚠ `String(e)` 를 stderr 로 흘리지 않는다 — execFileSync 의 래퍼 문구가 "Error: Command
    // failed:" 라서, 그걸 자식의 stderr 로 섞으면 **모든 비영 종료가 크래시로 오판**된다(실측).
    return {
      code: typeof e.status === 'number' ? e.status : -1,
      stdout: e.stdout ? String(e.stdout) : '',
      stderr: e.stderr ? String(e.stderr) : '',
      signal: e.signal || null,
    };
  }
}

// 크래시의 흔적 = 스택 프레임 또는 던져진 Error 이름. 게이트가 stderr 로 내는 판정문(`✗ …`)과
// 구별하기 위해 **줄 머리**에 앵커한다.
const CRASH_RE = /(?:^|\n)\s*\w*Error\b|(?:^|\n)\s+at [^\n]*:\d+:\d+/;

/**
 * 크래시(예외로 죽음)와 게이트 FAIL(판정으로 1)을 가른다 — 팔이 보는 것은 전자다.
 * 이 구별이 [ADR-28]의 판정 문법이다: 게이트는 `해당 없음`도 `FAIL`도 낼 수 있으나 **죽어서는
 * 안 된다**. 죽음만 팔의 실패로 센다.
 */
function crashed(r) {
  return !!r.signal || r.code === -1 || CRASH_RE.test(r.stderr);
}

// --- data 축 픽스처 ---------------------------------------------------------
// 각 형상은 실측 결함에서 왔다. 가공을 늘리지 않는다 — 늘리면 팔이 자기 상상을 검사하게 된다.
const ZONES = 13;          // [ADR-37]: 존별 표 여러 개 · 한국어 헤더
const ROWS_PER_ZONE = 4;
const HISTORY_ENTRIES = 3; // [ADR-31]: 헤딩형 분기점

/** 대안 형상의 평면 데이터를 만든다(순수). 반환: {rel: 내용} + 정답(ground truth). */
// @test-asset 하류 형상 픽스처 :: dataShape() — 어답터에서만 참인 데이터 형상. 하류 제보로 잡은 형상은 여기에 추가(회귀 고정, [ADR-40])
function dataShape() {
  const files = {};
  // ① live.md — 존별 표 N개, 한국어 헤더, 백틱 경로, 볼드 상태([ADR-37] B)
  const live = ['<!-- [Wiki] 라이브 제품 표면. -->', '# Live Features', ''];
  let liveRows = 0;
  for (let z = 1; z <= ZONES; z++) {
    live.push(`## 존 ${z}`, '| 기능 | ZFS Ref | 상태 |', '|---|---|---|');
    for (let r = 1; r <= ROWS_PER_ZONE; r++) {
      liveRows++;
      live.push(`| 기능${liveRows} \`/zone${z}/item${r}\` | [PLAN-01a] | **Live** |`);
    }
    live.push('');
  }
  files['.union-stack/feature/live.md'] = live.join('\n') + '\n';

  // ② 원장 — 볼드가 구분자를 감싸는 관례([ADR-37] A)
  const ledger = ['<!-- [Raw] 결정화된 ADR 영구 원장. Append-only. -->', '# Architecture Decision Ledger'];
  for (let i = 2; i <= 9; i++) {
    ledger.push(`- [2026-0${i}-01][ADR-0${i}]: **결정 제목 ${i} — 부제가 구분자 뒤에 온다(\`scripts/x.js\`).** 본문은 이어진다.`);
  }
  files['.union-stack/archive_ledger.md'] = ledger.join('\n') + '\n';

  // ③ HISTORY — 헤딩형([ADR-31]). 근거 라벨을 달아 CLARIFY 가 아니라 정상 계수가 되게 한다.
  //    값이 **여는 마커로 시작**하는 형상은 #7(LifeSaju 실측 4건) — 라벨 추출이 그 마커를
  //    먹으면 짝이 한 칸 밀려 시간축 카드의 강조가 반대 토큰에 걸린다(픽스처가 곧 회귀 고정).
  const hist = ['<!-- [Schema/Raw] 프로젝트 전략적 분기점. -->', '# Project History', ''];
  for (let i = 1; i <= HISTORY_ENTRIES; i++) {
    hist.push(`### 2026-0${i}-15 — 전략 분기점 ${i}`, '',
      `- **Context:** 상황 ${i}`,
      `- 근거: **핵심 ${i}** 때문 — \`이유\`가 있다`,
      `- **Impact:** \`A${i}\` → \`B${i}\`.`, '');
  }
  files['.union-stack/project/HISTORY.md'] = hist.join('\n') + '\n';

  // ④ 규범 문서 — **헤딩에 인라인 코드**가 있는 형상([ADR-47]). 상류 규범 헤딩엔 백틱이 없어
  //    안 드러났고, 실어답터(`raw \`pg\` Pool` · `단일 Dockerfile + \`PACKAGE\` 빌드 인자`)에서 발현했다.
  //    당위 축의 '절 구조' 칩이 헤딩을 그대로 넣던 경로가 이 픽스처의 과녁이다.
  files['.union-stack/architecture/ARCH-09_shape_probe.md'] = [
    '<!-- [Schema] 규범 픽스처(example). -->', '---', 'id: ARCH-09', 'status: Active', '---', '',
    '# 규범 픽스처', '',
    '## 결정: DB 접근은 raw `pg` Pool', '- 본문.', '',
    '## 결정: 루트 단일 Dockerfile + `PACKAGE` 빌드 인자', '- 본문.', '',
    '## **볼드 헤딩** — 부제', '- 본문.', '',
  ].join('\n') + '\n';

  // ④ HANDOFF §3 — 인용 + 헤딩 + 볼드 + 코드가 섞인 산문([ADR-35])
  files['.union-stack/sprint/HANDOFF.md'] = [
    '<!-- [Wiki] 세션 이어달리기. -->', '---', 'session_id: shape-probe', 'date: 2026-08-20T00:00:00Z',
    'author: agent', 'verification: "형상 팔 픽스처"', 'version: 1.0', '---', '',
    '# Handoff → 다음 세션', '',
    '## 1. 세션 요약', '- 형상 팔이 쓰는 픽스처다.', '',
    '## 2. 변경 위치 (ID 목록)', '- `scripts/x.js`', '',
    '## 3. 다음 작업 (단일 진입점)',
    '> ### 🎯 **다음 작업 제목** (부가) — 이월 없음',
    'webapp `serialize-x` 경로로 … **볼드**와 `코드`가 섞인다.', '',
    '## 4. 미해결 / 주의',
    // 접힌 줄에 걸친 볼드 — 줄 단위로 변환하면 짝이 갈려 원문이 노출된다(팔이 잡은 형상).
    '- 규율: **여러 줄에 걸친 강조는 `편집기 폭` 때문에',
    '  흔하다**(픽스처가 곧 회귀 고정).', '',
    '## 5. 검증 상태', '- 해당 없음', '',
  ].join('\n') + '\n';

  return { files, truth: { liveRows, historyEntries: HISTORY_ENTRIES } };
}

// --- 성공 바 ----------------------------------------------------------------
/** 렌더 본문(속성 제외)에 원문 마크다운 마커가 남았는가(순수). [ADR-35]·[ADR-37] 계약. */
function rawMarkers(html) {
  const body = String(html).slice(String(html).indexOf('<main>'))
    .replace(/title="[^"]*"/g, '').replace(/<[^>]*>/g, '');
  return (body.match(/\*\*|`/g) || []).length;
}

/** 무JS 도달성 — 형상 검사([ADR-26] 계약. 헤드리스 브라우저 의존 없이 판정). */
function noJsReachable(html) {
  const views = [...html.matchAll(/class="view" data-view="([a-z]+)"/g)].map(m => m[1]);
  if (!views.length) return { ok: false, why: '뷰가 없다' };
  const radios = (html.match(/class="vsel" type="radio"/g) || []).length;
  const rules = views.every(v => html.includes(`#v-${v}:checked ~ main .view[data-view="${v}"] { display:block; }`));
  const anchors = /<a [^>]*data-nav=/.test(html);
  const ok = radios === views.length && rules && !anchors;
  return { ok, why: ok ? '' : `라디오 ${radios}/${views.length} · 규칙 ${rules} · 앵커 ${anchors}` };
}

function envArm(ws) {
  const bars = [];
  const before = (readLedger(ws).match(/^- \[\d{4}-\d{2}-\d{2}\]\[ADR-\d+\]:/gm) || []).length;
  const init = run(ws, ['scripts/init.js', '--name', 'Adopter Probe', '--slug', 'probe', '--apply', '--drop-template-bits']);
  bars.push({ name: 'init 적용', ok: init.code === 0, detail: init.code === 0 ? '' : init.stderr.slice(0, 200) });

  // 상류 결정 기록이 한 건도 넘어가지 않는가([ADR-36]① — 머리는 리셋되는데 **회전본이 남아**
  // 신선한 어답터가 상류 ADR 24건을 물려받았다). 머리만 보면 못 잡는다: 저장소 전체를 센다.
  const after = (readLedger(ws).match(/^- \[\d{4}-\d{2}-\d{2}\]\[ADR-\d+\]:/gm) || []).length;
  bars.push({ name: '상류 ADR 잔존 0', ok: after === 0, detail: `${before} → ${after}건(회전본 포함 전수)` });

  const suite = run(ws, ['--test', 'scripts/*.test.js']);
  const failLine = (suite.stdout.match(/^# fail (\d+)$/m) || [])[1];
  bars.push({ name: '스위트 실패 0', ok: failLine === '0', detail: `fail ${failLine ?? '?'} (픽스처 부재는 건너뜀이지 실패가 아니다)` });

  const health = run(ws, ['scripts/health.js']);
  bars.push({ name: 'health 크래시 0 · exit 0', ok: health.code === 0 && !crashed(health), detail: `exit ${health.code}` });

  const dash = run(ws, ['scripts/dashboard.js', '--out', 'probe.html']);
  let reach = { ok: false, why: '산출물 없음' };
  if (!crashed(dash)) {
    try { reach = noJsReachable(fs.readFileSync(path.join(ws, 'probe.html'), 'utf8')); } catch (e) { reach = { ok: false, why: e.message }; }
  }
  bars.push({ name: '무JS 도달성', ok: reach.ok, detail: reach.why });
  // [PRO-24] ①(c) — init 뒤 사본에서 상류 전용 스크립트가 배송 계획(buildPlan)에 들어가지 않는다(§6 성공 바). 네트워크 없이 합성 상류 맵으로.
  // [WO-29a-9] drop-template-bits 가 상류 전용 사본을 지운다 → 드롭 직후 남은 사본 0 이어야 한다. 손 이식 어답터의 사본 INFO 경로는 사본 1개를 심어 계속 확인한다.
  const plan = run(ws, ['-e', [
    "const fs=require('fs');const t=require('./scripts/template-update');let lo=t.localCtx('.');",
    "const up={'scripts/eval.js':'x1','scripts/adopter-arm.js':'x2','scripts/adopter-census.js':'x3','scripts/health.js':'y1'};",
    "const P=()=>t.buildPlan(t.localTemplateFiles('.',lo),up,{local:lo,upstream:{manifest:lo.manifest,localOwned:lo.localOwned}});",
    "const p0=P();fs.writeFileSync('scripts/eval.js','// planted copy\\n');lo=t.localCtx('.');const p=P();fs.rmSync('scripts/eval.js');",
    "console.log(JSON.stringify({ns:p.newSync,cs:p.changedSync,uol0:p0.upstreamOnlyLocal.length,uol:p.upstreamOnlyLocal.length,manifest:!!lo.manifest}));",
  ].join('')]);
  let pj = null;
  try { pj = JSON.parse(plan.stdout.trim().split('\n').pop()); } catch { /* null */ }
  const leaked = pj ? [...pj.ns, ...pj.cs].filter(f => /eval|adopter-arm|adopter-census/.test(f)) : null;
  bars.push({ name: '상류 전용 스크립트가 배송 계획(buildPlan)에서 빠진다 · 드롭 뒤 남은 사본 0 · 심은 사본은 INFO', ok: !crashed(plan) && !!pj && pj.manifest && leaked.length === 0 && pj.cs.includes('scripts/health.js') && pj.uol0 === 0 && pj.uol === 1,
    detail: pj ? `매니페스트 ${pj.manifest} · 누출 ${leaked.length} · health 갱신 ${pj.cs.includes('scripts/health.js')} · 드롭 뒤 사본 ${pj.uol0} · 심은 사본 ${pj.uol}` : `exit ${plan.code} · 측정 실패` });
  return bars;
}

function dataArm(ws) {
  const { files, truth } = dataShape();
  for (const [rel, txt] of Object.entries(files)) {
    const abs = path.join(ws, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, txt);
  }
  const bars = [];
  // 도구 3종이 **죽지 않는가**. exit 0 은 요구하지 않는다 — 주입 콘텐츠에 더미 마커가 없어
  // 누설 게이트가 FAIL 하는 것이 정상이고, 그건 크래시가 아니라 판정이다.
  for (const [name, args] of [['health', ['scripts/health.js']],
    ['dashboard', ['scripts/dashboard.js', '--out', 'probe.html']],
    ['lineage-tree', ['scripts/lineage-tree.js', '--out', 'probe-tree.html']]]) {
    const r = run(ws, args);
    bars.push({ name: `${name} 크래시 0(exit 무관)`, ok: !crashed(r),
      detail: crashed(r) ? r.stderr.split('\n').find(Boolean) || '스택' : `exit ${r.code}` });
  }

  let html = '';
  try { html = fs.readFileSync(path.join(ws, 'probe.html'), 'utf8'); } catch { /* 아래 바가 잡는다 */ }
  const markers = html ? rawMarkers(html) : -1;
  bars.push({ name: '렌더 본문 원문 마커 0', ok: markers === 0, detail: `${markers}건` });

  // 계수 정확성 — 픽스처가 정답을 안다. "표시가 아니라 숫자가 틀린" 부류를 잡는 자리다([ADR-37]).
  const probe = run(ws, ['-e', [
    "const d=require('./scripts/dashboard');const p=d.gatherAll('.').product;",
    "const h=require('./scripts/history-linter');const fs=require('fs');",
    "const hist=h.parseEntries(fs.readFileSync('.union-stack/project/HISTORY.md','utf8')).filter(e=>!e.example);",
    "console.log(JSON.stringify({live:p.live.length,history:hist.length}));",
  ].join('')]);
  let counts = null;
  try { counts = JSON.parse(probe.stdout.trim().split('\n').pop()); } catch { /* null */ }
  bars.push({ name: `live 계수 정확(정답 ${truth.liveRows})`, ok: !!counts && counts.live === truth.liveRows,
    detail: counts ? `${counts.live}건 — 헤더가 데이터로 새면 여기서 부푼다` : '측정 실패' });
  bars.push({ name: `HISTORY 분기점 계수 정확(정답 ${truth.historyEntries})`, ok: !!counts && counts.history === truth.historyEntries,
    detail: counts ? `${counts.history}건 — 형식이 다르면 조용한 0 이 된다` : '측정 실패' });
  return bars;
}

// --- 교차 레포 형상([PRO-27]) ---------------------------------------------------
// 어답터 3곳 중 2곳이 상류 전제(ID 공간 분리·산술 계보·frontmatter 존재)를 깼다. 상류 형상에서 맞던 규칙이
// 전제부터 틀린 사례라, 두 형상을 팔에 고정한다(픽스처가 곧 회귀 고정 — [ADR-40]).

/** 독립 채번 레거시 형상(순수). 반환: {rel: 내용} + 정답. */
function legacyShape() {
  const files = {};
  const doc = (comment, id, status, title) => [comment, '---', `id: ${id}`, `status: ${status}`, '---', '', `# [${id}] ${title}`, '- 형상 픽스처(example).', ''].join('\n');
  // 같은 번호 36 — PLAN 과 PRO 가 서로 무관한 독립 채번. 중복이 **아니다**.
  files['.union-stack/plan/PLAN-36_legacy_root.md'] = doc('<!-- [Wiki] 레거시 독립 채번(example). -->', 'PLAN-36', 'Active', '레거시 루트');
  files['.union-stack/proposals/PRO-36_independent_numbering.md'] = doc('<!-- [Proposal] 독립 채번(example). -->', 'PRO-36', 'Proposed', '독립 채번');
  // 같은 도메인·같은 ID 파일 2개 — 하류 실측(2쌍). 린터가 REJECT 해야 한다.
  files['.union-stack/proposals/PRO-36_independent_numbering_dup.md'] = doc('<!-- [Proposal] 중복 사본(example). -->', 'PRO-36', 'Proposed', '독립 채번(중복 사본)');
  // 상류 참조를 담은 **실콘텐츠**(더미 마커 없음 → strict 게이팅 대상). [up:…] 을 로컬 미해소로 잡으면 상류 문서가
  // 어답터에서 통째로 걸리는 결함(SURVEY-02: 설문 파일 자체가 Fail-close)의 재현이다.
  // [PRO-27] ③ — 레거시 구간(36 미만)은 산술 상속을 끈다: WO-12a-1 은 무관한 PLAN-12 를 상속하지 않고 선언 부모 PRO-36 만 싣는다.
  files['.union-stack/adapter.json'] = JSON.stringify({ lineage: { arithmeticFrom: 36 } }, null, 2) + '\n';
  files['.union-stack/plan/PLAN-12_unrelated_legacy.md'] = doc('<!-- [Wiki] 무관한 레거시 PLAN(example). -->', 'PLAN-12', 'Active', '무관한 레거시 기획').replace('status: Active', 'status: Active\nmnemonic: wrongroot');
  // PRO-36 에 mnemonic — WO-12a-1(parent PRO-36, arithmetic:false)은 이것을 받고 PLAN-12 의 wrongroot 는 받지 않아야 한다([PRO-26] ④ 거짓 라벨 금지).
  files['.union-stack/proposals/PRO-36_independent_numbering.md'] = files['.union-stack/proposals/PRO-36_independent_numbering.md'].replace('status: Proposed', 'status: Proposed\nmnemonic: indep');
  files['.union-stack/sprint/WO-12a-1_legacy_task.md'] = [
    '<!-- (example) 레거시 구간 WO -->', '---', 'id: WO-12a-1', 'title: 레거시 구간 작업(example)', 'status: Active', 'parent: PRO-36',
    'evidence: "none — 형상 픽스처"', 'closed_by: []', '---', '', '# [WO-12a-1] 레거시 구간 작업', '## 목표', '- 예시', '## 수용 기준', '- 예시', '## 증거', '- 예시', '',
  ].join('\n');
  files['.union-stack/sprint/WO-36a-1_adopter_note.md'] = [
    '---', 'id: WO-36a-1', 'title: 어답터 메모', 'status: Active', 'evidence: "none — 형상 픽스처"', 'closed_by: []', '---', '',
    '# [WO-36a-1] 어답터 메모', '- 상류 [up:PRO-27] ① 을 따른다. 로컬 [PLAN-36] 아래 작업이다.', '',
  ].join('\n');
  return { files, truth: { duplicateKey: 'PRO-36', upstreamRefs: 1, legacyWo: '12a-1', legacyParent: 'PRO-36', unrelated: 'PLAN-12' } };
}

/** 전역 일련번호 WO 형상(순수). 계보는 frontmatter `plan:` 에만 있고 산술 조상은 0. */
function serialShape() {
  const files = {};
  files['.union-stack/plan/PLAN-07_serial_parent.md'] = ['<!-- [Wiki] 전역 일련번호 형상의 부모(example). -->', '---', 'id: PLAN-07', 'status: Active', '---', '', '# [PLAN-07] 부모', '- 형상 픽스처(example).', ''].join('\n');
  files['.union-stack/sprint/WO-345_serial_wo.md'] = [
    '---', 'id: WO-345', 'title: 전역 일련번호 작업(example)', 'status: Active', 'plan: PLAN-07', 'evidence: "none — 형상 픽스처"', 'closed_by: []', '---', '',
    '# [WO-345] 전역 일련번호 작업', '- 계보는 plan: 에만 있다(예시).', '',
  ].join('\n');
  // 부모 선언이 없는 고아 WO — 빈 맥락은 여전히 CLARIFY 여야 한다(③ 이 "0건 = 통과"를 되살리면 안 된다).
  files['.union-stack/sprint/WO-346_serial_orphan.md'] = [
    '---', 'id: WO-346', 'title: 고아 작업(example)', 'status: Active', 'evidence: "none — 형상 픽스처"', 'closed_by: []', '---', '',
    '# [WO-346] 고아 작업', '- 부모 선언 없음(예시).', '',
  ].join('\n');
  return { files, truth: { arithmeticAncestors: 0, frontmatterParent: 'PLAN-07', orphan: '346' } };
}

function writeShape(ws, files) {
  for (const [rel, txt] of Object.entries(files)) {
    const abs = path.join(ws, rel);
    fs.mkdirSync(path.dirname(abs), { recursive: true });
    fs.writeFileSync(abs, txt);
  }
}

function legacyArm(ws) {
  const { files, truth } = legacyShape();
  writeShape(ws, files);
  const bars = [];
  const z = run(ws, ['scripts/zfs-linter.js']);
  bars.push({ name: `중복 ID(${truth.duplicateKey}) → zfs-linter REJECT`, ok: z.code === 1 && !crashed(z) && z.stderr.includes(`중복 ID ${truth.duplicateKey}`),
    detail: `exit ${z.code}` });
  // 사본은 작업트리째라(미커밋 spike 포함) exit 0 을 요구하지 않는다 — 판정은 **픽스처 문서가 strict 목록에 오르는가**다.
  const strict = run(ws, ['scripts/ref-linter.js', '--strict']);
  const fixtureHit = strict.stderr.split('\n').filter(l => l.includes('✗') && l.includes('WO-36a-1_adopter_note.md'));
  bars.push({ name: '[up:…] 를 담은 실콘텐츠가 strict 참조 린터에 걸리지 않는다', ok: !crashed(strict) && fixtureHit.length === 0,
    detail: fixtureHit.length ? fixtureHit.join(' ') : `exit ${strict.code}(다른 파일의 미해소는 이 바의 과녁이 아니다)` });
  // 상류 자신도 [up:…] 예문을 갖는다(PRO-27) — 절대 건수가 아니라 **증분**으로 판정한다.
  const countUp = out => { const m = (out.stdout + out.stderr).match(/상류 참조\(up:\) (\d+)건/); return m ? +m[1] : 0; };
  const advHere = countUp(run(ROOT, ['scripts/ref-linter.js']));
  const advThere = countUp(run(ws, ['scripts/ref-linter.js']));
  bars.push({ name: `상류 참조 INFO 계수가 픽스처만큼(+${truth.upstreamRefs}) 는다`, ok: advThere === advHere + truth.upstreamRefs,
    detail: `${advHere} → ${advThere}` });
  // health --root 가 **사본을** 재는가 — 플래그를 무시하고 상류 자신을 재던 결함의 과녁. 도메인 계수 차로 판정한다.
  const here = run(ROOT, ['scripts/health.js', '--json']);
  const there = run(ROOT, ['scripts/health.js', '--root', ws, '--json']);
  let ok = false, detail = '측정 실패';
  try {
    const a = JSON.parse(here.stdout), b = JSON.parse(there.stdout);
    ok = path.resolve(b.root) === path.resolve(ws) && b.byDomain.PRO === a.byDomain.PRO + 2 && b.byDomain.PLAN === a.byDomain.PLAN + 2;
    detail = `PRO ${a.byDomain.PRO}→${b.byDomain.PRO} · PLAN ${a.byDomain.PLAN}→${b.byDomain.PLAN}`;
  } catch (e) { detail = e.message; }
  bars.push({ name: 'health --root 가 사본을 측정(상류 자신 아님)', ok, detail });
  // [PRO-27] ③ — 독립 채번 구간의 도메인 횡단 상속 차단 + 선언 부모 수집.
  const lf = run(ws, ['scripts/upward-fetch.js', `WO-${truth.legacyWo}`]);
  const hasUnrelated = lf.stdout.includes(`[${truth.unrelated}]`);
  const hasParent = lf.stdout.includes(`[${truth.legacyParent}]`);
  bars.push({ name: `arithmeticFrom 아래 WO: 무관한 ${truth.unrelated} 상속 안 함 · 선언 부모 ${truth.legacyParent} 수집 · exit 0`,
    ok: lf.code === 0 && !crashed(lf) && !hasUnrelated && hasParent, detail: `exit ${lf.code} · ${truth.unrelated} ${hasUnrelated ? '포함(!)' : '제외'} · ${truth.legacyParent} ${hasParent ? '포함' : '누락(!)'}` });
  // [PRO-26] ④ — 파생 라벨: 레거시 구간 WO 는 선언 부모의 mnemonic(indep)을 받고 무관한 숫자 루트의 mnemonic(wrongroot)은 받지 않는다.
  const lb = run(ws, ['scripts/label.js', `WO-${truth.legacyWo}`, '--json']);
  let lj = null;
  try { lj = JSON.parse(lb.stdout)[0]; } catch { /* null */ }
  bars.push({ name: '파생 라벨: 선언 부모 mnemonic(indep) 상속 · 무관한 PLAN-12 의 wrongroot 금지', ok: !crashed(lb) && !!lj && lj.label === 'indep' && lj.source === 'mnemonic:PRO-36',
    detail: lj ? `${lj.label} ← ${lj.source}` : `exit ${lb.code} · 측정 실패` });
  return bars;
}

function serialArm(ws) {
  const { files, truth } = serialShape();
  writeShape(ws, files);
  const bars = [];
  // [PRO-27] ③ — 산술 조상 0 이어도 plan: 부모가 맥락으로 실리고 exit 0.
  const uf = run(ws, ['scripts/upward-fetch.js', 'WO-345']);
  bars.push({ name: `산술 조상 0 인 WO 의 upward-fetch → plan: 부모 ${truth.frontmatterParent} 수집 · exit 0`,
    ok: uf.code === 0 && !crashed(uf) && uf.stdout.includes(`[${truth.frontmatterParent}]`) && uf.stdout.includes('frontmatter'), detail: `exit ${uf.code}` });
  // 빈 맥락은 (없음)+exit 0 이 아니라 CLARIFY(3) — "0건 검사 = 통과" 클래스([PRO-22] 2-bis)의 회귀 고정. ③ 이 이것을 되살리면 안 된다.
  const orphan = run(ws, ['scripts/upward-fetch.js', `WO-${truth.orphan}`]);
  bars.push({ name: '부모 선언 없는 고아 WO 의 upward-fetch → CLARIFY(exit 3)', ok: orphan.code === 3 && !crashed(orphan) && (orphan.stdout + orphan.stderr).includes('CLARIFY'),
    detail: `exit ${orphan.code}` });
  const bad = run(ROOT, ['scripts/health.js', '--root', path.join(ws, 'no-such-dir')]);
  bars.push({ name: 'health --root <없는 경로> → REJECT "측정 대상 아님"', ok: bad.code === 1 && !crashed(bad) && (bad.stderr + bad.stdout).includes('측정 대상 아님'),
    detail: `exit ${bad.code}` });
  const h = run(ROOT, ['scripts/health.js', '--root', ws]);
  bars.push({ name: 'health --root <사본> 크래시 0(exit 무관)', ok: !crashed(h), detail: crashed(h) ? h.stderr.split('\n').find(Boolean) || '스택' : `exit ${h.code}` });
  return bars;
}

/** 로컬 상태 어휘 형상(순수) — statusMap · evidenceFields · 백필([PRO-27] ②). */
function vocabShape() {
  const files = {};
  files['.union-stack/adapter.json'] = JSON.stringify({
    statusMap: { Done: 'Closed', Review: 'Verifying' },
    evidenceFields: { evidence: ['implementation_commit'], closed_by: ['surfaces'] },
  }, null, 2) + '\n';
  files['.union-stack/sprint/WO-40_local_vocab.md'] = [
    '<!-- (example) 로컬 어휘 WO -->', '---', 'id: WO-40', 'title: 로컬 어휘 작업(example)', 'status: Done', 'parent: PLAN-01',
    'implementation_commit: "abc123 (example)"', 'surfaces: [.union-stack/feature/live.md]', '---', '',
    '# [WO-40] 로컬 어휘 작업', '## 목표', '- 예시', '## 수용 기준', '- 예시', '## 증거', '- 예시', '',
  ].join('\n');
  files['.union-stack/sprint/WO-41_review_no_fm.md'] = ['# [WO-41] frontmatter 없는 작업(example)', '', '**Status:** Review', '- 본문', ''].join('\n');
  files['.union-stack/proposals/PRO-41_prose_status.md'] = ['# [PRO-41] 산문 상태 제안(example)', '', '상태: Approved — 2026-01-01', ''].join('\n');
  files['.union-stack/sprint/archived/WO-42_archived_no_fm.md'] = ['# [WO-42] 종결 디렉터리 문서(example)', '- 본문뿐', ''].join('\n');
  return { files, truth: { mappedClosed: '40', backfillRows: 3, estimable: 3, afterApplyVerifying: '41' } };
}

function vocabArm(ws) {
  const { files, truth } = vocabShape();
  writeShape(ws, files);
  const bars = [];
  const probe = run(ws, ['-e', [
    "const w=require('./scripts/work-close').gather('.');const z=require('./scripts/zfs_index').buildIndex('.');",
    "const a=w.find(x=>x.id==='40');const b=z.find(d=>d.domain==='WO'&&d.id==='40');",
    "console.log(JSON.stringify({status:a&&a.status,raw:a&&a.rawStatus,ev:a&&a.evidence,cb:a&&a.closed_by,idx:b&&b.status}));",
  ].join('')]);
  let p = null;
  try { p = JSON.parse(probe.stdout.trim().split('\n').pop()); } catch { /* null */ }
  bars.push({ name: 'statusMap: Done → Closed(work-close · 색인 둘 다)', ok: !!p && p.status === 'Closed' && p.raw === 'Done' && p.idx === 'Closed',
    detail: p ? `${p.raw} → ${p.status} · 색인 ${p.idx}` : '측정 실패' });
  bars.push({ name: 'evidenceFields: 별칭 증거·흔적이 읽힌다', ok: !!p && /abc123/.test(p.ev || '') && Array.isArray(p.cb) && p.cb.length === 1,
    detail: p ? `evidence=${p.ev} · closed_by ${(p.cb || []).length}곳` : '측정 실패' });
  // 백필 — dry-run 은 **쓰지 않는다**(상류가 어답터 문서를 고치지 않는 경계의 기계 검사).
  const watched = ['.union-stack/sprint/WO-41_review_no_fm.md', '.union-stack/proposals/PRO-41_prose_status.md', '.union-stack/sprint/archived/WO-42_archived_no_fm.md'];
  const snap = () => watched.map(f => fs.readFileSync(path.join(ws, f), 'utf8')).join('\u0000');
  const before = snap();
  const dry = run(ws, ['scripts/frontmatter-backfill.js', '--json']);
  let rows = null;
  try { rows = JSON.parse(dry.stdout).rows; } catch { /* null */ }
  bars.push({ name: `백필 dry-run: 대상 ${truth.backfillRows}건 나열 · 파일 쓰기 0`, ok: dry.code === 3 && !!rows && rows.length === truth.backfillRows && snap() === before,
    detail: rows ? `${rows.length}건 · exit ${dry.code}` : '측정 실패' });
  const ap = run(ws, ['scripts/frontmatter-backfill.js', '--apply']);
  const after = run(ws, ['scripts/frontmatter-backfill.js']);
  const probe2 = run(ws, ['-e', "const z=require('./scripts/zfs_index').buildIndex('.');const b=z.find(d=>d.domain==='WO'&&d.id==='41');console.log(JSON.stringify({s:b&&b.status,r:b&&b.rawStatus}))"]);
  let p2 = null;
  try { p2 = JSON.parse(probe2.stdout.trim().split('\n').pop()); } catch { /* null */ }
  bars.push({ name: '--apply 뒤 대상 0 · 삽입값은 로컬 어휘(Review → Verifying 은 매핑이 한다)', ok: ap.code === 0 && after.code === 0 && !!p2 && p2.r === 'Review' && p2.s === 'Verifying',
    detail: `apply exit ${ap.code} · 재검사 exit ${after.code}${p2 ? ` · ${p2.r} → ${p2.s}` : ''}` });
  // [PRO-24] ② 센서스 — 상류에서 사본을 "형제 레포"로 잰다. 익명성(경로·제목 0)과 읽기 전용(사본 변경 0)을 기계로 검사.
  const listPath = path.join(ws, '..', `census-list-${path.basename(ws)}.json`);
  fs.writeFileSync(listPath, JSON.stringify({ repos: [{ label: 'ARM', path: ws }] }));
  const treeSnap = () => JSON.stringify(require('./fs_walk').collectFiles(ws, '.union-stack').map(r => [r, fs.statSync(path.join(ws, r)).size]));
  const beforeCensus = treeSnap();
  const census = run(ROOT, ['scripts/adopter-census.js', '--repos', listPath, '--json']);
  try { fs.unlinkSync(listPath); } catch { /* 무시 */ }
  let crow = null;
  try { crow = JSON.parse(census.stdout).rows[0]; } catch { /* null */ }
  const flat = crow ? JSON.stringify(crow) : '';
  bars.push({ name: '센서스가 사본을 재고 행에 경로·제목·파일명 0', ok: census.code === 0 && !!crow && !crow.error && !flat.includes(path.basename(ws)) && !flat.includes('local_vocab') && !flat.includes('.md'),
    detail: crow ? `exit ${census.code} · WO ${crow.wo}` : `exit ${census.code} · 측정 실패` });
  bars.push({ name: '센서스 뒤 사본 변경 0(읽기 전용)', ok: treeSnap() === beforeCensus, detail: '' });
  // [PRO-25] 회고 트리거 — git 없는 사본(mtime 폴백)에서 지표 7 이 나오고 health 에 retro due 절이 있으며 크래시 0.
  const rt = run(ROOT, ['scripts/retro.js', '--root', ws, '--json']);
  let rj = null;
  try { rj = JSON.parse(rt.stdout); } catch { /* null */ }
  const hr = run(ROOT, ['scripts/health.js', '--root', ws, '--json']);
  let rd = null;
  try { rd = JSON.parse(hr.stdout).dims.find(d => d.name === 'retro due'); } catch { /* null */ }
  bars.push({ name: '회고 트리거: 사본(git 없음 → mtime)에서 지표 7 · health retro due 절 · 크래시 0', ok: !crashed(rt) && !!rj && rj.indicators.length === 7 && rj.dateSource === 'mtime' && !!rd && ['INFO', 'WARN'].includes(rd.status),
    detail: rj ? `지표 ${rj.indicators.length} · 출처 ${rj.dateSource} · health ${rd ? rd.status : '없음'}` : `exit ${rt.code} · 측정 실패` });
  return bars;
}

/** 비-JS 제품 검사 선언 형상(순수) — 런너는 무엇이든(여기선 node -e 로 pytest 꼴 출력을 흉내). */
function nonjsShape() {
  const files = {};
  files['.union-stack/adapter.json'] = JSON.stringify({ checks: [
    { name: 'zero', cmd: "node -e \"console.log('collected 0 items')\"", blocking: true, kind: '동작', cost: 'push', covers: '(example) 빈 스테이지 전수 검사' },
    { name: 'ok', cmd: "node -e \"console.log('3 passed in 0.1s')\"", blocking: true, kind: '동작', cost: 'push', covers: '(example) 정상' },
    { name: 'guard', cmd: "node -e \"console.log('collected 0 items')\"", blocking: true, kind: '메타', cost: 'push', covers: '(example) diff 조건부 가드' },
    { name: 'probe', cmd: "node -e \"console.log('collected 0 items')\"", blocking: true, kind: '동작', expected_zero_unless: 'env', cost: 'nightly', covers: '(example) env 조건부' },
  ] }, null, 2) + '\n';
  return { files, truth: { declared: 4, blocking: 4, expect: { zero: 'REJECT', ok: 'PASS', guard: 'NOOP_PASS', probe: 'CLARIFY' } } };
}

function nonjsArm(ws) {
  const { files, truth } = nonjsShape();
  writeShape(ws, files);
  // 사본은 상류 영수증을 물려받는다 — "선언만 있고 영수증 0" 형상을 만들기 위해 비운다(러너 외의 쓰기는 팔의 픽스처 준비뿐).
  fs.mkdirSync(path.dirname(path.join(ws, receipts.FILE)), { recursive: true });
  fs.writeFileSync(path.join(ws, receipts.FILE), receipts.HEADER);
  const bars = [];
  const dimOf = r => { try { return JSON.parse(r.stdout).dims.find(d => d.name === 'receipts'); } catch { return null; } };
  const h0 = run(ROOT, ['scripts/health.js', '--root', ws, '--json']);
  const d0 = dimOf(h0);
  bars.push({ name: `선언 ${truth.declared}(차단 ${truth.blocking}) · 영수증 0 → health 가 공백을 표면화(INFO)`,
    ok: !crashed(h0) && !!d0 && d0.status === 'INFO' && d0.value.includes(`선언 ${truth.declared}`) && /영수증 없음/.test(d0.value), detail: d0 ? d0.value : `exit ${h0.code} · 측정 실패` });
  const ci = run(ws, ['scripts/ci.js', '--only-checks', '--json']);
  let res = null;
  try { res = JSON.parse(ci.stdout).results; } catch { /* null */ }
  const got = res ? Object.fromEntries(res.map(r => [r.name, r.outcome])) : {};
  const judged = !!res && Object.entries(truth.expect).every(([k, v]) => got[k] === v);
  bars.push({ name: '0건 검사 3분할: 차단 전수 → REJECT · 메타 → NOOP_PASS · env 조건부 → CLARIFY · 정상 → PASS · 체인 exit 1',
    ok: ci.code === 1 && !crashed(ci) && judged, detail: res ? Object.entries(got).map(([k, v]) => `${k}=${v}`).join(' · ') : `exit ${ci.code} · 측정 실패` });
  const recs = receipts.parseReceipts(receipts.read(ws) || '');
  bars.push({ name: '영수증: 러너가 선언 행마다 1줄(scope=product · targets) — 수기 경로 0', ok: recs.length === truth.declared && recs.every(r => r.scope === 'product' && 'targets' in r),
    detail: `${recs.length}줄` });
  const h1 = run(ROOT, ['scripts/health.js', '--root', ws, '--json']);
  const d1 = dimOf(h1);
  bars.push({ name: '영수증 뒤 health: 차단 검사별 최신 포인터·나이 · 크래시 0', ok: !crashed(h1) && !!d1 && /zero 0d\(REJECT/.test(d1.value) && /ok 0d\(PASS/.test(d1.value),
    detail: d1 ? d1.value : `exit ${h1.code} · 측정 실패` });
  // [PRO-22] 단계 3·4 — 합성 diff(비-JS 제품: pytest 파일 삭제 · skip · noqa)로 약화 가드를 사본에서 돌린다.
  const diffPath = path.join(ws, 'weak.diff');
  fs.writeFileSync(diffPath, [
    'diff --git a/tests/test_api.py b/tests/test_api.py', 'deleted file mode 100644', 'index 1..0', '--- a/tests/test_api.py', '+++ /dev/null', '@@ -1,2 +0,0 @@',
    '-def test_a():', '-    assert api() == 1',
    'diff --git a/tests/test_b.py b/tests/test_b.py', 'index 1..2', '--- a/x', '+++ b/x', '@@ -1,2 +1,3 @@',
    '-def test_b():', '+@pytest.mark.skip', '+def test_b():  # KF-ARM-1',
    'diff --git a/app/svc.py b/app/svc.py', 'index 1..2', '--- a/x', '+++ b/x', '@@ -1 +1 @@', '-x = 1', '+x = 1  # noqa KF-ARM-1', '',
  ].join('\n'));
  const wg = run(ws, ['scripts/weakening-guard.js', '--diff', diffPath, '--json']);
  let wj = null;
  try { wj = JSON.parse(wg.stdout); } catch { /* null */ }
  bars.push({ name: '약화 가드: 테스트 삭제·skip 질문 + 예외 +2 는 known_failures 없이 REJECT', ok: wg.code === 1 && !crashed(wg) && !!wj && wj.outcome === 'REJECT' && wj.analysis.signals.some(s => s.kind === 'test-deleted') && wj.analysis.exceptions.net === 2,
    detail: wj ? `${wj.outcome} · 신호 ${wj.analysis.signals.length} · 예외 +${wj.analysis.exceptions.net}` : `exit ${wg.code} · 측정 실패` });
  // known_failures 로 덮으면(소유자·만료) red 가 내려오고 약화 질문만 남는다.
  const adapterPath = path.join(ws, '.union-stack/adapter.json');
  const cfg = JSON.parse(fs.readFileSync(adapterPath, 'utf8'));
  cfg.checks[0].known_failures = [{ id: 'KF-ARM-1', reason: 'example — 팔 픽스처', owner: 'arm', until: '2099-12-31' }];
  fs.writeFileSync(adapterPath, JSON.stringify(cfg, null, 2) + '\n');
  const wg2 = run(ws, ['scripts/weakening-guard.js', '--diff', diffPath, '--json']);
  let wj2 = null;
  try { wj2 = JSON.parse(wg2.stdout); } catch { /* null */ }
  bars.push({ name: 'known_failures(소유자·만료)가 덮으면 REJECT → CLARIFY(질문만)', ok: wg2.code === 3 && !!wj2 && wj2.outcome === 'CLARIFY' && wj2.knownFailures.covering === 2,
    detail: wj2 ? `${wj2.outcome} · 덮인 예외 ${wj2.knownFailures.covering}` : `exit ${wg2.code} · 측정 실패` });
  return bars;
}

/** 손 이식 어답터 형상(순수 계획): 지울 것·패치할 것. */
function kitShape() {
  const { KIT_FILES, ANCHOR } = require('./union-stack-kit');
  return { remove: [...KIT_FILES, ANCHOR], patch: { 'scripts/health.js': '\n// (example) 어답터 로컬 패치 — 키트가 건드리면 안 된다\n' }, truth: { kitFiles: KIT_FILES.length, patched: 'scripts/health.js' } };
}

function kitArm(ws) {
  const { remove, patch, truth } = kitShape();
  for (const rel of remove) { try { fs.unlinkSync(path.join(ws, rel)); } catch { /* 없음 */ } }
  for (const [rel, add] of Object.entries(patch)) fs.appendFileSync(path.join(ws, rel), add);
  const kit = path.join(ROOT, 'scripts/union-stack-kit.js');
  const bars = [];
  const snap = () => fs.readdirSync(path.join(ws, 'scripts')).sort().join(',') + '|' + fs.existsSync(path.join(ws, '.union-stack/template-sync.json'));
  const before = snap();
  const dry = run(ws, [kit, '--from-dir', ROOT, '--json']);
  let dj = null;
  try { dj = JSON.parse(dry.stdout); } catch { /* null */ }
  bars.push({ name: `키트 dry-run: 쓰기 0 · 가져올 키트 파일 ${truth.kitFiles} · 패치 파일은 unknown`, ok: dry.code === 0 && !crashed(dry) && snap() === before && !!dj && dj.plan.fetch.length === truth.kitFiles && dj.plan.unknown.includes(truth.patched),
    detail: dj ? `fetch ${dj.plan.fetch.length} · unknown ${dj.plan.unknown.length}` : `exit ${dry.code} · 측정 실패` });
  const ap = run(ws, [kit, '--apply', '--from-dir', ROOT, '--json']);
  let aj = null;
  try { aj = JSON.parse(ap.stdout); } catch { /* null */ }
  const anchorPath = path.join(ws, '.union-stack/template-sync.json');
  let anchor = null;
  try { anchor = JSON.parse(fs.readFileSync(anchorPath, 'utf8')); } catch { /* null */ }
  bars.push({ name: '키트 --apply: 8 파일 복원 · 앵커 clone@…(추정) · 동일 파일만(패치 파일 제외)', ok: ap.code === 0 && !crashed(ap) && !!aj && aj.applied && !!anchor && /^clone@.*\(추정\)$/.test(anchor.ref) && !(truth.patched in anchor.blobs) && 'scripts/template-update.js' in anchor.blobs,
    detail: anchor ? `${anchor.ref} · 정합 ${Object.keys(anchor.blobs).length}` : `exit ${ap.code} · 측정 실패` });
  bars.push({ name: '키트는 있는 파일을 건드리지 않는다(패치 보존)', ok: fs.readFileSync(path.join(ws, truth.patched), 'utf8').includes('어답터 로컬 패치'), detail: '' });
  return bars;
}

const SHAPES = ['env', 'data', 'legacy', 'serial', 'vocab', 'nonjs', 'kit'];
const ARMS = { env: envArm, data: dataArm, legacy: legacyArm, serial: serialArm, vocab: vocabArm, nonjs: nonjsArm, kit: kitArm };

function main(argv = process.argv.slice(2)) {
  const si = argv.indexOf('--shape');
  const shape = si >= 0 && argv[si + 1] ? argv[si + 1] : 'all';
  const ki = argv.indexOf('--keep');
  const keep = ki >= 0 && argv[ki + 1] ? path.resolve(argv[ki + 1]) : null;
  const json = argv.includes('--json');

  const shapes = shape === 'all' ? SHAPES : [shape];
  const results = [];
  for (const s of shapes) {
    const ws = keep ? path.join(keep, s) : fs.mkdtempSync(path.join(os.tmpdir(), `arm-${s}-`));
    fs.mkdirSync(ws, { recursive: true });
    const files = copyTree(ROOT, ws);
    const bars = ARMS[s] ? ARMS[s](ws) : [{ name: `알 수 없는 형상 '${s}'`, ok: false, detail: `${SHAPES.join('|')}|all` }];
    results.push({ shape: s, workspace: keep ? ws : null, files, bars });
    if (!keep) fs.rmSync(ws, { recursive: true, force: true });
  }

  if (json) { console.log(JSON.stringify(results, null, 2)); return results.some(r => r.bars.some(b => !b.ok)) ? 1 : 0; }
  console.log(`# 어답터 팔([PRO-17]) — 형상 ${shapes.join('·')}\n`);
  let failed = 0;
  for (const r of results) {
    console.log(`## ${r.shape} 형상 (사본 ${r.files} 파일)${r.workspace ? ` → ${r.workspace}` : ''}`);
    for (const b of r.bars) {
      if (!b.ok) failed++;
      console.log(`  ${b.ok ? '✓' : '✗'} ${b.name}${b.detail ? `  — ${b.detail}` : ''}`);
    }
    console.log('');
  }
  console.log(failed
    ? `성공 바 ${failed}건 미충족 — 상류 형상에서만 참인 사실이 남아 있다([LSN-17]).`
    : '성공 바 전부 충족 — 모든 형상에서 같은 게이트가 성립한다.');
  return failed ? 1 : 0;
}

module.exports = { dataShape, legacyShape, serialShape, vocabShape, nonjsShape, kitShape, SHAPES, rawMarkers, noJsReachable, crashed, ZONES, ROWS_PER_ZONE, HISTORY_ENTRIES };

if (require.main === module) process.exit(main());
