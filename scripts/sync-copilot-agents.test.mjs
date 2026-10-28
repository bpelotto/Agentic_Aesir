// Run with: node --test scripts/sync-copilot-agents.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { applyPlan, buildPlan, parseArgs, parseFrontmatter, toCopilot, toList } from "./sync-copilot-agents.mjs";

const here = fileURLToPath(new URL(".", import.meta.url));
const agentsDir = join(here, "..", "agents");

test("parseFrontmatter handles BOM, CRLF, inline and block lists", () => {
  const text = "﻿---\r\nname: x\r\ntools: [Read, Grep]\r\neffort: low\r\nlist:\r\n  - a\r\n  - \"b\"\r\n---\r\nbody\r\n";
  const { data, body } = parseFrontmatter(text);
  assert.equal(data.name, "x");
  assert.deepEqual(toList(data.tools), ["Read", "Grep"]);
  assert.deepEqual(data.list, ["a", "b"]);
  assert.equal(body, "body\n");
});

test("parseFrontmatter rejects an unterminated block instead of treating it as body", () => {
  assert.throws(() => parseFrontmatter("---\nname: x\nbody without closing"), /never closed/);
});

test("toCopilot maps tools, scoped Bash, effort, and drops model", () => {
  const warnings = [];
  const out = toCopilot(
    { name: "t", description: "d", tools: "Read, Write, Bash(git:*), mcp__x__y", model: "opus", effort: "high" },
    "Body\n",
    "t",
    (w) => warnings.push(w)
  );
  assert.match(out, /^---\nname: t\ndescription: "d"\ntools: \[read, edit, execute\]\nreasoning-effort: high\n---\nBody\n$/);
  assert.equal(warnings.length, 1);
  assert.match(warnings[0], /mcp__x__y/);
  assert.doesNotMatch(out, /model/);
});

test("toCopilot refuses empty description, bad names, bad effort, and disallowedTools without tools", () => {
  assert.throws(() => toCopilot({ name: "t", description: "" }, "", "t"), /description is required/);
  assert.throws(() => toCopilot({ name: "Völva", description: "d" }, "", "x"), /lowercase/);
  assert.throws(() => toCopilot({ name: "t", description: "d", effort: "turbo" }, "", "t"), /unknown effort/);
  assert.throws(() => toCopilot({ name: "t", description: "d", disallowedTools: "Edit" }, "", "t"), /disallowedTools/);
});

test("parseArgs rejects flags without values and unknown flags", () => {
  assert.throws(() => parseArgs(["--source"]), /needs a value/);
  assert.throws(() => parseArgs(["--target"]), /needs a value/);
  assert.throws(() => parseArgs(["--bogus"]), /Unknown argument/);
  assert.deepEqual(parseArgs(["--target", "project", "x", "--prune"]).dir, "x");
  assert.equal(parseArgs(["--target", "project", "--dry-run"]).dir, ".");
});

test("shipped agents convert with only Copilot aliases, and the sync is idempotent and prunes", () => {
  const target = mkdtempSync(join(tmpdir(), "aesir-sync-"));
  mkdirSync(target, { recursive: true });
  writeFileSync(join(target, "stale.agent.md"), "---\nname: stale\n---\n");
  writeFileSync(join(target, "keep.md"), "not an agent file");

  const warnings = [];
  const plan = buildPlan({ source: agentsDir, target, prune: true, warn: (w) => warnings.push(w) });
  assert.equal(warnings.length, 0, warnings.join("\n"));
  assert.equal(plan.filter((s) => s.action === "write").length, 9);
  assert.equal(plan.filter((s) => s.action === "delete").length, 1);
  applyPlan(plan, target);

  const files = readdirSync(target).filter((f) => f.endsWith(".agent.md")).sort();
  assert.equal(files.length, 9);
  assert.ok(readdirSync(target).includes("keep.md"));
  for (const f of files) {
    const text = readFileSync(join(target, f), "utf8");
    const tools = text.match(/^tools: \[(.*)\]$/m)[1].split(", ");
    for (const t of tools) assert.ok(["read", "edit", "search", "execute", "web", "agent", "todo"].includes(t), `${f}: ${t}`);
    assert.doesNotMatch(text, /\r/);
  }
  assert.match(readFileSync(join(target, "baldur.agent.md"), "utf8"), /tools: \[read, search, execute\]\nreasoning-effort: high/);

  const again = buildPlan({ source: agentsDir, target, prune: true });
  assert.ok(again.every((s) => s.action === "unchanged"), again.map((s) => `${s.action} ${s.dest}`).join("\n"));
});
