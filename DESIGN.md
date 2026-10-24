---
name: Schematic
description: A personal, offline schema editor whose chrome reads like the printed particulars of the drawing it holds.
colors:
  heritage-green: "#1f5a45"
  on-green: "#ffffff"
  green-wash: "#e6ece7"
  selection-tint: "rgb(31 90 69 / .08)"
  ink: "#1c2420"
  on-ink: "#ffffff"
  sage-ground: "#f2f4f1"
  sheet-white: "#ffffff"
  sunken-sheet: "#f6f7f5"
  field-white: "#ffffff"
  hairline: "#d5dbd5"
  schedule-rule: "#e1e6e1"
  muted-ink: "#5b665f"
  hover-wash: "#f0f3ef"
  off-sage: "#b3bcb5"
  canvas-dot: "rgb(186 196 188)"
  connector-edge: "#3a453f"
  warn-amber: "#9a5b00"
  danger-red: "#c62828"
  dark-green: "#7cc6a4"
  dark-on-green: "#0f1512"
  dark-wash: "#1f2b25"
  dark-selection-tint: "rgb(124 198 164 / .1)"
  dark-ink: "#e7ece8"
  dark-on-ink: "#111513"
  dark-ground: "#111513"
  dark-sheet: "#181d1a"
  dark-sunken: "#141815"
  dark-field: "#141815"
  dark-hairline: "#2c3530"
  dark-muted: "#9ba69f"
  dark-hover: "#202723"
  dark-off: "#56615a"
  dark-canvas-dot: "rgb(58 68 62)"
  dark-connector-edge: "#9ba69f"
  dark-warn: "#e0a060"
  dark-danger: "#ff7b72"
typography:
  figure:
    fontFamily: "\"Avenir Next\", Avenir, \"Segoe UI\", \"Helvetica Neue\", system-ui, sans-serif"
    fontSize: "30px"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-.02em"
    fontFeature: "\"tnum\""
  headline:
    fontFamily: "\"Avenir Next\", Avenir, \"Segoe UI\", \"Helvetica Neue\", system-ui, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    letterSpacing: "-.01em"
  title:
    fontFamily: "\"Avenir Next\", Avenir, \"Segoe UI\", \"Helvetica Neue\", system-ui, sans-serif"
    fontSize: "16px"
    fontWeight: 700
    letterSpacing: "-.01em"
  group:
    fontFamily: "\"Avenir Next\", Avenir, \"Segoe UI\", \"Helvetica Neue\", system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 700
  section:
    fontFamily: "\"Avenir Next\", Avenir, \"Segoe UI\", \"Helvetica Neue\", system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 700
  body:
    fontFamily: "\"Avenir Next\", Avenir, \"Segoe UI\", \"Helvetica Neue\", system-ui, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.4
    fontFeature: "\"tnum\""
  label:
    fontFamily: "\"Avenir Next\", Avenir, \"Segoe UI\", \"Helvetica Neue\", system-ui, sans-serif"
    fontSize: "12px"
    fontWeight: 500
  micro:
    fontFamily: "\"Avenir Next\", Avenir, \"Segoe UI\", \"Helvetica Neue\", system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 600
  canvas-text:
    fontFamily: "system-ui, -apple-system, \"Segoe UI\", Roboto, sans-serif"
    fontSize: "13px"
    fontWeight: 500
  canvas-caption:
    fontFamily: "system-ui, -apple-system, \"Segoe UI\", Roboto, sans-serif"
    fontSize: "10px"
    fontWeight: 500
    lineHeight: 1.2
  code:
    fontFamily: "ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
    fontSize: "12px"
    lineHeight: "18px"
rounded:
  handle: "2px"
  swatch: "3px"
  control: "4px"
  sheet: "6px"
  dot: "50%"
spacing:
  xs: "4px"
  sm: "6px"
  md: "8px"
  inset: "10px"
  lg: "12px"
  panel: "14px"
  dialog: "20px"
  field-height: "28px"
  control-height: "30px"
  top-bar: "48px"
  trace-band: "40px"
  status-bar: "26px"
  side-column: "316px"
  side-sheet: "296px"
