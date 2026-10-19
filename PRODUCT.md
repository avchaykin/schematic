# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

One person: the author, drawing schemas for their own work. Other people see the results only as
exported pictures or shared JSON files; there are no accounts, roles or collaborators inside the app.

## Product Purpose

Schematic is a browser editor for schemas made of blocks, connectors and the links between them.
It is used for three kinds of drawing:

- system architecture: services and components and the data flowing between them;
- wiring and signals: hardware, cables, buses and named signals running across blocks;
- networks: devices and the connections between them.

Success means a schema that can be drawn quickly, followed easily (which signal goes where), kept
safely as files, and exported cleanly for documents.

## Positioning

A schematic editor shaped around connections rather than shapes: connectors belong to blocks and
carry names, links can be bundled into groups (shown as a block or as a single bus line), a named
signal can be traced across blocks and links, and blocks of one schema can be referenced from
another with the links mirrored on both sides. Schemas stay plain JSON files the author owns.
(Derived from the features built so far.)

## Operating Context

- Runs by opening `index.html` in Chrome on the author's Mac; no server.
- Schemas are kept either in browser storage or, in Chrome, as JSON files in a folder chosen by the
  author, typically on iCloud Drive and possibly in git, saved automatically while editing. The same
  folder may be opened from another computer.
- Results leave the app as PNG or PDF pictures, or as exported JSON.

## Capabilities and Constraints

- Plain HTML, CSS and JavaScript with no build step and no dependencies (`index.html`, `style.css`,
  `app.js`). Must keep working by opening the file directly.
- Works offline; the only network use is the optional icon font from Google Fonts.
- Chrome (and Edge) are the target. Other browsers need only basic function; folder storage is
  Chrome/Edge only.
- Schema files are JSON with a format version, the writing app's name, version and repository
  address, and created/modified timestamps. Current app version: 1.0.
- Elements: blocks (with icon and connectors on any side), link connectors (free dots), titles,
  comments (sticky notes), frames, link groups, references to blocks in other schemas.
- Links: curved, straight or polyline, with colours, styles, names, routing around their own block.

## Brand Commitments

- Name: Schematic.
- Repository: https://github.com/avchaykin/schematic
- Icons come from Material Symbols Outlined.

## Evidence on Hand

- Screenshots of the tool in `docs/images/` (overview, links, connectors, groups, clones, frames,
  JSON, parameters), used by the guide `docs/guide.md`.
- No users, testimonials or metrics exist beyond the author; none should be invented.

## Product Principles

1. Connections are the subject: anything that makes links clearer to draw, route and follow comes first.
2. The author owns the files: plain JSON, readable and diffable, never locked into a service.
3. No build, no dependencies: opening the file is the whole installation.
4. Precise and quiet: the drawing is the focus; the interface stays out of its way.
5. Nothing is lost: changes are kept automatically, and conflicts are surfaced, not silently resolved.
