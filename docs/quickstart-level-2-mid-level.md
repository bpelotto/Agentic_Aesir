# Aesir Quickstart, Level 2: Mid-Level Engineer

> Skill level: mid-level engineer. You write code daily and have used Claude Code or another AI assistant. You have not run a multi-agent workflow before.

## What you will do

You will install the Aesir plugin, scaffold a real project with `/aesir:setup`, and run a feature through the pipeline tyr, thor, ull, baldur. You will also learn why each agent runs on the model it does, how to override an agent for one project, how to add rules for another stack, and how to sync the team to GitHub Copilot.

## The mental model

Three ideas cover most of it.

**The main session is the orchestrator.** There is no coordinator agent. The Claude Code session you are typing into decides what to do inline and what to delegate. Plan mode does task breakdown. Subagents cannot spawn other subagents, so the main session is the only place a pipeline can be driven from.

**Agents are fresh-context specialists.** A subagent starts with an empty conversation. It gets its own prompt (the agent file), the brief you or the main session writes, and the project instructions. It does the work, then returns one summary. The long file reads and test output stay in its context, not yours.

**Descriptions are the routing index.** Only each agent's `description` line sits in the main session's context on every turn. The agent body loads only when that agent is invoked. Claude Code picks an agent by matching your request against those descriptions, which is why each one says when to use the agent and when not to. You can always bypass routing by naming the agent, as in `aesir:thor`.

## Install

If you have not installed the plugin yet, run these in Claude Code:

```bash
/plugin marketplace add bpelotto/Agentic_Aesir
```

```bash
/plugin install aesir@agentic-aesir
```

Choose user scope so every project gets the team. The one-liner form is:

```bash
/plugin install aesir --marketplace bpelotto/Agentic_Aesir
```

To pick up later changes:

```bash
/plugin marketplace update agentic-aesir
```

```bash
/plugin update aesir@agentic-aesir
```

Then run the per-machine setup once:

```bash
/aesir:setup --user
```

It writes `~/.claude/rules/aesir.md` (the baseline working agreements and cost policy) and `~/.claude/rules/dotnet.md` (the .NET conventions, loaded only when you touch .NET files). It also previews the Copilot sync into `~/.copilot/agents` and asks before it writes or deletes anything.

## Scaffold a real project

Open a real repository in Claude Code and run:

```bash
/aesir:setup
```

With no flags, this is project mode. It detects the stack (a `*.csproj` or `*.sln` anywhere means .NET), then writes whichever of these files do not already exist:

| File | What it does |
|---|---|
| `AGENTS.md` | The shared contract: how we work, coding standards, cost policy, the team table, the pipelines. Read by Claude Code through `CLAUDE.md` and read directly by GitHub Copilot. |
| `CLAUDE.md` | Contains `@AGENTS.md` on its first line, which imports the shared file, plus a few Claude-only notes. Put personal or Claude-specific additions here. |
| `.claude/rules/dotnet.md` | Written only for .NET projects. Has a `paths:` list in its frontmatter, so it loads only when a matching file (`.cs`, `.csproj`, `.sln`, `.razor`, `.bicep`) is touched. |
| `.gitignore` entry | Makes sure `CLAUDE.local.md` is ignored, so personal overrides stay out of git. |

The skill never overwrites an existing file silently. If you already have a `CLAUDE.md` with content, it offers to move the shared parts into `AGENTS.md` and leave `CLAUDE.md` as the import plus your Claude-only notes. Add `--dry-run` first if you want to see the plan with no changes:

```bash
/aesir:setup --dry-run
```

Commit `AGENTS.md`, `CLAUDE.md`, and the rules file. Teammates who have the plugin get the same behavior from a plain `git pull`.

## A worked feature flow

The pipeline for a feature is tyr, then vidar (only if structure changes), then thor, ull, baldur. This example skips vidar because the change fits the existing design. The prompts and responses below are illustrative. Your output will differ in detail.

**1. Spec with tyr.**

```text
Ask tyr to write a spec for rate limiting on the public search endpoint: 60 requests per minute per API key, clear error when exceeded.
```

Illustrative response:

```text
Wrote docs/specs/search-rate-limit.md.
Open questions:
1. Should unauthenticated requests share one bucket, or be rejected?
Assumption stated in the spec: rejected with 401 (existing behavior).
```

tyr read the repo first, wrote Problem, Users, Goals, Non-goals, and user stories with Given/When/Then acceptance criteria, and replied with the path and the open questions only. Answer the open question in the chat, or edit the spec.

**2. Build with thor.**

```text
Ask thor to implement docs/specs/search-rate-limit.md. The limiter should follow the existing middleware pattern. Run the build and the existing tests.
```

Illustrative response:

```text
Changed: src/Api/Middleware/RateLimitMiddleware.cs (new), src/Api/Program.cs (registered it),
appsettings.json (limit as config).
Ran: dotnet build (ok), dotnet test (41 passed).
Assumption: the API key is read from the X-Api-Key header.
```

Note that you pointed at the spec path. thor has no memory of the tyr step, so the path is how the context crosses the gap.

**3. Test with ull.**

```text
Ask ull to cover the acceptance criteria in docs/specs/search-rate-limit.md for the new middleware. Do not change production code.
```

Illustrative response:

