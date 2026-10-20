---
name: lgui-verify
description: "Run independent browser functional, persistence and visual checks for an LGUI UI, including responsive layouts and editor save/reopen. Use for LGUI verification requests; not as proof of Unity runtime, physical IME or mobile compatibility."
license: MIT
compatibility: "Initialized LGUI workspace, restored Playwright tooling and installed Chrome or Edge."
---

Inputs: workspace, running local URL, intended UI/viewports and acceptance criteria. Resolve [CLI](../../tools/lgui.mjs) from this installed skill and read [project entries](../../docs/projects.md). Run configured `test`, `serve` and `verify-browser -- --browser chrome` (or msedge where the chosen fixture supports it). For native runtime checks run configured `verify-unity`. A missing verification entry is untested, not a successful fallback. The blank fixture checks title rendering/geometry only; replace or extend it with the UI's actual interaction and persistence assertions. `verify-editor` also requires an explicit project fixture and a running editor.

Read [verification scope](references/verification.md). For a different UI, adapt the fixture and interaction checks to its actual controls instead of carrying inventory assertions forward. Exercise real controls, save and reopen, inspect screenshots at relevant sizes, and separate source/build/functional/visual/user-acceptance results. Preserve failures in new evidence directories. Output versions, actual viewport, commands, evidence paths and limitations. A successful load or screenshot alone is not functional acceptance.

For motion work, follow the [motion handoff and acceptance](../lgui-author/references/motion-advisor.md). New designs need preserved visual-first and interaction-review passes, merged regional decisions and real node/platform bindings. Minor changes with unchanged purpose, hierarchy and interaction reuse the reviewed plan and record only their delta and affected checks. Review actual playback at normal speed for perceptibility, hierarchy, pacing and responsive input, then relevant interruption/reopen, reuse and reduced-motion behavior. Keep browser and native evidence separate. Changed properties or frame samples do not establish design coverage or continuous feel; say unverified where playback is unavailable.
