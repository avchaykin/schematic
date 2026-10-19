---
name: Schematic
description: A quiet, compact editor for schemas of blocks, connectors and links
colors:
  signal-blue: "#2563eb"
  blue-wash: "#dbeafe"
  trace-amber: "#f59e0b"
  red-flag: "#dc2626"
  drafting-ink: "#0f172a"
  pencil-grey: "#64748b"
  wire-slate: "#475569"
  connector-edge: "#334155"
  hairline: "#e2e8f0"
  hover-slate: "#f1f5f9"
  grid-dot: "#cbd5e1"
  graph-paper: "#f8fafc"
  sheet-white: "#ffffff"
  night-paper: "#0f172a"
  night-sheet: "#1e293b"
  night-hairline: "#334155"
  night-ink: "#e2e8f0"
  night-pencil: "#94a3b8"
  night-blue: "#3b82f6"
  night-wash: "#1e3a8a"
typography:
  title:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "15px"
    fontWeight: 700
    lineHeight: 1.4
  body:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.4
  body-strong:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "13px"
    fontWeight: 500
    lineHeight: 1.4
  label:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "11px"
    fontWeight: 600
    lineHeight: 1.4
    letterSpacing: "0.06em"
  note:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "11px"
    fontWeight: 400
    lineHeight: 1.4
  canvas-label:
    fontFamily: "system-ui, -apple-system, Segoe UI, Roboto, sans-serif"
    fontSize: "10px"
    fontWeight: 400
    lineHeight: 1.2
  mono:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "12px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  xs: "2px"
  sm: "4px"
  md: "6px"
  lg: "8px"
  xl: "12px"
  full: "50%"
spacing:
  xxs: "2px"
  xs: "4px"
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
components:
  button:
    backgroundColor: "{colors.sheet-white}"
    textColor: "{colors.drafting-ink}"
    rounded: "{rounded.md}"
    padding: "5px 9px"
  button-hover:
    backgroundColor: "{colors.hover-slate}"
  button-primary:
    backgroundColor: "{colors.signal-blue}"
    textColor: "{colors.sheet-white}"
    rounded: "{rounded.md}"
    padding: "5px 9px"
  button-toggle-on:
    backgroundColor: "{colors.blue-wash}"
    textColor: "{colors.signal-blue}"
  tool-group:
    backgroundColor: "{colors.sheet-white}"
    rounded: "{rounded.lg}"
    padding: "6px 7px"
  input:
    backgroundColor: "{colors.sheet-white}"
    textColor: "{colors.drafting-ink}"
    rounded: "{rounded.md}"
    padding: "5px 7px"
  section-label:
    textColor: "{colors.pencil-grey}"
    typography: "{typography.label}"
  menu:
    backgroundColor: "{colors.sheet-white}"
    rounded: "{rounded.lg}"
    padding: "4px"
  menu-item:
    rounded: "{rounded.md}"
    padding: "6px 10px"
  dialog:
    backgroundColor: "{colors.sheet-white}"
    textColor: "{colors.drafting-ink}"
    rounded: "{rounded.xl}"
  toast:
    backgroundColor: "{colors.drafting-ink}"
    textColor: "{colors.sheet-white}"
    rounded: "{rounded.lg}"
    padding: "8px 14px"
  connector:
    backgroundColor: "{colors.sheet-white}"
    rounded: "{rounded.full}"
    size: "12px"
---

# Design System: Schematic

## Overview

**Creative North Star: "The Engineer's Notebook"**

Schematic is a working page, not a showpiece. The canvas is a sheet of faint graph paper; the
toolbar and the settings panel sit at its edges like the margin of a notebook, set in small system
type and thin slate lines. Everything around the drawing is quiet and neutral so that the colours
the author gives to blocks, connectors and links carry all the meaning. A single blue marks what is
selected, pressed or about to happen; amber is reserved for tracing a signal.

The interface is dense on purpose. Controls are compact, grouped into rounded clusters with
hairline dividers, and familiar functions are icons only, with a tooltip for anyone who needs the
word. The settings panel reads like a form in a notebook: small uppercase section labels, a narrow
caption column, and fields that run to the edge.

The world has a night version that keeps the same structure and swaps paper for slate. Exports
always go out on white, because they leave the notebook for documents.

