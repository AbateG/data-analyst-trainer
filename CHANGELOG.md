# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres (loosely) to [Semantic Versioning](https://semver.org/).

## [0.2.0] - 2025-09-07
### Added
- Python challenge manifest system with progressive hints, examples, and property assertions (`src/types/pythonChallengeManifest.ts`).
- Pyodide singleton + headless runner utilities (`src/utils/pyodideSingleton.ts`, `pythonHeadlessRunner.ts`).
- Extensive Python & SQL test suites (Vitest) covering manifests, robustness, singleton behavior, schema validation, and solutions.
- Conceptual evaluator enhancements: confidence bands, misconception badges, spaced repetition integration.
- New authoring docs: `docs/CHALLENGE_AUTHORING.md`, `docs/PYTHON_MANIFEST_CHALLENGES.md`.
- New assets & presentation diagrams (SVG + raster images) for challenge flow and UI.
- SQL schema metadata & pre‑execution identifier validation with optional strict mode.
- Semantic layer scaffold for future local embeddings (`semanticLayer.ts`).
- Tone map + inline code highlighting features in conceptual solution rendering.
- Python runtime validation & failure reporting scripts.

### Changed
- Refactored `PythonRunner` and related components to use shared Pyodide loader preventing multiple WASM loads.
- Updated build & test configuration (`vite.config.ts`, `vitest.config.ts`, `tsconfig.app.json`).
- Improved challenge loaders to adapt new Python manifest format while preserving legacy compatibility.

### Fixed
- Eliminated memory errors due to multiple `loadPyodide` invocations by centralizing loader.
- Improved SQL challenge safety with identifier validation reducing accidental typos.

### Removed
- Redundant legacy conceptual answer scoring logic (replaced by new evaluator) where applicable.

### Notes
Tag: `v0.2.0`
Focus: Foundation for richer Python/SQL authoring, evaluation robustness, and offline deterministic conceptual scoring.

## [Unreleased]
- Add richer schema lineage & CTE parsing.
- Expand synonym / semantic mapping in conceptual evaluator.
- Persist spaced repetition state to exportable profile.
- Add CI coverage reports & badges.
- Engine scaffolding: introduced `src/engine` with `sqlValidation` module, barrel export, path alias `@engine/*`, and dedicated `tsconfig.engine.json` + `build:engine` script.
- Moved conceptual evaluator & spaced repetition helpers to engine (`@engine/conceptualEvaluator`, `@engine/spacedRepetition`).

[0.2.0]: https://github.com/AbateG/data-analyst-trainer/releases/tag/v0.2.0
