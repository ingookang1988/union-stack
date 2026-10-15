// scripts/adapter.js
// 어답터 설정 표면 — **sync 파일을 고치지 않고** 어답터 형상을 선언하는 단 하나의 자리.
//
// 왜 필요한가(실측): sync 카테고리는 "덮어써도 잃을 것이 없다"가 전제인데, 실전 어답터는
// sync 파일에 *정당한* 개조를 갖는다. LifeSaju 어답터는 3건을 반복 재적용하고 있었고
// `template-update --apply` 가 그중 2건을 조용히 덮어써 게이트 2개가 즉시 FAIL 했다.
// 원인은 개조가 나쁘다는 게 아니라 **개조를 담을 표면이 없었다**는 것이다. 그 표면이 이 파일이다.
//
// 위치가 `.union-stack/adapter.json` 인 이유: template-update 의 `classifyPath` 가 이 경로를
// sync 도 review 도 아닌 **불가침**(null)으로 분류한다 — 즉 어답터 소유이고 상류가 절대 건드리지
// 않는다. `package.json` 의 필드로 두는 안은 그 반대다(package.json 은 review 카테고리라
// 상류 변경과 어답터 설정이 같은 파일에서 충돌한다).
//
// 소비처(각 도구가 이 모듈을 읽는다 — 새 규약을 만들지 않는다):
//   · `private`     → health.js 의 leakage gate 를 FAIL 대신 INFO 로 강등. 누설 가드는 **공개
//                     템플릿 보호용**이라 비공개 실콘텐츠 레포에서는 의미가 반전된다(실콘텐츠가 정상).
//                     게이트 자체(`leakage-guard.js`)는 그대로 둔다 — 강등은 *점수표*의 판정이다.
//   · `zfsIgnored`  → zfs-linter 의 면제 목록에 합산(어답터 고유 매니페스트 파일명).
//   · `statusMap`   → 로컬 상태 어휘 → 상류 어휘 매핑([PRO-27] ②). zfs_index·work-close 가 읽기 시 적용하고 원문은 rawStatus 로
//                     남긴다. 어휘를 **강제하지 않는다** — 매핑에 없는 값은 그대로 산다(어답터 실측: `Done`·`Review`·status 38종).
//   · `evidenceFields` → 상류 필드(evidence·closed_by) 의 로컬 별칭 배열. 상류 필드가 있으면 그것이 우선, 없으면 별칭 순서대로.
//   · `lineage.arithmeticFrom` → 그 번호부터만 ID 산술 상속([PRO-27] ③). 레거시 독립 채번 구간(같은 번호가 도메인마다 다른 문서)은
//                     frontmatter 부모만 본다. 기본 0 = 전부 산술(상류 자신의 형상).
//
// 설정은 **선언이고 검증 대상**이다: 알 수 없는 키·형식 오류는 조용히 삼키지 않고 `warnings` 로
// 낸다(설정 오타가 "적용된 줄 알았는데 아니었다"로 끝나는 것이 이 부류 도구의 표준 사고).
const fs = require('fs');
const path = require('path');

const CONFIG_PATH = '.union-stack/adapter.json';
const DEFAULTS = { private: false, zfsIgnored: [], statusMap: {}, evidenceFields: {}, lineage: { arithmeticFrom: 0 } };
const KNOWN_KEYS = new Set(['private', 'zfsIgnored', 'statusMap', 'evidenceFields', 'lineage', '$schema']);
const LINEAGE_KEYS = new Set(['arithmeticFrom']);
// evidenceFields 가 별칭을 달 수 있는 상류 필드 — work-close 의 닫힘 계약이 읽는 둘뿐이다.
const ALIASABLE_FIELDS = new Set(['evidence', 'closed_by']);
const fresh = present => ({ ...DEFAULTS, zfsIgnored: [], statusMap: {}, evidenceFields: {}, lineage: { arithmeticFrom: 0 }, warnings: [], present });