components:
  button:
    backgroundColor: "{colors.sheet-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "30px"
  button-primary:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "30px"
  button-primary-dark:
    backgroundColor: "{colors.dark-ink}"
    textColor: "{colors.dark-on-ink}"
    rounded: "{rounded.control}"
    padding: "0 12px"
    height: "30px"
  button-open:
    backgroundColor: "{colors.green-wash}"
    textColor: "{colors.heritage-green}"
    rounded: "{rounded.control}"
    height: "30px"
  input:
    backgroundColor: "{colors.field-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    padding: "0 7px"
    height: "28px"
  tool-rail:
    backgroundColor: "{colors.sheet-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sheet}"
    padding: "4px"
  tool-button:
    textColor: "{colors.ink}"
    rounded: "{rounded.control}"
    width: "34px"
    height: "28px"
  tool-button-armed:
    backgroundColor: "{colors.heritage-green}"
    textColor: "{colors.on-green}"
    rounded: "{rounded.control}"
    width: "34px"
    height: "28px"
  trace-band:
    backgroundColor: "{colors.green-wash}"
    textColor: "{colors.ink}"
    padding: "0 6px"
    height: "40px"
  trace-band-pictogram:
    backgroundColor: "{colors.heritage-green}"
    textColor: "{colors.on-green}"
    rounded: "{rounded.control}"
    size: "28px"
  schedule-row:
    textColor: "{colors.ink}"
    typography: "{typography.body}"
    height: "30px"
  schedule-row-pointed:
    backgroundColor: "{colors.hover-wash}"
    textColor: "{colors.heritage-green}"
    height: "30px"
  menu-item-current:
    backgroundColor: "{colors.green-wash}"
    textColor: "{colors.heritage-green}"
    rounded: "{rounded.control}"
    padding: "0 8px"
    height: "30px"
  key-cap:
    backgroundColor: "{colors.sheet-white}"
    textColor: "{colors.ink}"
    typography: "{typography.micro}"
    rounded: "{rounded.control}"
    padding: "0 5px"
    height: "20px"
  dialog:
    backgroundColor: "{colors.sheet-white}"
    textColor: "{colors.ink}"
    rounded: "{rounded.sheet}"
    padding: "16px 20px 18px"
  toast:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.on-ink}"
    rounded: "{rounded.control}"
    padding: "9px 14px"
---

# Design System: Schematic

## Overview

**Creative North Star: "The Property Particulars"**

Schematic adopts the Property Particulars world first built for Floorplan. The chrome around the drawing reads like a printed particulars sheet: white sheets laid on a soft sage ground, hairline rules between entries, a 1px ink rule over every section, figures set tight to the right margin in tabular columns. One heritage green marks only where you are. The drawing is the subject; the chrome is the sheet that describes it and never competes with it. The schema's own colours (block fills and borders, link and connector colours, the palette, group frame colours, and the trace mark colour) are the author's data, saved with each schema, and sit outside this system. Only the selection, hover and editing marks drawn on top of the drawing belong to it.

The world is dense and calm. Controls are 30px, inputs 28px, body type is a system brochure sans at 13px with tabular figures, headings are bold and sentence case. The canvas and the side sheet are white sheets inset 10px on the sage ground with 6px top corners, open at the bottom where they meet the status bar. Depth is flat: tonal steps between sage, white and sunken sheet, hairlines, and ink section rules; soft shadows lift only what floats. The one moving part of the chrome is the trace band, which slides down over the canvas in 180ms while Trace is on.

Light mode is white sheets on sage with ink primary actions. Dark mode is a green-black ground with dark sheets, the same roles one for one, the green lifted to a pale mint with a near-black glyph. The system replaces, and refuses, the slate toolbar with a blue accent that most editors default to.

