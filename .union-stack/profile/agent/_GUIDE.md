# profile/agent/ — agent profiles (declarative card)

> Pattern borrowed from the A2A protocol's **Agent Card** (a declarative JSON "digital business
> card" — name, description, version, provider). union-stack borrows the *structure* only; this is
> not an A2A-compatible artifact. Tier: **Wiki**. Flat registry, not ZFS.

## agent schema
| field | source precedent | meaning |
|---|---|---|
| `name` | A2A Agent Card | display name of the agent |
| `description` | A2A | human-readable purpose/capabilities |
| `version` | A2A | profile version |
| `provider` | A2A | `{organization, url}` — who operates the agent |
| `interactionStyle` | own | `{formality, language, verbosity, …}` — how the agent speaks by default |
| `authority` | CODEOWNERS pattern | advisory scope of what the agent may decide alone |

## Agent teams / orgs (future)
v1 models grouping via `provider.organization` only (the A2A hook). If real agent-team semantics
are needed later (membership, team-level overrides), add a SCIM-Group-style resource
(`displayName` + members by reference) via a new proposal — do not embed.

## Interplay with human profiles
The acting agent reads the active **user** profile and adapts (존댓말 level, 호칭, tone). The agent's
own `interactionStyle` is the *default* that the user profile overrides — user-wins, same cascade.
