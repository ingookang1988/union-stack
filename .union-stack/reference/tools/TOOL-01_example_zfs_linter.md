<!-- 더미 예시(example) — 복제 후 당신의 실제 도구 카탈로그로 교체. 실체는 이 레포의 진짜 스크립트를 가리킨다. -->
---
id: TOOL-01
title: (예시) ZFS 네이밍 린터
kind: script            # script | skill | mcp | cli
impl: scripts/zfs-linter.js
status: Active
version: 1.0
---

# [TOOL-01] (예시) ZFS 네이밍 린터

## 용도
`.union-stack/` 아래 새 문서의 파일명이 ZFS 규약(`[DOMAIN]-[LUHMANN_ID]_[slug].md`)을 따르는지 검사.

## 언제 쓰나
- 컨트롤 평면에 새 파일을 만들었을 때(커밋 전 자기 점검).

## 언제 쓰지 않나
- 제품 코드 파일 네이밍(범위 밖 — 평면 전용).

## 호출
```bash
node scripts/zfs-linter.js
```
- exit 0 = 통과, 비0 = 위반(Fail-close — 멈추고 이름을 고친다).
- 같은 도메인·같은 ID 파일이 2개면 **중복 ID** 로 REJECT([PRO-27] ⑤) — 디렉터리가 달라도(archived 사본) 잡는다. 같은 번호·다른 도메인은 중복이 아니다.
