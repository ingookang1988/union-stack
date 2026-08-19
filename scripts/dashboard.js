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
const { gather: gatherWos, checkClosure, frontmatter, field, ACTIVE } = require('./work-close');
const { analyze: analyzeHandoff, HANDOFF_PATH } = require('./handoff-linter');
const { parseLedger, gather: gatherBlocks } = require('./blocks-index');
const { parseEntries: parseHistory } = require('./history-linter');
const { walkFiles } = require('./fs_walk');
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

/** health.gather().sizes → 크기 헤드룸 바(순수, 상위 N건).
 *  불리언 게이트(`0 > 30KB`)는 상한을 *넘는 순간*에만 말한다. append-only 원장처럼 줄어들 수
 *  없는 파일은 임박을 미리 봐야 분할·로테이션을 제때 결정할 수 있다. */
function sizeSection(sizes = [], capKb = 30, top = 6) {
  if (!sizes.length) return '';
  const rowsHtml = sizes.slice(0, top).map(s => {
    const pct = Math.min(100, Math.round((s.kb / capKb) * 100));
    const cls = s.kb > capKb ? ' bover' : pct >= 80 ? ' bnear' : '';
    return `<div class="brow"><span class="bnm sz" title="${esc(s.file)}">${esc(s.file.split('/').pop())}</span>`
      + `<span class="bbar"><span class="bfill${cls}" style="width:${pct}%"></span></span>`
      + `<span class="bval${s.kb > capKb ? ' bad' : ''}">${s.kb}KB</span></div>`;
  }).join('\n');
  const near = sizes.filter(s => s.kb <= capKb && s.kb / capKb >= 0.8).length;
  const over = sizes.filter(s => s.kb > capKb).length;
  return `<section class="card" id="size"><h2>파일 크기 헤드룸 — 상한 ${capKb}KB</h2>
  <div class="meta">${sizes.length} files · ${over ? `<span class="bad">초과 ${over}</span> · ` : ''}상한 80% 근접 ${near}건</div>
  ${rowsHtml}</section>`;
}

/** health.gather().sync → 평면 신선도(순수). 무기입은 "지연"이 아니라 *죽은 평면*이라 따로 표시. */
function syncSection(sync, today) {
  if (!sync) return '';
  const days = d => {
    const ms = Date.parse(today + 'T00:00:00Z') - Date.parse(d + 'T00:00:00Z');
    return Number.isFinite(ms) ? Math.round(ms / 86400000) : null;
  };
  const pill = p => {
    if (!p.last) return `<span class="pill dead">${esc(p.name)}<b>무기입</b></span>`;
    const n = days(p.last);
    const cls = n === null ? '' : n >= 30 ? ' stale' : n >= 7 ? ' aging' : ' fresh';
    return `<span class="pill${cls}" title="${esc(p.last)}">${esc(p.name)}<b>${n === null ? esc(p.last) : n === 0 ? '오늘' : n + '일'}</b></span>`;
  };
  const dead = sync.planes.filter(p => !p.last).length;
  return `<section class="card" id="sync"><h2>평면 신선도 — 마지막 기입<a class="more" data-nav="time" href="#/time">자세히 →</a></h2>
  <div class="meta">ledger ${sync.ledgerEntries} entries · last ${esc(sync.ledgerLast || '무기입')}`
    + `${dead ? ` · <span class="bad">무기입 ${dead}면</span>` : ''}</div>
  <div class="pills">${sync.planes.map(pill).join('')}</div></section>`;
}

/**
 * health.gather().contracts → 계약 간선 절(순수). [PRO-16]
 *
 * **그래프를 그리지 않는다.** 현재 실간선이 1건이라 화살표 하나를 그리는 꼴이고, 그건 표본 없는
 * 시각화를 기각한 기준(PLAN 히트맵·WO 종료추적)과 어긋난다. 대신 [PRO-16] §5의 반증 조건
 * ("consumers 가 실계약에 안 달리면 필드 폐기")을 **볼 계기**와, 오타 소비자가 잠금 보호를 조용히
 * 무력화하는 것을 잡는 **무결성 표면**을 낸다. 그래프는 간선이 쌓인 뒤의 일이다.
 */
function contractSection(c) {
  if (!c || !c.contracts) return '';
  const rows = c.byContract.map(x => {
    const chips = x.consumers.map(r => {
      const bad = c.unresolved.some(u => u.from === x.id && u.ref === r);
      const dup = x.redundant.includes(r);
      const cls = bad ? ' dead' : dup ? ' aging' : ' fresh';
      const tag = bad ? '미해소' : dup ? '동일계보' : '해소';
      return `<span class="pill${cls}">${esc(r)}<b>${tag}</b></span>`;
    }).join('');
    return `<div class="crow"><span class="nm" title="${esc(x.file)}">${esc(x.id)}</span>`
      + `<span class="carrow">→</span><span class="pills inline">${chips}</span></div>`;
  }).join('\n');
  const undeclared = c.contracts - c.declaring;
  return `<section class="card" id="contract"><h2>계약 간선 — 계보 밖 소비자</h2>
  <div class="meta">계약 ${c.contracts} · 선언 ${c.declaring} · 간선 ${c.edges}`
    + `${c.unresolved.length ? ` · <span class="bad">미해소 ${c.unresolved.length}</span>` : ''}`
    + `${undeclared > 0 ? ` · 미선언 ${undeclared}` : ''}</div>
  ${rows || '<div class="meta">선언된 간선 없음 — [PRO-16] §5 반증 조건 관측 대상</div>'}</section>`;
}

