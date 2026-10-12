# Schematic

A browser-based editor for drawing schemas made of blocks and the links between them.
Plain HTML, CSS and JavaScript: no build step, no server, no dependencies.

![Schematic with an example schema](docs/images/overview.png)

New to the tool? See the illustrated guide: [Working with Schematic](docs/guide.md).

## Running

Open `index.html` in a browser.

Icons come from the Material Symbols font on Google Fonts, so they need an internet connection.
Everything else works offline.

## Features

### Blocks

- Rounded rectangles with a name, ID, description, icon, background colour, border colour, border width and
  border style (solid, dashed or dotted).
- Any number of custom name/value attributes.
- Move by dragging; resize by dragging an edge or corner of the selected block.
- The icon sits above the name. When a block is too small for both, only the icon is shown, centred.
- Icons are picked from a searchable grid or typed in by their Material Symbols name.
- The ID follows the name (lower case, words joined by dashes, numbered if already taken) until you
  type one yourself; clearing the ID field makes it follow the name again. IDs are always unique.
  The same applies to links, titles, frames and link connectors.

### Connectors

- Small circles on any side of a block, spread evenly along that side.
- Optional name, shown next to the connector, and optional colour.
- Added per side from the block panel, where they are listed grouped by side.
- Moved to another side from the panel, or by Alt+dragging on the canvas (which also reorders them).

### Links

- Drag from one connector to another to link them.
- Links are curves that meet each connector at a right angle to its side.
- Shift+drag from a connector to pick up the link ends attached to it and drop them on another connector.
  If some of those links are selected, only they move; otherwise all of them do.
- Each link has a name (drawn on the link), an ID, a description, a colour, a line style (solid, dashed or dotted)
  and custom attributes.
- Colour priority: the link's own colour, then its group's links colour, then the colour of a block
  connector it ends at, then the colour of a link connector it ends at. Two block connectors (or two
  link connectors) with different colours give a black link.
- A new link starts with the colour of the connector it is drawn from. From an uncoloured link
  connector it takes the colour its existing links share. Such links keep following that connector's
  colour when it changes. A link connector created by a Shift-drop takes the same colour.
- White and very pale links get a thin grey edge so they stay visible.

### Link connectors

- A free-standing dot, like a block's connector but placed anywhere on the canvas.
- Any number of links can start or end at it, all meeting in one point.
- Created from the toolbar, or by holding Shift while dropping a new link on empty canvas: a preview
  dot shows where the link connector will appear, with the link attached.
- Links leave it at a right angle: left or right by default, or up or down if set so.
  Each link meeting there can also be given its own side (left, right, up or down).
- It has a name, ID, description, colour, border colour and custom attributes; its colour is passed on to its links unless a block connector
  at the other end has a colour of its own.
- Drag from the dot to start a link; drag its arrows handle, or Alt+drag the dot, to move it.

### Titles

- Free text placed anywhere on the schema, with no border or background.
- Text (one or several lines), size, colour and alignment are set in the panel; the box is moved and
  resized like a block.

### Frames

- A titled rectangle drawn beneath all other elements, with its title in the top-left corner.
- Whatever lies entirely inside a frame moves with it; the frame can be resized without moving its contents.
- Background and border are set as for blocks. By default there is no background and the border is solid grey.
- A frame is selected and dragged by its title or border; the inside stays free for the elements in it.

### Clones

- Clone a block to get linked copies that always change together: name, icon, colours, size,
  attributes and connectors are shared; ID, position and links are individual.
- A connector cannot be removed while any clone has a link on it.
- A clone can be detached to become an independent block. Duplicate makes an independent copy straight away.

### Link groups

- Select several links (Shift+click) and group them into a group block.
- Grouped links run into the left side of the group block and out of its right side, without connectors.
- The group block has the usual block settings (name, icon, colours, attributes) and can set a colour
  for all its links or for each one.
- Links can be moved into or out of a group; ungrouping removes the block and keeps the links.

### Trace

- **Trace** in the toolbar (or the T key) turns tracing on and off.
- While it is on, hovering a connector or a link marks the whole path that shares its name: links
  and connectors of that name, continuing through a block from one connector to its others of the
  same name. Other links fade back.
- Unnamed links and connectors do not break a path; a differently named one ends it. Names are
  compared ignoring case. A link connector's name is the name of its dot.

### Schema parameters

- Corner radius for all blocks.
- Line width of all links, and the size of all link connectors.
- Colour and width of the trace mark.
- A colour palette stored with the schema and offered wherever a colour is chosen.
  Colours can be added and removed.

### Storage

- Save schemas by name to browser local storage; load or delete them from a list.
- The working copy is kept automatically, so a reload does not lose unsaved edits.
- Export to a JSON file and import it back.
- **Export all** (in the Load dialog) writes every saved schema to one file; importing that file
  adds them all back to the saved schemas.
- A JSON dialog shows the schema as text and applies edits made there.

### Canvas

- Pan by dragging the background; zoom with Ctrl/⌘+scroll or the toolbar; fit the schema to the view.
- Shift+drag on empty canvas draws a selection box; Shift+click adds or removes single elements.
  Dragging one selected element moves them all, and Delete removes them all.
- Several selected elements can be aligned (left, centre, right, top, middle, bottom) or spread with
  equal gaps, horizontally or vertically, from the panel.
- Ctrl/⌘+C, X and V copy, cut and paste the selected elements (blocks, link connectors, titles,
  frames) together with the links between them, also into another schema or tab.
- Blocks snap to a 10 px grid; hold Alt to move or resize freely.
- Undo and redo.

## Keyboard and mouse

| Action | Shortcut |
| --- | --- |
| Add a block | Double-click the canvas |
| Rename a block | Double-click it |
| Link two connectors | Drag from one to the other |
| New link ending in a new link connector | Drag from a connector, hold Shift, release on empty canvas |
| Reattach links to another connector | Shift+drag from the connector they are on |
| Move or reorder a connector | Alt+drag it |
| Move a link connector | Drag its arrows handle, or Alt+drag the dot |
| Select several elements | Shift+drag on empty canvas, or Shift+click them |
| Select several links | Shift+click (or Ctrl/⌘+click) |
| Group selected links | Ctrl/⌘+G |
| Copy / cut / paste selected elements | Ctrl/⌘+C / Ctrl/⌘+X / Ctrl/⌘+V |
| Duplicate the selected block | Ctrl/⌘+D |
| Delete the selection | Delete or Backspace |
| Undo / redo | Ctrl/⌘+Z / Ctrl/⌘+Shift+Z |
| Save | Ctrl/⌘+S |
| Trace paths by name on hover | T |
| Ignore the grid | Hold Alt while dragging |
| Zoom | Ctrl/⌘+scroll |

## Files

- `index.html` — page structure, toolbar and dialogs
- `style.css` — styling
- `app.js` — the whole application
- `docs/guide.md` — illustrated guide to working with the tool
