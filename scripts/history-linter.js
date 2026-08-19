#!/usr/bin/env node
// scripts/history-linter.js
// HISTORY 근거 강제 게이트(Fail-close). 콘텐츠 레벨 거버넌스의 첫 강제 사례.
//
// 규율(project/_GUIDE.md): "사실 + 근거는 한 쌍. 근거 없는 사실은 등재 불가."
//   근거 없는 분기점은 회귀 방지를 진보 방지로 변질시키는 '독약'이므로 차단한다.
//
// 동작: .union-stack/project/HISTORY.md 의 표를 파싱해, 분기점(사실) 칸이 채워졌는데
//   근거(왜) 칸이 비면 위반. HISTORY.md 가 없으면 no-op(히스토리는 점진 적체 → 신규 프로젝트 보호).
//
// 실행: node scripts/history-linter.js [--contract]
const fs = require('fs');
const path = require('path');
const { withContract } = require('./gate-contract');

const HISTORY_PATH = '.union-stack/project/HISTORY.md';

// 계약 선언([PRO-11] — [GRAM-12c] 꼴).
const CONTRACT = {
  gate: 'HISTORY Reason Gate (history-linter)',
  input: '.union-stack/project/HISTORY.md 의 분기점 표(사실·근거 컬럼)',
  predicate: '사실 칸이 채워진 행은 근거 칸도 비어 있지 않아야 한다',
  scope: '근거의 존재만 본다 — 근거의 등급·진위·발현점은 보지 않음(SPIKE-fdt D4, [PRO-11] 보류 항목)',
  outcomes: ['PASS', 'REJECT'],
  failure_mode: '근거 없는 분기점 목록 출력 후 REJECT(차단). HISTORY.md 없으면 no-op PASS',
};

// 헤더 키워드로 컬럼을 식별(위치·번역 내성).
const FACT_HEADER = /사실|분기점|fact|turning/i;
const REASON_HEADER = /근거|왜|reason|why/i;
// 빈 칸으로 간주할 플레이스홀더.
const PLACEHOLDER = /^(?:[-–—?.]+|tbd|n\/?a)$/i;

function splitCells(line) {
  let s = line.trim();
  if (s.startsWith('|')) s = s.slice(1);
  if (s.endsWith('|')) s = s.slice(0, -1);
  return s.split('|').map(c => c.trim());
}

function isTableRow(line) {
  return /\|/.test(line) && !/^\s*>/.test(line) && !/^\s*<!--/.test(line);
}

function isSeparatorRow(line) {
  if (!isTableRow(line)) return false;
  return splitCells(line).every(c => /^:?-+:?$/.test(c));
}

function isEmptyCell(c) {
  const t = (c || '').replace(/[*_`]/g, '').trim();
  return t === '' || PLACEHOLDER.test(t);
}

/**
 * 마크다운에서 "사실 칸은 있는데 근거 칸이 빈" 행을 찾는다.
 * 순수 함수 — FS 접근 없음. 반환: [{line, fact}] (line은 1-기준).
 * (일반화 확장점: 컬럼 규칙을 인자로 빼면 lessons/proposals에도 재사용 가능.)
 */
/**
 * 분기점 표 → 항목 배열(순수) — 시간축 페이지가 소비한다.
 * findViolations 와 같은 표 인식 규칙을 쓴다(파서 정본은 이 파일 하나 — 중복 파서는 드리프트).
 * 반환: [{date, fact, reason, note, example}] — "(예시)" 행은 example: true 로 표시만 하고 거르지 않는다.
 */
function parseEntries(md) {
  const lines = String(md || '').split(/\r?\n/);
  const out = [];
  for (let i = 0; i < lines.length - 1; i++) {
    if (!isTableRow(lines[i]) || isSeparatorRow(lines[i])) continue;
    if (!isSeparatorRow(lines[i + 1])) continue;
    const header = splitCells(lines[i]);
    const factCol = header.findIndex(h => FACT_HEADER.test(h));
    if (factCol === -1) continue;
    const reasonCol = header.findIndex(h => REASON_HEADER.test(h));
    const dateCol = header.findIndex(h => /날짜|date/i.test(h));
    const noteCol = header.findIndex(h => /시사점|고려|note/i.test(h));
    for (let j = i + 2; j < lines.length && isTableRow(lines[j]); j++) {
      if (isSeparatorRow(lines[j])) continue;
      const row = splitCells(lines[j]);
      const fact = row[factCol] || '';
      if (isEmptyCell(fact)) continue;
      out.push({
        date: dateCol >= 0 ? (row[dateCol] || '') : '',
        fact,
        reason: reasonCol >= 0 ? (row[reasonCol] || '') : '',
        note: noteCol >= 0 ? (row[noteCol] || '') : '',
        example: /\(예시\)|example/i.test((row[dateCol] || '') + ' ' + fact),
      });
    }
  }
  return out;
}

function findViolations(md) {
  const lines = md.split(/\r?\n/);
  const violations = [];
  for (let i = 0; i < lines.length - 1; i++) {
    if (!isTableRow(lines[i]) || isSeparatorRow(lines[i])) continue;
    if (!isSeparatorRow(lines[i + 1])) continue; // 헤더는 다음 줄이 구분선
    const header = splitCells(lines[i]);
    const factCol = header.findIndex(h => FACT_HEADER.test(h));
    if (factCol === -1) continue; // 우리 표(분기점 표)가 아님 — 무시
    const reasonCol = header.findIndex(h => REASON_HEADER.test(h));
    if (reasonCol === -1) {
      violations.push({ line: i + 1, fact: '(표 양식 오류: 근거 컬럼 없음)' });
    }
    let j = i + 2;
    for (; j < lines.length && isTableRow(lines[j]); j++) {
      if (isSeparatorRow(lines[j])) continue;
      const row = splitCells(lines[j]);
      const fact = row[factCol] || '';
      if (isEmptyCell(fact)) continue; // 빈 행 — 등재 아님
      const reason = reasonCol >= 0 ? (row[reasonCol] || '') : '';
      if (reasonCol === -1 || isEmptyCell(reason)) {
        violations.push({ line: j + 1, fact: fact.replace(/[*_`]/g, '').trim() });
      }
    }
    i = j - 1; // 이 표 다음부터 계속
  }
  return violations;
}

function run(root = path.resolve(__dirname, '..')) {
  const p = path.join(root, HISTORY_PATH);
  if (!fs.existsSync(p)) {
    console.log('HISTORY 린터: HISTORY.md 없음 — 건너뜀(히스토리는 점진 적체).');
    return 0;
  }
  const violations = findViolations(fs.readFileSync(p, 'utf8'));
  if (violations.length) {
    console.error('\n[HISTORY] 근거 없는 분기점(독약 항목):');
    violations.forEach(v => console.error(`  ✗ L${v.line}: ${v.fact}`));
    console.error('\n각 분기점에 "왜"(근거)를 채우세요 — 근거가 있어야 회귀 재평가가 가능합니다.');
    console.error('규율: project/_GUIDE.md — 사실 + 근거는 한 쌍.\n');
    return 1;
  }
  console.log('HISTORY 린터 통과: 모든 분기점에 근거가 있음.');
  return 0;
}

module.exports = { findViolations, parseEntries, run, CONTRACT, HISTORY_PATH };

if (require.main === module) process.exit(withContract(CONTRACT, () => run())()); // run(root) 시그니처 — argv 전달 금지