/**
 * 스프린트 축(actual × action) 수집 — WO 닫힘 조건 + HANDOFF 인계 상태.
 * 전부 기존 export 소비: checkClosure([TOOL-23])는 traceTexts 를 호출부가 읽어 넘기는 계약이라
 * 여기(FS 층)서 closed_by 가 가리킨 파일을 읽는다. HANDOFF 는 handoff-linter.analyze 로 판정한다.
 */
function gatherSprint(root, wos) {
  const enriched = wos.map(wo => {
    const traceTexts = {};
    for (const rel of wo.closed_by || []) {
      try { traceTexts[rel] = fs.readFileSync(path.join(root, rel), 'utf8'); } catch { /* 부재는 checkClosure 가 잡는다 */ }
    }
    const siblings = wos.filter(w => w.parent && w.parent === wo.parent);
    return { ...wo, closure: checkClosure(wo, traceTexts, siblings) };
  });
  let handoff = null;
  try {
    const txt = fs.readFileSync(path.join(root, HANDOFF_PATH), 'utf8');
    const fm = frontmatter(txt);
    handoff = {
      session: field(fm, 'session_id'), date: field(fm, 'date'),
      verification: field(fm, 'verification'), ...analyzeHandoff(txt),
    };
  } catch { /* HANDOFF 부재도 상태다 — 카드가 "없음"으로 그린다 */ }
  let archived = 0;
  walkFiles(root, '.union-stack/sprint/archived', rel => { if (/WO-.*_.*[.]md$/.test(rel)) archived++; });
  return { wos: enriched, handoff, archived };
}

/**
 * 스프린트 축 **전용 페이지**(순수). 이 축의 짝은 **종료 의례**다 — 진입에는 3중 장치
 * (upward-fetch·check-prereqs·blast-radius)가 있고 종료는 [PRO-15]의 work-close 하나다.
 * WO 는 선언으로 닫히지 않는다: 상위 축 흔적(closed_by)과 증거(evidence)가 디프에서 검사
 * 가능해야 한다. 그래서 이 페이지는 WO 마다 그 닫힘 조건의 현재 상태를 편다.
 * HANDOFF 는 세션 사이의 이어달리기(휘발·최신 하나)라 이 축의 시간 방향 절반이다.
 */
