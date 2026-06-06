# sprint/ — actual × action (current work) guide
> **Grid:** actual (observed) × action. **Permission:** Wiki. **Change velocity:** very frequent.
## Goes in: "what is being done." WO (work order) / WF (workflow). next.md/prev.md rolling window.
## Stays out: planning intent (→ .union-stack/plan), finished decisions (→ archive_ledger).

---

## HANDOFF.md — the session relay (agent-generated)

> The period of a session and the comma to the next. The *fast time-axis* linking session to session.
> (cf. .union-stack/lessons/ is the repeated pattern across many sessions = the slow time-axis)

### Who / when
- The **agent ending a session** writes it, organizing its own work (Wiki atomic write).
- On the next session's bootstrap it is read **first**, right after project (identity).

### Volatile — only the latest one is valid
- Overwrite `HANDOFF.md` at the end of each session. The previous one is pushed to `prev.md` (rolling).
- Not for permanent retention. Once the next session reads it, its role is done.
- Lasting lessons are promoted separately to .union-stack/lessons/, decision records to archive_ledger.

### Authoring discipline (the agent must follow)
1. **A format a machine can pick up.** No prose diary. Structured items stamped with ZFS IDs.
2. **Changed locations as an ID list.** Not prose but `[WO-01a-2] [FLOW-01a]` style.
   The next agent runs Upward Fetching on those IDs to restore context itself.
3. **Extreme compression.** Don't explain everything. Point *exactly to where to look*.
4. **Next task as a single entry point.** One clear "start from [WO-01a-3]".
5. **Blockers/cautions stated separately.** Open issues and pitfalls as distinct items (so the next session doesn't fall in again).

### The 5 mandatory parts (miss any one and the relay fails)
- Session summary (1–3 lines) · changed locations (ID list) · next task (single entry point) · open/caution · verification status (did tests pass)
