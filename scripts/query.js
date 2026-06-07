// scripts/query.js
// plane 조회의 *순수* 핵심 로직 — CLI / MCP / skill 이 공유한다(로직 1벌, 표면 N개).
// 전부 read-only. 쓰기는 노출하지 않는다(권한 tier·permission-guard 우회 방지).
const { ancestorChain, isDescendant } = require('./zfs_util');

const CONTEXT_DOMAINS = new Set(['PLAN', 'FLOW', 'CON', 'ARCH', 'MTG']);
const LOCKED = new Set(['Verifying', 'Live']);

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

/** Blast Radius: 대상의 모든 자손 + 잠금(Verifying/Live) 여부. */
function blastRadius(id, index) {
  const affected = index
    .filter(d => isDescendant(id, d.id))
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(d => ({ domain: d.domain, id: d.id, status: d.status || null, file: d.file }));
  const locked = affected.filter(d => LOCKED.has(d.status));
  return { id, affected, locked, blocked: locked.length > 0 };
}

// 과거·결정 라우팅(P1-A 결정 트리).
const ROUTES = [
  { keys: ['ephemeral', 'session', 'progress', 'handoff', 'relay'], destination: '.union-stack/sprint/HANDOFF.md', tier: 'Wiki (volatile)', note: '다음 세션이 이어받을 휘발성 진행' },
  { keys: ['failure', 'repeat', 'pitfall', 'lesson', 'bug', 'mistake'], destination: '.union-stack/reference/lessons/LSN-*', tier: 'Wiki', note: '같은 계보 2~3회 반복 실패 → 사전경고' },
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
