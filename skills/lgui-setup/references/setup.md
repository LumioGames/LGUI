Use the installed `tools/lgui.mjs`; `--workspace` is mandatory and must be outside the plugin tree. `init` checks every copied file before writing. Repeating it before editing is safe; after user changes it reports conflicts. Updates use a fresh workspace and an explicit diff, not a blind template overwrite.

The configuration `.lgui/workspace.json` records schemaVersion, template and version. The template retains existing relative paths so shared reward imports and Unity's local package references work. Dependencies, browser profiles and generated outputs live in this workspace. `doctor` reports presence; a successful `bootstrap --install` verifies pinned manifests, checkouts and patches. It does not prove every file in an existing node_modules tree unmodified. Never suppress a bootstrap integrity error.

Read [installation](../../../docs/install.md) for host commands and [troubleshooting](../../../docs/troubleshooting.md) when blocked.