function sprintView(sprint, today) {
  if (!sprint) return '';
  const { wos, handoff, archived } = sprint;
  const active = wos.filter(w => !w.malformed && ACTIVE.has(w.status));
  const closable = active.filter(w => w.closure && !w.closure.issues.length);
  const locked = wos.filter(w => w.status === 'Verifying').length;
  const evPill = w => {
    if (!w.evidence) return '<span class="pill dead">증거<b>미기입</b></span>';
    if (/^none/.test(w.evidence.trim())) return `<span class="pill aging" title="${esc(w.evidence)}">증거<b>none — 사유 명시</b></span>`;
    return `<span class="pill fresh" title="${esc(w.evidence)}">증거<b>있음</b></span>`;
  };
  const woCard = w => {
    if (w.malformed) {
      return `<section class="card"><h2>${esc(w.file.split('/').pop())}</h2>
  <div class="meta bad">frontmatter 없음 — status·evidence·closed_by 를 읽을 수 없다</div></section>`;
    }
    const issues = (w.closure && w.closure.issues) || [];
    const infos = (w.closure && w.closure.info) || [];
    const traces = (w.closed_by || []).length
      ? w.closed_by.map(t => `<code>${esc(t.split('/').pop())}</code>`).join('')
      : '<span class="note">없음</span>';
    return `<section class="card norm">
    <h2>[WO-${esc(w.id)}] <span class="ntitle">${esc(w.title || '')}</span></h2>
    <div class="meta"><span class="pill ${w.status === 'Verifying' ? 'aging' : 'fresh'}">status<b>${esc(w.status || '없음')}</b></span>
      <span class="pill">부모<b>${esc(w.parent || '미기입')}</b></span>${evPill(w)}</div>
    <div class="frow"><span class="flabel">상위 흔적</span><span class="fvals">${traces}</span></div>
    ${issues.length
      ? `<div class="frow"><span class="flabel scope">닫힘 미충족</span><span class="fvals t">${issues.map(i => esc(i.msg)).join('<br>')}</span></div>`
      : `<div class="frow"><span class="flabel">닫힘 조건</span><span class="fvals t"><span class="ok">충족</span> — 지금 닫아도 종료 의례를 통과한다</span></div>`}
    ${infos.length ? `<div class="frow"><span class="flabel">참고</span><span class="fvals t">${infos.map(esc).join('<br>')}</span></div>` : ''}
  </section>`;
  };
  const hoCard = handoff
    ? `<section class="card"><h2>HANDOFF — 세션 이어달리기</h2>
  <div class="meta"><span class="pill ${handoff.findings.length ? 'dead' : 'fresh'}">5부<b>${handoff.findings.length ? '누락 ' + handoff.findings.length : '완비'}</b></span>
    <span class="pill">세션<b>${esc(handoff.session || '?')}</b></span>
    <span class="pill" title="${esc(handoff.date || '')}">일자<b>${esc((handoff.date || '').slice(0, 10) || '?')}</b></span></div>
  <div class="brow"><span class="bnm">tokens</span>
    <span class="bbar"><span class="bfill${handoff.tokens > handoff.budget ? ' bover' : handoff.tokens / handoff.budget >= 0.8 ? ' bnear' : ''}" style="width:${Math.min(100, Math.round((handoff.tokens / handoff.budget) * 100))}%"></span></span>
    <span class="bval${handoff.tokens > handoff.budget ? ' bad' : ''}">${handoff.tokens}/${handoff.budget}</span></div>
  ${handoff.verification ? `<div class="frow"><span class="flabel">검증란</span><span class="fvals t">${esc(handoff.verification)}</span></div>` : ''}
  </section>`
    : '<section class="card"><h2>HANDOFF</h2><div class="meta bad">없음 — 인계가 끊겨 있다</div></section>';
  return `<div class="tiles">
  <div class="tile"><div class="tl">활성 WO</div><div class="tv">${active.length}</div><div class="ts">Draft · Active · Verifying</div></div>
  <div class="tile"><div class="tl">닫힘 조건 충족</div><div class="tv ${closable.length ? 'good' : ''}">${closable.length}/${active.length}</div><div class="ts">종료 의례 통과 가능</div></div>
  <div class="tile"><div class="tl">잠금</div><div class="tv ${locked ? 'warn' : ''}">${locked}</div><div class="ts">Verifying 🔒</div></div>
  <div class="tile"><div class="tl">아카이브</div><div class="tv">${archived}</div><div class="ts">Closed 보존(삭제 금지)</div></div>
  </div>
  <section class="card"><h2>왜 이 페이지가 있는가</h2>
  <div class="meta">이 축의 짝은 <b>종료 의례</b>다 — 진입에는 3중 장치(upward-fetch·check-prereqs·blast-radius)가
  있는데 종료는 [PRO-15]의 work-close 하나다. WO 는 선언으로 닫히지 않는다: <b>상위 축 흔적(closed_by)</b>과
  <b>증거(evidence)</b>가 디프에서 검사 가능해야 한다. 아래는 WO 마다 그 닫힘 조건의 현재 상태이고,
  HANDOFF 는 이 축의 시간 방향 절반(세션 사이 이어달리기)이다.</div></section>
  ${active.map(woCard).join('')}
  ${wos.filter(w => w.malformed).map(woCard).join('')}
  ${hoCard}`;
}

/**
 * 시간축 수집 — 원장(전술 결정) + HISTORY(전략 분기점) + LSN(오답노트) + 재제안 차단.
 * 파서는 각 소유 도구의 export 소비: parseLedger([TOOL-22] 관할)·parseHistory(history-linter)·
 * gatherBlocks([TOOL-22])·LSN frontmatter 는 work-close 의 순수 헬퍼(frontmatter/field)로 읽는다.
 */
function gatherTime(root) {
  const readIf = rel => { try { return fs.readFileSync(path.join(root, rel), 'utf8'); } catch { return ''; } };
  const adrs = parseLedger(readIf('.union-stack/archive_ledger.md'));
  const history = parseHistory(readIf('.union-stack/project/HISTORY.md'));
  const lessons = [];
  walkFiles(root, '.union-stack/reference/lessons', rel => {
    if (!rel.endsWith('.md') || rel.endsWith('_GUIDE.md')) return;
    const fm = frontmatter(readIf(rel));
    if (fm == null) { lessons.push({ file: rel, malformed: true }); return; }
    lessons.push({
      file: rel, id: field(fm, 'id'), title: field(fm, 'title'), status: field(fm, 'status'),
      occurrences: field(fm, 'occurrences'), valid_reason: field(fm, 'valid_reason'),
    });
  });
  return { adrs, history, lessons, blocks: gatherBlocks(root) };
}

/**
 * 시간축 **전용 페이지**(순수). 격자 §3.2가 식별한 **두 번째 빈칸**이 이 축이다 —
 * "같은 실수의 반복"은 여러 스프린트에 걸쳐서만 보이고 어느 단일 스냅샷에도 나타나지 않는다.
 * E1 실측이 근거를 보탠다: 하네스 페이오프가 가장 큰 구간이 정확히 비국소 지식(과거 실패·폐기
 * 결정)이었고, 그래서 [ADR-04]가 시간축 평면의 제거를 금지했다. 세 층을 편다:
 *   LSN(사전 경고 — 진입 의례가 선주입) · 원장(전술 결정 + 재제안 차단) · HISTORY(전략 분기점).
 */
