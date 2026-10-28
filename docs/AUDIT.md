# Aesir team audit, October 2026

This records why the 31-agent Copilot roster became a 9-agent Claude Code plugin, what each old agent became, and what the change does to cost.

## Findings

| Problem | Evidence | Effect |
|---|---|---|
| Copilot-only format | Tool names were Copilot aliases (`read`, `edit`, `search`, `agent`, `todo`, `web`, `execute`); `argument-hint` and `.agent.md` are Copilot conventions. Claude Code reads none of `.github/agents`, `copilot-instructions.md`, or `instructions/*.instructions.md`. | The team was invisible to Claude Code. |
| No model tiers | No agent set `model:`. In Claude Code every subagent would have inherited the main model, including Opus for social posts and changelogs. | Up to 40x the necessary spend on light tasks. |
| Three orchestrators | Odin, Sigurd, and Var all held the `agent` tool and ran their own pipelines. Claude Code subagents cannot spawn subagents. | The delegation design could not run. |
| Overlap | Four agents gated shipping (Baldur, Loki, Var, Heimdall). Ull and Modi shared templates and differed by one line. Frigga, Tyr, and Sigurd all owned the backlog with three different sizing scales. Changelogs were claimed by Bragi, Kvasir, and Heimdall. Mimir and Huginn covered the same domains. | Inconsistent routing; the same work described three ways. |
| Boilerplate | About 18% of body text was mythology persona. The roster appeared in three files. "Do not do X, that is Y's job" appeared in seven or more files. The 31 description lines (about 13,500 characters) were loaded into every session. | Tokens paid on every turn for text that did not change behavior. |
| Instructions that forced cost | Odin "always delegate"; Sigurd's mandatory nine-step pipeline; Heimdall's nine mandatory CI stages on every pipeline; Mimir and Huginn "go wide first" with no stop rule; Ull "two edge cases per method". | A one-line change could trigger five or more subagent calls. |
| Tools did not match promises | Only Völva had `execute`. Thor, Ull, Modi, and Heimdall promised runnable, compilable output but could not build or run anything. Loki checked CVEs without web access. | Verification claims that could not be true. |
| Internal errors | Heimdall said "pin to SHA" with a tag as the example. Angrboda's risk score range was wrong. Var's coverage rule named four levels while its table had five. Völva's model list ("GPT-4o") was frozen in the prompt. No agent owned publishing. | Misleading guidance. |
| Missing files | The README linked a `LICENSE` that did not exist. | Unclear licensing. |

## What changed

- The repo is now a Claude Code plugin (`aesir`) and its own marketplace (`agentic-aesir`). Install once per machine at user scope and every project gets the team.
- Nine agents in Claude Code format with model and effort tiers. Each description is under about 260 characters. Each body is under 50 lines with no persona paragraphs, no roster, and no cross-agent prohibition lists.
- Odin is gone as a file. The main session orchestrates, routing by agent descriptions, and Claude Code plan mode does task breakdown. Odin's method lives in `/aesir:playbook`.
- Shared rules live once, in `AGENTS.md` (project) or `~/.claude/rules/aesir.md` (user level). `CLAUDE.md` imports `AGENTS.md`, and Copilot reads `AGENTS.md` directly.
- Stack conventions moved to a path-scoped rules file (`rules/dotnet.md`) that loads only when .NET files are touched, with an `applyTo` twin for Copilot.
- Copilot support is generated, not hand-maintained: `scripts/sync-copilot-agents.mjs` converts the Claude-format agents to `.agent.md` for `~/.copilot/agents/` or a project's `.github/agents/`.
- Every agent that claims to verify something has `Bash`. The reviewer has `Bash` for diffs and test runs but is denied `Edit` and `Write`.

## Where each old agent went

