---
name: lgui-edit
description: "Query, preflight, modify, undo, save and export the same live FairyGUI editor session used by a human in LGUI. Use when an LGUI editor must be edited or inspected; not for parallel disk writes or generic file editing."
license: MIT
compatibility: "Initialized LGUI workspace; running patched Editor Online at a loopback URL with ?agent=1."
---

Inputs: workspace, selected editor client and desired edits. Read [session protocol](references/session.md) before mutations. Resolve [CLI](../../tools/lgui.mjs) from this skill's installed path. Run `editor --workspace <workspace>` if requested; in another terminal run `agent --workspace <workspace> clients`. If several clients exist, ask which one. Do not broadcast.

Query state and entities; derive selectors from real stable IDs. Send preflight with current identity, then transact with a unique requestId through `agent --workspace <workspace> call <clientId> <request.json>`. Query the new identity after each change. Preserve the single UI queue, revision checks and undo history. Use undo/redo via that queue when requested.

Save, require verified readback and dirty=false, reopen and query to confirm persisted state. Export to a new explicit ZIP path in the workspace. Use the generic `publish` command on that saved snapshot, then web/native verification as appropriate. Never create a disk backend to edit alongside the live session. Output selected client/session, operation results, revision changes, readback and export hash; omit connection tokens.

When inputs are missing, ask only for the required workspace/client/change. If no live editor exists, explain how to start it; do not manufacture successful state. The relay is HTTP, not MCP. Current mutations support setDisplayNodeProps, not arbitrary component/resource creation.
