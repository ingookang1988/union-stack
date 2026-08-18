#!/usr/bin/env node
// scripts/lineage-tree.js
// 계보 트리 렌더러 — 평면 전체를 루만 계보 포레스트로 그려 HTML 1장(인라인 SVG)으로 낸다. [TOOL-24]
//
// 스파이크 판정(2026-08-18)에서 승격된 유일한 시각화다: 첫 렌더가 CLI 23세션이 못 드러낸
// 구조 사실(계수 도메인의 좌표 앨리어싱, [ADR-25])을 즉시 냈다. 값은 큰/낯선 평면에서의
// 방향 잡기 — 이 템플릿의 실사용자는 어답터 레포를 운영하는 에이전트이므로,
// 도메인 목록·status 어휘·평면 규모를 **가정하지 않는다**:
//   - 색은 도메인 문자열 해시 → 색상환(목록 하드코딩 0)
//   - status·tier 부재를 무가정 처리(fetch-eval의 101노드 적대 평면이 회귀 테스트로 고정)
//   - 폭·높이는 내용에서 도출(고정 캔버스 없음)
// 새 계산 금지 — zfs_index.buildIndex + zfs_util.ancestorChain + query.LOCKED 소비만.
// read-only 코어(render까지 FS 접근 0) · zero-dep. 산출물은 gitignore(lineage-tree.html).
//
// 실행: node scripts/lineage-tree.js [--json] [--out <path>]
const fs = require('fs');
const path = require('path');
const { buildIndex } = require('./zfs_index');
const { ancestorChain } = require('./zfs_util');
const { LOCKED } = require('./query');

// 근사 폰트 메트릭(12px 모노스페이스). 정밀 측정이 아니라 캔버스 크기 도출용.
const CW = 7.2, RH = 22, X0 = 12, IND = 26, PAD = 24;

/** 도메인 → 색상환 각도(순수·결정적). 목록 하드코딩 없이 미지 도메인도 칠해진다. */
function hue(s) {
  let h = 0;
  for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) % 360;
  return h;
}

/** status는 frontmatter 자유 문자열이라 이스케이프한다.
 *  (id·slug·domain은 ZFS 정규식이 문자 집합을 닫아둬 인젝션 표면이 없다 — 카드 참조.) */
function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/** 색인 → 계보 포레스트(순수). 부모는 **최근접 실존 조상** — 중간 세대가 비어도 계보에 붙인다.
 *  (바로 위 부모만 보면 10a 부재 시 10a-1 이 루트로 승격되는데, 그건 blast-radius 의
 *   isDescendant 판정과 어긋난다 — 트리가 평면 자신의 계보 의미론을 숨기면 안 된다.) */
function forest(index) {
  const byId = new Map();
  for (const d of index) {
    if (!byId.has(d.id)) byId.set(d.id, { id: d.id, docs: [], kids: [] });
    byId.get(d.id).docs.push(d);
  }
  const roots = [];
  for (const node of byId.values()) {
    const parentId = ancestorChain(node.id).slice(1).find(id => byId.has(id));
    if (parentId) byId.get(parentId).kids.push(node);
    else roots.push(node);
  }
  const cmp = (a, b) => a.id.localeCompare(b.id);
  roots.sort(cmp);
  for (const n of byId.values()) n.kids.sort(cmp);
  return roots;
}

/** 포레스트 → 행 목록(깊이 우선, 순수). */
function rows(roots) {
  const out = [];
  const walk = (n, d) => { out.push({ node: n, depth: d }); n.kids.forEach(k => walk(k, d + 1)); };
  roots.forEach(r => walk(r, 0));
  return out;
}

/** 색인 → 자기완결 HTML(순수 — FS 접근 없음). */
function render(index, { title = 'plane' } = {}) {
  const rs = rows(forest(index));
  const domains = [...new Set(index.map(d => d.domain))].sort();
  let maxX = 0;
  const body = rs.map((r, i) => {
    const y = 54 + i * RH;
    let x = X0 + r.depth * IND;
    let s = `<text x="${x}" y="${y}" class="id">${r.depth ? '└ ' : ''}${r.node.id}</text>`;
    let cx = x + (r.node.id.length + (r.depth ? 2 : 0)) * CW + 14;
    for (const d of r.node.docs) {
      const chipW = d.domain.length * 7.6 + 10;
      s += `<rect x="${cx}" y="${y - 11}" width="${chipW}" height="15" rx="3" fill="hsl(${hue(d.domain)} 62% 45%)"/>`
        + `<text x="${cx + 5}" y="${y}" class="chip">${d.domain}</text>`;
      cx += chipW + 6;
      const lock = LOCKED.has(d.status) ? ' \u{1F512}' : '';
      const label = (d.slug || d.file) + (d.status ? ` ${esc(d.status)}` : '') + lock;
      s += `<text x="${cx}" y="${y}" class="doc">${label}</text>`;
      cx += label.length * (CW - 0.8) + 14;
    }
    if (cx > maxX) maxX = cx;
    return s;
  }).join('\n');
  const width = Math.ceil(maxX + PAD);
  const height = rs.length * RH + 70;
  return `<!doctype html>
<meta charset="utf-8">
<title>lineage — ${esc(title)}</title>
<style>
  body { margin: 16px; background: #fff; }
  svg { font-family: ui-monospace, Consolas, monospace; }
  .id { font-size: 12px; fill: #111; }
  .chip { font-size: 10.5px; fill: #fff; }
  .doc { font-size: 11px; fill: #666; }
  .meta { font-size: 13px; fill: #111; }
</style>
<svg viewBox="0 0 ${width} ${height}" width="${width}" xmlns="http://www.w3.org/2000/svg">
<text x="${X0}" y="24" class="meta">${esc(title)} — ${index.length} docs / ${rs.length} lineage nodes / ${domains.length} domains</text>
${body}
</svg>
`;
}

module.exports = { hue, forest, rows, render };

if (require.main === module) {
  const args = process.argv.slice(2);
  const root = path.resolve(__dirname, '..');
  const index = buildIndex(root);
  if (args.includes('--json')) { console.log(JSON.stringify(forest(index), null, 2)); process.exit(0); }
  const oi = args.indexOf('--out');
  const out = oi >= 0 && args[oi + 1] ? args[oi + 1] : path.join(root, 'lineage-tree.html');
  fs.writeFileSync(out, render(index, { title: path.basename(root) }));
  console.error(`계보 트리: ${index.length}문서 → ${out}`);
}
