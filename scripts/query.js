// scripts/query.js
// plane 조회의 *순수* 핵심 로직 — CLI / MCP / skill 이 공유한다(로직 1벌, 표면 N개).
// 전부 read-only. 쓰기는 노출하지 않는다(권한 tier·permission-guard 우회 방지).
const { ancestorChain, isDescendant, parseId } = require('./zfs_util');

const CONTEXT_DOMAINS = new Set(['PLAN', 'FLOW', 'CON', 'ARCH', 'MTG']);
const LOCKED = new Set(['Verifying']);

/** Upward Fetching: 부모 계보 맥락(PLAN/FLOW/CON/ARCH/MTG) + 같은 계보 LSN. */
function upwardFetch(id, index) {
  const chain = ancestorChain(id);
  const ancestors = new Set(chain);
  const context = index
    .filter(d => CONTEXT_DOMAINS.has(d.domain) && ancestors.has(d.id))
    .sort((a, b) => a.domain.localeCompare(b.domain))
    .map(d => ({ domain: d.domain, id: d.id, file: d.file }));
  const lessons = index
    .filter(d => d.domain === 'LSN' && isDescendant(d.id, id))
    .map(d => ({ domain: d.domain, id: d.id, file: d.file }));
  return { id, chain, context, lessons };
}

/**
 * Blast Radius: 대상의 모든 자손 **+ 선언된 계약 소비자와 그 자손** + 잠금(Verifying) 여부.
 *
 * 계보 자손만 보면 계약의 영향권을 구조적으로 못 본다([PRO-16] §2-A 실측): 계약은 정의상
 * 포함관계가 *아닌* 당사자끼리 공유되므로(FE와 BE는 형제) 소비자는 늘 다른 계보에 있다.
 * 그래서 `consumers:` 로 선언된 계보 밖 간선을 합집합한다. 자손까지 포함하는 것은 보수적
 * 선택이다 — 잠금 검사는 놓치는 것보다 넓은 편이 안전하다([PRO-16] §3-2).
 * 간선은 **계약 → 소비자 한 방향만** 선언한다(양방향은 정본이 둘이 되어 드리프트).
 */
function blastRadius(id, index) {
  const row = d => ({ domain: d.domain, id: d.id, status: d.status || null, file: d.file });
  const lineage = index.filter(d => isDescendant(id, d.id));
  const seen = new Set(lineage.map(d => d.file));
  const viaContract = [];
  const unresolved = [];
  for (const src of lineage) {
    for (const raw of src.consumers || []) {
      const cid = parseId(raw);
      const hit = cid ? index.filter(d => isDescendant(cid, d.id)) : [];
      if (!hit.length) { unresolved.push({ ref: raw, from: src.file }); continue; }
      for (const d of hit) {
        if (seen.has(d.file)) continue;
        seen.add(d.file);
        viaContract.push({ ...row(d), via: `${src.domain}-${src.id}` });
      }
    }
  }
  const cmp = (a, b) => a.id.localeCompare(b.id);
  const affected = [...lineage.map(row).sort(cmp), ...viaContract.sort(cmp)];
  const locked = affected.filter(d => LOCKED.has(d.status));
  return { id, affected, locked, blocked: locked.length > 0, viaContract, unresolvedConsumers: unresolved };
}

// 과거·결정 라우팅(P1-A 결정 트리). find()가 첫 매칭을 반환하므로 *더 구체적인* 분기가 앞선다.
const ROUTES = [
  { keys: ['ephemeral', 'session', 'progress', 'handoff', 'relay'], destination: '.union-stack/sprint/HANDOFF.md', tier: 'Wiki (volatile)', note: '다음 세션이 이어받을 휘발성 진행' },
  // 환경·머신·크로스레포 사실은 lessons *앞*에 둔다 — 둘 다 "failure/repeat"를 포함하므로 순서가 경계다([ADR-11]).
  { keys: ['environment', 'machine', 'tooling-quirk', 'toolquirk', 'cross-repo', 'crossrepo', 'preference', 'workflow-quirk'], destination: 'agent-platform cross-session memory (예: Claude Code MEMORY.md — 비커밋·사용자 전역)', tier: 'Private (off-plane)', note: '환경/크로스레포 반복 사실·선호 → 사적 메모리. 커밋 평면 아님(누설 방지). 레포 특정이면 lessons로.' },
  { keys: ['failure', 'repeat', 'pitfall', 'lesson', 'bug', 'mistake'], destination: '.union-stack/reference/lessons/LSN-*', tier: 'Wiki', note: '같은 계보 2~3회 반복 실패 → 사전경고. 단 *레포/제품* 특정만 — 환경 특정은 위 사적 메모리로.' },
  { keys: ['proposal', 'rule', 'harness', 'process'], destination: '.union-stack/proposals/PRO-*', tier: 'Proposal', note: '하네스 규칙/프로세스 변경 제안' },
  { keys: ['decision', 'adr', 'tactical'], destination: '.union-stack/archive_ledger.md', tier: 'Raw (append-only)', note: '전술적 결정(작업/ZFS 단위)' },
  { keys: ['pivot', 'strategic', 'turning', 'direction', 'dependency', 'history'], destination: '.union-stack/project/HISTORY.md', tier: 'Schema/Raw', note: '전략적 분기점(사실+근거)' },
];

/** where_to_record: kind 키워드 → 목적지. 매칭 + 전체 표 반환. */
function whereToRecord(kind) {
  const k = String(kind || '').toLowerCase();
  const r = ROUTES.find(route => route.keys.some(key => k.includes(key)));
  const strip = ({ keys, ...rest }) => rest;
  return { kind, match: r ? strip(r) : null, all: ROUTES.map(strip) };
}

module.exports = { upwardFetch, blastRadius, whereToRecord, CONTEXT_DOMAINS, LOCKED };
