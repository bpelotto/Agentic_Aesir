# Working agreements

This project uses the Aesir team, a Claude Code plugin (`aesir`) with nine specialist subagents on cost tiers. The main session is the orchestrator: it does small work itself and delegates when a task benefits from a fresh context, parallel fan-out, or a tool boundary.

## How we work

- Read before you write. Match the existing patterns, naming, and structure.
- Small, complete, verified changes. Run the build and the relevant tests before reporting; say plainly when you could not.
- Never invent an API, flag, path, or result. Check the code or the docs.
- Secrets and environment values come from configuration or a secret store, never from source files.
- Behavior changes come with tests. Bug fixes come with a test that failed first.
- Cite sources for facts from outside the repository.
- Report faithfully: what changed, what you ran, what failed, what you skipped.

## Coding standards (any language)

- Names say what things are. Functions do one thing. Files stay focused.
- Validate at trust boundaries (user input, network, files); trust inside.
- Handle failures where they can be handled; otherwise fail loudly with context. No swallowed exceptions.
- Structured logging with enough context to debug. No secrets or personal data in logs.
- Prefer the platform's built-ins over a new dependency unless the dependency earns its place.
- Leave no placeholders, commented-out code, or TODOs without an issue reference.
- Stack conventions live in `.claude/rules/` (Claude Code) and `.github/instructions/` (Copilot) and load only when matching files are touched.

## Cost policy

- Do it inline when it is a handful of tool calls or you already hold the context.
- Delegate when the work is parallel, needs isolation from the current context, or would fill the context with reading.
- Model tiers: Haiku-class to gather and summarize, Sonnet to build and test, Opus to design and review. Each subagent carries a default; override per call only with a reason.
- Start a new session for a new phase of work rather than extending one indefinitely.
- Do not run a full pipeline on a small change. Skip the steps that do not apply.

## The team

| Agent | Use for | Model |
|---|---|---|
| mimir | research, comparisons, digests, dependency advisories | sonnet |
| tyr | PRDs, user stories, acceptance criteria | sonnet |
| vidar | architecture, API design, ADRs, risk | opus |
| thor | implementation in any layer | sonnet |
| ull | test strategy and test code at every level | sonnet |
| baldur | code and security review, no edits | opus |
| aegir | infrastructure, CI/CD, releases | sonnet |
| saga | docs, posts, release notes, editing | sonnet |
| volva | prompts, agents, model choice, evals | sonnet |

Mention an agent by name, or describe the task and let the session route it. `/aesir:playbook` explains the pipelines and tiers.

## Pipelines (skip what does not apply)

- Feature: tyr (spec) → vidar (design, only if structure changes) → thor (build) → ull (tests) → baldur (review)
- Bug fix: thor (failing test first, then fix) → baldur (if the fix touches auth, data, money, or concurrency)
- Content: mimir (facts) → saga (write and edit)
- New project: tyr → vidar → aegir (environment and pipeline) → thor
