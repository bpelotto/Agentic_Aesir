# Aesir Quickstart, Level 3: Senior Engineer

> Skill level: senior engineer. You know context windows, subagent economics, and prompt design. This guide covers design rationale, context accounting, tuning, versioning, and limits. It skips the basics.

## What this is

Aesir is a Claude Code plugin named `aesir`, hosted in the GitHub repo `bpelotto/Agentic_Aesir`, which is also its own marketplace, named `agentic-aesir`. It ships nine subagents in Claude Code format, two skills (`/aesir:playbook` and `/aesir:setup`), and a script that converts the agents to GitHub Copilot's format. There is no runtime and no code path. Everything is markdown, JSON, and one Node script.

Install on any machine:

```bash
/plugin marketplace add bpelotto/Agentic_Aesir
```

```bash
/plugin install aesir@agentic-aesir
```

Choose user scope. The one-liner is `/plugin install aesir --marketplace bpelotto/Agentic_Aesir`.

## Why 31 became 9

The previous design was a 31-agent roster written for Copilot. `docs/AUDIT.md` has the full findings and the mapping from each old agent to its replacement. The reasons that matter:

**Overlap.** Four agents gated shipping. Ull and Modi shared templates and differed by one line. Three agents owned the backlog with three sizing scales. Changelogs had three owners. Overlapping descriptions make routing inconsistent: the router sees several plausible matches and picks differently on different days. Merging by capability rather than by job title fixed that. Security review is not a separate agent because it belongs in every review, so it lives in baldur.

**Three orchestrators that cannot work.** Odin, Sigurd, and Var all held the tool to call other agents. In Claude Code, subagents cannot spawn subagents. Those designs were not suboptimal, they were inoperable. The fix is structural: the main session is the orchestrator, plan mode does the task breakdown, and every agent is a leaf. Odin's method moved into `/aesir:playbook`, which loads only when invoked.

**Description tax.** Every agent description is loaded into the main session on every turn. The old 31 descriptions came to about 13,500 characters. The new nine come to about 2,250. That difference is paid on every turn of every session, whether or not an agent is ever called.

**Boilerplate and forced cost.** About 18% of body text was persona. The roster appeared in three files. Instructions like "always delegate" and a mandatory nine-step pipeline meant a one-line change could trigger five or more subagent calls. The replacements say when to skip steps.

**No tiers.** No old agent set a model. Under Claude Code every subagent would have inherited the main model, including for social posts and changelogs.

The cost of consolidating is that thor is now a generalist across layers. Stack knowledge moved out of the agent and into path-scoped rules files, which load only when relevant files are touched.

## Context accounting

What loads when, with rough sizes. Token figures assume about four characters per token, so treat them as estimates.

| Item | Loads | Approx. size | Approx. tokens |
|---|---|---|---|
| 9 agent descriptions | Main session, every turn | about 2,250 chars total | about 560 |
| `/aesir:playbook` description | Main session, every turn | about 250 chars | about 60 |
| `/aesir:setup` description | Never (`disable-model-invocation: true`) | not in context | 0 |
| An agent body | Only when that agent is invoked, in the subagent's context | 1.6 to 2.2 KB | about 400 to 550 |
| `/aesir:playbook` body | Only when invoked | about 4.5 KB | about 1,100 |
| `AGENTS.md` (project template) | Via `@AGENTS.md` in `CLAUDE.md`, at session start | about 3.3 KB | about 800 |
| `~/.claude/rules/aesir.md` | User baseline, at session start | about 1.3 KB | about 330 |
| `.claude/rules/dotnet.md` | Only when a matching file is touched (`paths:`) | about 1.8 KB | about 450 |

Two things follow.

First, the standing cost is the descriptions plus your instruction files, not the agents. Adding a tenth agent costs one description (about 60 tokens) per turn. A long body costs nothing until that agent runs. So description length is the budget to watch, and body length matters per invocation.

Second, the project `AGENTS.md` and the user-level `aesir.md` overlap on the working agreements and cost policy. If you use both, you pay for both. The user-level file is the baseline for projects that have no `AGENTS.md`. If your projects all carry `AGENTS.md`, you can drop `~/.claude/rules/aesir.md`.

## Effort and model tuning

Each agent file sets a default model and, where it saves cost, an effort level. The available effort levels are low, medium, high, xhigh, and max. The agents set only three:

| Agent | Model | Effort | Rationale |
|---|---|---|---|
| vidar | opus | high | Wrong architecture is the most expensive error to unwind |
| baldur | opus | high | The reviewer is the check on everyone else |
| mimir | sonnet | medium | Needs source judgment, bounded by an explicit stop rule |
| saga | sonnet | low | Routine editing and drafting |
| thor, ull, tyr, aegir, volva | sonnet | not set | The session's default applies |

Prices are Anthropic list prices per million tokens, in and out, as of October 2026: haiku $0.10 / $0.50, sonnet $2 / $10, opus $4 / $20. Haiku pricing rises 5x above 100K prompt tokens, so it is a poor fit for large-context gathering. Check current pricing before you use these in a budget.