**Key Characteristics:**
- Neutral slate chrome; colour belongs to the schema, not the interface.
- One accent (Signal Blue) for selection, focus and active states.
- Compact 13px system type; 11px uppercase labels for structure.
- Thin 1px hairlines and small radii; almost no shadow on chrome.
- Light and dark themes with identical layout.

## Colors

A slate-neutral palette with one blue accent and one amber signal, taken from the Tailwind colour
scale and defined as CSS custom properties on `:root`, redefined for `[data-theme="dark"]`.

### Primary
- **Signal Blue** (`signal-blue`): selection rings, focus outlines, the primary Block button,
  pressed toggles, the marquee, connector hover. In dark mode it lightens to **Night Blue**.
- **Blue Wash** (`blue-wash`): the fill behind a pressed toggle or active choice, the selected icon
  tile, the active segment of a segmented control. **Night Wash** in dark mode.

### Secondary
- **Trace Amber** (`trace-amber`): the trace mark on links and connectors, the unsaved mark on the
  Save button, the pending-folder state. Its default can be changed per schema.

### Tertiary
- **Red Flag** (`red-flag`): destructive buttons, the "none" diagonal in swatches, errors, broken
  references.

### Neutral
- **Graph Paper** (`graph-paper`): canvas and recessed panel areas (pickers, colour trays).
- **Sheet White** (`sheet-white`): toolbar, panel, dialogs, menus, fields, default block fill.
- **Hairline** (`hairline`): every 1px border and divider in the chrome.
- **Hover Slate** (`hover-slate`): hover fill on buttons and menu items.
- **Grid Dot** (`grid-dot`): canvas dots, faded with zoom.
- **Drafting Ink** (`drafting-ink`): primary text; also the toast background.
- **Pencil Grey** (`pencil-grey`): secondary text, notes, section labels, connector names.
- **Wire Slate** (`wire-slate`): the default colour of an uncoloured link.
- **Connector Edge** (`connector-edge`): outline of an uncoloured connector and default block border.
- **Night Paper / Night Sheet / Night Hairline / Night Ink / Night Pencil**: the same roles in dark mode.

### Named Rules
**The Schema Owns Colour Rule.** Chrome stays slate. Saturated colour appears only where the author
put it, plus Signal Blue for state and Trace Amber for tracing.

**The One Accent Rule.** Signal Blue means "selected, focused or active" and nothing else; it is
never decoration.

## Typography

**Body Font:** the system UI font (system-ui, -apple-system, Segoe UI, Roboto, sans-serif)
**Label/Mono Font:** ui-monospace (SFMono-Regular, Menlo, Consolas) for the JSON editor only
**Icons:** Material Symbols Outlined, 18px by default

**Character:** Native, compact and unadorned. Hierarchy comes from size steps of one or two pixels,
weight and uppercase labels, not from a display face.

### Hierarchy
- **Title** (700, 15px): dialog headings.
- **Body** (400, 13px, line-height 1.4): all controls, panel text, menus.
- **Body Strong** (500, 13px): block names on the canvas, the schema name field.
- **Label** (600, 11px, 0.06em, uppercase): panel and dialog section headings.
- **Note** (400, 11px): help notes, list metadata, dates.
- **Canvas Label** (400–500, 10px): connector and link names, captions on the canvas.
- **Mono** (400, 12px, line-height 1.5): the JSON editor.

### Named Rules
**The Small Steps Rule.** Text sizes stay between 10px and 15px in the chrome; a larger size is only
for content the author sets (titles on the canvas, icons on blocks).

## Layout

A fixed application frame: a toolbar across the top, the canvas filling the rest, and a 300px
settings panel on the right. The toolbar is one row of grouped controls with 8px between groups,
a spacer pushing history and zoom to the right; below 1400px the add and tool groups drop their
labels, and the row wraps rather than scrolls. The panel uses a two-column field grid (76px caption,
flexible control; 130px in dialogs) with 6px row gaps and 14px padding. Spacing steps are 2, 4, 6,
8, 12 and 16px. The canvas has its own 10px snap grid, drawn as dots every 20px.

## Elevation & Depth

