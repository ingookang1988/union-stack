<!-- [Raw] 실행 영수증 — 러너(ci.js)만 Append. 사람·에이전트 read-only. 한 줄 = 검사 1회. (예시) 줄은 꼴 안내. -->
# Execution Receipts ([PRO-22] 영수증)
- (예시) [2026-01-01][RCPT] sha=0000000 dirty=no scope=product name=unit exit=0 outcome=PASS targets=12 passed=12 failed=0 skipped=0 reason=- env=- dur=1ms gen=ci.js@0.0.0 cmd="pnpm test"
- [2026-10-16][RCPT] sha=2133507 dirty=yes scope=product name=suite exit=1 outcome=REJECT targets=42 passed=40 failed=2 skipped=0 reason=exit_1 env=- dur=4103ms gen=ci.js@6.0.0 cmd="node --test 'scripts/*.test.js'"