function timeView(time, today) {
  if (!time) return '';
  const { adrs, history, lessons, blocks } = time;
  const realHistory = history.filter(e => !e.example);
  const blockIds = new Set(blocks.map(b => b.id));
  const byDate = {};
  for (const a of adrs) byDate[a.date] = (byDate[a.date] || 0) + 1;
  const dates = Object.keys(byDate).sort();
  const maxN = Math.max(1, ...Object.values(byDate));
  const densityRows = dates.map(d =>
    `<div class="brow"><span class="bnm">${esc(d)}</span>`
    + `<span class="bbar"><span class="bfill" style="width:${Math.round((byDate[d] / maxN) * 100)}%"></span></span>`
    + `<span class="bval">${byDate[d]}</span></div>`).join('');
  const gist = t => {
    const cut = t.split(' — ')[0];
    return cut.length > 72 ? cut.slice(0, 72) + '…' : cut;
  };
  const recent = adrs.slice(-8).reverse().map(a =>
    `<div class="crow"><span class="nm">${esc(a.id)}</span><span class="note">${esc(a.date)}</span>`
    + `${blockIds.has(a.id) ? '<span class="pill dead">⛔<b>재제안 차단</b></span>' : ''}`
    + `<span class="fvals t" title="${esc(a.text.slice(0, 300))}">${esc(gist(a.text))}</span></div>`).join('');
  const blockRows = blocks.map(b =>
    `<div class="frow"><span class="flabel">⛔ ${esc(b.id)}</span><span class="fvals t"><b>${esc(b.blocks)}</b>`
    + `${b.reopen_when ? `<br><span class="note">재개 조건: ${esc(b.reopen_when)}</span>` : ''}</span></div>`).join('');
  const lsnCards = lessons.map(l => l.malformed
    ? `<div class="crow"><span class="nm">${esc(l.file.split('/').pop())}</span><span class="bad">frontmatter 없음</span></div>`
    : `<div class="frow"><span class="flabel">${esc(l.id || '?')}</span><span class="fvals t">${esc(l.title || '')}`
      + `${l.occurrences ? ` <span class="pill aging">반복<b>${esc(l.occurrences)}회</b></span>` : ''}`
      + `${l.valid_reason ? `<br><span class="note">유효 사유: ${esc(l.valid_reason)}</span>` : ''}</span></div>`).join('');
  const histRows = history.map(e =>
    `<div class="frow${e.example ? ' dim' : ''}"><span class="flabel">${esc(e.date)}</span>`
    + `<span class="fvals t"><b>${esc(e.fact)}</b><br><span class="note">왜: ${esc(e.reason)}</span>`
    + `${e.note ? `<br><span class="note">시사점: ${esc(e.note)}</span>` : ''}</span></div>`).join('');
  return `<div class="tiles">
  <div class="tile"><div class="tl">전술 결정</div><div class="tv">${adrs.length}</div><div class="ts">archive_ledger ADR</div></div>
  <div class="tile"><div class="tl">전략 분기점</div><div class="tv">${realHistory.length}</div><div class="ts">HISTORY (예시 ${history.length - realHistory.length} 별도)</div></div>
  <div class="tile"><div class="tl">오답노트</div><div class="tv">${lessons.length}</div><div class="ts">LSN — 진입 의례가 선주입</div></div>
  <div class="tile"><div class="tl">재제안 차단</div><div class="tv ${blocks.length ? 'warn' : ''}">${blocks.length}</div><div class="ts">blocks-index → AGENTS.md</div></div>
  </div>
  <section class="card"><h2>왜 이 페이지가 있는가</h2>
  <div class="meta">시간축은 격자가 식별한 <b>두 번째 빈칸</b>이다 — "같은 실수의 반복"은 여러 스프린트에
  걸쳐서만 보이고 어느 단일 스냅샷에도 나타나지 않는다. E1 실측: 하네스 페이오프가 가장 큰 구간이
  정확히 <b>비국소 지식</b>(과거 실패·폐기 결정)이었고, 그래서 [ADR-04]가 이 평면의 제거를 금지했다.
  세 층이다: <b>LSN</b>(사전 경고 — 진입 의례가 선주입) · <b>원장</b>(전술 결정 + 재제안 차단) ·
  <b>HISTORY</b>(전략 분기점 — 사실+근거 한 쌍).</div></section>
  <div class="grid">
  <section class="card"><h2>결정 밀도 — 날짜별 ADR</h2>
  <div class="meta">${adrs.length} 결정 / ${dates.length} 일</div>
  ${densityRows}</section>
  <section class="card"><h2>재제안 차단 — [PRO-14]</h2>
  <div class="meta">결정된 것을 다시 꺼내지 마라 — 재개 조건이 충족됐다면 그 근거를 먼저 제시하라</div>
  ${blockRows || '<div class="meta">차단 항목 없음</div>'}</section>
  </div>
  <section class="card"><h2>최근 결정 — 원장 끝 8건</h2>
  ${recent}</section>
  <div class="grid">
  <section class="card"><h2>오답노트 — LSN</h2>
  <div class="meta">같은 계보 2~3회 반복 실패만 등재([ADR-11] — 환경 사실은 사적 메모리로)</div>
  ${lsnCards || '<div class="meta">등재 없음</div>'}</section>
  <section class="card"><h2>전략 분기점 — HISTORY</h2>
  <div class="meta">사실+근거 한 쌍 — 금지가 아니라 경고. 근거가 회귀 판단의 핵심이다</div>
  ${histRows || '<div class="meta">등재 없음</div>'}</section>
  </div>`;
}

