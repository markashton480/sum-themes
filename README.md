# sum-themes

Distribution repository for SUM theme artifacts.

## What this repo is

This repo is the source of truth for **versioned theme releases**. Each theme is released independently using **namespaced tags** (e.g. `theme-a/v1.0.0`).

Themes are stored under:

- `themes/theme_a/`
- `themes/theme_b/`

## How client sites consume themes

Client projects vendor a theme into their repo (e.g. `theme/active/`) using `git subtree`, pinned to a tag.

Example upgrade flow (illustrative):

- `git fetch sum-themes --tags`
- `git subtree pull --prefix=theme/active sum-themes "theme-a/v1.0.1:themes/theme_a" --squash`

Publishing and CI guardrails live in the canonical development repo (`sum-platform`) and are added in follow-up tasks under WO `TDIST`.
