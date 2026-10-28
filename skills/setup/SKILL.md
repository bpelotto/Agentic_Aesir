---
name: setup
description: Scaffold or refresh the Aesir setup. Project mode writes AGENTS.md, CLAUDE.md, and stack rules. --user writes baseline rules to ~/.claude/rules and syncs Copilot agents to ~/.copilot/agents. --copilot syncs Copilot files into this project.
disable-model-invocation: true
allowed-tools: Read, Write, Edit, Glob, Grep, Bash(node *), Bash(ls *), Bash(mkdir *), Bash(diff *)
argument-hint: "[--user] [--copilot] [--dry-run]"
---

# /aesir:setup

Templates live in `${CLAUDE_PLUGIN_ROOT}/skills/setup/templates/`. The Copilot sync script is `${CLAUDE_PLUGIN_ROOT}/scripts/sync-copilot-agents.mjs`. Arguments given: `$ARGUMENTS`.

Rules for every mode:
- Never overwrite a file that exists. If a target exists and differs from the template, show a short diff and ask whether to replace, merge, or skip.
- Say what you wrote, what you skipped, and what the user still has to do.
- `--dry-run` prints the plan and changes nothing.

## Project mode (no flags)

1. Detect the stack: `*.csproj` or `*.sln` anywhere in the project means .NET. For other stacks there is no rules template yet; say so.
2. Write `AGENTS.md` from `templates/AGENTS.md` if absent. If the project has a `CLAUDE.md` with real content and no `AGENTS.md`, offer to move the shared parts into `AGENTS.md` and leave `CLAUDE.md` as `@AGENTS.md` plus Claude-only notes.
3. Write `CLAUDE.md` from `templates/CLAUDE.md` if absent. If a `CLAUDE.md` exists without an `@AGENTS.md` line, offer to add it at the top.
4. .NET detected: write `.claude/rules/dotnet.md` from `templates/rules/dotnet.md` if absent.
5. Ensure `.gitignore` contains `CLAUDE.local.md`.
6. Report. Suggest `--copilot` if the project has a `.github/` folder or the user mentioned Copilot.

## --user

Run once per machine. Makes the baseline available in every project with no project files.

1. Write `~/.claude/rules/aesir.md` from `templates/rules/aesir.md` and `~/.claude/rules/dotnet.md` from `templates/rules/dotnet.md`. Skip identical existing files; diff otherwise.
2. Preview the Copilot user-agent sync:

   ```
   node "${CLAUDE_PLUGIN_ROOT}/scripts/sync-copilot-agents.mjs" --target user --prune --dry-run
   ```

   Show the user the files it will write and the files it will delete (stale `.agent.md` files from earlier Aesir versions). On confirmation, run the same command without `--dry-run`.
3. If `~/.copilot/instructions/agent-roster.instructions.md` exists, it is the old roster; offer to delete it.
4. Report.

## --copilot

For this project's `.github/` folder, so teammates on Copilot get the same team.

1. Preview if `.github/agents/` already has files, then sync:

   ```
   node "${CLAUDE_PLUGIN_ROOT}/scripts/sync-copilot-agents.mjs" --target project . --prune
   ```

2. Write `.github/copilot-instructions.md` from `templates/copilot-instructions.md` if absent.
3. .NET detected: write `.github/instructions/dotnet.instructions.md` from `templates/instructions/dotnet.instructions.md` if absent.
4. Report.