/** 개요용 당위 요약 카드(순수) — 등급·드리프트·concern 만 압축. 세부는 arch 페이지로 링크한다. */
function normCard(norms, sync, concerns) {
  if (!norms || !norms.total) return '';
  const GRADE = {
    gated: { cls: 'fresh', label: '게이트' },
    cited: { cls: 'aging', label: '인용만' },
    isolated: { cls: 'dead', label: '고립' },
  };
  const rows = norms.norms.map(n => {
    const g = GRADE[n.grade] || GRADE.isolated;
    const who = n.gates.length ? n.gates.map(f => f.split('/').pop()).join(' ') : `코드 ${n.codeCites} · 평면 ${n.planeCites}`;
    return `<div class="crow"><span class="nm" title="${esc(n.file)}">${esc(n.key)}</span>`
      + `<span class="pill ${g.cls}"><b>${g.label}</b></span><span class="note">${esc(who)}</span></div>`;
  }).join('');
  const drift = sync ? sync.planes.filter(p => ['gap', 'state'].includes(p.name)) : [];
  const verified = drift.filter(p => p.last).length;
  const driftLine = drift.map(p =>
    `<span class="pill ${p.last ? 'fresh' : 'dead'}">${esc(p.name)}<b>${esc(p.last || '무기입')}</b></span>`).join('');
  const tags = concerns && concerns.tagged
    ? Object.entries(concerns.byTag).map(([t, n]) => `<span class="pill fresh">${esc(t)}<b>${n}</b></span>`).join('')
    : `<span class="pill dead">concern 태그<b>사용 0</b></span>`;
  return `<section class="card" id="norm"><h2>당위 축 — 규범과 그 집행
    <a class="more" data-nav="arch" href="#/arch">자세히 →</a></h2>
  <div class="meta">규범 ${norms.total} · 게이트 ${norms.gated} · 인용만 ${norms.cited}`
    + `${norms.isolated ? ` · <span class="bad">고립 ${norms.isolated}</span>` : ''}`
    + `${verified === 0 ? ` · <span class="bad">대조된 적 없음</span>` : ''}</div>
  ${rows}
  <div class="pills">${driftLine}${tags}</div></section>`;
}

/**
 * 당위 축(ARCH) **전용 페이지**(순수). 개요의 요약 카드가 아니라 세부 뷰다.
 *
 * 이 축의 짝은 verification 의 첫 화살표(규범↔현실=gap)이므로, 목록이 아니라
 * "규범이 무엇을 말하고, 지켜지는지 누가 보는가"를 낸다. 규범마다 넷을 편다:
 *   제목·티어·크기 · **절 구조**(파일을 열지 않고 내용을 가늠) ·
 *   **집행자의 계약**(특히 `scope` — [PRO-11]의 존재 이유가 "무엇을 *안* 보는지가 호출부에서
 *   읽혀야 한다"이고 규범 페이지가 그 호출부다) · **인용처 목록**(계수를 이동 가능한 정보로).
 *
 * ⚠ **인용 ≠ 집행.** 문자열 언급 기반 추정이라 판정이 아니라 관측이다([ADR-07] 계측 오염 함정).
 */
