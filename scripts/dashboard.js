#!/usr/bin/env node
// scripts/dashboard.js
// 평면 대시보드 — 관측 표면 전부를 자기완결 HTML 1장으로 합성한다. [TOOL-25]
//
// 합성이지 계산이 아니다: 4개 도구의 기존 export 를 소비만 한다(로직 1벌, 표면 N개).
//   health.gather()        → 게이트 + 관측 절(effect surface·tier 등)   [TOOL-04]
//   context-budget.gather()→ 부트스트랩 토큰 예산                        (scripts/context-budget.js)
//   work-close.gather()    → WO 작업대(활성 판정은 export 된 ACTIVE)     [TOOL-23]
//   lineage-tree.planeBody → 계보 트리 + 상태 필터(CSS/JS 공유)          [TOOL-24]
// 어답터 평면 무가정은 각 소스 도구가 이미 보장한다 — 여기서는 그 출력을 그리기만 한다.
// 섹션 함수는 전부 순수(데이터 → HTML 조각). FS 는 gather 호출부와 --out 쓰기뿐.
// zero-dep 자기완결(인라인 CSS/JS, CDN 0) · 산출물은 gitignore(dashboard.html).
//
// 실행: node scripts/dashboard.js [--json] [--out <path>]
const fs = require('fs');
const path = require('path');
const { buildIndex } = require('./zfs_index');
const { gather: gatherHealth } = require('./health');
const { gather: gatherBudget } = require('./context-budget');
const { gather: gatherWos, ACTIVE } = require('./work-close');
const { LOCKED } = require('./query');
const { planeBody, PLANE_CSS, FILTER_JS } = require('./lineage-tree');

/** frontmatter 유래 자유 문자열 이스케이프(lineage-tree 와 동일 규칙). */
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

// health 판정 마크 — 색은 dataviz 예약 status 팔레트(계열색과 절대 공유 금지), 항상 글리프+단어 동반.
const MARKS = {
  OK: { glyph: '✓', color: '#067647' },
  FAIL: { glyph: '✗', color: '#b42318' },
  WARN: { glyph: '!', color: '#b54708' },
  INFO: { glyph: '·', color: '#6b7280' },
};

/** 4표면 → 스탯 타일 행(순수). 집계는 표현층 계수뿐 — planeBody 의 meta 라인과 같은 급. */
function tilesSection({ index, health, budget, wos }) {
  const active = wos.filter(w => !w.malformed && ACTIVE.has(w.status));
  const locked = index.filter(d => LOCKED.has(d.status)).length;
  const domains = new Set(index.map(d => d.domain)).size;
  const tile = (label, value, sub, cls = '') =>
    `<div class="tile"><div class="tl">${label}</div><div class="tv ${cls}">${value}</div><div class="ts">${sub}</div></div>`;
  return `<div class="tiles">
${tile('문서', index.length, `${domains} domains`)}
${tile('게이트', health.fails === 0 ? '통과' : `${health.fails} 실패`, health.warns ? `WARN ${health.warns}` : 'WARN 0', health.fails === 0 ? 'good' : 'bad')}
${tile('활성 WO', active.length, locked ? `\u{1F512} ${locked} Verifying` : '잠금 0', locked ? 'warn' : '')}
${tile('부트스트랩', budget.total, `/ ${budget.totalCap} tok${budget.over ? ` · 초과 ${budget.over}` : ''}`, budget.over ? 'bad' : '')}
</div>`;
}

/** health.gather() 결과 → 게이트/관측 표(순수). */
function healthSection(h) {
  const tr = d => {
    const m = MARKS[d.status] || MARKS.INFO;
    return `<tr><td class="mk" style="color:${m.color}">${m.glyph} ${esc(d.status)}</td>`
      + `<td class="nm">${esc(d.name)}</td><td>${esc(d.value)}${d.note ? `<span class="note"> — ${esc(d.note)}</span>` : ''}</td></tr>`;
  };
  const dist = Object.entries(h.byDomain).map(([k, v]) => `${k}:${v}`).join(' ');
  const verdict = h.healthy
    ? `<span class="ok">게이트 전부 통과</span>`
    : `<span class="bad">게이트 ${h.fails}건 실패</span>`;
  return `<section class="card" id="health"><h2>Health — 게이트 + 관측</h2>
  <div class="meta">${verdict}${h.warns ? ` · WARN ${h.warns}` : ''} · 도메인 분포: ${esc(dist)}</div>
  <table class="tbl">${h.dims.map(tr).join('\n')}</table></section>`;
}