| Old agent | Old role | Now |
|---|---|---|
| Odin | Orchestrator | The main session, plus `/aesir:playbook` |
| Frigga | Project manager | Main session with plan mode; spec artifacts via `tyr` |
| Tyr | Product owner | `tyr` (PRDs, stories, acceptance criteria only) |
| Mimir | Research analyst | `mimir` |
| Skadi | Data analyst | Dropped. Queries and analysis are `thor` or `mimir` work; data plugins cover dashboards. |
| Vidar | Architect | `vidar` |
| Sigurd | Engineering manager | Main session with plan mode |
| Thor | Backend engineer | `thor` (all layers; stack rules come from rules files) |
| Magni | Frontend engineer | `thor` |
| Njord | Database engineer | `thor`; schema design questions go to `vidar` |
| Aegir | DevOps | `aegir` |
| Heimdall | CI/CD | `aegir` |
| Baldur | Code reviewer | `baldur` |
| Loki | Security | `baldur` (security is part of every review) |
| Var | QA lead | `ull` (strategy) and the main session (go/no-go) |
| Ull | Unit tests | `ull` |
| Modi | Integration tests | `ull` |
| Fenrir | Performance and chaos | `ull` (basic load and benchmark checks) |
| Bragi | Copywriter | `saga` |
| Saga | Blogger | `saga` |
| Idunn | Editor | `saga` (editing mode) |
| Rán | SEO | `saga` |
| Freya | Graphic designer | Dropped. Design tokens and asset specs go in `tyr` specs when needed. |
| Eir | UX designer | Dropped. Flows and accessibility live in `tyr` specs and `thor` implementation. |
| Kvasir | Technical writer | `saga` |
| Huginn | News gatherer | `mimir` |
| Muninn | Content strategist | `saga` |
| Hermod | Social media | `saga` |
| Jormungandr | API specialist | `vidar` (API contracts) |
| Angrboda | Risk analyst | `mimir` (dependency advisories) and `vidar` (design risk) |
| Völva | AI specialist | `volva` |

Any dropped role can come back as one file in `.claude/agents/` if a project needs it. The playbook gives the contract.

## Cost model

Always-loaded context per session, before and after:

| Surface | Before | After |
|---|---|---|
| Agent descriptions (Claude Code) | 31 descriptions, about 13,500 characters | 9 descriptions, about 2,250 characters |
| Agent bodies (Copilot loads the whole file) | about 15,000 words across 31 files | about 2,800 words across 9 files |
| Roster copies | 3 files | 1 (`AGENTS.md`), optional |
| Stack conventions | Inside Thor, Njord, Ull, Aegir, Heimdall, always on | One rules file, loaded only for matching paths |

Model mix per task, using Anthropic list prices in October 2026 (per million tokens, input / output):

| Tier | Model | Price | Agents |
|---|---|---|---|
| Gather | Haiku 5.5, $0.10 / $0.50 | built-in Explore for file hunting |
| Build | Sonnet 5.5, $2 / $10 | mimir, tyr, thor, ull, aegir, saga, volva |
| Judge | Opus 5.5, $4 / $20 | vidar, baldur |

Before, with no `model:` set, every agent would have run on the session's model. A session on Opus would have paid Opus rates for all 31. After, seven of nine agents default to Sonnet, and the two that read a lot but write little (the architect and the reviewer) are the only ones on Opus.

The other cost change is behavioral. The old instructions required delegation and full pipelines on every task. The new `AGENTS.md` and playbook say to work inline for small tasks and to skip pipeline steps that do not apply.

## Format compatibility

| Surface | Claude Code | VS Code Copilot |
|---|---|---|
| Agents | plugin `agents/*.md` (installed once, every project) | `.github/agents/*.agent.md` or `~/.copilot/agents/*.agent.md`, generated by the sync script |
| Shared instructions | `CLAUDE.md` → `@AGENTS.md` | `AGENTS.md` directly, plus `.github/copilot-instructions.md` |
| Stack rules | `.claude/rules/dotnet.md` (`paths:`) | `.github/instructions/dotnet.instructions.md` (`applyTo:`) |
| Skills | `/aesir:playbook`, `/aesir:setup` | not available; the playbook content is in `AGENTS.md` in short form |

Claude Code never reads `.github/agents`, and Copilot's `.agent.md` files are never written into `.claude/agents`, so neither tool sees an agent twice.

## Not verified in this pass

- Behavior of the generated `.agent.md` files inside VS Code's agent picker. The format follows the published reference; open a project in VS Code after running `/aesir:setup --user` and confirm nine Aesir agents appear once.
- Agent `memory` (persistent notes per agent). Left off in v1 because it force-enables write tools and plugin-scoped memory paths are untested on Windows.