function normView(norms, sync, concerns) {
  if (!norms || !norms.total) {
    return `<section class="card"><h2>당위 축 — 규범과 그 집행</h2>
  <div class="meta">규범 문서(ARCH·INF) 없음 — 이 축은 아직 비어 있다</div></section>`;
  }
  const GRADE = {
    gated: { cls: 'fresh', label: '게이트 있음', why: '판정 계약을 선언한 실행 자산이 이 규범을 참조한다' },
    cited: { cls: 'aging', label: '인용만', why: '아는 곳은 있으나 아무것도 판정하지 않는다 — 산문 규범' },
    isolated: { cls: 'dead', label: '고립', why: '평면·코드 어디서도 인용하지 않는다 — 죽은 규범' },
  };
  const fileList = (label, files) => files.length
    ? `<div class="frow"><span class="flabel">${label}</span><span class="fvals">`
      + files.map(f => `<code title="${esc(f)}">${esc(f.split('/').pop())}</code>`).join('') + '</span></div>'
    : '';
  const contractBlock = c => `<div class="ctr">
    <div class="ctrh">${esc(c.gate || c.file)}</div>
    ${c.predicate ? `<div class="frow"><span class="flabel">판정</span><span class="fvals t">${esc(c.predicate)}</span></div>` : ''}
    ${c.scope ? `<div class="frow"><span class="flabel scope">사각지대</span><span class="fvals t">${esc(c.scope)}</span></div>` : ''}
    ${c.outcomes && c.outcomes.length ? `<div class="frow"><span class="flabel">결과</span><span class="fvals">${c.outcomes.map(o => `<code>${esc(o)}</code>`).join('')}</span></div>` : ''}
    ${c.failure_mode ? `<div class="frow"><span class="flabel">실패 시</span><span class="fvals t">${esc(c.failure_mode)}</span></div>` : ''}
  </div>`;
  const card = n => {
    const g = GRADE[n.grade] || GRADE.isolated;
    return `<section class="card norm">
    <h2>${esc(n.key)} <span class="ntitle">${esc(n.title || '')}</span></h2>
    <div class="meta"><span class="pill ${g.cls}"><b>${g.label}</b></span>
      <span class="note">${esc(g.why)}</span></div>
    <div class="meta"><span class="note">${esc(n.file)} · ${n.kb}KB · status ${esc(n.status || '없음')} · tier ${esc(n.tier || '미기입')}</span></div>
    ${n.headings.length ? `<div class="frow"><span class="flabel">절 구조</span><span class="fvals">${n.headings.map(h => `<code>${esc(h)}</code>`).join('')}</span></div>` : ''}
    ${n.gateContracts.length ? n.gateContracts.map(contractBlock).join('')
      : `<div class="frow"><span class="flabel">집행</span><span class="fvals t">판정하는 게이트 없음</span></div>`}
    ${fileList('코드 인용', n.cites)}
    ${fileList('평면 인용', n.planeFiles)}
  </section>`;
  };
  // 드리프트 화살표: gap·state 가 무기입이면 규범이 현실과 대조된 적이 **없다**.
  const drift = sync ? sync.planes.filter(p => ['gap', 'state'].includes(p.name)) : [];
  const verified = drift.filter(p => p.last).length;
  const driftPills = drift.map(p =>
    `<span class="pill ${p.last ? 'fresh' : 'dead'}">${esc(p.name)}<b>${esc(p.last || '무기입')}</b></span>`).join('');
  const tags = concerns && concerns.tagged
    ? Object.entries(concerns.byTag).map(([t, n]) => `<span class="pill fresh">${esc(t)}<b>${n}</b></span>`).join('')
    : `<span class="pill dead">concern 태그<b>사용 0</b></span>`;
  return `<div class="tiles">
  <div class="tile"><div class="tl">규범</div><div class="tv">${norms.total}</div><div class="ts">ARCH + INF</div></div>
  <div class="tile"><div class="tl">게이트 있음</div><div class="tv ${norms.gated ? 'good' : 'bad'}">${norms.gated}</div><div class="ts">판정 계약이 참조</div></div>
  <div class="tile"><div class="tl">산문뿐</div><div class="tv ${norms.cited ? 'warn' : ''}">${norms.cited}</div><div class="ts">인용만 · 판정 없음</div></div>
  <div class="tile"><div class="tl">현실과 대조</div><div class="tv ${verified ? 'good' : 'bad'}">${verified}/${drift.length || 0}</div><div class="ts">verification 첫 화살표</div></div>
  </div>
  <section class="card"><h2>왜 이 절이 있는가</h2>
  <div class="meta">이 축의 짝은 <b>verification 의 첫 화살표(규범↔현실 = gap)</b>다. 그래서 나열이 아니라
  "지켜지는지 누가 보는가"를 낸다 — 나열은 계보 뷰가 이미 한다.
  근거는 이 레포 자신의 데이터다: <b>[PHASE-02] E3 가 의례 자발 수행률 0%를 실측</b>해 산문 규칙만으론
  강제되지 않음을 확증했다. <span class="bad">단 인용은 집행이 아니다</span> — 아래 등급은 문자열 언급
  기반 추정이므로 판정이 아니라 관측이다([ADR-07] 계측 오염 함정).</div></section>
  ${norms.norms.map(card).join('\n')}
  <section class="card"><h2>규범 ↔ 현실 검증 <span class="note">verification 첫 화살표</span></h2>
  <div class="meta">${verified === 0
    ? `<span class="bad">규범 ${norms.total}건 중 0건이 현실과 대조된 적 없다</span> — gap·state 가 무기입이다`
    : `대조 기록 있음`}</div>
  <div class="pills">${driftPills}</div></section>
  <section class="card"><h2>횡단 오버레이 <span class="note">[PRO-04] concern:</span></h2>
  <div class="meta">${concerns && concerns.tagged
    ? `${concerns.tagged}/${concerns.total} 문서에 태그됨`
    : `<span class="bad">승인됐으나 사용 0</span> — 관측이 없으면 폐기 판단도 못 한다(consumers: 와 같은 문법)`}</div>
  <div class="pills">${tags}</div></section>`;
}

