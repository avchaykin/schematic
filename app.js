(() => {
  'use strict';

  const LIB_KEY = 'schematic:library';
  const CUR_KEY = 'schematic:current';
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const GRID = 10;
  const MIN_SIZE = 24;
  const MAX_RADIUS = 40;
  const MAX_BORDER = 12;
  const SMALL_W = 90;
  const SMALL_H = 70;
  const SIDES = ['top', 'right', 'bottom', 'left'];
  const NORMALS = { top: [0, -1], right: [1, 0], bottom: [0, 1], left: [-1, 0] };

  const DEFAULT_PALETTE = [
    '#ffffff', '#f1f5f9', '#cbd5e1', '#94a3b8', '#64748b', '#334155', '#0f172a',
    '#fee2e2', '#ffedd5', '#fef9c3', '#dcfce7', '#ccfbf1', '#dbeafe', '#e0e7ff', '#f3e8ff', '#fce7f3',
    '#ef4444', '#f97316', '#eab308', '#22c55e', '#14b8a6', '#3b82f6', '#6366f1', '#a855f7', '#ec4899',
  ];

  // Curated subset for the picker; any Material Symbols name can also be typed in.
  const ICONS = [
    'home', 'settings', 'search', 'person', 'group', 'database', 'storage', 'cloud', 'cloud_upload',
    'cloud_download', 'dns', 'router', 'lan', 'hub', 'device_hub', 'memory', 'developer_board',
    'computer', 'laptop', 'smartphone', 'tablet', 'desktop_windows', 'monitor', 'keyboard', 'mouse',
    'print', 'save', 'folder', 'folder_open', 'description', 'article', 'note', 'edit', 'delete',
    'check', 'close', 'lock', 'lock_open', 'key', 'security', 'shield', 'vpn_key', 'verified_user',
    'admin_panel_settings', 'api', 'code', 'terminal', 'bug_report', 'build', 'construction',
    'extension', 'widgets', 'apps', 'dashboard', 'analytics', 'bar_chart', 'pie_chart', 'show_chart',
    'timeline', 'table_chart', 'schema', 'account_tree', 'mediation', 'share', 'link', 'sync',
    'sync_alt', 'swap_horiz', 'swap_vert', 'compare_arrows', 'call_split', 'merge', 'alt_route',
    'route', 'input', 'output', 'login', 'logout', 'upload', 'download', 'send', 'mail', 'inbox',
    'chat', 'forum', 'notifications', 'campaign', 'call', 'videocam', 'photo_camera', 'image', 'mic',
    'volume_up', 'play_arrow', 'pause', 'stop', 'schedule', 'timer', 'alarm', 'event',
    'calendar_month', 'today', 'history', 'update', 'bolt', 'power', 'power_settings_new',
    'battery_full', 'electrical_services', 'lightbulb', 'sensors', 'wifi', 'bluetooth', 'cell_tower',
    'satellite_alt', 'rss_feed', 'public', 'language', 'map', 'place', 'navigation', 'explore',
    'local_shipping', 'flight', 'directions_car', 'train', 'factory', 'warehouse', 'store',
    'shopping_cart', 'payments', 'credit_card', 'account_balance', 'receipt_long', 'inventory_2',
    'category', 'label', 'sell', 'bookmark', 'star', 'favorite', 'thumb_up', 'flag', 'warning',
    'error', 'info', 'help', 'visibility', 'filter_alt', 'tune', 'function', 'calculate',
    'functions', 'data_object', 'data_array', 'token', 'smart_toy', 'psychology', 'science',
    'biotech', 'school', 'work', 'business', 'apartment', 'engineering', 'support_agent',
    'manage_accounts', 'badge', 'fingerprint', 'qr_code', 'layers', 'view_in_ar', 'deployed_code',
    'package_2', 'webhook', 'http', 'web', 'cable', 'settings_ethernet', 'toggle_on', 'water_drop',
    'thermostat', 'mode_fan',
  ];

  // ---------- helpers ----------

  const $ = (sel) => document.querySelector(sel);
  const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
  const snap = (v) => Math.round(v / GRID) * GRID;
  const uid = (prefix) => prefix + Math.random().toString(36).slice(2, 9);
  const num = (v, fallback) => (Number.isFinite(Number(v)) && v !== null && v !== '' ? Number(v) : fallback);

  function h(tag, props = {}, ...children) {
    const el = document.createElement(tag);
    for (const [key, value] of Object.entries(props)) {
      if (key === 'class') el.className = value;
      else if (key.startsWith('on')) el.addEventListener(key.slice(2), value);
      else if (key in el) el[key] = value;
      else el.setAttribute(key, value);
    }
    el.append(...children.filter((c) => c !== null && c !== undefined && c !== false));
    return el;
  }

  const icon = (name) => h('span', { class: 'mi' }, name);

  const isHex = (c) => /^#[0-9a-f]{6}$/i.test(c || '');

  function isPale(color) {
    const m = /^#([0-9a-f]{6})$/i.exec(color || '');
    if (!m) return false;
    const n = parseInt(m[1], 16);
    return (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255 > 0.9;
  }

  function contrastColor(bg) {
    const m = /^#([0-9a-f]{6})$/i.exec(bg || '');
    if (!m) return '#0f172a';
    const n = parseInt(m[1], 16);
    const lum = (0.299 * (n >> 16) + 0.587 * ((n >> 8) & 255) + 0.114 * (n & 255)) / 255;
    return lum > 0.6 ? '#0f172a' : '#ffffff';
  }

  // ---------- DOM refs ----------

  const viewport = $('#viewport');
  const world = $('#world');
  const linksG = $('#links-g');
  const inspector = $('#inspector');
  const nameInput = $('#schema-name');
  const toastEl = $('#toast');
  const libraryDialog = $('#library-dialog');
  const paletteDialog = $('#palette-dialog');
  const importFile = $('#import-file');

  // ---------- state ----------

  let schema = emptySchema();
  let view = { x: 0, y: 0, zoom: 1 };
  let selection = null; // { type: 'block' | 'link', id }
  let libName = null; // library entry this document was loaded from / saved as
  let undoStack = [];
  let redoStack = [];
  let lastSnapshot = JSON.stringify(schema);
  let tempLink = null; // { from, x, y, target } while dragging a new link
  let iconPickerOpen = false;
  let colorPickerConn = null; // which colour chooser is open in the inspector: a connector id or a block field key

  function emptySchema(name = 'Untitled') {
    return { format: 'schematic', version: 1, name, radius: 8, palette: [...DEFAULT_PALETTE], blocks: [], links: [] };
  }

  function freshBlockId(taken, prefix = 'block') {
    let n = 1;
    while (taken.has(`${prefix}-${n}`)) n++;
    return `${prefix}-${n}`;
  }

  function normalizeAttributes(raw) {
    const out = [];
    for (const a of Array.isArray(raw) ? raw : []) {
      if (a && typeof a === 'object') out.push({ name: String(a.name ?? ''), value: String(a.value ?? '') });
    }
    return out;
  }

  // Coerces arbitrary parsed JSON into a valid schema; throws if it is not one at all.
  function normalizeSchema(raw) {
    if (!raw || typeof raw !== 'object' || !Array.isArray(raw.blocks)) {
      throw new Error('Not a schematic file: "blocks" array is missing.');
    }
    const out = emptySchema(String(raw.name || 'Untitled'));
    out.radius = clamp(num(raw.radius, 8), 0, MAX_RADIUS);
    if (Array.isArray(raw.palette)) {
      out.palette = [...new Set(raw.palette.map((c) => String(c).toLowerCase()).filter(isHex))];
    }
    const blockIds = new Set();
    const connIds = new Set();

    for (const b of raw.blocks) {
      if (!b || typeof b !== 'object') continue;
      let id = String(b.id ?? '').trim();
      if (!id || blockIds.has(id)) id = freshBlockId(blockIds);
      blockIds.add(id);

      const connectors = [];
      for (const c of Array.isArray(b.connectors) && b.kind !== 'group' ? b.connectors : []) {
        if (!c || typeof c !== 'object') continue;
        let cid = String(c.id ?? '').trim();
        if (!cid || connIds.has(cid)) cid = uid('c');
        connIds.add(cid);
        const conn = { id: cid, name: String(c.name ?? ''), side: SIDES.includes(c.side) ? c.side : 'right', color: String(c.color ?? '') };
        if (c.ref) conn.ref = String(c.ref);
        connectors.push(conn);
      }

      out.blocks.push({
        id,
        name: String(b.name ?? ''),
        icon: String(b.icon ?? ''),
        background: String(b.background || '#ffffff'),
        border: String(b.border || '#334155'),
        borderWidth: clamp(num(b.borderWidth, 2), 0, MAX_BORDER),
        x: num(b.x, 0),
        y: num(b.y, 0),
        width: Math.max(MIN_SIZE, num(b.width, 140)),
        height: Math.max(MIN_SIZE, num(b.height, 90)),
        attributes: normalizeAttributes(b.attributes),
        connectors,
      });
      if (b.kind === 'group') {
        out.blocks[out.blocks.length - 1].kind = 'group';
        out.blocks[out.blocks.length - 1].linkColor = String(b.linkColor ?? '');
      }
      else if (b.cloneGroup) out.blocks[out.blocks.length - 1].cloneGroup = String(b.cloneGroup);
    }

    const linkIds = new Set();
    for (const l of Array.isArray(raw.links) ? raw.links : []) {
      if (!l || typeof l !== 'object') continue;
      if (!connIds.has(l.from) || !connIds.has(l.to) || l.from === l.to) continue;
      let id = String(l.id ?? '').trim();
      if (!id || linkIds.has(id)) id = uid('l');
      linkIds.add(id);
      out.links.push({
        id,
        from: l.from,
        to: l.to,
        color: String(l.color ?? ''),
        name: String(l.name ?? ''),
        attributes: normalizeAttributes(l.attributes),
      });
      if (out.blocks.some((b) => b.kind === 'group' && b.id === l.via)) out.links[out.links.length - 1].via = l.via;
    }
    // Make clone groups consistent, whatever the file said.
    pruneCloneGroups(out);
    for (const group of new Set(out.blocks.map((b) => b.cloneGroup).filter(Boolean))) {
      syncClones(out.blocks.find((b) => b.cloneGroup === group), out);
    }
    return out;
  }

  // ---------- storage ----------

  function readLibrary() {
    try {
      const lib = JSON.parse(localStorage.getItem(LIB_KEY) || '{}');
      return lib && typeof lib === 'object' ? lib : {};
    } catch {
      return {};
    }
  }

  function writeLibrary(lib) {
    try {
      localStorage.setItem(LIB_KEY, JSON.stringify(lib));
      return true;
    } catch (err) {
      toast('Could not write to browser storage: ' + err.message, true);
      return false;
    }
  }

  // Working copy, so a reload does not lose unsaved edits.
  function saveCurrent() {
    try {
      localStorage.setItem(CUR_KEY, JSON.stringify({ schema, view, libName }));
    } catch { /* storage full or unavailable; the explicit Save reports it */ }
  }

  let saveTimer = 0;
  function saveCurrentSoon() {
    clearTimeout(saveTimer);
    saveTimer = setTimeout(saveCurrent, 300);
  }

  function isDirty() {
    const entry = libName !== null ? readLibrary()[libName] : null;
    if (!entry) return schema.blocks.length > 0;
    return schema.name !== libName || JSON.stringify(entry.schema) !== lastSnapshot;
  }

  // ---------- history ----------

  function commit() {
    syncClones(selectedBlock());
    const snap = JSON.stringify(schema);
    if (snap === lastSnapshot) return;
    undoStack.push(lastSnapshot);
    if (undoStack.length > 200) undoStack.shift();
    redoStack = [];
    lastSnapshot = snap;
    saveCurrent();
    updateChrome();
  }

  function restore(snap) {
    schema = JSON.parse(snap);
    lastSnapshot = snap;
    if (selection?.type === 'block' && !findBlock(selection.id)) selection = null;
    if (selection?.type === 'link') {
      const ids = selection.ids.filter(findLink);
      selection = ids.length ? { type: 'link', ids } : null;
    }
    saveCurrent();
    refreshAll();
  }

  function undo() {
    if (!undoStack.length) return;
    redoStack.push(lastSnapshot);
    restore(undoStack.pop());
  }

  function redo() {
    if (!redoStack.length) return;
    undoStack.push(lastSnapshot);
    restore(redoStack.pop());
  }

  function replaceDocument(next, name = null) {
    schema = next;
    libName = name;
    selection = null;
    iconPickerOpen = false;
    colorPickerConn = null;
    undoStack = [];
    redoStack = [];
    lastSnapshot = JSON.stringify(schema);
    refreshAll();
    fitView();
    saveCurrent();
  }

  // ---------- model ----------

  const findBlock = (id) => schema.blocks.find((b) => b.id === id);
  const findLink = (id) => schema.links.find((l) => l.id === id);
  const sideConnectors = (block, side) => block.connectors.filter((c) => c.side === side);

  function findConnector(id) {
    for (const block of schema.blocks) {
      const conn = block.connectors.find((c) => c.id === id);
      if (conn) return { block, conn };
    }
    return null;
  }

  const selectedBlock = () => (selection?.type === 'block' ? findBlock(selection.id) : null);

  // ---------- clones ----------
  // Blocks sharing a cloneGroup are identical except for ID and position. Their connectors are
  // matched by `ref`, since each clone needs its own connector ids for links.

  const CLONE_SHARED = ['name', 'icon', 'background', 'border', 'borderWidth', 'width', 'height'];

  const cloneMembers = (block, s = schema) =>
    (block.cloneGroup ? s.blocks.filter((b) => b.cloneGroup === block.cloneGroup) : [block]);

  // Copies everything shared from `source` onto the other members of its group.
  function syncClones(source, s = schema) {
    if (!source?.cloneGroup) return;
    const siblings = cloneMembers(source, s).filter((b) => b !== source);
    if (!siblings.length) return;
    for (const c of source.connectors) if (!c.ref) c.ref = uid('r');
    const dropped = new Set();
    for (const b of siblings) {
      for (const key of CLONE_SHARED) b[key] = source[key];
      b.attributes = source.attributes.map((a) => ({ ...a }));
      const mine = new Map(b.connectors.map((c) => [c.ref, c]));
      b.connectors = source.connectors.map((c) => {
        const own = mine.get(c.ref);
        mine.delete(c.ref);
        return { id: own?.id ?? uid('c'), name: c.name, side: c.side, color: c.color || '', ref: c.ref };
      });
      for (const c of mine.values()) dropped.add(c.id);
    }
    if (dropped.size) s.links = s.links.filter((l) => !dropped.has(l.from) && !dropped.has(l.to));
  }

  // A group of one is just a block.
  function pruneCloneGroups(s = schema) {
    const count = new Map();
    for (const b of s.blocks) if (b.cloneGroup) count.set(b.cloneGroup, (count.get(b.cloneGroup) || 0) + 1);
    for (const b of s.blocks) if (b.cloneGroup && count.get(b.cloneGroup) < 2) delete b.cloneGroup;
  }

  // Blocks of the clone group (this one included) that have a link on the given connector.
  function clonesLinkedAt(block, conn) {
    return cloneMembers(block).filter((b) => {
      const own = b === block ? conn : b.connectors.find((c) => conn.ref && c.ref === conn.ref);
      return own && schema.links.some((l) => l.from === own.id || l.to === own.id);
    });
  }

  function cloneBlock(block) {
    syncClones(block);
    if (!block.cloneGroup) block.cloneGroup = uid('g');
    for (const c of block.connectors) if (!c.ref) c.ref = uid('r');
    const copy = JSON.parse(JSON.stringify(block));
    copy.id = freshBlockId(new Set(schema.blocks.map((b) => b.id)));
    copy.x += GRID * 2;
    copy.y += GRID * 2;
    copy.connectors.forEach((c) => { c.id = uid('c'); });
    schema.blocks.push(copy);
    select({ type: 'block', id: copy.id });
    commit();
  }

  function detachClone(block) {
    syncClones(block);
    delete block.cloneGroup;
    block.connectors.forEach((c) => { delete c.ref; });
    pruneCloneGroups();
    commit();
    render();
    renderInspector();
  }

  const selectedLinks = () => (selection?.type === 'link' ? selection.ids.map(findLink).filter(Boolean) : []);

  // Connectors are spread evenly along their side.
  function connectorLocal(block, conn) {
    const list = sideConnectors(block, conn.side);
    const t = (list.indexOf(conn) + 1) / (list.length + 1);
    switch (conn.side) {
      case 'top': return [block.width * t, 0];
      case 'bottom': return [block.width * t, block.height];
      case 'left': return [0, block.height * t];
      default: return [block.width, block.height * t];
    }
  }

  function connectorWorld(id) {
    const found = findConnector(id);
    if (!found) return null;
    const [lx, ly] = connectorLocal(found.block, found.conn);
    const [nx, ny] = NORMALS[found.conn.side];
    return { x: found.block.x + lx, y: found.block.y + ly, nx, ny };
  }

  // Cubic curve whose control points lie on each connector's normal, so both ends meet their side at 90°.
  function linkPath(a, b) {
    const d = clamp(Math.hypot(b.x - a.x, b.y - a.y) * 0.5, 30, 220);
    return `M${a.x},${a.y} C${a.x + a.nx * d},${a.y + a.ny * d} ${b.x + b.nx * d},${b.y + b.ny * d} ${b.x},${b.y}`;
  }

  // Point halfway along the curve linkPath(a, b) draws.
  function linkMidpoint(a, b) {
    const d = clamp(Math.hypot(b.x - a.x, b.y - a.y) * 0.5, 30, 220);
    return {
      x: (a.x + 3 * (a.x + a.nx * d) + 3 * (b.x + b.nx * d) + b.x) / 8,
      y: (a.y + 3 * (a.y + a.ny * d) + 3 * (b.y + b.ny * d) + b.y) / 8,
    };
  }

  // In order: the link's own colour, its group's link colour, then its connectors' colour
  // (black if the two connectors disagree).
  function linkColor(link) {
    if (link.color) return link.color;
    const group = link.via ? findBlock(link.via) : null;
    if (group?.linkColor) return group.linkColor;
    const a = findConnector(link.from)?.conn.color || '';
    const b = findConnector(link.to)?.conn.color || '';
    if (a && b && a.toLowerCase() !== b.toLowerCase()) return '#000000';
    return a || b;
  }

  function addBlock(at) {
    const rect = viewport.getBoundingClientRect();
    const width = 140;
    const height = 90;
    let x = snap((at ? at.x : (rect.width / 2 - view.x) / view.zoom) - width / 2);
    let y = snap((at ? at.y : (rect.height / 2 - view.y) / view.zoom) - height / 2);
    while (schema.blocks.some((b) => b.x === x && b.y === y)) {
      x += GRID * 2;
      y += GRID * 2;
    }
    const block = {
      id: freshBlockId(new Set(schema.blocks.map((b) => b.id))),
      name: 'Block',
      icon: '',
      background: '#ffffff',
      border: '#334155',
      borderWidth: 2,
      x, y, width, height,
      attributes: [],
      connectors: [],
    };
    schema.blocks.push(block);
    select({ type: 'block', id: block.id });
    commit();
  }

  function duplicateBlock(block) {
    syncClones(block);
    const copy = JSON.parse(JSON.stringify(block));
    copy.id = freshBlockId(new Set(schema.blocks.map((b) => b.id)));
    copy.x += GRID * 2;
    copy.y += GRID * 2;
    delete copy.cloneGroup;
    copy.connectors.forEach((c) => { c.id = uid('c'); delete c.ref; });
    schema.blocks.push(copy);
    select({ type: 'block', id: copy.id });
    commit();
  }

  function removeConnector(block, conn) {
    block.connectors = block.connectors.filter((c) => c !== conn);
    schema.links = schema.links.filter((l) => l.from !== conn.id && l.to !== conn.id);
  }

  // Deleting a link group only dissolves it: its links stay and run directly again.
  function deleteSelection() {
    const block = selectedBlock();
    const links = selectedLinks();
    if (block) {
      const ids = new Set(block.connectors.map((c) => c.id));
      schema.links = schema.links.filter((l) => !ids.has(l.from) && !ids.has(l.to));
      for (const l of schema.links) if (l.via === block.id) delete l.via;
      schema.blocks = schema.blocks.filter((b) => b !== block);
      pruneCloneGroups();
    } else if (links.length) {
      schema.links = schema.links.filter((l) => !links.includes(l));
    } else {
      return;
    }
    select(null);
    commit();
  }

  // ---------- link groups ----------
  // A group block (kind: 'group') has no connectors. Links with `via` set to its id are drawn
  // into its left side and out of its right side.

  const groupBlocks = () => schema.blocks.filter((b) => b.kind === 'group');

  // Where each grouped link enters and leaves its group block.
  function groupRoutes() {
    const routes = new Map();
    const dist = (p, q) => Math.hypot(p.x - q.x, p.y - q.y);
    for (const g of groupBlocks()) {
      const left = { x: g.x, y: g.y + g.height / 2 };
      const right = { x: g.x + g.width, y: left.y };
      const items = [];
      for (const link of schema.links) {
        if (link.via !== g.id) continue;
        let a = connectorWorld(link.from);
        let b = connectorWorld(link.to);
        if (!a || !b) continue;
        // Links have no direction: the nearer end comes in on the left.
        if (dist(b, left) + dist(a, right) < dist(a, left) + dist(b, right)) [a, b] = [b, a];
        items.push({ link, a, b });
      }
      // Same order on both sides, so a link can be followed through the block.
      items.sort((p, q) => p.a.y - q.a.y);
      items.forEach(({ link, a, b }, i) => {
        const y = g.y + (g.height * (i + 1)) / (items.length + 1);
        routes.set(link.id, {
          a,
          b,
          entry: { x: g.x, y, nx: -1, ny: 0 },
          exit: { x: g.x + g.width, y, nx: 1, ny: 0 },
        });
      });
    }
    return routes;
  }

  function groupLinks(links) {
    if (links.length < 2) return;
    const ends = links.flatMap((l) => [connectorWorld(l.from), connectorWorld(l.to)]).filter(Boolean);
    const width = 120;
    const height = Math.max(60, snap(links.length * 20 + 20));
    const cx = ends.reduce((sum, p) => sum + p.x, 0) / ends.length;
    const cy = ends.reduce((sum, p) => sum + p.y, 0) / ends.length;
    const block = {
      id: freshBlockId(new Set(schema.blocks.map((b) => b.id)), 'group'),
      name: 'Group',
      icon: '',
      background: '#f1f5f9',
      border: '#64748b',
      borderWidth: 2,
      x: snap(cx - width / 2),
      y: snap(cy - height / 2),
      width,
      height,
      attributes: [],
      connectors: [],
      kind: 'group',
      linkColor: '',
    };
    schema.blocks.push(block);
    for (const l of links) l.via = block.id;
    select({ type: 'block', id: block.id });
    commit();
  }

  function setLinksGroup(links, groupId) {
    for (const l of links) {
      if (groupId) l.via = groupId;
      else delete l.via;
    }
    commit();
    render();
    renderInspector();
  }

  function select(next) {
    syncClones(selectedBlock());
    const key = (sel) => (sel ? sel.type + ':' + (sel.type === 'link' ? sel.ids.join(',') : sel.id) : '');
    const same = key(selection) === key(next);
    selection = next;
    if (!same) {
      iconPickerOpen = false;
      colorPickerConn = null;
      renderInspector();
    }
    render();
  }

  // ---------- canvas rendering ----------

  const blockEls = new Map();
  let frame = 0;

  function render() {
    if (!frame) frame = requestAnimationFrame(() => { frame = 0; draw(); });
  }

  function draw() {
    syncClones(selectedBlock());
    drawBlocks();
    drawLinks();
    world.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.zoom})`;
    linksG.setAttribute('transform', `translate(${view.x} ${view.y}) scale(${view.zoom})`);
    const cell = GRID * 2 * view.zoom;
    viewport.style.backgroundSize = `${cell}px ${cell}px`;
    viewport.style.backgroundPosition = `${view.x - cell / 2}px ${view.y - cell / 2}px`;
    $('#zoom-label').textContent = Math.round(view.zoom * 100) + '%';
  }

  function drawBlocks() {
    const seen = new Set();
    const activeGroup = selectedBlock()?.cloneGroup;
    for (const block of schema.blocks) {
      seen.add(block.id);
      let el = blockEls.get(block.id);
      if (!el) {
        el = h('div', { class: 'block' });
        el.dataset.id = block.id;
        blockEls.set(block.id, el);
        world.append(el);
      }
      el.style.left = block.x + 'px';
      el.style.top = block.y + 'px';
      el.style.width = block.width + 'px';
      el.style.height = block.height + 'px';
      const isSelected = selection?.type === 'block' && selection.id === block.id;
      el.classList.toggle('selected', isSelected);
      el.classList.toggle('clone-sibling', !isSelected && Boolean(activeGroup) && block.cloneGroup === activeGroup);

      // Rebuild the inside only when something visible changed, so elements survive clicks and drags.
      const sig = JSON.stringify([block.name, block.icon, block.background, block.border, block.borderWidth, schema.radius,
        block.width, block.height, block.connectors, Boolean(block.cloneGroup)]);
      if (el._sig !== sig) {
        el._sig = sig;
        buildBlock(el, block);
      }
    }
    for (const [id, el] of blockEls) {
      if (!seen.has(id)) {
        el.remove();
        blockEls.delete(id);
      }
    }
    const ordered = schema.blocks.every((b, i) => world.children[i] === blockEls.get(b.id));
    if (!ordered) world.append(...schema.blocks.map((b) => blockEls.get(b.id)));

    for (const el of world.querySelectorAll('.connector.target')) el.classList.remove('target');
    if (tempLink?.target) world.querySelector(`[data-conn="${CSS.escape(tempLink.target)}"]`)?.classList.add('target');
  }

  function buildBlock(el, block) {
    // Too small for a title: show just the icon, centred.
    const small = Boolean(block.icon) && (block.width < SMALL_W || block.height < SMALL_H);
    const body = h('div', { class: 'block-body' + (small ? ' small' : '') });
    body.style.background = block.background;
    body.style.borderColor = block.border;
    body.style.borderWidth = block.borderWidth + 'px';
    body.style.borderRadius = schema.radius + 'px';
    body.style.color = contrastColor(block.background);
    if (block.icon) {
      const ic = h('span', { class: 'mi block-icon' }, block.icon);
      ic.style.fontSize = (small ? clamp(Math.min(block.width, block.height) * 0.6, 12, 40) : 32) + 'px';
      body.append(ic);
    }
    if (!small) body.append(h('div', { class: 'block-title' }, block.name));
    if (block.cloneGroup && !small) body.append(h('span', { class: 'mi clone-badge', title: 'Clone' }, 'copy_all'));

    const parts = [body];
    for (const dir of ['n', 'e', 's', 'w', 'nw', 'ne', 'se', 'sw']) {
      const handle = h('div', { class: 'handle ' + dir });
      handle.dataset.dir = dir;
      parts.push(handle);
    }
    for (const conn of block.connectors) {
      const [x, y] = connectorLocal(block, conn);
      const dot = h('div', { class: 'connector', title: conn.name || 'Connector' });
      dot.dataset.conn = conn.id;
      dot.style.left = x + 'px';
      dot.style.top = y + 'px';
      if (conn.color) {
        dot.style.background = conn.color;
        dot.style.borderColor = `color-mix(in srgb, ${conn.color} 65%, black)`;
      }
      parts.push(dot);
      if (conn.name) {
        const label = h('div', { class: 'conn-label ' + conn.side }, conn.name);
        label.style.left = x + 'px';
        label.style.top = y + 'px';
        parts.push(label);
      }
    }
    el.replaceChildren(...parts);
  }

  function svgPath(cls, d) {
    const p = document.createElementNS(SVG_NS, 'path');
    p.setAttribute('class', cls);
    p.setAttribute('d', d);
    return p;
  }

  function drawLinks() {
    const nodes = [];
    const labels = []; // drawn last, above every line
    const routes = groupRoutes();
    for (const link of schema.links) {
      const a = connectorWorld(link.from);
      const b = connectorWorld(link.to);
      if (!a || !b) continue;
      const route = routes.get(link.id);
      const d = route ? `${linkPath(route.a, route.entry)} ${linkPath(route.exit, route.b)}` : linkPath(a, b);
      if (selection?.type === 'link' && selection.ids.includes(link.id)) nodes.push(svgPath('link-halo', d));
      const line = svgPath('link', d);
      const color = linkColor(link);
      if (color) line.style.stroke = color;
      // White and near-white lines get a thin grey edge so they stay visible on the canvas.
      if (isPale(color)) nodes.push(svgPath('link-outline', d));
      const hit = svgPath('link-hit', d);
      hit.dataset.link = link.id;
      nodes.push(line, hit);
      if (link.name) {
        // A grouped link is labelled on its way into the group.
        const mid = route ? linkMidpoint(route.a, route.entry) : linkMidpoint(a, b);
        const text = document.createElementNS(SVG_NS, 'text');
        text.setAttribute('class', 'link-label');
        text.setAttribute('x', mid.x);
        text.setAttribute('y', mid.y - 5);
        text.textContent = link.name;
        labels.push(text);
      }
    }
    if (tempLink) {
      const a = connectorWorld(tempLink.from);
      const b = (tempLink.target && connectorWorld(tempLink.target)) || { x: tempLink.x, y: tempLink.y, nx: 0, ny: 0 };
      if (a) nodes.push(svgPath('link-temp', linkPath(a, b)));
    }
    linksG.replaceChildren(...nodes, ...labels);
  }

  // ---------- view ----------

  function toWorld(e) {
    const rect = viewport.getBoundingClientRect();
    return { x: (e.clientX - rect.left - view.x) / view.zoom, y: (e.clientY - rect.top - view.y) / view.zoom };
  }

  function zoomAt(cx, cy, factor) {
    const zoom = clamp(view.zoom * factor, 0.2, 3);
    view.x = cx - ((cx - view.x) * zoom) / view.zoom;
    view.y = cy - ((cy - view.y) * zoom) / view.zoom;
    view.zoom = zoom;
    render();
    saveCurrentSoon();
  }

  function zoomCentered(factor) {
    const rect = viewport.getBoundingClientRect();
    zoomAt(rect.width / 2, rect.height / 2, factor);
  }

  function fitView() {
    const rect = viewport.getBoundingClientRect();
    if (!schema.blocks.length) {
      view = { x: 0, y: 0, zoom: 1 };
    } else {
      const x1 = Math.min(...schema.blocks.map((b) => b.x));
      const y1 = Math.min(...schema.blocks.map((b) => b.y));
      const x2 = Math.max(...schema.blocks.map((b) => b.x + b.width));
      const y2 = Math.max(...schema.blocks.map((b) => b.y + b.height));
      const pad = 80;
      const zoom = clamp(Math.min((rect.width - pad * 2) / (x2 - x1), (rect.height - pad * 2) / (y2 - y1)), 0.2, 1);
      view = {
        zoom,
        x: rect.width / 2 - ((x1 + x2) / 2) * zoom,
        y: rect.height / 2 - ((y1 + y2) / 2) * zoom,
      };
    }
    render();
    saveCurrent();
  }

  // ---------- canvas interaction ----------

  function drag(onMove, onEnd) {
    const move = (e) => onMove(e);
    const up = (e) => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
      window.removeEventListener('pointercancel', up);
      onEnd?.(e);
    };
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    window.addEventListener('pointercancel', up);
  }

  function startPan(e) {
    const start = { x: e.clientX, y: e.clientY, vx: view.x, vy: view.y };
    viewport.classList.add('panning');
    drag((ev) => {
      view.x = start.vx + ev.clientX - start.x;
      view.y = start.vy + ev.clientY - start.y;
      render();
    }, () => {
      viewport.classList.remove('panning');
      saveCurrent();
    });
  }

  function startMove(e, block) {
    const start = toWorld(e);
    const origin = { x: block.x, y: block.y };
    drag((ev) => {
      const p = toWorld(ev);
      const x = origin.x + p.x - start.x;
      const y = origin.y + p.y - start.y;
      block.x = ev.altKey ? Math.round(x) : snap(x);
      block.y = ev.altKey ? Math.round(y) : snap(y);
      render();
    }, commit);
  }

  function startResize(e, block, dir) {
    const start = toWorld(e);
    const o = { l: block.x, t: block.y, r: block.x + block.width, b: block.y + block.height };
    drag((ev) => {
      const p = toWorld(ev);
      const q = ev.altKey ? Math.round : snap;
      let { l, t, r, b } = o;
      if (dir.includes('w')) l = Math.min(q(o.l + p.x - start.x), r - MIN_SIZE);
      if (dir.includes('e')) r = Math.max(q(o.r + p.x - start.x), l + MIN_SIZE);
      if (dir.includes('n')) t = Math.min(q(o.t + p.y - start.y), b - MIN_SIZE);
      if (dir.includes('s')) b = Math.max(q(o.b + p.y - start.y), t + MIN_SIZE);
      Object.assign(block, { x: l, y: t, width: r - l, height: b - t });
      render();
    }, () => {
      commit();
      renderInspector();
    });
  }

  // Shift+drag: the connector follows the pointer to the nearest side and slot.
  function startConnectorMove(block, conn) {
    drag((ev) => {
      const p = toWorld(ev);
      const px = p.x - block.x;
      const py = p.y - block.y;
      const dist = { top: Math.abs(py), bottom: Math.abs(py - block.height), left: Math.abs(px), right: Math.abs(px - block.width) };
      const side = SIDES.reduce((best, s) => (dist[s] < dist[best] ? s : best));
      const t = clamp(side === 'top' || side === 'bottom' ? px / block.width : py / block.height, 0, 1);
      const others = sideConnectors(block, side).filter((c) => c !== conn);
      const slots = others.length + 1;
      const index = clamp(Math.round(t * (slots + 1)) - 1, 0, slots - 1);

      conn.side = side;
      const rest = block.connectors.filter((c) => c !== conn);
      const at = index < others.length ? rest.indexOf(others[index]) : rest.length;
      rest.splice(at, 0, conn);
      block.connectors = rest;
      render();
    }, () => {
      commit();
      renderInspector();
    });
  }

  function startLink(e, fromId) {
    const p = toWorld(e);
    tempLink = { from: fromId, x: p.x, y: p.y, target: null };
    const targetAt = (ev) => {
      const id = document.elementFromPoint(ev.clientX, ev.clientY)?.closest?.('.connector')?.dataset.conn;
      return id && id !== fromId ? id : null;
    };
    drag((ev) => {
      Object.assign(tempLink, toWorld(ev), { target: targetAt(ev) });
      render();
    }, (ev) => {
      const to = targetAt(ev);
      tempLink = null;
      if (to) {
        const exists = schema.links.some((l) => (l.from === fromId && l.to === to) || (l.from === to && l.to === fromId));
        if (!exists) {
          schema.links.push({
            id: freshBlockId(new Set(schema.links.map((l) => l.id)), 'link'),
            from: fromId,
            to,
            color: '',
            name: '',
            attributes: [],
          });
          commit();
        }
      }
      render();
    });
  }

  viewport.addEventListener('pointerdown', (e) => {
    if (e.button !== 0 && e.button !== 1) return;
    // Flush any pending inspector edit (fires its change handler) before selection moves on.
    if (inspector.contains(document.activeElement) || document.activeElement === nameInput) document.activeElement.blur();

    if (e.button === 1) {
      e.preventDefault();
      startPan(e);
      return;
    }
    const target = e.target;
    const blockEl = target.closest('.block');
    const block = blockEl && findBlock(blockEl.dataset.id);
    const connEl = target.closest('.connector');
    const handleEl = target.closest('.handle');
    const linkEl = target.closest('[data-link]');

    if (block) {
      select({ type: 'block', id: block.id });
      if (connEl) {
        const conn = block.connectors.find((c) => c.id === connEl.dataset.conn);
        if (!conn) return;
        if (e.shiftKey) startConnectorMove(block, conn);
        else startLink(e, conn.id);
      } else if (handleEl) {
        startResize(e, block, handleEl.dataset.dir);
      } else {
        startMove(e, block);
      }
    } else if (linkEl) {
      const id = linkEl.dataset.link;
      if ((e.shiftKey || e.metaKey || e.ctrlKey) && selection?.type === 'link') {
        // Shift/Ctrl/⌘+click adds or removes a link from the selection.
        const ids = selection.ids.includes(id) ? selection.ids.filter((x) => x !== id) : [...selection.ids, id];
        select(ids.length ? { type: 'link', ids } : null);
      } else {
        select({ type: 'link', ids: [id] });
      }
    } else {
      select(null);
      startPan(e);
    }
  });

  viewport.addEventListener('dblclick', (e) => {
    if (e.target.closest('.connector, [data-link]')) return;
    if (e.target.closest('.block')) {
      const input = inspector.querySelector('[data-role="block-name"]');
      input?.focus();
      input?.select();
    } else {
      addBlock(toWorld(e));
    }
  });

  viewport.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      const rect = viewport.getBoundingClientRect();
      zoomAt(e.clientX - rect.left, e.clientY - rect.top, Math.exp(-e.deltaY * 0.01));
    } else {
      view.x -= e.deltaX;
      view.y -= e.deltaY;
      render();
      saveCurrentSoon();
    }
  }, { passive: false });

  window.addEventListener('keydown', (e) => {
    const mod = e.ctrlKey || e.metaKey;
    const key = e.key.toLowerCase();
    if (mod && key === 's') {
      e.preventDefault();
      saveToLibrary();
      return;
    }
    if (e.target.closest('input, select, textarea, dialog')) return;

    if (mod && key === 'z') {
      e.preventDefault();
      if (e.shiftKey) redo(); else undo();
    } else if (mod && key === 'y') {
      e.preventDefault();
      redo();
    } else if (mod && key === 'd') {
      e.preventDefault();
      const block = selectedBlock();
      if (block && block.kind !== 'group') duplicateBlock(block);
    } else if (mod && key === 'g') {
      e.preventDefault();
      groupLinks(selectedLinks());
    } else if (key === 'delete' || key === 'backspace') {
      e.preventDefault();
      deleteSelection();
    } else if (key === 'escape') {
      select(null);
    }
  });

  // ---------- inspector ----------

  function field(label, control) {
    return h('label', { class: 'field' }, h('span', {}, label), control);
  }

  // Text input bound to the model: live on input, one undo step on change.
  function boundInput(value, apply, props = {}) {
    const input = h('input', { type: 'text', value, spellcheck: false, ...props });
    input.addEventListener('input', () => {
      apply(input.value);
      render();
    });
    input.addEventListener('change', commit);
    return input;
  }

  function slider(value, min, max, apply) {
    const input = h('input', { type: 'range', min, max, step: 1, value });
    const label = h('span', { class: 'slider-value' }, value + ' px');
    input.addEventListener('input', () => {
      apply(Number(input.value));
      label.textContent = input.value + ' px';
      render();
    });
    input.addEventListener('change', commit);
    return h('div', { class: 'slider' }, input, label);
  }

  // One-line colour setting: a button showing the current colour; the palette opens below on click.
  function colorField(label, key, value, apply, noneValue = 'transparent') {
    const none = value === noneValue;
    const dot = h('span', { class: 'color-dot' + (none ? ' none' : '') });
    if (!none) dot.style.background = value;
    const button = h('button', {
      class: 'color-button',
      title: 'Click to choose a colour',
      onclick: (e) => {
        e.preventDefault();
        colorPickerConn = colorPickerConn === key ? null : key;
        renderInspector();
      },
    }, dot, none ? 'none' : value);
    const out = [field(label, button)];
    if (colorPickerConn === key) out.push(h('div', { class: 'conn-colors' }, swatches(value, apply, noneValue)));
    return out;
  }

  // Colour chooser over the schema's palette. `none` is the value the crossed swatch stands for.
  function swatches(current, apply, none = 'transparent') {
    const pick = (color) => {
      apply(color);
      commit();
      render();
      renderInspector();
    };
    const same = (a, b) => String(a).toLowerCase() === String(b).toLowerCase();
    const wrap = h('div', { class: 'swatches' });
    wrap.append(h('button', {
      class: 'swatch none' + (current === none ? ' active' : ''),
      title: 'None',
      onclick: () => pick(none),
    }));
    for (const color of schema.palette) {
      const b = h('button', { class: 'swatch' + (same(current, color) ? ' active' : ''), title: color, onclick: () => pick(color) });
      b.style.background = color;
      wrap.append(b);
    }
    const custom = h('input', {
      type: 'color',
      class: 'swatch',
      title: 'Custom colour',
      value: isHex(current) ? current : '#ffffff',
    });
    custom.addEventListener('input', () => {
      apply(custom.value);
      render();
    });
    custom.addEventListener('change', () => pick(custom.value));
    wrap.append(custom);
    if (isHex(current) && !schema.palette.some((c) => same(c, current))) {
      wrap.append(h('button', {
        class: 'swatch add',
        title: `Add ${current} to the palette`,
        onclick: () => {
          schema.palette.push(current.toLowerCase());
          commit();
          renderInspector();
        },
      }, icon('add')));
    }
    return wrap;
  }

  function iconPicker(block) {
    const grid = h('div', { class: 'icon-grid' });
    for (const name of ICONS) {
      const b = h('button', {
        class: block.icon === name ? 'active' : '',
        title: name,
        onclick: () => {
          block.icon = name;
          iconPickerOpen = false;
          commit();
          render();
          renderInspector();
        },
      }, icon(name));
      b.dataset.name = name;
      grid.append(b);
    }
    const search = h('input', { type: 'search', placeholder: 'Filter icons…', spellcheck: false });
    search.addEventListener('input', () => {
      const q = search.value.trim().toLowerCase().replace(/\s+/g, '_');
      for (const b of grid.children) b.hidden = !b.dataset.name.includes(q);
    });
    return h('div', { class: 'icon-picker' }, search, grid);
  }

  // Box with a dot on one side: the pictogram for "connector on this side".
  function sideIcon(side) {
    const dot = { top: [9, 3.5], right: [14.5, 9], bottom: [9, 14.5], left: [3.5, 9] }[side];
    const svg = document.createElementNS(SVG_NS, 'svg');
    svg.setAttribute('viewBox', '0 0 18 18');
    svg.setAttribute('class', 'side-icon');
    const rect = document.createElementNS(SVG_NS, 'rect');
    for (const [k, v] of Object.entries({ x: 3.5, y: 3.5, width: 11, height: 11, rx: 2 })) rect.setAttribute(k, v);
    const circle = document.createElementNS(SVG_NS, 'circle');
    for (const [k, v] of Object.entries({ cx: dot[0], cy: dot[1], r: 2.75 })) circle.setAttribute(k, v);
    svg.append(rect, circle);
    return svg;
  }

  function connectorRow(block, conn) {
    // The side button opens four buttons around itself, one per side, to reposition the connector.
    const choices = h('div', { class: 'side-choices', hidden: true }, ...SIDES.map((side) => h('button', {
      class: `icon-only side-choice ${side}` + (side === conn.side ? ' active' : ''),
      title: `Move to the ${side} side`,
      onclick: () => {
        choices.hidden = true;
        if (side === conn.side) return;
        conn.side = side;
        commit();
        render();
        renderInspector();
      },
    }, sideIcon(side))));
    const picker = h('div', { class: 'side-picker' },
      h('button', {
        class: 'icon-only',
        title: `On the ${conn.side} side — click to move`,
        onclick: () => {
          const open = choices.hidden;
          closeSidePickers();
          choices.hidden = !open;
        },
      }, sideIcon(conn.side)),
      choices,
    );
    const colorButton = h('button', {
      class: 'icon-only',
      title: conn.color ? `Colour ${conn.color} — click to change` : 'No colour — click to choose',
      onclick: () => {
        colorPickerConn = colorPickerConn === conn.id ? null : conn.id;
        renderInspector();
      },
    }, h('span', { class: 'color-dot' + (conn.color ? '' : ' none') }));
    if (conn.color) colorButton.firstChild.style.background = conn.color;
    const row = h('div', { class: 'row' },
      boundInput(conn.name, (v) => { conn.name = v; }, { placeholder: 'Connector name' }),
      colorButton,
      picker,
      h('button', {
        class: 'icon-only',
        title: 'Remove connector',
        onclick: () => {
          const linked = block.cloneGroup ? clonesLinkedAt(block, conn) : [];
          if (linked.length) {
            toast(`Cannot remove: this connector is linked on ${linked.map((b) => b.id).join(', ')}. Delete those links first.`, true);
            return;
          }
          removeConnector(block, conn);
          commit();
          render();
          renderInspector();
        },
      }, icon('delete')),
    );
    if (colorPickerConn !== conn.id) return row;
    const colors = h('div', { class: 'conn-colors' }, swatches(conn.color || '', (c) => { conn.color = c; }, ''));
    return h('div', {}, row, colors);
  }

  function closeSidePickers() {
    for (const el of inspector.querySelectorAll('.side-choices')) el.hidden = true;
  }

  document.addEventListener('pointerdown', (e) => {
    if (!e.target.closest?.('.side-picker')) closeSidePickers();
  });

  // ID input for a block or link: must be non-empty and unique among `siblings`.
  // `onRename(newId)` runs just before the id changes, to fix up references to the old one.
  function idField(item, siblings, kind, onRename) {
    const taken = (v) => !v || siblings.some((x) => x !== item && x.id === v);
    const input = h('input', { type: 'text', value: item.id, spellcheck: false });
    input.addEventListener('input', () => input.classList.toggle('invalid', taken(input.value.trim())));
    input.addEventListener('change', () => {
      const v = input.value.trim();
      if (taken(v)) {
        toast(v ? `ID "${v}" is already used by another ${kind}.` : 'ID cannot be empty.', true);
        input.value = item.id;
        input.classList.remove('invalid');
        return;
      }
      onRename(v);
      item.id = v;
      input.value = v;
      commit();
      render();
    });
    return input;
  }

  // Free-form name/value pairs on a block or link.
  function attributesSection(owner) {
    const out = [h('h3', {}, 'Attributes')];
    for (const attr of owner.attributes) {
      out.push(h('div', { class: 'row' },
        boundInput(attr.name, (v) => { attr.name = v; }, { placeholder: 'name' }),
        boundInput(attr.value, (v) => { attr.value = v; }, { placeholder: 'value' }),
        h('button', {
          class: 'icon-only',
          title: 'Remove attribute',
          onclick: () => {
            owner.attributes = owner.attributes.filter((a) => a !== attr);
            commit();
            renderInspector();
          },
        }, icon('delete')),
      ));
    }
    out.push(h('div', { class: 'row' }, h('button', {
      onclick: () => {
        owner.attributes.push({ name: '', value: '' });
        commit();
        renderInspector();
        const rows = inspector.querySelectorAll('input[placeholder="name"]');
        rows[rows.length - 1]?.focus();
      },
    }, icon('add'), 'Add attribute')));
    return out;
  }

  function renderInspector() {
    const block = selectedBlock();
    const links = selectedLinks();
    if (block) inspector.replaceChildren(...blockInspector(block));
    else if (links.length) inspector.replaceChildren(...linkInspector(links));
    else inspector.replaceChildren(...emptyInspector());
  }

  function emptyInspector() {
    return [
      h('h3', {}, 'Schema'),
      h('p', {}, `${schema.blocks.length} block(s), ${schema.links.length} link(s)`),
      h('h3', {}, 'How to'),
      h('ul', {},
        h('li', {}, 'Add block or double-click the canvas to create a block.'),
        h('li', {}, 'Select a block to edit it here and to resize it by its edges and corners.'),
        h('li', {}, 'Add connectors in this panel, then drag from one connector to another to link them.'),
        h('li', {}, 'Shift+drag a connector to move it along or between sides.'),
        h('li', {}, 'Click a link to select it; Delete removes the selection.'),
        h('li', {}, 'Shift+click links to select several, then group them into a block they all run through.'),
        h('li', {}, 'Clone a block to get linked copies that always change together.'),
        h('li', {}, 'Hold Alt while moving or resizing to ignore the grid.'),
      ),
    ];
  }

  function blockInspector(block) {
    const out = [];
    const isGroup = block.kind === 'group';

    // --- basics
    const idInput = idField(block, schema.blocks, 'block', (id) => {
      for (const l of schema.links) if (l.via === block.id) l.via = id;
      selection = { type: 'block', id };
    });

    const preview = h('span', { class: 'mi icon-preview' }, block.icon);
    const iconInput = boundInput(block.icon, (v) => {
      block.icon = v.trim().toLowerCase().replace(/\s+/g, '_');
      preview.textContent = block.icon;
    }, { placeholder: 'none' });

    out.push(
      h('h3', {}, isGroup ? 'Link group' : 'Block'),
      field('Name', boundInput(block.name, (v) => { block.name = v; }, { 'data-role': 'block-name' })),
      field('ID', idInput),
      field('Icon', h('div', { class: 'row', style: 'margin:0' },
        preview,
        iconInput,
        h('button', {
          class: 'icon-only',
          title: 'Choose icon',
          onclick: () => { iconPickerOpen = !iconPickerOpen; renderInspector(); },
        }, icon('apps')),
        h('button', {
          class: 'icon-only',
          title: 'Remove icon',
          onclick: () => { block.icon = ''; commit(); render(); renderInspector(); },
        }, icon('close')),
      )),
    );
    if (iconPickerOpen) out.push(iconPicker(block));

    // --- appearance
    out.push(
      h('h3', {}, 'Appearance'),
      ...colorField('Background', 'block:background', block.background, (c) => { block.background = c; }),
      ...colorField('Border', 'block:border', block.border, (c) => { block.border = c; }),
      field('Border width', slider(block.borderWidth, 0, MAX_BORDER, (v) => { block.borderWidth = v; })),
    );

    if (isGroup) {
      out.push(...groupedLinksSection(block));
    } else {
      // --- connectors, grouped by side
      out.push(h('div', { class: 'section-head' },
        h('h3', {}, 'Connectors'),
        ...SIDES.map((side) => h('button', {
          class: 'icon-only',
          title: `Add connector on the ${side} side`,
          onclick: () => {
            block.connectors.push({ id: uid('c'), name: '', side, color: '' });
            commit();
            render();
            renderInspector();
          },
        }, sideIcon(side))),
      ));
      for (const side of SIDES) {
        const list = sideConnectors(block, side);
        if (!list.length) continue;
        out.push(h('div', { class: 'side-group' }, sideIcon(side), side));
        for (const conn of list) out.push(connectorRow(block, conn));
      }
      out.push(h('p', { class: 'note' }, 'Shift+drag a connector on the canvas to move or reorder it.'));
    }

    out.push(...attributesSection(block));

    // --- clones
    if (block.cloneGroup) {
      const others = cloneMembers(block).filter((b) => b !== block);
      out.push(
        h('h3', {}, 'Clones'),
        h('p', {}, `Cloned with ${others.map((b) => b.id).join(', ')}. Every change applies to all of them; only ID and position are individual.`),
        h('div', { class: 'row' }, h('button', {
          title: 'Turn this block into an independent copy',
          onclick: () => detachClone(block),
        }, icon('link_off'), 'Detach from clones')),
      );
    }

    // --- actions
    out.push(h('h3', {}, 'Actions'));
    if (isGroup) {
      out.push(
        h('div', { class: 'row' }, h('button', { class: 'danger', onclick: deleteSelection }, icon('call_split'), 'Ungroup links')),
        h('p', { class: 'note' }, 'Ungrouping removes this block; its links stay and run directly again.'),
      );
    } else {
      out.push(h('div', { class: 'row wrap' },
        h('button', { title: 'Linked copy: changes apply to all clones', onclick: () => cloneBlock(block) }, icon('copy_all'), 'Clone'),
        h('button', { title: 'Independent copy', onclick: () => duplicateBlock(block) }, icon('content_copy'), 'Duplicate'),
        h('button', { class: 'danger', onclick: deleteSelection }, icon('delete'), 'Delete block'),
      ));
    }
    return out;
  }

  function describeLink(link) {
    const end = (id) => {
      const found = findConnector(id);
      if (!found) return '?';
      return `${found.block.name || found.block.id} · ${found.conn.name || found.conn.side}`;
    };
    return `${end(link.from)}  →  ${end(link.to)}`;
  }

  function groupedLinksSection(block) {
    const links = schema.links.filter((l) => l.via === block.id);
    const out = [
      h('h3', {}, `Grouped links (${links.length})`),
      ...colorField('Links colour', 'block:linkColor', block.linkColor || '', (c) => { block.linkColor = c; }, ''),
    ];
    for (const link of links) {
      const key = 'link:' + link.id;
      const dot = h('span', { class: 'color-dot' + (link.color ? '' : ' none') });
      if (link.color) dot.style.background = link.color;
      out.push(h('div', { class: 'row' },
        h('span', { class: 'grow' }, describeLink(link)),
        h('button', {
          class: 'icon-only',
          title: link.color ? `This link's own colour: ${link.color}` : 'No colour of its own — click to set one',
          onclick: () => {
            colorPickerConn = colorPickerConn === key ? null : key;
            renderInspector();
          },
        }, dot),
        h('button', {
          class: 'icon-only',
          title: 'Take this link out of the group',
          onclick: () => setLinksGroup([link], null),
        }, icon('close')),
      ));
      if (colorPickerConn === key) {
        out.push(h('div', { class: 'conn-colors' }, swatches(link.color || '', (c) => { link.color = c; }, '')));
      }
    }
    if (links.length) {
      out.push(h('p', { class: 'note' }, 'A link uses its own colour if it has one, then the group\'s links colour, then its connectors\' colour.'));
    }
    if (!links.length) out.push(h('p', {}, 'No links pass through this group. Select a link to add it here.'));
    return out;
  }

  function linkInspector(links) {
    const single = links.length === 1;
    const out = [h('h3', {}, single ? 'Link' : `${links.length} links selected`)];
    if (single) {
      const link = links[0];
      out.push(
        field('Name', boundInput(link.name, (v) => { link.name = v; })),
        field('ID', idField(link, schema.links, 'link', (id) => { selection = { type: 'link', ids: [id] }; })),
        h('p', { class: 'note' }, describeLink(link)),
      );
    } else out.push(h('ul', {}, ...links.map((l) => h('li', {}, describeLink(l)))));

    // --- grouping
    const groups = groupBlocks();
    const current = links.every((l) => (l.via || '') === (links[0].via || '')) ? links[0].via || '' : null;
    out.push(h('h3', {}, 'Group'));
    if (groups.length) {
      const groupSelect = h('select', {},
        current === null ? h('option', { value: '?', selected: true, disabled: true }, '(mixed)') : null,
        h('option', { value: '', selected: current === '' }, 'Not grouped'),
        ...groups.map((g) => h('option', { value: g.id, selected: current === g.id }, `${g.name || g.id} (${g.id})`)),
      );
      groupSelect.addEventListener('change', () => setLinksGroup(links, groupSelect.value));
      out.push(field('Runs via', groupSelect));
    }
    out.push(
      h('div', { class: 'row' }, h('button', {
        disabled: links.length < 2,
        title: 'Create a group block these links run through (Ctrl/⌘+G)',
        onclick: () => groupLinks(links),
      }, icon('merge'), 'Group into new block')),
      h('p', { class: 'note' }, single
        ? 'Shift+click more links to select several, then group them.'
        : 'Shift+click a link to add it to or remove it from the selection.'),
    );

    // --- colour
    const color = links.every((l) => l.color === links[0].color) ? links[0].color || '' : null;
    out.push(
      h('h3', {}, 'Colour'),
      swatches(color, (c) => { for (const l of links) l.color = c; }, ''),
      h('p', { class: 'note' }, 'With no colour set (crossed swatch) a link takes its group\'s links colour if it is in one, otherwise its connectors\' colour (black if the two differ).'),
    );
    if (single) out.push(...attributesSection(links[0]));
    out.push(
      h('h3', {}, 'Actions'),
      h('div', { class: 'row' }, h('button', { class: 'danger', onclick: deleteSelection }, icon('delete'), single ? 'Delete link' : 'Delete links')),
    );
    return out;
  }

  // ---------- toolbar, library, import/export ----------

  let toastTimer = 0;
  function toast(message, isError = false) {
    toastEl.textContent = message;
    toastEl.classList.toggle('error', isError);
    toastEl.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => { toastEl.hidden = true; }, isError ? 4500 : 2000);
  }

  function updateChrome() {
    if (document.activeElement !== nameInput) nameInput.value = schema.name;
    $('#dirty').hidden = !isDirty();
    $('[data-action="undo"]').disabled = !undoStack.length;
    $('[data-action="redo"]').disabled = !redoStack.length;
    if (!selection) renderInspector();
  }

  function refreshAll() {
    nameInput.value = schema.name;
    updateChrome();
    renderInspector();
    render();
  }

  const confirmDiscard = () => !isDirty() || confirm('Discard unsaved changes to the current schema?');

  function saveToLibrary() {
    document.activeElement?.blur?.();
    commit();
    const name = schema.name.trim() || 'Untitled';
    const lib = readLibrary();
    if (lib[name] && name !== libName && !confirm(`A saved schema named "${name}" already exists. Overwrite it?`)) return;
    schema.name = name;
    commit();
    lib[name] = { savedAt: Date.now(), schema: JSON.parse(lastSnapshot) };
    if (!writeLibrary(lib)) return;
    libName = name;
    saveCurrent();
    updateChrome();
    toast(`Saved "${name}"`);
  }

  function openLibrary() {
    renderLibrary();
    libraryDialog.showModal();
  }

  function renderLibrary() {
    const lib = readLibrary();
    const names = Object.keys(lib).sort((a, b) => (lib[b].savedAt || 0) - (lib[a].savedAt || 0));
    const list = $('#library-list');
    if (!names.length) {
      list.replaceChildren(h('div', { class: 'empty' }, 'Nothing saved yet. Use Save to store the current schema.'));
      return;
    }
    list.replaceChildren(...names.map((name) => {
      const entry = lib[name];
      const blocks = entry.schema?.blocks?.length ?? 0;
      const links = entry.schema?.links?.length ?? 0;
      const when = entry.savedAt ? new Date(entry.savedAt).toLocaleString() : '';
      return h('div', { class: 'lib-row' },
        h('div', { class: 'lib-info' },
          h('div', { class: 'lib-name' }, name),
          h('div', { class: 'lib-meta' }, `${blocks} block(s), ${links} link(s) · ${when}`),
        ),
        h('button', {
          class: 'primary',
          onclick: () => {
            if (!confirmDiscard()) return;
            try {
              const loaded = normalizeSchema(entry.schema);
              loaded.name = name;
              replaceDocument(loaded, name);
              libraryDialog.close();
            } catch (err) {
              toast(err.message, true);
            }
          },
        }, 'Load'),
        h('button', {
          class: 'danger icon-only',
          title: 'Delete saved schema',
          onclick: () => {
            if (!confirm(`Delete saved schema "${name}"? This cannot be undone.`)) return;
            const next = readLibrary();
            delete next[name];
            if (!writeLibrary(next)) return;
            if (libName === name) {
              libName = null;
              saveCurrent();
            }
            renderLibrary();
            updateChrome();
          },
        }, icon('delete')),
      );
    }));
  }

  function openSettings() {
    $('#schema-params').replaceChildren(
      field('Corner radius', slider(schema.radius, 0, MAX_RADIUS, (v) => { schema.radius = v; })),
    );
    renderPalette();
    paletteDialog.showModal();
  }

  function renderPalette() {
    const list = $('#palette-list');
    list.replaceChildren(...schema.palette.map((color) => {
      const b = h('button', {
        class: 'swatch removable',
        title: `Remove ${color}`,
        onclick: () => {
          schema.palette = schema.palette.filter((c) => c !== color);
          paletteChanged();
        },
      }, icon('close'));
      b.style.background = color;
      b.style.color = contrastColor(color);
      return b;
    }));
    if (!schema.palette.length) list.append(h('div', { class: 'empty' }, 'The palette is empty.'));
  }

  function paletteChanged() {
    commit();
    renderPalette();
    renderInspector();
  }

  function addPaletteColor() {
    const color = $('#palette-new').value.toLowerCase();
    if (schema.palette.includes(color)) {
      toast(`${color} is already in the palette.`, true);
      return;
    }
    schema.palette.push(color);
    paletteChanged();
  }

  function exportJson() {
    document.activeElement?.blur?.();
    commit();
    const blob = new Blob([JSON.stringify(schema, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const fileName = (schema.name.trim() || 'schema').replace(/[^\w.-]+/g, '_') + '.json';
    const a = h('a', { href: url, download: fileName });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  importFile.addEventListener('change', async () => {
    const file = importFile.files[0];
    importFile.value = '';
    if (!file) return;
    try {
      const imported = normalizeSchema(JSON.parse(await file.text()));
      if (!confirmDiscard()) return;
      replaceDocument(imported);
      toast(`Imported "${imported.name}" — use Save to keep it in browser storage`);
    } catch (err) {
      toast('Import failed: ' + err.message, true);
    }
  });

  const actions = {
    'new': () => { if (confirmDiscard()) replaceDocument(emptySchema()); },
    'save': saveToLibrary,
    'library': openLibrary,
    'close-library': () => libraryDialog.close(),
    'settings': openSettings,
    'close-palette': () => paletteDialog.close(),
    'palette-add': addPaletteColor,
    'palette-reset': () => { schema.palette = [...DEFAULT_PALETTE]; paletteChanged(); },
    'export': exportJson,
    'import': () => importFile.click(),
    'add-block': () => addBlock(),
    'undo': undo,
    'redo': redo,
    'zoom-in': () => zoomCentered(1.2),
    'zoom-out': () => zoomCentered(1 / 1.2),
    'zoom-reset': () => zoomCentered(1 / view.zoom),
    'fit': fitView,
  };

  document.addEventListener('click', (e) => {
    const action = e.target.closest('[data-action]')?.dataset.action;
    if (action) actions[action]?.();
  });

  paletteDialog.addEventListener('click', (e) => {
    if (e.target === paletteDialog) paletteDialog.close(); // backdrop
  });

  libraryDialog.addEventListener('click', (e) => {
    if (e.target === libraryDialog) libraryDialog.close(); // backdrop
  });

  nameInput.addEventListener('input', () => {
    schema.name = nameInput.value;
  });
  nameInput.addEventListener('change', commit);

  // ---------- boot ----------

  try {
    const saved = JSON.parse(localStorage.getItem(CUR_KEY) || 'null');
    if (saved?.schema) {
      schema = normalizeSchema(saved.schema);
      lastSnapshot = JSON.stringify(schema);
      libName = typeof saved.libName === 'string' ? saved.libName : null;
      if (saved.view && [saved.view.x, saved.view.y, saved.view.zoom].every(Number.isFinite)) {
        view = { x: saved.view.x, y: saved.view.y, zoom: clamp(saved.view.zoom, 0.2, 3) };
      }
    }
  } catch { /* corrupt working copy: start empty */ }

  refreshAll();
})();
