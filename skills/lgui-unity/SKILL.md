---
name: lgui-unity
description: "Migrate an LGUI FairyGUI UI to Unity/PuerTS, prepare native resources and validate or build Windows IL2CPP Player. Use for LGUI native delivery; not for arbitrary Unity gameplay or claiming browser checks prove native rendering."
license: MIT
compatibility: "Windows, Unity 6000.6.6f1 with IL2CPP and C++ tools, valid local license; PuerTS 3.0.3."
---

Inputs: workspace, Unity executable and desired prepare/build/runtime action. Read [native procedure](references/native.md). Use [CLI](../../tools/lgui.mjs) resolved from this installed skill and always pass the user's workspace.

Run `bootstrap --workspace <workspace> --install --unity`; build web/shared business and formally publish before `unity-setup`. Supply UNITY_EDITOR or `-UnityEditor` explicitly when automatic discovery does not match. Run native prepare → generate → build in order with `unity --workspace <workspace> -- -Action <action>`. Keep platform-specific loading, events, font metrics, storage and disposal in the native adapter.

For native validation use editor-auto/player plus the verification commands in the reference. Inspect actual text/art geometry and measured dimensions. Record compilation separately from runtime and visual checks. If Unity/license/tools are absent, continue browser/package work and report native work untested. Output build path, logs, exact versions, hashes and result scope. Do not redistribute Unity, system fonts or incomplete third-party binary notices.
