# Agentic Aesir

A lean, Norse-named specialist team for Claude Code, packaged as a plugin. Nine subagents on cost tiers, a playbook that says when to use them, and a setup skill that scaffolds any project in one command. It also generates GitHub Copilot agents from the same source, so one roster serves both tools.

Install it once per machine and every project gets the team. No framework, no runtime, no dependencies: agents are Markdown files with frontmatter.

## Install

In Claude Code (desktop app, CLI, or VS Code extension):

```bash
/plugin install aesir --marketplace bpelotto/Agentic_Aesir
```

Choose **user** scope when asked so the team is available in every project. Then, once per machine:

```bash
/aesir:setup --user
```

This writes the baseline working agreements to `~/.claude/rules/` and syncs the Copilot agents to `~/.copilot/agents/` (after showing you what it will change).

To update later:

```bash
/plugin marketplace update agentic-aesir
```

```bash
/plugin update aesir@agentic-aesir
```

Developing the plugin itself? Register your clone as a local marketplace and edits take effect after `/reload-plugins`:

```bash
claude plugin marketplace add D:/path/to/Agentic_Aesir
```

```bash
claude plugin install aesir@agentic-aesir
```

## Use

Describe the task and let Claude route it, or name the agent:

```
Use baldur to review the diff on this branch.
```

```
Have mimir compare Postgres and Cosmos DB for an append-heavy event log.
```

In a project, run `/aesir:setup` once to add `AGENTS.md` (shared working agreements, read by Claude Code and Copilot), `CLAUDE.md` (imports it), and a path-scoped .NET rules file if the project is .NET. Run `/aesir:playbook` whenever you want the full picture: when to delegate, what each tier costs, and the standard pipelines.

## The team

| Agent | Use for | Model | Writes |
|---|---|---|---|
| mimir | research, technology comparisons, digests, dependency advisories | sonnet | nothing |
| tyr | PRDs, user stories, acceptance criteria | sonnet | `docs/specs/` |
| vidar | architecture, API contracts, ADRs, risk | opus | `docs/adr/` |
| thor | implementation in any layer, bug fixes | sonnet | code |
| ull | test strategy and tests at every level | sonnet | tests |
| baldur | code and security review | opus | nothing (edit tools denied) |
| aegir | infrastructure, containers, CI/CD, releases | sonnet | infra, workflows |
| saga | docs, blog posts, release notes, editing | sonnet | docs, content |
| volva | prompts, agent design, model choice, evals | sonnet | `docs/ai/` |

There is no Odin file. The main Claude session is the orchestrator: it reads the agent descriptions, routes work, and uses plan mode for task breakdown. Subagents start with a fresh context, so the session passes each one a self-contained brief.

## Cost policy, in short

- Do small things inline. Delegate for fan-out, isolation, or a fresh context.
- Haiku-class to gather, Sonnet to build, Opus to design and review. Each agent carries a default; override per call only with a reason.
- Skip pipeline steps that do not apply. A one-line fix does not need a spec, an ADR, and a review.
- Only agent descriptions are loaded every turn. Bodies load on invocation, rules load on matching paths, skills load when called.

## Copilot

VS Code Copilot reads Copilot-format agents from `.github/agents/` (project) or `~/.copilot/agents/` (user). The plugin generates them from the Claude-format source:

```bash
node scripts/sync-copilot-agents.mjs --target user --prune --dry-run
```

`/aesir:setup --user` runs this for you. `/aesir:setup --copilot` writes a project-level mirror plus `.github/copilot-instructions.md` and the `.instructions.md` twin of the rules file. Copilot reads `AGENTS.md` directly, so the working agreements are shared without duplication.

## Layout

```
.claude-plugin/        plugin.json and marketplace.json
agents/                nine agents (Claude Code subagent format)
skills/playbook/       /aesir:playbook
skills/setup/          /aesir:setup and the templates it writes
scripts/               sync-copilot-agents.mjs
docs/                  AUDIT.md and three quickstart guides
AGENTS.md, CLAUDE.md   this repo uses its own template
```

## Extending

- Override an agent for one project: copy `agents/<name>.md` to `.claude/agents/<name>.md` and edit. Same `name` wins over the plugin's copy.
- Add an agent: one file, frontmatter `name`, `description` (under 250 characters, say when and when not), `tools`, `model`; body under 60 lines. Every description is loaded into every session, so keep the roster lean.
- Add a stack: a `.claude/rules/<stack>.md` with `paths:` globs, plus an `.instructions.md` twin with `applyTo:` for Copilot.

## Learn more

- [docs/quickstart-level-1-beginner.md](docs/quickstart-level-1-beginner.md): never used an AI agent before
- [docs/quickstart-level-2-mid-level.md](docs/quickstart-level-2-mid-level.md): daily Copilot or Claude user, new to multi-agent work
- [docs/quickstart-level-3-senior-engineer.md](docs/quickstart-level-3-senior-engineer.md): context accounting, cost tuning, limitations
- [docs/AUDIT.md](docs/AUDIT.md): why 31 agents became 9, where each one went, and the cost model

## Why this exists

A personal learning project and portfolio: learn agentic AI by building with it, prototype real tools, and write about the journey. Ideas, agent definitions, and workflow patterns are welcome as discussions or pull requests.

## License

[MIT](LICENSE)