**Key Characteristics:**
- Heritage green is state only: Trace on, the trace band, open menus and toggles, the current menu row, focus, the pointed-at signal, and every selection, hover and editing mark on the canvas. The brand square's green outline is its one identity use.
- Ink rules (1px, ink) open every section: inspector subheads, the Signals schedule, dialog parameter groups. Hairlines separate everything else.
- With nothing selected the side sheet is the schema's particulars: its name, the link count as the one big figure, then the Signals schedule.
- Brochure sans from the system for the chrome; the drawing itself is set in system-ui, the face its PNG and PDF exports use.
- Material Symbols Outlined for every pictogram: 18px in the top bar and trace band, 20px in the tool rail and icon grid.
- Small radii (4px controls, 6px sheets), soft shadows on floaters only.

## Colors

White sheets and sage greys tinted toward green, set in a green-black ink, with a single heritage green for state. Every chrome colour is a custom property on `:root` with a same-role value on `:root[data-theme="dark"]`.

### Primary
- **Heritage Green** (heritage-green; dark-green in dark mode; `--mark`): the mark. The armed Trace cell, the trace-band pictogram and its "Trace" name, the open schema-list arrow and other active toggles, the current row in the schema list, segmented choices and text choices that are on, the active swatch ring, the 2px focus ring, the pointed-at signal row, the brand square outline, native accent and caret colour. On the canvas: dashed selection outlines, corner handle edges, the selected-link halo, the hovered or targeted connector, the link being drawn, the junction ghost, the marquee edge and its hint, the move and jump buttons on junctions and references. Glyphs on solid green are on-green (dark-on-green).
- **Green Wash** (green-wash; dark-wash; `--wash`): the ground under green text. Open toggles, active segmented and text choices, the current schema-list row, the trace band, the fill of corner handles, selected group tags, the junction move button, and text selection.
- **Selection Tint** (selection-tint; dark-selection-tint; `--select-fill`): the translucent fill inside the marquee.

### Neutral
- **Ink** (ink; dark-ink): all text, the primary action (Apply), the toast ground, section rules.
- **Sage Ground** (sage-ground; dark-ground): the page ground under the sheets, and the status bar.
- **Sheet White** (sheet-white; dark-sheet): top bar, side sheet, tool rail, menu, dialogs, buttons, key caps. The canvas paper takes the same value.
- **Field White** (field-white; dark-field): inputs, selects and the schema name box; in dark mode it drops to the sunken value so fields read as wells.
- **Sunken Sheet** (sunken-sheet; dark-sunken): the icon picker and connector colour wells, the library location strip, the JSON editor.
- **Hairline** (hairline; dark-hairline): every 1px border and divider, key cap edges, the trace band's lower edge.
- **Schedule Rule** (schedule-rule; shares dark-hairline): the lighter rule between Signals rows, tool-rail groups and library rows.
- **Muted Ink** (muted-ink; dark-muted): secondary text, field labels, schedule figures and column heads, the status bar, connector names on the canvas, frame titles, reference captions. Uncoloured links default to this value.
- **Hover Wash** (hover-wash; dark-hover): row, menu item, quiet button and tool cell hover; button press.
- **Off Sage** (off-sage; dark-off): scrollbar thumbs and the outline behind dimmed links.
- **Canvas Dot** (canvas-dot; dark-canvas-dot; `--grid`, stored as an r g b triplet): the 1px dot grid on the canvas paper.
- **Connector Edge** (connector-edge; dark-connector-edge; `--dot-edge`): the ring of a connector that has no colour of its own.
- **Status colours** (warn-amber, danger-red and their dark values): the unsaved mark on Save and a pending folder, invalid inputs, danger buttons, JSON errors. Text, rings and the 6px unsaved dot only.

### Named Rules
**The One Mark Rule.** Heritage green answers "where am I". If an element is not Trace, an open toggle or menu, the current row, focus, the pointed-at signal or a selection or editing mark, it is not green. The brand square outline is the only exception.

**The Wash, Not Fill Rule.** Open toggles, current rows and active choices are green text on the green wash with a green border, never solid green. Solid green with an on-green glyph is reserved for the armed Trace cell, the trace-band pictogram, the picked icon in the icon grid and a hovered connector.

**The Ink Primary Rule.** The primary action is ink with an on-ink label. Primary buttons are never green, so a green element is never mistaken for a commit.