/**
 * JSON 텍스트 → 정규화된 설정(순수 — FS 비의존).
 * 반환: {private, zfsIgnored, warnings[], present}
 * 파싱 실패도 **관측 결과**다 — 기본값으로 진행하되 경고를 남긴다(설정 파일 하나가 게이트 전체를
 * 죽이면 안 된다: 이 모듈은 게이트가 아니라 게이트의 입력이다).
 */
function parseConfig(txt) {
  const out = fresh(true);
  let j;
  try { j = JSON.parse(String(txt)); } catch (e) {
    out.warnings.push(`${CONFIG_PATH} 파싱 실패 — 기본값으로 진행: ${e.message}`);
    return out;
  }
  if (!j || typeof j !== 'object' || Array.isArray(j)) {
    out.warnings.push(`${CONFIG_PATH} 최상위가 객체가 아님 — 기본값으로 진행`);
    return out;
  }
  for (const k of Object.keys(j)) {
    if (!KNOWN_KEYS.has(k)) out.warnings.push(`${CONFIG_PATH}: 알 수 없는 키 '${k}' — 무시됨(오타 확인)`);
  }
  if ('private' in j) {
    if (typeof j.private === 'boolean') out.private = j.private;
    else out.warnings.push(`${CONFIG_PATH}: 'private' 는 boolean 이어야 함 — 무시됨`);
  }
  if ('zfsIgnored' in j) {
    if (Array.isArray(j.zfsIgnored) && j.zfsIgnored.every(x => typeof x === 'string')) {
      // 파일**명**만 받는다(zfs-linter 의 IGNORED 와 같은 의미론). 경로가 오면 경고 후 basename 사용.
      out.zfsIgnored = j.zfsIgnored.map(s => {
        const base = s.split('/').pop();
        if (base !== s) out.warnings.push(`${CONFIG_PATH}: 'zfsIgnored' 는 파일명만 받는다 — '${s}' → '${base}'`);
        return base;
      }).filter(Boolean);
    } else out.warnings.push(`${CONFIG_PATH}: 'zfsIgnored' 는 문자열 배열이어야 함 — 무시됨`);
  }
  if ('statusMap' in j) {
    const m = j.statusMap;
    if (m && typeof m === 'object' && !Array.isArray(m)) {
      for (const [k, v] of Object.entries(m)) {
        if (typeof v === 'string' && v.trim()) out.statusMap[k] = v.trim();
        else out.warnings.push(`${CONFIG_PATH}: 'statusMap.${k}' 는 비지 않은 문자열이어야 함 — 무시됨`);
      }
    } else out.warnings.push(`${CONFIG_PATH}: 'statusMap' 은 {로컬: 상류} 객체여야 함 — 무시됨`);
  }
  if ('evidenceFields' in j) {
    const e = j.evidenceFields;
    if (e && typeof e === 'object' && !Array.isArray(e)) {
      for (const [k, v] of Object.entries(e)) {
        if (!ALIASABLE_FIELDS.has(k)) { out.warnings.push(`${CONFIG_PATH}: 'evidenceFields.${k}' — 별칭을 달 수 있는 상류 필드는 ${[...ALIASABLE_FIELDS].join('·')} 뿐 — 무시됨`); continue; }
        if (Array.isArray(v) && v.every(x => typeof x === 'string' && x.trim())) out.evidenceFields[k] = v.map(x => x.trim());
        else out.warnings.push(`${CONFIG_PATH}: 'evidenceFields.${k}' 는 문자열 배열이어야 함 — 무시됨`);
      }
    } else out.warnings.push(`${CONFIG_PATH}: 'evidenceFields' 는 {상류필드: [별칭]} 객체여야 함 — 무시됨`);
  }
  if ('lineage' in j) {
    const l = j.lineage;
    if (l && typeof l === 'object' && !Array.isArray(l)) {
      for (const k of Object.keys(l)) if (!LINEAGE_KEYS.has(k)) out.warnings.push(`${CONFIG_PATH}: 'lineage.${k}' 알 수 없는 키 — 무시됨`);
      if ('arithmeticFrom' in l) {
        if (Number.isInteger(l.arithmeticFrom) && l.arithmeticFrom >= 0) out.lineage.arithmeticFrom = l.arithmeticFrom;
        else out.warnings.push(`${CONFIG_PATH}: 'lineage.arithmeticFrom' 은 음 아닌 정수여야 함 — 기본값(0) 사용`);
      }
    } else out.warnings.push(`${CONFIG_PATH}: 'lineage' 는 객체여야 함 — 무시됨`);
  }
  return out;
}

