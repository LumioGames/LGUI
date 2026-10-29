The reference implementation lives at `unity-migration/complex-inventory/`: `art/`, `project/`, `shared/`, `fidelity/`, `published/`. `prototype/shared/model.ts` supplies reward rules. See architecture.

Only for the supplied inventory: run `node <workspace>/unity-migration/complex-inventory/fidelity/prepare-skin.mjs` to reproduce fixed source rectangles; run `prepare-detail-icons.mjs` for its 6×4 transparent atlas. They require its exact input dimensions. Inspect `skin-manifest.json`, `detail-icons.json` and `art/prompts.json` before changing an input. For a different design, create a new manifest and extraction script with that design's regions; do not force it through the inventory constants.

After offline formal package edits, `node <workspace>/unity-migration/complex-inventory/scripts/publish-fidelity-project.mjs` is the inventory-specific publisher and asserts its IDs. For other exported .fairy projects use the generic `publish` command documented in workflow.