/** health.gather() effect surface 절의 byTool → 도구별 막대(순수). 한 줄 텍스트를 스캔 가능하게. */
function effectSection(dim) {
  if (!dim || !dim.note) return '';
  const pairs = dim.note.split('←')[0].trim().split(/\s+/)
    .map(t => { const i = t.lastIndexOf(':'); return i > 0 ? { tool: t.slice(0, i), n: +t.slice(i + 1) } : null; })
    .filter(p => p && Number.isFinite(p.n));
  if (!pairs.length) return '';
  const max = Math.max(...pairs.map(p => p.n));
  const bars = pairs.map(p => `<div class="brow"><span class="bnm">${esc(p.tool)}</span>`
    + `<span class="bbar"><span class="bfill" style="width:${Math.round((p.n / max) * 100)}%"></span></span>`
    + `<span class="bval">${p.n}</span></div>`).join('\n');
  return `<section class="card" id="effect"><h2>효과 표면 — 도구별 allow 규칙</h2>
  <div class="meta">${esc(dim.value)}</div>
  ${bars}</section>`;
}

/** work-close.gather() 결과 → 활성 작업대(순수). 활성 판정은 export 된 ACTIVE 소비. */
function worktableSection(wos) {
  const act = wos.filter(w => !w.malformed && ACTIVE.has(w.status));
  const bad = wos.filter(w => w.malformed);
  if (!act.length && !bad.length) {
    return `<section class="card" id="wo"><h2>작업대 — 활성 WO<a class="more" data-nav="sprint" href="#/sprint">자세히 →</a></h2><div class="meta">활성 WO 없음</div></section>`;
  }
  const tr = w => `<tr><td class="nm">[WO-${w.id}]</td><td>${esc(w.title || '')}</td>`
    + `<td>${esc(w.parent || '')}</td><td>${esc(w.status || '')}</td><td class="note">${esc(w.evidence || '')}</td></tr>`;
  const warn = bad.length
    ? `<div class="meta bad">frontmatter 없는 WO ${bad.length}건: ${bad.map(w => esc(w.file)).join(' ')}</div>` : '';
  return `<section class="card" id="wo"><h2>작업대 — 활성 WO<a class="more" data-nav="sprint" href="#/sprint">자세히 →</a></h2>${warn}
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
  nav a { color:var(--muted); text-decoration:none; font-size:12.5px; padding:4px 10px;
          border-radius:6px; }
  nav a:hover { color:var(--ink); background:#f1f2f4; }
  nav a.on { color:#fff; background:#2a78d6; font-weight:600; }
  .view[hidden] { display:none; }
  .more { margin-left:auto; font-size:11.5px; font-weight:400; color:#2a78d6; text-decoration:none; }
  .more:hover { text-decoration:underline; }
  .card > h2 { display:flex; align-items:baseline; gap:10px; }
  .card.norm > h2 { display:flex; align-items:baseline; gap:10px; flex-wrap:wrap;
                    font-family:ui-monospace, Consolas, monospace; }
  .ntitle { font-family:-apple-system,"Segoe UI",Roboto,"Noto Sans KR",sans-serif;
            font-weight:400; color:var(--muted); font-size:12.5px; }
  .frow { display:flex; gap:10px; margin:8px 18px 0; align-items:baseline; font-size:12.5px; }
  .flabel { flex:0 0 74px; color:var(--faint); font-size:11.5px; }
  .flabel.scope { color:#b54708; font-weight:600; }
  .fvals { display:flex; flex-wrap:wrap; gap:5px; min-width:0; }
  .fvals.t { display:block; color:var(--ink); line-height:1.5; }
  .fvals code { background:#f1f2f4; border-radius:4px; padding:1px 6px; font-size:11.5px;
                font-family:ui-monospace, Consolas, monospace; }
  .ctr { margin:10px 18px 0; padding:10px 12px; border:1px solid var(--line);
         border-radius:8px; background:#fafbfc; }
  .ctr .frow { margin:6px 0 0; }
  .ctrh { font-size:12px; font-weight:600; font-family:ui-monospace, Consolas, monospace; }
  .frow.dim { opacity:.55; }
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
  .bnear { background:#b54708; }
  .bval { color:var(--muted); font-family:ui-monospace, Consolas, monospace; }
  .bnm.sz { min-width:0; flex:0 0 210px; overflow:hidden; text-overflow:ellipsis; white-space:nowrap;
            font-family:ui-monospace, Consolas, monospace; font-size:11.5px; }
  .pills { display:flex; flex-wrap:wrap; gap:8px; margin:10px 18px 0; }
  .pills.inline { margin:0; }
  .crow { display:flex; align-items:center; gap:8px; flex-wrap:wrap; margin:8px 18px 0; }
  .carrow { color:var(--faint); }
  .pill { display:inline-flex; align-items:baseline; gap:6px; padding:4px 10px; border-radius:999px;
          border:1px solid var(--line); background:#fafbfc; font-size:11.5px; color:var(--muted); }
  .pill b { font-family:ui-monospace, Consolas, monospace; color:var(--ink); }
  .pill.fresh { border-color:#a6e0c1; background:#f0fbf5; } .pill.fresh b { color:#067647; }
  .pill.aging { border-color:#f0d08a; background:#fffaf0; } .pill.aging b { color:#b54708; }
  .pill.stale, .pill.dead { border-color:#f1bcb7; background:#fef6f5; } .pill.stale b, .pill.dead b { color:#b42318; }
  .card .plane { font:12.5px/1.45 ui-monospace, Consolas, monospace; }
  .card .plane section { padding:10px 18px; }
  .card .plane > .meta, .card .plane > .legend, .card .plane > .flt { margin:8px 18px 0; }
`;

/**
 * 뷰 정의 — 축 하나가 페이지 하나다. 새 축을 추가하려면 여기에 한 줄을 더한다.
 * 라우팅은 해시(`#/arch`)로 한다: 사용자에겐 고유 URL·뒤로가기·북마크가 있는 **별도 페이지**이면서,
 * 산출물은 zero-dep 자기완결 **1개 파일**로 남는다(gitignore 항목·링크 관리가 늘지 않는다).
 * 파일 분리로 바꾸려면 이 배열을 파일별로 렌더하고 href 만 바꾸면 된다 — 뷰 함수는 그대로다.
 */
const VIEWS = [
  { id: 'overview', label: '개요' },
  { id: 'arch', label: '당위(ARCH)' },
  { id: 'sprint', label: '스프린트' },
  { id: 'time', label: '시간축' },
];

/** 수집된 표면 → 자기완결 HTML(순수 — FS 접근 없음). */
function render(data, { title = 'plane' } = {}) {
  const { index, health, budget, wos, today } = data;
  const effectDim = (health.dims || []).find(d => d.name === 'effect surface');
  const body = {
    overview: `${tilesSection(data)}
<div class="grid">
${healthSection(health)}
<div class="col">
${budgetSection(budget)}
${worktableSection(wos)}
${syncSection(health.sync, today)}
</div>
</div>
<div class="grid">
<div class="col">
${normCard(health.norms, health.sync, health.concerns)}
${sizeSection(health.sizes, health.sizeCapKb)}
</div>
<div class="col">
${contractSection(health.contracts)}
${effectSection(effectDim)}
</div>
</div>
<section class="card" id="plane"><h2>계보 — 평면 전체</h2>
<div class="plane">${planeBody(index)}</div>
</section>`,
    arch: normView(health.norms, health.sync, health.concerns),
    sprint: sprintView(data.sprint, today),
    time: timeView(data.time, today),
  };
  return `<!doctype html>
<meta charset="utf-8">
<title>dashboard — ${esc(title)}</title>
<style>${PLANE_CSS}${DASH_CSS}</style>
<nav><b>${esc(title)}</b>
  ${VIEWS.map(v => `<a href="#/${v.id}" data-nav="${v.id}">${esc(v.label)}</a>`).join('')}</nav>
<main>
${VIEWS.map(v => `<div class="view" data-view="${v.id}" hidden>\n${body[v.id] || ''}\n</div>`).join('\n')}
</main>
<script>${ROUTER_JS}${FILTER_JS}</script>
`;
}

// 뷰 라우터 — 축 하나 = 페이지 하나.
// **클릭이 정본이고 해시는 부가다.** 해시만으로 전환하면 `data:` URL 임베드처럼 해시가 유지되지 않는
// 뷰어에서 첫 뷰에 갇혀 나머지 축에 영영 도달할 수 없다(실측: 프리뷰 패널에서 재현).
// 그래서 클릭으로 직접 전환하고, 해시는 지원되는 환경에서만 북마크·뒤로가기를 얹는 보너스로 둔다.
const ROUTER_JS = `
(function () {
  const views = [...document.querySelectorAll('.view')];
  const navs = [...document.querySelectorAll('nav a[data-nav]')];
  const links = [...document.querySelectorAll('a[data-nav]')]; // 나브 + 카드 안 "자세히 →" 링크
  if (!views.length) return;
  function show(want) {
    const hit = views.some(v => v.dataset.view === want) ? want : views[0].dataset.view;
    views.forEach(v => { v.hidden = v.dataset.view !== hit; });
    navs.forEach(a => a.classList.toggle('on', a.dataset.nav === hit));
    document.title = document.title.split(' — ')[0] + ' — ' + hit;
    scrollTo(0, 0);
  }
  function fromHash() {
    const h = location.hash || '';
    return h.slice(0, 2) === '#/' ? h.slice(2) : '';
  }
  links.forEach(a => a.addEventListener('click', e => {
    e.preventDefault();
    show(a.dataset.nav);
    try { history.replaceState(null, '', '#/' + a.dataset.nav); } catch (_) { /* data: URL 등 — 무시 */ }
  }));
  addEventListener('hashchange', () => show(fromHash()));
  show(fromHash());
})();
`;

/** 표면 수집(read-only). `today`는 신선도 경과일 계산용 — 순수 렌더에 주입한다. */
function gatherAll(root = path.resolve(__dirname, '..'), today = new Date().toISOString().slice(0, 10)) {
  const wos = gatherWos(root);
  return {
    index: buildIndex(root), health: gatherHealth(root), budget: gatherBudget(root),
    wos, sprint: gatherSprint(root, wos), time: gatherTime(root), today,
  };
}

module.exports = {
  tilesSection, healthSection, budgetSection, worktableSection,
  sizeSection, syncSection, effectSection, contractSection, normCard, normView,
  gatherSprint, sprintView, gatherTime, timeView, render, gatherAll, VIEWS, MARKS,
};

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
