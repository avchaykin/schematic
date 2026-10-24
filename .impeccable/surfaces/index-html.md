---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: ["app.js","style.css"]
---

# Schematic editor (index.html)

Scope: the whole app chrome: top bar, tool rail, trace band, canvas sheet, inspector, dialogs, menu, status bar. Visitor mode: Operate. The schema's own colours (blocks, links, connectors, palette, and the trace mark colour, a per-schema setting defaulting to amber so a trace stands out over links of any colour, green included) are user data and stay outside the system; only selection, hover and editing marks join it.

Audience and job: the author, drawing and following architecture, wiring and network schemas on a Mac in Chrome, often for long sessions. Constraints: three files, no build, no dependencies, offline, Material Symbols for icons, light and dark mode. Must not feel like the grey-toolbar-with-blue-accent editor it replaces, generic SaaS, or playful.

## Direction contract

THESIS: The chrome reads like printed particulars: white sheets on a soft sage ground, hairline rules, ink section rules, and one heritage green that marks only where you are. Taken over from the Floorplan project at the author's request; it refuses the slate toolbar with a blue accent.

OWN-WORLD: Sage ground #f2f4f1, white sheets #ffffff with #d5dbd5 hairlines, ink #1c2420, muted #5b665f, heritage green #1f5a45 for state only (Trace on, open menus, focus, selection marks, the hovered signal), green wash #e6ece7 under current rows. Avenir Next / Segoe UI, sentence case, tabular figures right-aligned, 1px ink rules over sections. Radii 4/6px, soft shadows on floaters only. Dark: green-black ground, same roles, mint #7cc6a4.

STORY: The author opens a schema and the side sheet already reads like its particulars: how many links run between how many blocks, then every named signal with its link and block counts. Pointing at a signal traces it across the drawing.

FIRST VIEWPORT: 48px white top bar: green-outlined brand square + "Schematic", the schema name with its dropdown, file group; history, zoom, theme, JSON, import/export group and a "Schema" button right. Canvas sheet inset 10px on sage with a floating white tool rail top-left (add Block, Connector, Title, Frame, Reference, Comment; Trace). 296px side sheet with the particulars (wider than Floorplan's 272px: connector rows carry a name, colour, helper, side and delete control). 26px sage status bar with the hints.

FORM: Property Particulars, pinned by the user ("use design style made before for floorplan project"); the roll was skipped because a user-pinned direction beats it. seed: none (roll skipped: direction pinned)
Signature interaction: the Signals schedule. With nothing selected, pointing at a signal row traces that signal on the canvas (whether or not Trace is on) and clicking selects its links. While Trace is on, a green-wash trace band slides down over the canvas saying what pointing does, with a T key cap to turn it off.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
