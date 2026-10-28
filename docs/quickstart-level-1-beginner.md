# Aesir Quickstart, Level 1: Complete Beginner

> Skill level: complete beginner. You have never used an AI agent before. Start here.

## What you will do

You will install a plugin called Aesir into Claude Code. It gives you a team of nine helpers. Then you will ask three of them to build a small program, test it, and review it. The whole thing takes about fifteen minutes.

## What an agent is

An agent is a helper with one job. You give it a task in plain English. It reads your files, does the work, and tells you what it did. A coder agent writes code. A reviewer agent reads code and points out problems. Each one has its own instructions that keep it focused on its job.

Claude Code is the tool you talk to. It is the main assistant. When a task fits one of the specialists, Claude Code hands it off to that agent, which works on its own and sends back a summary. You can also ask for an agent by name. The agents in Aesir are named after Norse gods: thor builds, ull tests, baldur reviews.

## Prerequisites

- Claude Code installed, either the desktop app or the command line version.
- A Claude subscription or an Anthropic API key, signed in to Claude Code.
- A folder on your computer to practice in. An empty folder is fine.

You do not need any AI experience. You do need to be able to open a folder and type into a chat box.

## Step 1: Install the plugin

Claude Code installs plugins from a marketplace. This repository is its own marketplace. Open Claude Code in any folder and add it:

```bash
/plugin marketplace add bpelotto/Agentic_Aesir
```

Then install the plugin:

```bash
/plugin install aesir@agentic-aesir
```

Claude Code asks where to install it. Choose user scope. That makes the team available in every project on your machine.

If you prefer a single command, this does the same thing:

```bash
/plugin install aesir --marketplace bpelotto/Agentic_Aesir
```

You type these lines into the Claude Code chat box, not into a separate terminal. They start with a slash because they are Claude Code commands.

## Step 2: Run the one-time setup

Run this once per computer:

```bash
/aesir:setup --user
```

This writes two small instruction files into a `.claude/rules` folder in your home directory. They tell Claude Code how the team works, for example "run the tests before you say you are done". It also offers to copy the agents for GitHub Copilot. If you do not use Copilot, you can decline that part.

Claude Code shows you what it plans to write and what it skips. The command never overwrites a file that already exists without asking you first.

## Step 3: Open a practice folder

Open any folder in Claude Code. An empty folder is best for this guide. If you want to make one from a terminal, this works:

```bash
mkdir aesir-practice
```

Then open `aesir-practice` in Claude Code. If you have a project you care about, you can use it instead, but start with an empty folder the first time.

## Step 4: Ask thor to build something

Type this into the chat:

```text
Ask thor to write a small script called average.py. It takes numbers as command line arguments and prints their average. If no numbers are given, it prints a friendly error.
```

You can use any language you like. Python is only an example.

What happens:

1. Claude Code reads your request and sees that you named thor.
2. thor starts in a fresh, separate workspace. It knows nothing about your conversation except what Claude Code tells it.
3. thor looks at your folder, writes the script, and runs it to check that it works.
4. thor sends back a short report: what it changed, the commands it ran, and the results.

You should now see a new file in your folder. Open it and read it. You do not have to understand every line yet.

## Step 5: Ask ull to test it

Type:

```text
Ask ull to write tests for average.py and run them.
```

What happens:

1. ull reads `average.py` and any existing tests.
2. ull writes a test file that checks the normal case, the error case, and the edge most likely to break.
3. ull runs the tests and reports the real pass and fail counts.

If a test fails, that is useful. It means ull found a bug. ull reports the bug and stops. It does not change your program to hide the problem. That is deliberate: the tester and the builder are separate so one cannot quietly cover for the other.

## Step 6: Ask baldur to review it

Type:

```text
Ask baldur to review average.py and its tests.
```

What happens:

1. baldur reads the files. It is not given the tools to edit or create files, so it cannot change your code.
2. baldur checks for mistakes, security problems, and unclear code.
3. baldur sends back a list of findings grouped as blockers, things to fix, and small nits. It also names at least one thing done well.

If baldur lists a problem, you can type "Ask thor to fix the blockers baldur found." That is the loop you will use for real work: build, test, review, fix.

## The 3 agents to learn first

You have just used thor, ull, and baldur. The three to learn first are thor, baldur, and vidar. ull is easy to add once you know these.

**thor** is the builder. Use thor whenever you want code written or changed: a new feature, a bug fix, a script, a database change. thor reads the code around the change first and matches its style. It runs the build and tests before it reports, and it tells you honestly if it could not.

**baldur** is the reviewer. Use baldur after any code is written, by thor or by you. It checks correctness and security in one pass and returns findings ranked by severity. baldur makes no edits. That separation is the point: the one who checks the work is not the one who did it.

**vidar** is the architect. Use vidar before you build something big, when you need to decide how it should be structured or which technology to pick. vidar writes a short decision record into a `docs/adr` folder in your project and gives you one clear recommendation, not a list of maybes. For a tiny script you do not need vidar. For "should this be one service or two?" you do.

## The other six, in one line each

- mimir: researches a question on the web and gives you an answer with sources.
- tyr: turns a vague idea into a written spec with a checklist of what "done" means.
- ull: writes and runs tests.
- aegir: sets up infrastructure and build pipelines.
- saga: writes and edits documentation, README files, and release notes.
- volva: helps design prompts and AI features.

## Writing a good request

Agents do better with a clear request. A good one has three parts:

1. What you want, in one sentence.
2. Where it applies: a file name, a folder, or "the changes I just made".
3. What done looks like: "the tests pass", "a list of problems", "a short summary".

Compare "make it better" with "In average.py, handle inputs that are not numbers by printing a clear error. Run the tests when you finish." The second gives the agent something to aim at.

You do not have to name an agent every time. You can also describe the job, for example "review my latest changes for security problems", and Claude Code picks the best fit. Naming the agent just removes the guesswork while you are learning.

## What you just installed

- Nine agents: mimir, tyr, vidar, thor, ull, baldur, aegir, saga, volva.
- Two skills, which are commands you can type: `/aesir:playbook` explains when to use which agent, and `/aesir:setup` writes the instruction files for a project.

The agents do not change your computer until you ask for work. Installing them is safe.

## If something goes wrong

**The plugin does not show up.** Reload the plugins. If that does not help, restart Claude Code.

```bash
/reload-plugins
```

**Claude Code did the work itself instead of using an agent.** That is allowed. For small tasks it is often cheaper and faster. If you want a specific agent, say its name: "Ask thor to...".

**The wrong agent was picked.** Name the one you want. You can also write the full name, which is the plugin name, a colon, then the agent: `aesir:thor`.

**An agent says it cannot find something.** Agents start with no memory of your chat. Tell Claude Code what the agent needs to know, such as the file name or what you are trying to achieve.

**You are not sure what the team can do.** Run the playbook. It explains when to use each agent:

```bash
/aesir:playbook
```

## What is next

- Try the same loop on a real task in a real project. Ask thor for a small change, ask ull to cover it, ask baldur to review it.
- Run `/aesir:setup` (without flags) inside a project to write the shared instruction files for that project. Level 2 shows what it creates.
- Try tyr for a feature you have only half thought through. Ask it to write the spec, then hand the spec to thor.
- When you are comfortable, read the Level 2 guide: `docs/quickstart-level-2-mid-level.md`.