Chrome is flat: depth comes from hairline borders and the step between Graph Paper and Sheet White.
Shadows appear only on things that float above the page, and on blocks to lift them slightly off
the paper.

### Shadow Vocabulary
- **Block lift** (`box-shadow: 0 1px 3px rgb(15 23 42 / .12)`): blocks on the canvas.
- **Popover** (`box-shadow: 0 8px 24px rgb(15 23 42 / .18)`): the saved-schemas menu.
- **Picker** (`box-shadow: 0 2px 8px rgb(15 23 42 / .22)`): the connector side picker.
- **Toast** (`box-shadow: 0 4px 16px rgb(15 23 42 / .25)`): notifications.
- **Dialog** (`box-shadow: 0 20px 50px rgb(15 23 42 / .3)`): modal dialogs.
- **Selection ring** (`box-shadow: 0 0 0 3px rgb(37 99 235 / .35)`): selected blocks, connectors, tags.

### Named Rules
**The Flat Chrome Rule.** Toolbar, panel and fields never cast shadows; only floating layers and
canvas blocks do.

## Shapes

Small, consistent radii: 6px for buttons, fields and menu items; 8px for button groups, menus,
trays and toasts; 12px for dialogs; 4px for swatches, tags and handles; full circles for connectors
and colour dots. Block corners follow the schema's own corner-radius setting. Borders are 1px
hairlines in the chrome; canvas borders follow each element's settings.

## Components

### Buttons
- **Shape:** gently rounded (6px), 1px Hairline border, Sheet White fill.
- **Default:** 13px body text, icon and label 4px apart, padding 5px 9px; icon-only buttons 5px.
- **Hover / Focus:** Hover Slate fill; focus shows a 2px Signal Blue outline offset 1px.
- **Primary:** Signal Blue fill with white text (the Block button), darker blue on hover.
- **Toggle on:** Blue Wash fill, Signal Blue border and icon (Trace, active choices).
- **Danger:** Red Flag text on the default button.
- **Disabled:** 40% opacity.

### Tool groups (signature)
Related toolbar buttons share one 8px-rounded outline with hairline dividers between them and no
borders of their own: file, import/export, add elements, schema tools, history, zoom. The schema
name field and its dropdown arrow form one such group.

### Inputs / Fields
- **Style:** 1px Hairline border, 6px radius, Sheet White (Night Paper in dark), padding 5px 7px.
- **Focus:** 2px Signal Blue outline.
- **Error:** Red Flag border (invalid ID).

### Panel sections
Uppercase 11px Pencil Grey labels separate sections; fields sit in a caption/control grid; help
text is an 11px note under the controls.

### Menus and dialogs
Menus are Sheet White with an 8px radius, 4px padding and the Popover shadow; items are full-width,
6px-rounded rows with a Hover Slate hover. Dialogs have a 12px radius, a header and footer divided by
hairlines, and the Dialog shadow over a slate backdrop.

### Canvas elements
- **Connector:** a 12px circle, white fill with a 2px Connector Edge ring, or the connector's own
  colour with a ring 35% darker; grows and turns Signal Blue on hover.
- **Block:** the author's fill, border and corner radius, with the Block lift shadow; name in Body
  Strong, icon 32px above it.
- **Comment:** a sticky note with a folded bottom-right corner and a soft drop shadow, always on top.
- **Frame:** a titled outline behind everything, title in 13px 600 Pencil Grey.
- **Group tag:** a small white tag with a 1px border in the group's frame colour, 10px 500 text.

## Do's and Don'ts

### Do:
- **Do** keep chrome slate and let the schema's colours be the only strong colour on screen.
- **Do** use Signal Blue only for selected, focused, pressed or active states.
- **Do** group related toolbar actions in one shared outline (8px radius, hairline dividers).
- **Do** make familiar functions icon-only with a tooltip; keep labels for less familiar ones.
- **Do** define every chrome colour as a token with a dark-mode counterpart.
- **Do** keep text between 10px and 15px in the chrome.

### Don't:
- **Don't** add shadows to the toolbar, panel or fields.
- **Don't** use Trace Amber for anything but tracing and the unsaved/pending marks.
- **Don't** change layout between light and dark themes; only the tokens change.
- **Don't** make exports follow the dark theme; pictures always go out on white.
