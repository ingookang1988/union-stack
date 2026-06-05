<!-- [Schema/당위] ZFS 네이밍 규범. 이 파일은 방법론이므로 그대로 공개/사용 가능. -->
---
id: ARCH-00
title: ZFS 네이밍 규약
status: Active
version: 1.0
---

# [ARCH-00] ZFS (Zettelkasten File System) 네이밍 규약

## 파일명 공식
`[DOMAIN]-[LUHMANN_ID]_[slug].md`  — 예: `PLAN-01a1_example_oauth.md`

## 규칙
1. **DOMAIN**: 대문자 2~6자. 허용: `PLAN FLOW ARCH WO WF EVD ADR CON LSN PRO`.
2. **LUHMANN_ID**: 숫자로 시작. 숫자 블록과 알파벳 블록이 교차 확장.
   알파벳은 **`l`/`o`를 제외**한 `[a-km-np-z]`(숫자 1/0과의 혼동 차단).
   단말 작업은 끝에 `-[0-9]+`.
3. **slug**: 소문자로 시작하는 스네이크 케이스. 공백·하이픈·대문자 금지.

## 딥링킹
상대 경로 금지. 본문에서 `[PLAN-01a1]` 브래킷 ID로만 참조 → 전역 정규식 색인.

## 계보 추론
- **Upward Fetching**: 단말에서 절삭해 부모 역산. `01a1-2`→`01a1`→`01a`→`01`.
- **Blast Radius**: 수정·삭제 시 같은 계보의 자식/형제를 색인, Verifying/Live 노드가
  있으면 Fail-close. (교차 규칙으로 `01a1`이 `01a10`을 오인하지 않음)

> 검증된 정규식·판정 로직은 `scripts/zfs_util.js`, 테스트는 `scripts/zfs_util.test.js`.