**The Author's Colours Rule.** Block, link, connector, group frame and trace colours belong to the schema and are saved with it. The trace mark defaults to amber (#f59e0b) so a trace stands out over links of any colour, green included; the author may change it per schema, or set it to the link's own colour or none. Chrome tokens never restyle the drawing, and drawing colours never enter the chrome.

**The Same Roles at Night Rule.** Every chrome colour has a light and a dark value with the same role; dark mode lifts the green to mint with a near-black glyph rather than inventing new hues.

## Typography

**Display Font:** none; the 30px figure is the body family in bold.
**Body Font:** Avenir Next (with Avenir, Segoe UI, Helvetica Neue, system-ui, sans-serif)
**Canvas Font:** system-ui (with -apple-system, Segoe UI, Roboto, sans-serif), so the drawing on screen matches its PNG and PDF exports.
**Label/Mono Font:** ui-monospace, SFMono-Regular, Menlo for the JSON editor only.

**Character:** A geometric-humanist brochure sans taken from the operating system, as on a printed particulars sheet. Bold carries hierarchy; sizes step in small increments. The drawing keeps a neutral system face because it leaves the app as an export.

### Hierarchy
- **Figure** (700, 30px, 1.1, -.02em): the link count in the schema particulars, with "links between N blocks" in 13px 500 muted ink on its baseline.
- **Headline** (700, 18px, -.01em): dialog titles.
- **Title** (700, 16px, -.01em): the side sheet's first heading (the schema name, Block, Link), the brand name, and "Trace" in the trace band.
- **Group** (700, 14px): parameter group heads in dialogs.
- **Section** (700, 13px): inspector subheads (Appearance, Connectors, Attributes) and the "How to" fold.
- **Body** (400, 13px, 1.4): everything else. Buttons are 500, primary buttons and trace-band exit 600, signal names and library names 600, the schema name 600.
- **Label** (500, 12px): field labels, schedule column heads, connector side groups, menu meta, notes, the status bar, segmented choices.
- **Micro** (600, 11px): key caps and the marquee hint.
- **Canvas text** (500, inherited 13px): block names; titles are 600 and scale with the drawing.
- **Canvas caption** (500, 10px): link labels (haloed in the paper colour), connector names, reference captions, group tags.

### Named Rules
**The Tabular Rule.** The whole chrome sets tabular figures; counts sit right-aligned in fixed columns (the Signals schedule, slider values in a 40px column) so they line up and do not jitter.

**The Sentence Case Rule.** Labels, buttons and headings are sentence case and bold where they lead. No uppercase tracking, no small labels above headings.

**The Export Face Rule.** Anything drawn on the canvas is set in system-ui, never in the chrome's brochure stack, because the PNG and PDF exports draw it that way.

## Layout

