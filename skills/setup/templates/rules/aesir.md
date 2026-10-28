# Aesir baseline

The Aesir team (Claude Code plugin `aesir`) provides nine specialist subagents on cost tiers. The main session orchestrates. `/aesir:playbook` has the details; `/aesir:setup` scaffolds a project.

## How we work

- Read before you write. Match the existing patterns, naming, and structure.
- Small, complete, verified changes. Run the build and the relevant tests before reporting; say plainly when you could not.
- Never invent an API, flag, path, or result. Check the code or the docs.
- Secrets and environment values come from configuration or a secret store, never from source files.
- Behavior changes come with tests. Bug fixes come with a test that failed first.
- Report faithfully: what changed, what you ran, what failed, what you skipped.

## Cost policy

- Do it inline when it is a handful of tool calls or you already hold the context.
- Delegate when the work is parallel, needs isolation from the current context, or would fill the context with reading.
- Model tiers: Haiku-class to gather and summarize, Sonnet to build and test, Opus to design and review. Each subagent carries a default; override per call only with a reason.
- Start a new session for a new phase of work rather than extending one indefinitely.
- Do not run a full pipeline on a small change. Skip the steps that do not apply.
