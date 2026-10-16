---
name: lgui-verify
description: "Run independent browser functional, persistence and visual checks for an LGUI UI, including responsive layouts and editor save/reopen. Use for LGUI verification requests; not as proof of Unity runtime, physical IME or mobile compatibility."
license: MIT
compatibility: "Initialized LGUI workspace, restored Playwright tooling and installed Chrome or Edge."
---

Inputs: workspace, running local URL, intended UI/viewports and acceptance criteria. Resolve [CLI](../../tools/lgui.mjs) from this installed skill. Run `test --workspace <workspace>` for business/layout/patch unit checks, then `serve` if needed. For the inventory reference run `verify-browser --workspace <workspace> -- --browser chrome` (or edge). For shared editor persistence run `verify-editor --workspace <workspace> -- --persistent` with the editor running.

Read [verification scope](references/verification.md). For a different UI, adapt the fixture and interaction checks to its actual controls instead of carrying inventory assertions forward. Exercise real controls, save and reopen, inspect screenshots at relevant sizes, and separate source/build/functional/visual/user-acceptance results. Preserve failures in new evidence directories. Output versions, actual viewport, commands, evidence paths and limitations. A successful load or screenshot alone is not functional acceptance.