```text
Added tests/Api.Tests/RateLimitMiddlewareTests.cs: under limit, at limit, over limit
returns 429 with Retry-After, separate buckets per key.
Ran: dotnet test (45 passed, 0 failed).
Not covered: clock skew across instances (needs a shared store).
```

If a test had failed, ull would report it and stop. That is a finding for thor, not something ull patches.

**4. Review with baldur.**

```text
Ask baldur to review the uncommitted changes, with attention to security.
```

Illustrative response:

```text
## Review: uncommitted changes
Summary: Sound design. One blocker.
### Blockers
- RateLimitMiddleware.cs:38 - bucket key is logged in full - leaks API keys to logs - log a hash prefix (CWE-532)
### Should fix
- Limit is read once at startup; changes need a restart.
### Done well
- Tests exercise the 429 path and the Retry-After header.
```

Then close the loop:

```text
Ask thor to fix the blocker baldur found: log a hash prefix of the key instead of the full key.
```

For a change this size you could also skip tyr and say "add rate limiting to search" straight to thor. The playbook says to skip any step that does not apply. Most work is one or two steps.

Other pipelines from the playbook:

- Bug fix: thor (failing test first) then baldur if the fix touches auth, data, money, or concurrency.
- Content: mimir then saga.
- New project: tyr, vidar, aegir, thor.
- Dependency or security scare: mimir (advisory facts), baldur (exposure in your code), thor (fix).

## Model tiers and why

Each agent file sets a default model. Prices are Anthropic list prices per million tokens, input and output, as of October 2026. Check current pricing before you quote them.

| Tier | Model | Price in / out | Agents |
|---|---|---|---|
| Gather | haiku | $0.10 / $0.50 | The built-in Explore agent, for file hunting and summaries |
| Build | sonnet | $2 / $10 | mimir, tyr, thor, ull, aegir, saga, volva |
| Judge | opus | $4 / $20 | vidar, baldur |

The reasoning:

- **vidar is opus with high effort** because a design decision is expensive to reverse. A wrong boundary costs far more than the tokens to get it right.
- **baldur is opus with high effort** because a review exists to catch what the author missed. A weaker reviewer misses more, and the review is a small share of total cost.
- **thor, ull, tyr, aegir, volva are sonnet** because the work is well specified once the design is set. Sonnet is the right default for building.
- **mimir is sonnet with medium effort.** Research needs good source judgment but has a stop rule built in: answer first, stop when you have it.
- **saga is sonnet with low effort.** Writing and editing in place is routine work that does not benefit from deep reasoning.

Judge cost per completed task, not per call. A cheaper agent that needs a redo is not cheaper. You can override the model for one call when a task is genuinely hard, for example by asking for opus on a tricky thor task. Do not raise the default.

## Override an agent for one project

A project-level agent with the same `name` takes precedence over the plugin's copy. To change how thor works in one repo, copy the plugin's file and edit it. The plugin's agent files live in its `agents` folder. In a local clone of this repo that is `agents/thor.md`.

```bash
mkdir -p .claude/agents
```

```bash
cp <path-to-clone>/agents/thor.md .claude/agents/thor.md
```

Edit the copy. Keep `name: thor` unchanged. Typical edits: tighten the `tools:` list, change `model:`, or add a line to the body such as "Run `make verify` instead of the default build". Commit the file so the team shares it. Keep it small. The plugin's body is under 60 lines for a reason: every agent prompt you add is context you pay for on each invocation.

## Add rules for another stack

The `/aesir:setup` skill has a rules template for .NET only. For other stacks it says so and writes nothing. Add your own. A rules file is a markdown file in `.claude/rules/` with a `paths:` list in the frontmatter:

```markdown
---
paths:
  - "**/*.py"
  - "**/pyproject.toml"
---

# Python conventions

- Python 3.12, type hints on public functions.
- pytest, one test file per module, `test_<behavior>` names.
- Dependencies in pyproject.toml; no unpinned installs.
```

Save it as `.claude/rules/python.md`. It loads only when Claude Code touches a matching file, so it costs nothing in sessions that never open Python. Put universal rules in `AGENTS.md` instead. Put stack rules in a path-scoped file. Use `~/.claude/rules/` for rules you want in every project on your machine.

## Sync to GitHub Copilot

Claude Code and Copilot read different agent formats. The plugin ships the Claude format and generates the Copilot one. To give a project's teammates the team in Copilot, run this in Claude Code from the project root:

```bash
/aesir:setup --copilot
```

It runs the sync script into `.github/agents/` with pruning of stale files, writes `.github/copilot-instructions.md` if absent, and for .NET projects writes `.github/instructions/dotnet.instructions.md`. Copilot also reads `AGENTS.md`, so the shared contract is already in place.

Do not copy the agents into `.claude/agents` for Copilot's sake. Claude Code would then load both the plugin's agents and the copies.

For your own machine, `/aesir:setup --user` does the same into `~/.copilot/agents`. If you have a clone of this repo, you can run the script directly from its root. Dry-run first:

```bash
node scripts/sync-copilot-agents.mjs --target project . --dry-run
```

## What is next

- Run `/aesir:playbook` and read the delegation rules once. It is short.
- Read the agent files in `agents/`. Each is under 50 lines, and the description is the part that matters most.
- Override one agent in a project where your conventions differ, and notice what you had to change.
- When you want the design reasoning, the context costs, and the known limits, read the Level 3 guide: `docs/quickstart-level-3-senior-engineer.md`.
