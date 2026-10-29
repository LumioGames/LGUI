# LGUI

> **In development — 0.3.0 is not released yet.** The install steps and commands below work only after 0.3.0 ships; the old 0.2.0 is at tag `v0.2.0-final`.

## For AI agents: install and first use

When the user sends you this repository, follow these steps. If any step fails, stop and show the user the exact error; do not skip it.

1. Check Node: run `node -v`; 24 or later is required. If it is missing, ask the user to install it; do not install it for them.
2. Install the plugin for your client:
   - Claude Code:
     ```
     claude plugin marketplace add LumioGames/LGUI
     claude plugin install lgui@lumio-lgui
     ```
   - Codex:
     ```
     codex plugin marketplace add LumioGames/LGUI
     codex plugin add lgui@lumio-lgui
     ```
   - Other clients: run `git clone --depth 1 https://github.com/LumioGames/LGUI` and use its `plugin/` folder as the plugin directory. Skills are in `plugin/skills/`.
3. The command-line tool does not depend on skills and works right away. Continue in the current session:
   1. Find the plugin directory: Claude Code uses `~/.claude/plugins/cache/lumio-lgui/lgui/<version>/`, Codex uses `~/.codex/plugins/cache/lumio-lgui/lgui/<version>/`, other clients use the cloned `plugin/`. Below, `lgui` means `node <plugin directory>/tools/lgui.mjs`.
   2. Run `lgui doctor` to check the environment, including whether Chrome or Edge is installed.
   3. Ask the user which folder the project should live in, then run `lgui init`.
   4. Run `lgui dev` to open the preview and tell the user the URL.
4. Tell the user that LGUI skills take effect in a new session. In the new session they can simply say "use LGUI to build a ... screen".
5. From then on, build screens and features following the UI and MVC development specs in `plugin/references/`.

## What it is

LGUI is an open-source UI engine framework built for AI agents. UI assets, prefab hierarchies and all UI and game code can be written entirely on the web, with no game engine. When you need Unity, one command exports the project (Unity + PuerTS) without refactoring the code.

## Install

See "For AI agents" above. Only the repository's `plugin/` folder is shipped as the plugin.

## Skills

| Skill | Use it for |
|---|---|
| `lgui-setup` | Install, create a project, check the environment, open the preview |
| `lgui-author` | Build screens |
| `lgui-edit` | Edit screens in the editor together with a person |
| `lgui-verify` | Screenshot and test verification |
| `lgui-unity` | Unity integration |

`plugin/skills/` still holds the 0.2.0 skill content and will be rewritten for the new commands.

## Known limitations

- 0.3.0 is in development: the CLI, framework and inventory example are being rewritten for the new layout, and the old commands do not run for now.
- Skills take effect only in a new session (a host limitation); the CLI is not affected.
- Unity support comes last.

## Links

[Changelog](CHANGELOG.md) · [Contributing](CONTRIBUTING.md) · [UI spec](plugin/references/ui-spec.md) · [MVC spec](plugin/references/mvc-spec.md) · [Project layout](plugin/references/project-layout.md) · [Unity (phase 3)](plugin/references/unity.md) · [Error codes](plugin/references/error-codes.md) · [Third-party notices](plugin/THIRD_PARTY_NOTICES.md)

Original work is licensed under [MIT](LICENSE), Copyright © 2026 LumioGames.
