#!/usr/bin/env node
// Sync Aesir agents from Claude Code format (agents/*.md) to GitHub Copilot
// custom agents (*.agent.md). Zero dependencies. Node 18+.
//
//   node sync-copilot-agents.mjs [--target user | --target project [dir]]
//                                [--source <agents dir>] [--prune] [--dry-run]
//
// --target user     writes to ~/.copilot/agents            (default)
// --target project  writes to <dir>/.github/agents          (dir defaults to .)
// --prune           deletes *.agent.md in the target that are not in the roster
// --dry-run         prints what would happen and changes nothing
//
// Output frontmatter follows the VS Code custom agent file reference
// (code.visualstudio.com/docs/agents/reference/custom-agent-file-reference):
// name, description, tools (Copilot aliases), reasoning-effort. The Claude
// `model` alias is dropped on purpose: Copilot model names differ by vendor and
// an unknown model string is worse than the user's current selection.
// Tests: node --test scripts/sync-copilot-agents.test.mjs

import { existsSync, mkdirSync, readFileSync, readdirSync, unlinkSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { basename, dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

export const TOOL_MAP = {
  Read: "read",
  Edit: "edit",
  Write: "edit",
  MultiEdit: "edit",
  NotebookEdit: "edit",
  Grep: "search",
  Glob: "search",
  Bash: "execute",
  BashOutput: "execute",
  KillShell: "execute",
  WebSearch: "web",
  WebFetch: "web",
  Task: "agent",
  Agent: "agent",
  TodoWrite: "todo",
};

const EFFORT_LEVELS = new Set(["low", "medium", "high", "xhigh", "max"]);
const NAME_PATTERN = /^[a-z0-9][a-z0-9-]*$/;

export function parseArgs(argv) {
  const args = { target: "user", dir: ".", source: null, prune: false, dryRun: false, help: false };
  const takeValue = (i, flag) => {
    const v = argv[i + 1];
    if (v === undefined || v.startsWith("--")) throw new Error(`${flag} needs a value`);
    return v;
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--help" || a === "-h") args.help = true;
    else if (a === "--target") {
      args.target = takeValue(i++, a);
      if (args.target === "project" && argv[i + 1] !== undefined && !argv[i + 1].startsWith("--")) args.dir = argv[++i];
    } else if (a === "--source") args.source = takeValue(i++, a);
    else if (a === "--prune") args.prune = true;
    else if (a === "--dry-run") args.dryRun = true;
    else throw new Error(`Unknown argument: ${a}`);
  }
  if (!["user", "project"].includes(args.target)) throw new Error("--target must be user or project");
  return args;
}

// Minimal YAML front matter parser: scalar values, inline lists, and block lists.
export function parseFrontmatter(text) {
  text = text.replace(/^﻿/, "").replace(/\r\n/g, "\n");
  if (!text.startsWith("---\n")) return { data: {}, body: text };
  const m = text.match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) throw new Error("front matter opened with --- but never closed");
  const data = {};
  let key = null;
  for (const raw of m[1].split("\n")) {
    const list = raw.match(/^\s+-\s+(.*)$/);
    if (list && key) {
      (Array.isArray(data[key]) ? data[key] : (data[key] = [])).push(unquote(list[1]));
      continue;
    }
    const kv = raw.match(/^([A-Za-z0-9_-]+):\s*(.*)$/);
    if (!kv) continue;
    key = kv[1];
    data[key] = kv[2] === "" ? "" : unquote(kv[2]);
  }
  return { data, body: m[2] };
}

function unquote(s) {
  s = s.trim();
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) return s.slice(1, -1);
  return s;
}

export function toList(v) {
  if (v == null || v === "") return [];
  if (Array.isArray(v)) return v;
  const s = String(v).trim();
  const inner = s.startsWith("[") && s.endsWith("]") ? s.slice(1, -1) : s;
  return inner.split(",").map((t) => unquote(t)).filter(Boolean);
}

function yamlString(s) {
  return JSON.stringify(String(s ?? ""));
}

// "Bash(git:*)" -> "Bash"; "mcp__server__tool" stays as is (and is reported as unmapped).
function baseToolName(t) {
  return t.replace(/\(.*\)$/, "");
}