To override per call, say so in the request. For example, ask for thor on opus for a hard concurrency bug, or for baldur on a trivial diff where sonnet would do. Do not change the default for a single hard task. The playbook is explicit: raise per call, not in the file. If a default is wrong for a whole project, override the agent for that project (below).

Measure cost per completed task. A sonnet agent that needs two redo passes can cost more than one opus pass. A review that catches a defect before merge is cheap against the cost of the defect.

## When a subagent costs more than inline work

A subagent is not free. It starts with no conversation context, so it re-reads the files you already read, and its summary has to carry back whatever you need to continue. Run inline when:

- the change is a handful of tool calls,
- you already hold the files and the decisions in context,
- you are iterating with the user and they want to see each step.

Delegate when work fans out (review five modules, research three options), when reading would flood your context, when you want an independent read (a review of your own change), or when you need a tool boundary (baldur cannot edit; that is the point).

Serial handoffs are the usual hidden cost. A chain of tyr, thor, ull, baldur pays the cold-start read four times and passes results through summaries. Run the chain when each step earns it. For a small fix, thor alone, then baldur only if the fix touches auth, data, money, or concurrency.

### Writing a brief that works

A subagent sees only the prompt it is given plus its own file and the project instructions. A good brief carries four things:

1. The goal, in one sentence, and why it matters.
2. Constraints: what must not change, interfaces to preserve, the style to match.
3. Pointers: file paths, the spec path, the diff range. Pass paths, not pasted content, when the agent can read them.
4. What done looks like, including the commands to run.

Compare:

```text
Ask thor to fix the login bug.
```

with:

```text
Ask thor to fix the failure in tests/Auth/LoginTests.cs::Login_ExpiredToken_Returns401.
Expected 401, got 500. Suspect src/Auth/TokenValidator.cs. Do not change the public
interface. Write the failing test first if it does not reproduce, then fix, then run
dotnet test and report the counts.
```

The second needs no follow-up and no re-discovery.

## Parallel vs chained

Run steps in parallel when they are independent and neither needs the other's output. Examples: baldur reviewing the backend module while mimir checks a dependency advisory; three mimir calls each comparing one library; ull writing tests for one module while saga drafts docs for another.

Chain steps only when one needs the previous output, and pass that output in the brief. tyr's spec path goes into thor's brief. thor's changed-file list goes into baldur's brief. Do not chain for ceremony. The pipelines in the playbook are menus, and most tasks use one or two steps.

Parallel writes to the same files conflict. If two agents may edit the same area, serialize them or isolate one in a worktree.

## Tool grants as behavior constraints

Each agent's `tools` line is both access control and a statement of what the agent is for. The grants in this repo:

| Agent | Tools | What the grant says |
|---|---|---|
| thor | Read, Edit, Write, Bash, Grep, Glob | Builds and runs the build and tests |
| ull | Read, Edit, Write, Bash, Grep, Glob | Writes tests and runs them |
| baldur | Read, Grep, Glob, Bash (Edit, Write denied) | Reads diffs and runs tests, never fixes |
| aegir | Read, Edit, Write, Bash, Grep, Glob, WebSearch | Edits infra and validates it locally |
| vidar | Read, Grep, Glob, Write, WebSearch | Writes ADRs and design docs, no code execution |
| tyr | Read, Grep, Glob, Write | Writes specs, no web, no shell |
| mimir | Read, Grep, Glob, WebSearch, WebFetch | Reads and browses, writes nothing |
| saga | Read, Write, Edit, Grep, Glob, WebSearch | Edits docs in place |
| volva | Read, Grep, Glob, Write, WebSearch | Writes design docs, checks provider docs |

The rule used here: if an agent's output promises something runnable, it has `Bash`. The old roster broke that rule, with agents promising compilable code and no way to compile it. Note that baldur keeps `Bash` for `git diff` and test runs, so the denial of `Edit` and `Write` blocks file edits through the editor tools, not every possible side effect of a shell. Treat it as a strong behavioral boundary, and use permission settings if you need a hard one.

## Override and extend

Per project, put a file at `.claude/agents/<name>.md` with the same `name`. It replaces the plugin's agent in that project. Copy the plugin's version and edit it:

```bash
mkdir -p .claude/agents
```

```bash
cp <path-to-clone>/agents/baldur.md .claude/agents/baldur.md
```

A new agent goes in `.claude/agents/` for one project or `~/.claude/agents/` for all projects. The contract:

- Frontmatter: `name`, `description`, `tools`, `model`. Add `effort` only where it saves cost.
- The description stays under 250 characters and says both when to use the agent and when not to. All nine shipped descriptions are between 234 and 248 characters.
- Body under 60 lines: role, how to work, output shape, two or three constraints with reasons.
- No persona paragraph, no roster, no lists of what other agents do. The router and `AGENTS.md` handle that.
- Grant only the tools the role needs, and match the promises to the tools. An agent that promises to run tests needs `Bash`. A reviewer that must not edit gets `disallowedTools: Edit, Write`.

Shared rules belong in `AGENTS.md` for a project or `~/.claude/rules/` for all projects. Do not repeat them in agent bodies.

## AGENTS.md as the shared contract