/** 이 ID 에 ID 산술 상속이 적용되는가(순수) — 숫자 머리가 arithmeticFrom 이상이면 산술, 아래면 frontmatter 만([PRO-27] ③). */
function arithmeticApplies(cfg, id) {
  const from = cfg && cfg.lineage && Number.isInteger(cfg.lineage.arithmeticFrom) ? cfg.lineage.arithmeticFrom : 0;
  if (!from) return true;
  const m = String(id || '').match(/^\d+/);
  return !!m && parseInt(m[0], 10) >= from;
}

/**
 * 로컬 상태 → 상류 어휘(순수). 정확 일치 → **첫 토큰** 일치(어답터 실측: `Done (2026-01-01)` 같은 산문 status 가 흔하다 — 센서스 1회차) → 그대로.
 * 매핑에 없으면 강제하지 않는다. null 은 null.
 */
function mapStatus(cfg, raw) {
  if (raw == null) return null;
  const m = cfg && cfg.statusMap;
  if (!m) return raw;
  const has = k => Object.prototype.hasOwnProperty.call(m, k);
  if (has(raw)) return m[raw];
  const head = String(raw).trim().split(/\s+/)[0];
  return head && has(head) ? m[head] : raw;
}

/** 상류 필드의 읽기 순서(순수): 상류 필드 → 로컬 별칭들. */
function fieldAliases(cfg, key) {
  const a = cfg && cfg.evidenceFields && cfg.evidenceFields[key];
  return [key, ...(Array.isArray(a) ? a : [])];
}

/** 설정 로드(얇은 FS 층). 파일이 없으면 기본값 + present:false — **부재는 정상**(템플릿·무설정 어답터). */
function load(root = path.resolve(__dirname, '..')) {
  const abs = path.join(root, CONFIG_PATH);
  let txt;
  try { txt = fs.readFileSync(abs, 'utf8'); } catch { return fresh(false); }
  return parseConfig(txt);
}

/**
 * 이 레포가 **상류 템플릿 인스턴스**인가(순수-ish). `init.js` 가 package.json 의 name 을 어답터
 * 슬러그로 덮어쓰므로 name 이 기계 판별자다. 자기 테스트가 "템플릿 평면 내용"을 단언할 때
 * 이 판별로 가드한다 — 어답터에서 예시 문서가 사라지는 것은 결함이 아니라 **정상 사용**이다.
 *
 * ⚠ 이것은 판정이 아니라 **모드 표시**다. 픽스처 유무를 직접 볼 수 있는 검사는 그쪽이 낫다
 * (그 검사는 무엇을 필요로 하는지 스스로 말한다). 이 함수는 "템플릿 청결도" 처럼 개별 픽스처로
 * 환원되지 않는 단언에만 쓴다.
 */
function isTemplateRepo(root = path.resolve(__dirname, '..')) {
  try {
    return JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8')).name === 'union-stack';
  } catch { return false; }
}

module.exports = { CONFIG_PATH, DEFAULTS, ALIASABLE_FIELDS, parseConfig, load, isTemplateRepo, mapStatus, fieldAliases, arithmeticApplies };
