// scripts/zfs_util.js
// ZFS (Zettelkasten File System) 네이밍 유틸리티.
// 모든 로직은 scripts/zfs_util.test.js 로 검증된다.
//
// 파일명 공식: [DOMAIN]-[LUHMANN_ID]_[slug].md
//   DOMAIN     : 대문자 2~6자 + 닫힌 화이트리스트(VALID_DOMAINS)
//   LUHMANN_ID : 숫자로 시작, 숫자·알파벳 교차. 알파벳은 l/o 제외([a-km-np-z]).
//                단말 작업은 끝에 -[0-9]+ 허용.
//   slug       : 소문자로 시작하는 스네이크 케이스

// l, o 를 문자셋에서 물리적으로 제외 → 휴먼 에러(1↔l, 0↔o) 원천 차단
const ZFS_REGEX =
  /^([A-Z]{2,6})-([0-9]+(?:[a-km-np-z]+[0-9]+)*(?:[a-km-np-z]+)?(?:-[0-9]+)?)_([a-z][a-z0-9_]*)\.md$/;

// 허용 도메인 — 닫힌 화이트리스트. [A-Z]{2,6} 구조만으로는 PLAN→PLAM 같은
// 도메인 오타를 못 막으므로 명시 집합으로 강제한다(Fail-close).
// 새 도메인은 .union-stack/proposals 승인 후 여기와 ARCH-00에 함께 추가한다.
const VALID_DOMAINS = new Set([
  'ARCH',  // topology    당위·상태
  'PHASE', // project/roadmap  당위·행위(마일스톤)
  'CON',   // contracts   계약·상태
  'PLAN',  // plan        계약·행위
  'FLOW',  // feature     실제·상태(데이터 리니지)
  'WO',    // sprint      실제·행위(작업 오더)
  'WF',    // sprint      실제·행위(워크플로우)
  'LSN',   // lessons     시간축(오답노트)
  'EVD',   // mechanism   증거
  'ADR',   // 결정 기록
  'PRO',   // proposals   하네스 규칙 변경 제안
]);

/** 도메인 문자열이 허용 화이트리스트에 속하는지 */
function isValidDomain(domain) {
  return VALID_DOMAINS.has(domain);
}

/** 파일명이 ZFS 규약(구조 + 허용 도메인)을 따르는지 검사 */
function isValidName(filename) {
  const m = filename.match(ZFS_REGEX);
  if (!m) return false;
  return VALID_DOMAINS.has(m[1]);
}

/** 파일명에서 도메인/Luhmann ID/slug 추출. 실패 시 null */
function parse(filename) {
  const m = filename.match(ZFS_REGEX);
  if (!m) return null;
  return { domain: m[1], id: m[2], slug: m[3] };
}

/** 파일명·`DOMAIN-ID`(브래킷 참조)·순수 ID 문자열에서 Luhmann ID만 추출 */
function parseId(name) {
  // 전체 파일명(..._slug.md) 또는 슬러그 없는 DOMAIN-ID(예: WO-01a1-2) 모두 허용
  const m = name.match(
    /^[A-Z]{2,6}-([0-9]+(?:[a-km-np-z]+[0-9]+)*(?:[a-km-np-z]+)?(?:-[0-9]+)?)(?:_|$)/
  );
  if (m) return m[1];
  // 이미 순수 ID 문자열인 경우
  if (/^[0-9]+(?:[a-km-np-z]+[0-9]+)*(?:[a-km-np-z]+)?(?:-[0-9]+)?$/.test(name)) return name;
  return null;
}

/**
 * otherId 가 planId 의 진짜 자식/단말/자기자신인지 판정.
 * 루만 교차 규칙: 부모가 숫자로 끝나면 자식은 알파벳(다음 레벨) 또는 하이픈(단말),
 *                부모가 알파벳으로 끝나면 자식은 숫자로 이어진다.
 * 이로써 01a1 이 01a10(다른 숫자 노드)을 자식으로 오인하지 않는다.
 */
function isDescendant(planId, otherId) {
  if (otherId === planId) return true;
  if (!otherId.startsWith(planId)) return false;
  const parentEndsDigit = /[0-9]/.test(planId[planId.length - 1]);
  const next = otherId[planId.length];
  return parentEndsDigit ? /[a-z-]/.test(next) : /[0-9]/.test(next);
}

/** 단말 ID에서 부모 체인을 역산. 01a1-2 → [01a1-2, 01a1, 01a, 01] */
function ancestorChain(id) {
  const chain = [id];
  let cur = id;
  // 단말 작업 접미사(-N) 제거
  if (/-[0-9]+$/.test(cur)) {
    cur = cur.replace(/-[0-9]+$/, '');
    chain.push(cur);
  }
  // 마지막 블록(연속된 동일 종류 문자)을 하나씩 절삭
  while (cur.length > 0) {
    const isDigitEnd = /[0-9]$/.test(cur);
    const re = isDigitEnd ? /[0-9]+$/ : /[a-z]+$/;
    const next = cur.replace(re, '');
    if (next === cur || next.length === 0) break;
    chain.push(next);
    cur = next;
  }
  return chain;
}

module.exports = {
  ZFS_REGEX, VALID_DOMAINS, isValidDomain, isValidName,
  parse, parseId, isDescendant, ancestorChain,
};
