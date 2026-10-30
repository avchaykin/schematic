# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Schematic: a browser editor for schemas of blocks, connectors and links. Plain HTML, CSS and
JavaScript: no build step, no package manager, no server, no dependencies, no test suite. Run it by
opening `index.html` in a browser (icons come from the Material Symbols font on Google Fonts; the
rest works offline). Verify changes by loading the page, e.g. a headless Chrome screenshot with a
schema seeded into `localStorage` (`schematic:current` holds `{ schema, ... }`) before `app.js` runs.

## Files

- `app.js`: the whole app, one IIFE in `'use strict'`, split into `// ---------- name ----------`
  sections (storage, history, model, clones, trace, references, copy and paste, link groups,
  zip-ties, canvas rendering, view, canvas interaction, zip-tie tool, inspector, top bar, JSON
  view, picture export, boot). Search for the section header to find a feature.
- `index.html`: top bar, tool rail (`#tools`), canvas (`#viewport` > `#frames`, `svg#links`,
  `#world`), side panel (`#inspector`), status bar and dialogs (schema parameters, library, JSON, palette).
- `style.css`: all styling; colours are CSS custom properties with a dark theme (`data-theme` on `<html>`).
- `README.md` (feature list, shortcut table) and `docs/guide.md` (illustrated user guide):
  update both when a user-visible feature changes.
- `PRODUCT.md`, `DESIGN.md`, `.impeccable/`: product and design-system context for the
  impeccable design skill. UI work should follow DESIGN.md's tokens and voice.

## Architecture

- **One mutable document.** `schema` is a plain JSON object (blocks, links, ties, notes, palette and
  schema-wide parameters). Blocks have a `kind`: none (an ordinary block), `junction` (a link
  connector, one connector), `title`, `comment`, `frame`, `group` (a link group), `ref`
  (a block of another saved schema).
  Links join connector ids (`from`, `to`), not blocks.
- **Load path.** Everything entering the app (storage, import, paste, JSON dialog) goes through
  `normalizeSchema()`, which fills defaults and drops invalid data. A new schema field needs a
  default in `emptySchema()` and parsing in `normalizeSchema()`; optional per-item fields are
  usually stored only when set.
- **Edit cycle.** Mutate `schema` directly, then call `commit()` (one undo step: snapshots
  JSON, saves the working copy, autosaves to the folder), `render()` (redraws the canvas on the next
  animation frame through `draw()`), and `renderInspector()` (rebuilds the side panel). Live
  edits (typing, dragging) mutate and `render()`, and `commit()` on change or drop. Undo and redo restore JSON snapshots.
- **Selection** is `{ type, id | ids }` (block, blocks, link, tie, …), set through `select()`.
  The inspector and status bar (`updateStatus`) show whatever is selected; with nothing selected
  the panel shows schema info, signals and comments. `updateChrome()` syncs top bar and tool rail state.
- **Rendering.** Blocks are DOM elements in `#world`. Links, group buses and zip-ties are SVG in
  `#links-g`. `linkShapes(routes)` computes link geometry (path `d`, colours, dash) once, for both
  the SVG canvas (`drawLinks`) and the canvas-based PNG/PDF export, so link look changes usually
  touch both. Panning and zooming only transform the view (`renderView`/`applyView`).
- **Derived link look.** `linkColor()` resolves a link's colour (its own colour, then its group's links colour, then a block
  connector's colour, then a link connector's colour). Links through groups and zip-ties are routed by
  `linkRoutes()`, which builds each link's chain of ends, ties and group stops.
- **Shared copies.** Clones (`cloneGroup`) are kept identical by `syncClones()`. References
  mirror a block of another saved schema, and saving writes the reverse links into that schema (`auto`).
- **UI construction.** The panel is built with the `h(tag, props, ...children)` helper and helpers such as `field`,
  `colorField`, `swatches`, `slider`, `styleField`. Buttons with `data-action` are dispatched through
  the `actions` map near the end of `app.js`. Letter shortcuts are handled in the global keydown
  handler and go by key position, so they work with non-Latin layouts.
- **Storage.** The library of saved schemas is in `localStorage` (`schematic:*` keys). Chrome and
  Edge can use a folder of JSON files instead (File System Access API), with conflict detection
  when a file changes from elsewhere.

## Conventions

- Match the surrounding code: short comments that explain why, plain functions, no classes or
  frameworks. User-facing text uses British spelling ("colour") and sentence case.
- External scripts and libraries are not used; keep it that way.
