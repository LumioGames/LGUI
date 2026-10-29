---
name: lgui-unity
description: "Migrate an LGUI FairyGUI UI to Unity/PuerTS, prepare native resources and validate or build Windows IL2CPP Player. Use for LGUI native delivery; not for arbitrary Unity gameplay or claiming browser checks prove native rendering."
license: MIT
compatibility: "Windows, Unity 6000.6.6f1 with IL2CPP and C++ tools, valid local license; PuerTS 3.0.3."
---

Inputs: workspace, Unity executable and desired prepare/build/runtime action. Read project configuration and [native procedure](references/native.md). Resolve [CLI](../../tools/lgui.mjs) from this installed skill and always pass the user's workspace. Inspect `.lgui/project.json` before choosing commands.

Run `bootstrap --workspace <workspace> --install --unity`; build shared business and formally publish, then run the project's `unity-setup`. For configured native methods use `unity --workspace <workspace> -- --action prepare|generate|build --editor <absolute-Unity.exe>` in order; build optionally accepts `--cli <absolute-official-unity-CLI>`. The project supplies its Unity project, C# methods and resource adapter. If it explicitly declares a custom `commands.unity`, its documented arguments apply instead (the inventory recipe uses `-Action`). Never select the inventory project for an unconfigured UI. Keep loading, events, measured font fitting, storage and disposal in the native adapter.

Run the configured `verify-unity` entry for project-specific Player startup, interaction, persistence and screenshots. The inventory's editor-auto/player procedures in the reference apply only to that explicit recipe. Inspect actual text/art geometry and measured dimensions. Record compilation separately from runtime and visual checks. If Unity/license/tools or verification entry are absent, continue other work and report native work untested. Output build path, logs, versions, hashes and scope. Do not redistribute Unity, system fonts or incomplete third-party binary notices.