A fixed application grid: a 48px white top bar, the canvas sheet filling the rest, a 316px side column, and a 26px sage status bar. The canvas sheet and the side sheet are inset 10px from the sage ground (the side sheet is 296px wide inside its column, wider than Floorplan's because connector rows carry a name, colour, helper, side and delete control), open at the bottom. The tool rail floats 10px in from the canvas's top-left corner. While Trace is on, the 40px trace band spans the top of the canvas from just right of the rail (62px) to the sheet's edge.

The top bar runs left to right: the brand square and name, the schema name box with its list arrow, the file group, then after a spacer history, zoom, theme, JSON, the import and export group, and a text "Schema" button for the schema parameters. Related buttons are grouped with shared borders. Below 1100px the brand name hides and the name box narrows from 210px to 150px so the bar keeps one line.

The side sheet is padded 14px (18px at the foot). Field rows are a two-column grid (86px label, flexible value; 130px labels in dialogs). Controls are 30px, inputs 28px, schedule and menu rows 30px. Gaps step 4, 6, 8 and 12px; sections open 18px below the last. The schema parameters dialog is up to 1000px wide in balanced columns of at least 270px with a 28px gutter; other dialogs are 520px (JSON 860px), padded 20px.

## Elevation & Depth

Flat by default: depth comes from the sage, white and sunken tonal steps, hairlines and ink section rules. Chrome shadows are soft, tinted with the ink colour (pure black in dark mode), and used only for things that float over the canvas or the page. Elements of the drawing carry their own small contact shadows so blocks and comments sit on the paper; those belong to the drawing.

### Shadow Vocabulary
- **Float** (`box-shadow: 0 1px 2px rgb(28 36 32 / .06), 0 6px 18px rgb(28 36 32 / .08)`): the tool rail, the schema list menu, the connector side picker.
- **Lift** (`box-shadow: 0 4px 12px rgb(28 36 32 / .08), 0 24px 64px rgb(28 36 32 / .14)`): dialogs, over a rgb(28 36 32 / .25) backdrop.
- **Toast lift** (`box-shadow: 0 2px 6px rgb(28 36 32 / .14), 0 12px 32px rgb(28 36 32 / .14)`): the toast.
- **Block contact** (`box-shadow: 0 1px 2px rgb(28 36 32 / .1)`): block bodies on the canvas.
- **Note drop** (`filter: drop-shadow(0 2px 3px rgb(28 36 32 / .2))`): comments, which are clipped to a folded corner.

### Named Rules
**The Floaters Only Rule.** In the chrome, only the tool rail, menus, dialogs and the toast carry shadows. Sheets, the trace band, buttons, inputs and rows stay flat.

## Shapes

Small, calm corners. Controls, toggles, tool cells, the trace-band pictogram, key caps, menu rows, group tags and the toast use 4px; sheets (top corners only), the tool rail, menus and dialogs use 6px; colour swatches use 3px (large palette swatches 4px); corner handles 2px. The trace band is square except a 6px bottom-left corner where it meets the rail. Connectors and colour dots are circles. The brand square is a 2px green outline with 4px corners. Key caps carry a 2px bottom edge. Comments are clipped to a 14px folded corner. Borders are 1px hairlines; section heads take a 1px ink rule on top. Grouped and segmented buttons share borders and round only their outer corners. Gradients appear only as drawn devices: the canvas dot grid, the red diagonal of the "no colour" swatch, the mixed-colour wheel dot and the comment's folded corner; never as a fill.

## Components

### Buttons
- **Shape:** gently squared (4px), 30px high, 1px hairline border, white ground, weight 500, 12px side padding; icon-only buttons are 30px square with an 18px pictogram.
- **Primary:** ink with an on-ink label, weight 600. Hover drops opacity to .86.
- **Hover / Focus:** hover darkens the border to muted ink; press shows the hover wash; colour transitions take 150ms. Focus is a 2px heritage-green outline offset 1px. Disabled drops to .4 opacity.
- **Open / active:** green border, green wash, green glyph (the open schema-list arrow, a connected folder).
- **Danger:** danger-red text, danger-red border on hover.
- **Quiet icon buttons** (section heads, dialog close, icon grid): 28px, no visible border, hover wash.
- **Unsaved:** the Save pictogram turns warn-amber with a 6px amber dot in its top-right corner, taking no room of its own.

### Chips (segmented and text choices)
- **Style:** joined 30px (or 28px square) buttons sharing borders, 12px labels or 16px pictograms.
- **State:** the chosen one takes the green border, green wash, green text at 600. Text choices beside swatches ("Same as link") are 20px high and follow the same rule.

### Inputs / Fields
- **Style:** 28px, field-white, 1px hairline, 4px corners, 7px side padding; labels in 12px muted ink.
- **Focus:** the shared green focus ring; the caret is green. Invalid inputs take a danger-red border and ring.
- **Hover:** border darkens to muted ink. Placeholders are muted ink at full opacity.

### Navigation
- **Tool rail:** a white floating sheet (6px corners, hairline, float shadow) of 20px ink pictograms in 34x28px cells; the add tools (Block, Link connector, Title, Frame, Reference, Comment) and Trace are separate groups split by the schedule rule. Trace on is a solid green cell with an on-green pictogram; hover is the hover wash.
- **Schema list menu:** a floating sheet of 30px rows, name left and 12px muted meta right; the open schema's row takes the green wash with bold green text.

### Signals Schedule
The signature component. With nothing selected the side sheet reads like the schema's particulars: the schema name as the title, the link count as the 30px figure with "links between N blocks" beside it, then the Signals schedule under an ink rule. Column heads (Signal, Links, Blocks) are 12px muted ink; one 30px row per named signal, separated by the schedule rule, sorted by name with natural numbering; signal names 600 ink and truncated, counts in muted ink tight to the right margin. Pointing at a row traces that signal on the canvas whether or not Trace is on, washes the row with the hover wash, turns its text green and underlines the name (1.5px, offset 3px); clicking selects its links. With no named signals a single muted sentence under the ink rule says how to get some. A closed "How to" fold follows.

### Trace Band
A 40px green-wash band across the top of the canvas while Trace is on: a 28px green pictogram square with an 18px on-green route glyph, "Trace" in bold 16px green, one line in ink saying what pointing does (it changes when the schema ignores names), and at the right a quiet "Turn off" button led by a T key cap. It slides in from above in 180ms (cubic-bezier(.2,.8,.2,1)) and away when Trace turns off. A hairline runs under it.

### Status Bar
Contextual: it carries the keys for whatever is selected (several elements, a block, another element, links) and for the empty canvas otherwise, in 12px muted ink on the sage ground, separated by middle dots. The side sheet carries data and actions only.

**The One Place Rule.** Each instruction is said once: what pointing does under Trace is on the trace band, how to handle the selection is in the status bar, and neither is repeated in the side sheet.

### Selection Marks on the Canvas
A selected block, title, frame, comment or reference takes a 1.5px dashed green outline offset 3px; linked clones of the selected block take a 2px dashed one. Corner handles are 9px green-wash squares with a 1.5px green edge and 2px corners; edge handles are invisible 8px strips. A selected link carries a green halo at 30% opacity, 5px wider than the line. A hovered or targeted connector grows to 1.35x in solid green (80ms). The link being drawn is a green 6 4 dash. The marquee is a 1px green edge over the selection tint with a green 11px hint and key cap. Selected junctions show a small wash-and-green move button; references show a jump button in green (danger red when the target is missing).

### Dialogs and Toast
Dialogs are white sheets with 6px corners and the lift shadow: a header with the 18px title and a quiet close button over a hairline, a 20px-padded body whose parameter groups each open under an ink rule, and a hairline footer for notes and actions. The toast is an ink pill with 4px corners centred 18px above the canvas foot.

## Do's and Don'ts

### Do:
- **Do** keep heritage green (#1f5a45, #7cc6a4 in dark mode) for Trace, open toggles and menus, current rows, active choices, focus, the pointed-at signal and the selection and editing marks on the canvas.
- **Do** put open toggles, current rows and active choices on the green wash with green text and a green border; keep solid green for the armed Trace cell, the trace-band pictogram, the picked icon and a hovered connector.
- **Do** open every section with a 1px ink rule and separate entries with hairlines or the lighter schedule rule.
- **Do** use tabular figures right-aligned in fixed columns and bold sentence-case headings; keep body at 13px, controls at 30px and inputs at 28px.
- **Do** lay content on white sheets inset 10px on the sage ground; reserve chrome shadows for the rail, menus, dialogs and the toast.
- **Do** set everything drawn on the canvas in system-ui so the screen matches the PNG and PDF exports.
- **Do** give every chrome colour a light and a dark value with the same role, as custom properties on `:root` and `:root[data-theme="dark"]`.
- **Do** take every pictogram from Material Symbols Outlined.

### Don't:
- **Don't** use green for decoration, emphasis, primary buttons or status.
- **Don't** introduce a blue (or any other hue) as the interface accent; the slate toolbar with a blue accent is the world this replaced.
- **Don't** restyle block, link, connector, group frame or trace colours from the chrome system; they are the author's data, saved with the schema.
- **Don't** load webfonts for the chrome text; the Material Symbols icon font is the only network request.
- **Don't** use gradient fills, large radii or shadows on in-flow sheets and controls.
- **Don't** repeat an instruction from the trace band or the status bar in the side sheet.
