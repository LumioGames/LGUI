---
name: lgui-author
description: "Prepare reference-image layers, assets and responsive FairyGUI UI in an initialized LGUI workspace. Use for implementing or adapting LGUI interfaces from a design; not for generic image generation or an unrelated web application."
license: MIT
---

Inputs: workspace, target UI, reference and asset rights/source, expected viewports and interactions. Ask for missing design inputs before inventing a reference or overwriting artwork. Start with lgui-setup if no workspace exists.

Read [authoring boundaries](references/authoring.md). Record reference dimensions and source hashes; identify reusable frames, scale-9 regions, text, icons and interaction states. Distinguish crops from newly rendered transparent assets. Keep a provenance manifest. Use available image tools only when needed and report limitations honestly.

Implement business in pure TS, geometry in shared layout functions, and loading/fonts/events/storage/disposal in platform adapters. The inventory template's art scripts are reproducible example-specific operations, not universal image segmentation. Its 24 slots, IDs and 1586×992 canvas must not constrain another UI.

For a live editor, use lgui-edit and its shared session. For an offline source change, ensure the live editor is closed, keep resource IDs stable, then validate/save/reopen/publish. Rebuild with `node <absolute-installed-tools/lgui.mjs> build-web --workspace <absolute-workspace>`, then use lgui-verify at requested sizes. Output source/assets/provenance, build results and screenshots with known differences from the reference. No automatic claim of pixel identity or native equivalence.
