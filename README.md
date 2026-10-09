# Schematic

A browser-based editor for drawing schemas made of blocks and the links between them.
Plain HTML, CSS and JavaScript: no build step, no server, no dependencies.

## Running

Open `index.html` in a browser.

Icons come from the Material Symbols font on Google Fonts, so they need an internet connection.
Everything else works offline.

## Features

### Blocks

- Rounded rectangles with a name, ID, icon, background colour, border colour, border width and
  border style (solid, dashed or dotted).
- Any number of custom name/value attributes.
- Move by dragging; resize by dragging an edge or corner of the selected block.
- The icon sits above the name. When a block is too small for both, only the icon is shown, centred.
- Icons are picked from a searchable grid or typed in by their Material Symbols name.
- IDs are editable and must be unique.

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
- Each link has a name (drawn on the link), an ID, a colour, a line style (solid, dashed or dotted)
  and custom attributes.
- Colour priority: the link's own colour, then its group's links colour, then the colour of a block
  connector it ends at, then the colour of a link connector it ends at. Two block connectors (or two
  link connectors) with different colours give a black link.
- White and very pale links get a thin grey edge so they stay visible.

### Link connectors

- A free-standing dot, like a block's connector but placed anywhere on the canvas.
- Any number of links can start or end at it, all meeting in one point.
- Created from the toolbar, or by holding Shift while dropping a new link on empty canvas: the link
  connector appears there with the link attached.
- Links leave it at a right angle: left or right by default, or up or down if set so.
- It has a name, ID, colour and custom attributes; its colour is passed on to its links unless a block connector
  at the other end has a colour of its own.
- Drag from the dot to start a link; drag its arrows handle, or Alt+drag the dot, to move it.

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

### Schema parameters

- Corner radius for all blocks.
- A colour palette stored with the schema and offered wherever a colour is chosen.
  Colours can be added and removed.

### Storage

- Save schemas by name to browser local storage; load or delete them from a list.
- The working copy is kept automatically, so a reload does not lose unsaved edits.
- Export to a JSON file and import it back.
- A JSON dialog shows the schema as text and applies edits made there.

### Canvas

- Pan by dragging the background; zoom with Ctrl/⌘+scroll or the toolbar; fit the schema to the view.
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
| Select several links | Shift+click (or Ctrl/⌘+click) |
| Group selected links | Ctrl/⌘+G |
| Duplicate the selected block | Ctrl/⌘+D |
| Delete the selection | Delete or Backspace |
| Undo / redo | Ctrl/⌘+Z / Ctrl/⌘+Shift+Z |
| Save | Ctrl/⌘+S |
| Ignore the grid | Hold Alt while dragging |
| Zoom | Ctrl/⌘+scroll |

## Files

- `index.html` — page structure, toolbar and dialogs
- `style.css` — styling
- `app.js` — the whole application