export function toCopilot(data, body, fallbackName, warn = () => {}) {
  const name = data.name || fallbackName;
  if (!NAME_PATTERN.test(name)) throw new Error(`${name}: agent name must be lowercase letters, digits, and hyphens`);
  const description = String(data.description ?? "").trim();
  if (!description) throw new Error(`${name}: description is required (Copilot routes on it)`);

  const claudeTools = toList(data.tools);
  if (claudeTools.length === 0 && toList(data.disallowedTools).length > 0) {
    throw new Error(`${name}: disallowedTools without tools cannot be expressed in Copilot; list tools explicitly`);
  }
  const tools = [];
  for (const t of claudeTools) {
    const mapped = TOOL_MAP[baseToolName(t)];
    if (!mapped) warn(`${name}: no Copilot equivalent for tool "${t}", dropped`);
    else if (!tools.includes(mapped)) tools.push(mapped);
  }
  if (data.effort && !EFFORT_LEVELS.has(data.effort)) throw new Error(`${name}: unknown effort "${data.effort}"`);

  const lines = ["---", `name: ${name}`, `description: ${yamlString(description)}`];
  if (claudeTools.length) lines.push(`tools: [${tools.join(", ")}]`);
  if (data.effort) lines.push(`reasoning-effort: ${data.effort}`);
  lines.push("---", "");
  return lines.join("\n") + body.replace(/\r\n/g, "\n").replace(/^\s+/, "");
}

export function buildPlan({ source, target, prune, warn = () => {} }) {
  if (!existsSync(source)) throw new Error(`Source directory not found: ${source}`);
  const sources = readdirSync(source).filter((f) => f.endsWith(".md"));
  if (sources.length === 0) throw new Error(`No agent files in ${source}`);

  const roster = new Set();
  const plan = [];
  for (const file of sources) {
    const { data, body } = parseFrontmatter(readFileSync(join(source, file), "utf8"));
    const name = data.name || basename(file, ".md");
    const out = toCopilot(data, body, name, warn);
    const outName = `${name}.agent.md`;
    if (roster.has(outName)) throw new Error(`duplicate agent name "${name}"`);
    roster.add(outName);
    const dest = join(target, outName);
    const current = existsSync(dest) ? readFileSync(dest, "utf8") : null;
    plan.push({ action: current === out ? "unchanged" : current ? "update" : "write", dest, out });
  }
  if (prune && existsSync(target)) {
    for (const f of readdirSync(target)) {
      if (f.endsWith(".agent.md") && !roster.has(f)) plan.push({ action: "delete", dest: join(target, f) });
    }
  }
  return plan;
}

export function applyPlan(plan, target) {
  mkdirSync(target, { recursive: true });
  let done = 0;
  try {
    for (const step of plan) {
      if (step.action === "write" || step.action === "update") writeFileSync(step.dest, step.out, "utf8");
      else if (step.action === "delete") unlinkSync(step.dest);
      done++;
    }
  } catch (err) {
    throw new Error(`${err.message} (after ${done} of ${plan.length} steps; re-run to finish)`);
  }
}

export function summarize(plan) {
  const counts = plan.reduce((c, s) => ((c[s.action] = (c[s.action] ?? 0) + 1), c), {});
  return Object.entries(counts)
    .map(([k, v]) => `${v} ${k}`)
    .join(", ");
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    const header = readFileSync(fileURLToPath(import.meta.url), "utf8").split("\n").slice(1, 11);
    console.log(header.map((l) => l.replace(/^\/\/ ?/, "")).join("\n"));
    return;
  }
  const here = dirname(fileURLToPath(import.meta.url));
  const source = resolve(args.source ?? join(here, "..", "agents"));
  const target =
    args.target === "user" ? join(homedir(), ".copilot", "agents") : join(resolve(args.dir), ".github", "agents");

  const tag = args.dryRun ? "[dry-run] " : "";
  const plan = buildPlan({ source, target, prune: args.prune, warn: (msg) => console.warn(`${tag}warning: ${msg}`) });
  console.log(`${tag}source: ${source}`);
  console.log(`${tag}target: ${target}`);
  for (const step of plan) console.log(`${tag}${step.action.padEnd(9)} ${step.dest}`);
  if (!args.dryRun) applyPlan(plan, target);
  console.log(`${tag}${summarize(plan)}`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(resolve(process.argv[1])).href) {
  try {
    main();
  } catch (err) {
    console.error(`sync-copilot-agents: ${err.message}`);
    process.exit(1);
  }
}