`/aesir:setup` writes `AGENTS.md` and a `CLAUDE.md` whose first line is `@AGENTS.md`. Claude Code expands that import, so it reads the shared file. GitHub Copilot reads `AGENTS.md` directly. One file, two tools, no drift.

Claude-only content goes below the import in `CLAUDE.md`. Personal overrides go in `CLAUDE.local.md`, which setup adds to `.gitignore`. Stack conventions go in `.claude/rules/` for Claude Code and `.github/instructions/` for Copilot, each scoped to matching files so they cost nothing elsewhere. The two copies of the .NET conventions use different scoping syntax (`paths:` and `applyTo:`) and must be kept in step by hand.

If a project already has a `CLAUDE.md` with real content, setup offers to move the shared parts into `AGENTS.md` instead of overwriting.

## Copilot format mapping

VS Code Copilot reads Copilot-format `.agent.md` files from `.github/agents/` (project) or `~/.copilot/agents/` (user). `scripts/sync-copilot-agents.mjs` generates them from the Claude-format files. It is zero-dependency and needs Node 18 or later.

| Claude Code agent field | Copilot output |
|---|---|
| `name` | `name` |
| `description` | `description` (quoted string) |
| `tools: Read` | `read` |
| `tools: Edit, Write` | `edit` |
| `tools: Grep, Glob` | `search` |
| `tools: Bash` | `execute` |
| `tools: WebSearch, WebFetch` | `web` |
| `effort` | `reasoning-effort` |
| `tools: Bash(git:*)` (scoped) | `execute` |

The `model` field and `disallowedTools` are not carried over (Copilot model names differ by vendor, and a deny list cannot be expressed). Tools with no Copilot equivalent, such as MCP tools, are dropped with a warning. Duplicate aliases are collapsed, line endings are normalized to LF, and the agent body is copied unchanged.

Run it through the skill so it handles prompts and diffs:

```bash
/aesir:setup --copilot
```

Or directly, from a clone, with a dry run first:

```bash
node scripts/sync-copilot-agents.mjs --target project . --prune --dry-run
```

`--target user` writes to `~/.copilot/agents`. `--prune` deletes `.agent.md` files in the target that are not in the current roster, which clears out stale files from earlier versions.

Never copy the agents into `.claude/agents` for Copilot's sake. Claude Code would load both the plugin's agents and the copies.

## Updates and versioning

`plugin.json` pins no version. Updates therefore track commits on the repo. To pull them on a normal machine:

```bash
/plugin marketplace update agentic-aesir
```

```bash
/plugin update aesir@agentic-aesir
```

The marketplace entry uses `"source": "./"`, so the plugin is the repo root.

On a developer machine with a local clone, register the clone as the marketplace instead:

```bash
claude plugin marketplace add <path-to-clone>
```

```bash
claude plugin install aesir@agentic-aesir
```

Edits to agents and skills then take effect in a running session after:

```bash
/reload-plugins
```

The tradeoff of no pinned version: you cannot hold a team to a known release by version number. If you need reproducibility across a team, host your own fork as the marketplace and update it on your schedule. Agent prompt changes alter behavior, so treat updates like dependency bumps: read the diff of `agents/` and the rules templates before you update a shared machine or a CI image.

A practical check after any update is to ask baldur and thor each for a small, known task on a scratch branch, and compare the output shape against what you expect. The agents' output formats are part of their contracts: baldur's severity-ranked review, thor's file-by-file report with commands run, tyr's spec path plus open questions.

## Known limitations

- **No nested subagents.** Every agent is a leaf. The main session drives all pipelines. Do not write an agent that expects to delegate.
- **Partial frontmatter support in VS Code.** VS Code's support for Claude-format agents reads only a subset of the frontmatter fields. That is why the Copilot files are generated rather than shared.
- **No agent memory in v1.** Agents do not carry learnings between runs. Persistent knowledge goes in `AGENTS.md`, rules files, or specs and ADRs in the repo.
- **Subagents start cold.** They have no conversation context. Briefs must be self-contained, or the agent will re-derive what you already know.
- **Plugin agents ignore some fields.** `permissionMode` and `hooks` in a plugin agent's frontmatter are ignored, so the plugin's agents cannot rely on them.
- **Haiku pricing steps up.** Haiku rises 5x above 100K prompt tokens, which weakens it for large-context gathering.
- **Prices go stale.** The numbers here are list prices as of October 2026. volva's prompt tells it to check current pricing at the source.
- **Rules templates cover .NET only.** Other stacks need a rules file you write yourself.
- **Rules are advisory.** `AGENTS.md` and rules files shape behavior but do not enforce it. If something must never happen, back it with a permission setting or a CI check.

## What is next

- Read `docs/AUDIT.md` for the evidence behind the consolidation and the old-to-new agent map.
- Read `skills/playbook/SKILL.md`. It is the shortest accurate description of intended use.
- Override baldur or thor in one project, and measure whether the change helps on real tasks.
- Add a rules file for your stack and check that it loads only for matching files.
- Read `scripts/sync-copilot-agents.mjs` before changing the Copilot mapping. The tool alias table is at the top.
