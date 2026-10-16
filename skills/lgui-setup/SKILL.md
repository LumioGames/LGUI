---
name: lgui-setup
description: "Initialize LGUI configuration and project directories after plugin installation, diagnose an LGUI workspace, or restore its pinned dependencies. Use for starting browser-first FairyGUI UI work; do not use for unrelated Node or Unity projects."
license: MIT
compatibility: "Node.js 24.18+ and Git; network access for explicit dependency restoration."
---

Start here after installing LGUI. Inputs: the user's chosen absolute workspace directory, whether to restore dependencies, and whether Unity support is needed.

1. Resolve [the CLI](../../tools/lgui.mjs) from this installed skill's location. Its absolute location is stable within this installed version, independent of the shell working directory. Never derive the plugin from the user's cwd, write into its cache, or assume host placeholder variables are expanded in this Markdown.
2. If no destination was supplied, ask for a workspace directory before writing anything. A request merely asking what LGUI is should receive an explanation, not initialization. Keep temporary validation directories separate too.
3. For initialization, run `node <absolute-cli> init --workspace <absolute-workspace>`. This creates the inventory reference template and `.lgui/workspace.json`. Existing differing files stop the operation; never reset or overwrite them to make initialization succeed. For diagnosis of an existing workspace, skip init and proceed directly to doctor.
4. Run `doctor`, then `bootstrap --dry-run` through the same CLI and workspace, unless the user limited the request to doctor alone. Explain the three dependency roots and report missing tools. A null `unityEditorOverride` only means UNITY_EDITOR is unset: it does not detect whether Unity is installed or licensed. When dependency restoration is requested, run `bootstrap --install`; add `--unity` only for native work.
5. For requested setup or preview, run `build-web`, then `serve`. Report the local URL and how to stop the foreground process. For editor work run `editor` in a separate terminal and continue with lgui-edit. A diagnosis-only request stops after reporting results and does not build, install or start services.

Every command after the command name uses `--workspace <absolute-workspace>`. Output: workspace/config location, dependency status, tested URL, and unresolved prerequisites. Initialization copies a reference project; it does not claim a blank arbitrary UI generator, install Unity, or activate a license. See [setup details](references/setup.md) for updates and recovery.
