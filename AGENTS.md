# LGUI contributor and agent instructions

## Scope

LGUI is an independent FairyGUI UI prototype for Agent authoring, browser-first development and Unity migration. Do not add dependencies on LumioEngine, LumioGameNext or private sibling projects.

Keep the existing directory relationships unless a task explicitly includes their migration. Shared business imports the original reward model; build scripts resolve dependencies in separate package roots; Unity uses local PuerTS package paths. Read the README and the relevant source before changing those contracts.

## Architecture

- Keep business rules and save-schema validation in pure TypeScript. Shared business must not import DOM, UnityEngine, PuerTS CS objects or filesystem APIs.
- Share layout data/functions across hosts. Keep font measurement, native objects, event wiring, persistence and disposal in platform adapters.
- Preserve stable FairyGUI resource IDs and manifest mappings. Update formal source through the documented toolchain, then validate, save/reopen, publish and read back the result.
- Keep one application runtime across view close/open. Release view listeners on close and release the runtime once on host shutdown.
- Maintain the local Agent bridge as an explicit localhost development capability. Never embed connection tokens in source, docs, examples or evidence.

## Changes and evidence

Use focused failing tests before changing behavior, then verify the affected path. UI geometry or art changes also require an actual screenshot at the relevant viewport; an intact string or a successful build does not prove visible text or correct drawing.

Preserve previous failure evidence. Write new runs to new evidence directories, record actual dimensions and versions, and distinguish source validation, compilation, runtime checks, visual review and user acceptance. Do not promote partial or untested results to passed. Fixed 24-component fidelity checks do not prove virtual-list scale performance, physical IME behavior or mobile compatibility.

When updating a shared runtime input, update its build/setup identity and verify the bytes actually loaded by each host. Avoid broad regeneration or unrelated source normalization during focused changes.

## Dependencies and repository hygiene

Use `node scripts/bootstrap.mjs --dry-run` before dependency restoration. Installation is explicit via `--install`, optionally `--unity`; preserve lockfiles and the separation between the SDK 0.7.0 toolchain and the editor's 0.2.4 dependencies.

Do not commit node_modules, dependency checkouts, Unity import caches, installers, native Player builds, browser profiles, active locks, credentials or temporary connection files. Keep required source `.meta`, licenses, patch provenance, formal UI resources and deliberate business IIFE artifacts. Do not globally ignore `dist` or all binary assets.

Root MIT covers original work; retain third-party license notices and asset provenance. Do not copy system fonts, Unity installations or machine-specific license data into the repository.