/** context-budget.gather() 결과 → 예산 바(순수). */
function budgetSection(b) {
  const bar = r => {
    const pct = Math.min(100, Math.round((r.tokens / r.budget) * 100));
    const over = r.status === 'OVER';
    return `<div class="brow"><span class="bnm">${esc(r.name)}</span>`
      + `<span class="bbar"><span class="bfill${over ? ' bover' : ''}" style="width:${pct}%"></span></span>`
      + `<span class="bval${over ? ' bad' : ''}">${r.tokens}/${r.budget}${over ? ' OVER' : ''}</span></div>`;
  };
  return `<section class="card" id="budget"><h2>Bootstrap 예산 — 상시 주입 토큰</h2>
  <div class="meta">총합 ${b.total}/${b.totalCap} tok${b.over ? ` · <span class="bad">초과 ${b.over}건</span>` : ''}</div>
  ${b.rows.map(bar).join('\n')}</section>`;
}

/** work-close.gather() 결과 → 활성 작업대(순수). 활성 판정은 export 된 ACTIVE 소비. */
function worktableSection(wos) {
  const act = wos.filter(w => !w.malformed && ACTIVE.has(w.status));
  const bad = wos.filter(w => w.malformed);
  if (!act.length && !bad.length) {
    return `<section class="card" id="wo"><h2>작업대 — 활성 WO</h2><div class="meta">활성 WO 없음</div></section>`;
  }
  const tr = w => `<tr><td class="nm">[WO-${w.id}]</td><td>${esc(w.title || '')}</td>`
    + `<td>${esc(w.parent || '')}</td><td>${esc(w.status || '')}</td><td class="note">${esc(w.evidence || '')}</td></tr>`;
  const warn = bad.length
    ? `<div class="meta bad">frontmatter 없는 WO ${bad.length}건: ${bad.map(w => esc(w.file)).join(' ')}</div>` : '';
  return `<section class="card" id="wo"><h2>작업대 — 활성 WO</h2>${warn}
  <table class="tbl"><tr class="th"><td>WO</td><td>제목</td><td>부모</td><td>상태</td><td>증거</td></tr>
  ${act.map(tr).join('\n')}</table></section>`;
}

