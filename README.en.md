# LGUI

LGUI is an open-source UI development plugin for agents: iterate in the browser with FairyGUI, share pure TypeScript business and layout, then migrate to native Unity/PuerTS. The inventory is a reference template, not a universal UI contract.

Install from the repository marketplace in Codex CLI 0.160.0 or Claude Code 2.1.283; see the [installation guide](docs/install.md) and [tested compatibility](docs/compatibility.md). After installation run `$lgui-setup` in Codex or `/lgui:lgui-setup` in Claude. First choose a workspace: initialization creates its configuration and directories, then diagnoses/restores dependencies. The installed plugin cache stays read-only.

The shared editor uses one live session, queue, revision and undo history for humans and agents. CLI calls use a localhost HTTP relay, not MCP. Save/readback and explicit ZIP export precede publication. Browser fidelity currently assembles real DOM controls manually; Unity consumes formal published FairyGUI packages. Presentation mapping is not fully deduplicated. Native fonts, events, resources, storage and lifecycle remain platform-specific.

See [workflow](docs/workflow.md), [architecture](docs/architecture.md), [evidence and limitations](docs/evidence.md), [contributing](CONTRIBUTING.md) and [release](docs/release.md). Original work is [MIT](LICENSE); preserve [third-party notices](THIRD_PARTY_NOTICES.md). A public repository, installable package and official directory listing are distinct. This project does not automatically apply for official listing.
