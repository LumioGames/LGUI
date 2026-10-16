---
name: lgui-author
description: "Design and implement responsive FairyGUI UI from references in an LGUI workspace: assets, reusable component instances, XML structure, scale-9, controllers and simple transitions. Use for adapting LGUI interfaces; not for unrelated web apps or generic image generation."
license: MIT
---

Inputs: workspace, target UI, reference and asset rights/source, expected viewports and interactions. Ask for missing design inputs before inventing a reference or overwriting artwork. Start with lgui-setup if no workspace exists.

Read [authoring boundaries](references/authoring.md). Record reference dimensions and source hashes; identify reusable frames, scale-9 regions, text, icons and interaction states. Distinguish crops from newly rendered transparent assets. Keep a provenance manifest. Use available image tools only when needed and report limitations honestly.

Inspect the actual project's package index, target component, reusable components and code bindings before changing it. Reuse suitable assets; report missing resources instead of inventing placeholders. Establish block alignment and an initial implementation, then measure and render iteratively. Do not spend an entire task measuring without producing a reviewable draft.

Read only the references needed for the task:

| Task | Reference |
|---|---|
| Structure, references, controllers, scale-9 | [XML format](references/xml-format.md) |
| Repeated units, instance values and resizing | [Component instancing](references/component-instancing.md) |
| Entrance, exit and replayable feedback | [Transitions](references/transition.md) |
| Reference dimensions and visual comparison | [Measurement and verification](references/measure-verify.md) |
| Before editing and before delivery | [Pitfalls](references/pitfalls.md) |

These references adapt the team's supplied fairygui-ui skill; [origin and deduplication](../../docs/imported-ui-skill.md) records the mapping. Product paths, binding prefixes, popup frameworks, controller pages and business keys are project-specific. No original private-project conventions become global LGUI requirements.

Read the workspace's `.lgui/project.json` to locate its real build and verification entries; see [project configuration](../../docs/projects.md). Implement business in pure TS, geometry in shared layout functions, and loading/fonts/events/storage/disposal in platform adapters. Formal XML geometry uses integers. Measure native glyph bounds and fit text in the native adapter; browser font sizes do not prove Unity text fits. The inventory's art scripts, 24 slots, IDs and canvas apply only to that example.

For a live editor, use lgui-edit and its shared session. For an offline source change, ensure the live editor is closed, keep resource IDs stable, then validate/save/reopen/publish. Run the configured `build-web`, then lgui-verify at requested sizes. Missing entries require project configuration; never silently run a reference fixture. Output source/assets/provenance, build results and screenshots with known differences from the reference. No automatic claim of pixel identity or native equivalence.

The current Agent transaction surface supports existing-node property edits, not arbitrary XML/component creation. Check the actual operation schema. Unsupported structural work uses the editor's supported UI or a separate saved offline project, never a parallel disk writer against an open session. Import/publish success alone does not prove component rendering or native behavior.