// SaaS 카드 레이아웃 — 회색 캔버스 위 흰 카드, 스탯 타일 행, 2열 그리드(좁으면 1열).
// 크롬(네비·타일·카드 제목)은 산세리프, 데이터(ID·값·평면)는 PLANE_CSS 의 모노스페이스 유지.
const DASH_CSS = `
  body { background:#f6f7f9; font:13px/1.5 -apple-system, "Segoe UI", Roboto, "Noto Sans KR", sans-serif; }
  main { max-width:1200px; margin:0 auto; padding:20px 24px 48px; }
  nav { position:sticky; top:0; background:rgba(255,255,255,.92); backdrop-filter:blur(4px);
        border-bottom:1px solid var(--line); padding:12px 24px; display:flex; gap:18px;
        align-items:baseline; z-index:2; }
  nav b { font-size:14px; margin-right:auto; }
  nav a { color:var(--muted); text-decoration:none; font-size:12.5px; }
  nav a:hover { color:var(--ink); }
  .tiles { display:grid; grid-template-columns:repeat(auto-fit, minmax(180px, 1fr)); gap:14px;
           margin-bottom:14px; }
  .tile { background:#fff; border:1px solid var(--line); border-radius:10px;
          box-shadow:0 1px 2px rgba(16,24,40,.05); padding:14px 16px; }
  .tl { font-size:12px; color:var(--muted); }
  .tv { font-size:24px; font-weight:650; margin:2px 0;
        font-family:ui-monospace, Consolas, monospace; font-variant-numeric:tabular-nums; }
  .tv.good { color:#067647; } .tv.bad { color:#b42318; } .tv.warn { color:#b54708; }
  .ts { font-size:11.5px; color:var(--faint); }
  .grid { display:grid; grid-template-columns:1fr 1fr; gap:14px; align-items:start; }
  .col { display:grid; gap:14px; }
  @media (max-width: 920px) { .grid { grid-template-columns:1fr; } }
  .card { background:#fff; border:1px solid var(--line); border-radius:10px;
          box-shadow:0 1px 2px rgba(16,24,40,.05); padding:0; margin-top:14px; }
  .grid .card, .col .card { margin-top:0; }
  .card > h2 { font-size:13px; font-weight:600; color:var(--ink); letter-spacing:0;
               text-transform:none; margin:0; padding:12px 18px; border-bottom:1px solid var(--line); }
  .card > .meta, .card > .tbl, .card > .brow { margin-left:18px; margin-right:18px; }
  .card > .meta { margin-top:10px; }
  .card > :last-child { margin-bottom:14px; }
  .tbl { border-collapse:collapse; font-size:12.5px; margin-top:8px; }
  .tbl td { padding:4px 16px 4px 0; vertical-align:baseline; border-top:1px solid #f1f2f4; }
  .tbl tr:first-child td { border-top:0; }
  .tbl .th td { color:var(--faint); font-size:11px; }
  .mk { white-space:nowrap; font-weight:600; font-size:11.5px; }
  .nm { font-weight:600; white-space:nowrap; font-family:ui-monospace, Consolas, monospace; }
  .note { color:var(--faint); }
  .ok { color:#067647; font-weight:600; }
  .bad { color:#b42318; font-weight:600; }
  .brow { display:flex; align-items:center; gap:10px; padding:3px 0; font-size:12.5px; }
  .bnm { min-width:70px; }
  .bbar { flex:1; max-width:260px; height:8px; background:var(--line); border-radius:4px; overflow:hidden; }
  .bfill { display:block; height:100%; background:#2a78d6; }
  .bover { background:#b42318; }
  .bval { color:var(--muted); font-family:ui-monospace, Consolas, monospace; }
  .card .plane { font:12.5px/1.45 ui-monospace, Consolas, monospace; }
  .card .plane section { padding:10px 18px; }
  .card .plane > .meta, .card .plane > .legend, .card .plane > .flt { margin:8px 18px 0; }
`;

/** 수집된 4표면 → 자기완결 HTML(순수 — FS 접근 없음). */
function render(data, { title = 'plane' } = {}) {
  const { index, health, budget, wos } = data;
  return `<!doctype html>
<meta charset="utf-8">
<title>dashboard — ${esc(title)}</title>
<style>${PLANE_CSS}${DASH_CSS}</style>
<nav><b>${esc(title)} — 평면 대시보드</b>
  <a href="#health">Health</a><a href="#budget">예산</a><a href="#wo">작업대</a><a href="#plane">계보</a></nav>
<main>
${tilesSection(data)}
<div class="grid">
${healthSection(health)}
<div class="col">
${budgetSection(budget)}
${worktableSection(wos)}
</div>
</div>
<section class="card" id="plane"><h2>계보 — 평면 전체</h2>
<div class="plane">${planeBody(index)}</div>
</section>
</main>
<script>${FILTER_JS}</script>
`;
}

/** 4표면 수집(read-only). */
function gatherAll(root = path.resolve(__dirname, '..')) {
  return { index: buildIndex(root), health: gatherHealth(root), budget: gatherBudget(root), wos: gatherWos(root) };
}

module.exports = { tilesSection, healthSection, budgetSection, worktableSection, render, gatherAll, MARKS };

if (require.main === module) {
  const args = process.argv.slice(2);
  const root = path.resolve(__dirname, '..');
  const data = gatherAll(root);
  if (args.includes('--json')) {
    console.log(JSON.stringify({ health: data.health, budget: data.budget, wos: data.wos }, null, 2));
    process.exit(data.health.fails ? 1 : 0);
  }
  const oi = args.indexOf('--out');
  const out = oi >= 0 && args[oi + 1] ? args[oi + 1] : path.join(root, 'dashboard.html');
  fs.writeFileSync(out, render(data, { title: path.basename(root) }));
  console.error(`대시보드: docs ${data.index.length} · 게이트 FAIL ${data.health.fails} · 활성 WO ${data.wos.filter(w => ACTIVE.has(w.status)).length} → ${out}`);
}
