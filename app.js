(() => {
  'use strict';

  const LIB_KEY = 'schematic:library';
  const CUR_KEY = 'schematic:current';
  const CLIP_KEY = 'schematic:clipboard';
  const TRACE_KEY = 'schematic:trace';
  const SIZE_KEY = 'schematic:sizes';
  const TRACE_COLOR = '#f59e0b';
  const SVG_NS = 'http://www.w3.org/2000/svg';
  const GRID = 10;
  const MIN_SIZE = 24;
  const MAX_RADIUS = 40;
  const MAX_BORDER = 12;
  const LINE_STYLES = ['solid', 'dashed', 'dotted'];
  const LINK_DASH = { dashed: '7 6', dotted: '0.01 5.5' }; // round caps turn the tiny dashes into dots
  const LINK_DIRS = { left: [-1, 0], right: [1, 0], up: [0, -1], down: [0, 1] };
  const lineStyle = (v) => (LINE_STYLES.includes(v) ? v : 'solid');
  const LINK_SHAPES = ['curved', 'straight', 'polyline']; // how all links of a schema are drawn
  const LINK_STUB = 20; // how far a polyline link runs straight out of a connector before turning
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
  const framesLayer = $('#frames'); // beneath the links, so frames sit under everything
  const linksG = $('#links-g');
  const inspector = $('#inspector');
  const nameInput = $('#schema-name');
  const toastEl = $('#toast');
  const libraryDialog = $('#library-dialog');
  const paletteDialog = $('#palette-dialog');
  const jsonDialog = $('#json-dialog');
  const jsonText = $('#json-text');
  const jsonError = $('#json-error');
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
  let multiLink = null; // [{ from, ghost }] while Shift+dragging new links off several selected link connectors
  let reattach = null; // { from, links, x, y, target } while dragging link ends off connector `from`
  let iconPickerOpen = false;
  let colorPickerConn = null; // which colour chooser is open in the inspector: a connector id or a block field key
  let defaultSizes = {}; // { block, group }: { width, height } for new ones, once the user has set it
  let justCreated = null; // the block or group block just added; resizing it sets the size of the next ones
  let traceOn = false; // the Trace tool: hovering a connector or link marks the path it belongs to
  let hover = null; // { conn } or { link }: what the pointer is over while tracing
  let trace = null; // { links, conns }: ids marked by the trace, worked out on every draw

  function emptySchema(name = 'Untitled') {
    return { format: 'schematic', version: 1, name, radius: 8, junctionSize: 12, linkWidth: 2, traceColor: TRACE_COLOR, traceWidth: 2, traceIgnoreNames: false, groupFrames: true, linkShape: 'curved', linkBend: 50, palette: [...DEFAULT_PALETTE], blocks: [], links: [] };
  }

  function freshBlockId(taken, prefix = 'block') {
    let n = 1;
    while (taken.has(`${prefix}-${n}`)) n++;
    return `${prefix}-${n}`;
  }

  // A link connector ("junction"): a free-standing dot that any number of links can meet at.
  // Stored as a zero-size block with a single connector, so links attach to it like to any other.
  function junctionBlock(id, x, y, { name = '', description = '', attributes = [], connectorId = uid('c'), color = '', borderColor = '', axis = 'horizontal' } = {}) {
    return {
      id,
      name,
      description,
      x,
      y,
      width: 0,
      height: 0,
      attributes,
      connectors: [{ id: connectorId, name: '', side: 'center', color }],
      borderColor, // colour of the dot's outline; '' keeps the default
      axis, // links leave it left/right ('horizontal') or up/down ('vertical')
      kind: 'junction',
    };
  }

  // A title: free text on the canvas, with no border, background or connectors.
  function titleBlock(id, x, y, o = {}) {
    return {
      id,
      name: String(o.name ?? 'Title'),
      description: String(o.description ?? ''),
      x,
      y,
      width: Math.max(MIN_SIZE, num(o.width, 240)),
      height: Math.max(MIN_SIZE, num(o.height, 40)),
      fontSize: clamp(num(o.fontSize, 24), 8, 96),
      color: String(o.color ?? ''),
      align: ['left', 'center', 'right'].includes(o.align) ? o.align : 'left',
      attributes: normalizeAttributes(o.attributes),
      connectors: [],
      kind: 'title',
    };
  }

  // ---------- ids ----------
  // Until the user types an ID themselves (customId), an element's id follows its name.

  const DEFAULT_ID = /^(block|group|junction|title|frame|link)-\d+$/;

  const slugify = (text) => String(text).trim().toLowerCase().replace(/[^\p{L}\p{N}]+/gu, '-').replace(/^-+|-+$/g, '');

  // Whether `id` is one the tool would have produced for an element with this name.
  function looksDerived(id, name) {
    const slug = slugify(name);
    return DEFAULT_ID.test(id) || /^l[a-z0-9]{5,9}$/.test(id)
      || (slug !== '' && (id === slug || (id.startsWith(slug + '-') && /^\d+$/.test(id.slice(slug.length + 1)))));
  }

  // The id an element should have given its name: the name in id form, numbered if already taken.
  function derivedId(item, s = schema) {
    const isLink = s.links.includes(item);
    const taken = new Set((isLink ? s.links : s.blocks).filter((x) => x !== item).map((x) => x.id));
    const slug = slugify(item.name || '');
    if (!slug) {
      return DEFAULT_ID.test(item.id) && !taken.has(item.id) ? item.id : freshBlockId(taken, isLink ? 'link' : item.kind || 'block');
    }
    const suffix = item.id.startsWith(slug + '-') ? item.id.slice(slug.length + 1) : null;
    if ((item.id === slug || (suffix !== null && /^\d+$/.test(suffix))) && !taken.has(item.id)) return item.id;
    if (!taken.has(slug)) return slug;
    let n = 2;
    while (taken.has(`${slug}-${n}`)) n++;
    return `${slug}-${n}`;
  }

  // Changes an id and everything that refers to it.
  function setId(item, id, s = schema) {
    if (item.id === id) return;
    const isLink = s.links.includes(item);
    if (!isLink) for (const l of s.links) if (l.via === item.id) l.via = id;
    if (s === schema && selection) {
      if (!isLink && selection.type === 'block' && selection.id === item.id) selection = { type: 'block', id };
      if (!isLink && selection.type === 'blocks') selection = { type: 'blocks', ids: selection.ids.map((x) => (x === item.id ? id : x)) };
      if (isLink && selection.type === 'link') selection = { type: 'link', ids: selection.ids.map((x) => (x === item.id ? id : x)) };
    }
    item.id = id;
  }

  function followName(item, s = schema) {
    if (!item.customId) setId(item, derivedId(item, s), s);
  }

  // A frame: a titled rectangle drawn beneath everything else. Whatever lies inside it moves with it.
  function frameBlock(id, x, y, o = {}) {
    return {
      id,
      name: String(o.name ?? 'Frame'),
      description: String(o.description ?? ''),
      background: String(o.background || 'transparent'),
      border: String(o.border || '#94a3b8'),
      borderWidth: clamp(num(o.borderWidth, 2), 0, MAX_BORDER),
      borderStyle: lineStyle(o.borderStyle),
      x,
      y,
      width: Math.max(MIN_SIZE, num(o.width, 360)),
      height: Math.max(MIN_SIZE, num(o.height, 240)),
      attributes: normalizeAttributes(o.attributes),
      connectors: [],
      kind: 'frame',
    };
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
    out.junctionSize = clamp(num(raw.junctionSize, 12), 6, 32);
    out.linkWidth = clamp(num(raw.linkWidth, 2), 1, 10);
    // A colour, 'none' (no mark, other links just fade) or 'link' (each link's own colour, drawn bolder).
    out.traceColor = isHex(raw.traceColor) ? raw.traceColor.toLowerCase() : ['none', 'link'].includes(raw.traceColor) ? raw.traceColor : TRACE_COLOR;
    out.traceWidth = clamp(num(raw.traceWidth, 2), 1, 16);
    out.traceIgnoreNames = raw.traceIgnoreNames === true;
    out.groupFrames = raw.groupFrames !== false;
    out.linkShape = LINK_SHAPES.includes(raw.linkShape) ? raw.linkShape : 'curved';
    out.linkBend = clamp(num(raw.linkBend, 50), 0, 150);
    if (Array.isArray(raw.palette)) {
      out.palette = [...new Set(raw.palette.map((c) => String(c).toLowerCase()).filter(isHex))];
    }
    const blockIds = new Set();
    const customIds = new Set(); // ids that do not follow from the name, so were typed in
    const connIds = new Set();

    for (const b of raw.blocks) {
      if (!b || typeof b !== 'object') continue;
      let id = String(b.id ?? '').trim();
      if (!id || blockIds.has(id)) id = freshBlockId(blockIds);
      else if (b.customId === true || !looksDerived(id, b.name ?? '')) customIds.add(id);
      blockIds.add(id);

      if (b.kind === 'frame') {
        out.blocks.push(frameBlock(id, num(b.x, 0), num(b.y, 0), b));
        continue;
      }
      if (b.kind === 'title') {
        out.blocks.push(titleBlock(id, num(b.x, 0), num(b.y, 0), b));
        continue;
      }
      if (b.kind === 'junction') {
        const c = (Array.isArray(b.connectors) && b.connectors[0]) || {};
        let cid = String(c.id ?? '').trim();
        if (!cid || connIds.has(cid)) cid = uid('c');
        connIds.add(cid);
        out.blocks.push(junctionBlock(id, num(b.x, 0), num(b.y, 0), {
          name: String(b.name ?? ''),
          description: String(b.description ?? ''),
          attributes: normalizeAttributes(b.attributes),
          connectorId: cid,
          color: String(c.color ?? ''),
          borderColor: String(b.borderColor ?? ''),
          axis: b.axis === 'vertical' ? 'vertical' : 'horizontal',
        }));
        continue;
      }

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
        description: String(b.description ?? ''),
        icon: String(b.icon ?? ''),
        background: String(b.background || '#ffffff'),
        border: String(b.border || '#334155'),
        borderWidth: clamp(num(b.borderWidth, 2), 0, MAX_BORDER),
        borderStyle: lineStyle(b.borderStyle),
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
        out.blocks[out.blocks.length - 1].axis = b.axis === 'vertical' ? 'vertical' : 'horizontal';
      }
      else if (b.cloneGroup) out.blocks[out.blocks.length - 1].cloneGroup = String(b.cloneGroup);
    }

    for (const block of out.blocks) if (customIds.has(block.id)) block.customId = true;

    const linkIds = new Set();
    for (const l of Array.isArray(raw.links) ? raw.links : []) {
      if (!l || typeof l !== 'object') continue;
      if (!connIds.has(l.from) || !connIds.has(l.to) || l.from === l.to) continue;
      let id = String(l.id ?? '').trim();
      let custom = false;
      if (!id || linkIds.has(id)) id = uid('l');
      else custom = l.customId === true || !looksDerived(id, l.name ?? '');
      linkIds.add(id);
      out.links.push({
        id,
        from: l.from,
        to: l.to,
        color: String(l.color ?? ''),
        style: lineStyle(l.style),
        name: String(l.name ?? ''),
        description: String(l.description ?? ''),
        attributes: normalizeAttributes(l.attributes),
      });
      if (out.blocks.some((b) => b.kind === 'group' && b.id === l.via)) out.links[out.links.length - 1].via = l.via;
      if (custom) out.links[out.links.length - 1].customId = true;
      for (const key of ['fromDir', 'toDir']) {
        const end = out.blocks.find((b) => b.kind === 'junction' && b.connectors[0].id === l[key === 'fromDir' ? 'from' : 'to']);
        if (end && LINK_DIRS[l[key]]) out.links[out.links.length - 1][key] = l[key];
      }
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
    validateSelection();
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

  const CLONE_SHARED = ['name', 'description', 'icon', 'background', 'border', 'borderWidth', 'borderStyle', 'width', 'height'];

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
      followName(b, s);
      b.attributes = source.attributes.map((a) => ({ ...a }));
      const mine = new Map(b.connectors.map((c) => [c.ref, c]));
      b.connectors = source.connectors.map((c) => {
        const own = mine.get(c.ref);
        mine.delete(c.ref);
        if (own) setConnectorColor(own, c.color || '', s); // so links on this clone follow the change too
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
    delete copy.customId;
    followName(copy);
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

  // Every selected element (block, title, frame, ...), whether one or several are selected.
  function selectedBlocks() {
    if (selection?.type === 'block') return [findBlock(selection.id)].filter(Boolean);
    if (selection?.type === 'blocks') return selection.ids.map(findBlock).filter(Boolean);
    return [];
  }

  // Selection for a list of element ids: none, one (with its panel) or several.
  function blockSelection(ids) {
    if (!ids.length) return null;
    return ids.length === 1 ? { type: 'block', id: ids[0] } : { type: 'blocks', ids };
  }

  // Drops anything from the selection that no longer exists (after undo, JSON edits, ...).
  function validateSelection() {
    if (selection?.type === 'link') {
      const ids = selection.ids.filter(findLink);
      selection = ids.length ? { type: 'link', ids } : null;
    } else if (selection) {
      selection = blockSelection(selectedBlocks().map((b) => b.id));
    }
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
    const point = { x: found.block.x + lx, y: found.block.y + ly };
    // A junction has no side; aim() picks its direction per link, along its axis.
    if (found.block.kind === 'junction') return { ...point, nx: 0, ny: 0, axis: found.block.axis };
    const [nx, ny] = NORMALS[found.conn.side];
    return { ...point, nx, ny };
  }

  // Gives a junction end its direction for one link: along its axis, towards `other`.
  function aim(p, other) {
    if (!p.axis) return p;
    if (LINK_DIRS[p.dir]) return { ...p, nx: LINK_DIRS[p.dir][0], ny: LINK_DIRS[p.dir][1] }; // set for this link
    return p.axis === 'vertical'
      ? { ...p, nx: 0, ny: other.y < p.y ? -1 : 1 }
      : { ...p, nx: other.x < p.x ? -1 : 1, ny: 0 };
  }

  // Where one end ('from' or 'to') of a link is drawn; follows the pointer while that end is being reattached.
  function linkEnd(link, key) {
    if (reattach && link[key] === reattach.from && reattach.links.includes(link.id)) {
      return (reattach.target && connectorWorld(reattach.target)) || { x: reattach.x, y: reattach.y, nx: 0, ny: 0 };
    }
    const point = connectorWorld(link[key]);
    // fromDir / toDir: the side this link leaves a link connector on, overriding the connector's default.
    return point?.axis && link[key + 'Dir'] ? { ...point, dir: link[key + 'Dir'] } : point;
  }

  // The corners of a straight or right-angled (polyline) link from a to b. A polyline leaves each
  // connector along its normal and turns at right angles only.
  function linkCorners(a, b) {
    if (schema.linkShape !== 'polyline') return [a, b];
    const p = { x: a.x + a.nx * LINK_STUB, y: a.y + a.ny * LINK_STUB };
    const q = { x: b.x + b.nx * LINK_STUB, y: b.y + b.ny * LINK_STUB };
    // Whether each end leaves sideways. An end with no direction (the pointer) follows the other.
    const sideways = (end, other) => (end.nx || end.ny ? end.nx !== 0 : other.nx || other.ny ? other.nx !== 0 : true);
    const ha = sideways(a, b);
    const hb = sideways(b, a);
    // Two ends facing the same way turn beyond the farther one; otherwise halfway between them.
    const turnAt = (u, v, same, forward) => (same ? (forward ? Math.max(u, v) : Math.min(u, v)) : (u + v) / 2);
    let turns;
    if (ha && hb) {
      const x = turnAt(p.x, q.x, a.nx === b.nx, a.nx > 0);
      turns = [{ x, y: p.y }, { x, y: q.y }];
    } else if (!ha && !hb) {
      const y = turnAt(p.y, q.y, a.ny === b.ny, a.ny > 0);
      turns = [{ x: p.x, y }, { x: q.x, y }];
    } else {
      turns = [ha ? { x: q.x, y: p.y } : { x: p.x, y: q.y }];
    }
    return [a, p, ...turns, q, b];
  }

  // One stretch of a link from a to b, drawn in the schema's link style: its path data, points
  // that bound it, and the point halfway along (where a name goes).
  function linkStretch(a, b) {
    if (schema.linkShape === 'curved') {
      // A cubic curve whose control points lie on each connector's normal, so both ends meet their
      // side at 90°. They stand off by half the distance between the ends at the default bend of 50%.
      const k = clamp(Math.hypot(b.x - a.x, b.y - a.y) * 0.5, 30, 220) * (schema.linkBend / 50);
      const c1 = { x: a.x + a.nx * k, y: a.y + a.ny * k };
      const c2 = { x: b.x + b.nx * k, y: b.y + b.ny * k };
      const at = (t) => {
        const u = 1 - t;
        return {
          x: u * u * u * a.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * b.x,
          y: u * u * u * a.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * b.y,
        };
      };
      return {
        d: `M${a.x},${a.y} C${c1.x},${c1.y} ${c2.x},${c2.y} ${b.x},${b.y}`,
        points: Array.from({ length: 17 }, (_, i) => at(i / 16)),
        mid: at(0.5),
      };
    }
    const points = linkCorners(a, b);
    const lengths = points.slice(1).map((p, i) => Math.hypot(p.x - points[i].x, p.y - points[i].y));
    let rest = lengths.reduce((sum, len) => sum + len, 0) / 2;
    let mid = points[0];
    for (let i = 0; i < lengths.length; i++) {
      if (rest <= lengths[i] && lengths[i] > 0) {
        const t = rest / lengths[i];
        mid = { x: points[i].x + (points[i + 1].x - points[i].x) * t, y: points[i].y + (points[i + 1].y - points[i].y) * t };
        break;
      }
      rest -= lengths[i];
    }
    return { d: 'M' + points.map((p) => `${p.x},${p.y}`).join(' L'), points, mid };
  }

  const linkPath = (a, b) => linkStretch(a, b).d;

  // In order: the link's own colour, its group's links colour, the colour of a block connector it
  // ends at, then the colour of a link connector it ends at. Two ends of the same kind with
  // different colours give black.
  function linkColor(link) {
    if (link.color) return link.color;
    const group = link.via ? findBlock(link.via) : null;
    if (group?.linkColor) return group.linkColor;
    const ends = [findConnector(link.from), findConnector(link.to)].filter((end) => end?.conn.color);
    for (const onJunction of [false, true]) {
      const colors = ends.filter((end) => (end.block.kind === 'junction') === onJunction).map((end) => end.conn.color);
      if (colors.length === 2 && colors[0].toLowerCase() !== colors[1].toLowerCase()) return '#000000';
      if (colors.length) return colors[0];
    }
    return '';
  }

  // ---------- trace ----------
  // A path is followed by name: from the hovered connector or link, along links and connectors of
  // the same name, and through a block from one connector to its others of that name. Unnamed
  // links and connectors carry whatever name reaches them. With the schema set to ignore names,
  // the path is simply everything joined by links, and stops at blocks.

  const traceName = (text) => String(text || '').trim().toLowerCase();
  const connectorTraceName = ({ block, conn }) => traceName(block.kind === 'junction' ? block.name : conn.name);
  const linksAt = (connId) => schema.links.filter((l) => l.from === connId || l.to === connId);

  function tracePath(start) {
    const links = new Set();
    const conns = new Set();
    const names = new Set();
    const queue = [];
    const link = start.link ? findLink(start.link) : null;
    const found = start.conn ? findConnector(start.conn) : null;
    // An unnamed starting point takes the names of what it touches.
    if (link) {
      const ends = [findConnector(link.from), findConnector(link.to)].filter(Boolean);
      const own = traceName(link.name);
      for (const name of own ? [own] : ends.map(connectorTraceName)) if (name) names.add(name);
      links.add(link.id);
      queue.push({ link });
    } else if (found) {
      const own = connectorTraceName(found);
      for (const name of own ? [own] : linksAt(found.conn.id).map((l) => traceName(l.name))) if (name) names.add(name);
      conns.add(found.conn.id);
      queue.push({ found });
    } else {
      return null;
    }
    const anyName = schema.traceIgnoreNames;
    const passes = (name) => anyName || !name || names.has(name);
    const visitLink = (l) => {
      if (links.has(l.id) || !passes(traceName(l.name))) return;
      links.add(l.id);
      queue.push({ link: l });
    };
    const visitConn = (id) => {
      const end = conns.has(id) ? null : findConnector(id);
      if (!end || !passes(connectorTraceName(end))) return;
      conns.add(id);
      queue.push({ found: end });
    };
    while (queue.length) {
      const item = queue.pop();
      if (item.link) {
        visitConn(item.link.from);
        visitConn(item.link.to);
        continue;
      }
      const { block, conn } = item.found;
      for (const l of linksAt(conn.id)) visitLink(l);
      const name = traceName(conn.name);
      if (name && !anyName) for (const c of block.connectors) if (traceName(c.name) === name) visitConn(c.id);
    }
    return { links, conns };
  }

  function setHover(next) {
    if ((hover?.conn ?? null) === (next?.conn ?? null) && (hover?.link ?? null) === (next?.link ?? null)) return;
    hover = next;
    render();
  }

  function toggleTrace() {
    traceOn = !traceOn;
    hover = null;
    try {
      localStorage.setItem(TRACE_KEY, traceOn ? '1' : '');
    } catch { /* not remembered; the tool still works */ }
    updateChrome();
    render();
  }

  // Top-left position that centres a new element of the given size in the view, off any existing one.
  function freeSpot(width, height) {
    const rect = viewport.getBoundingClientRect();
    let x = snap((rect.width / 2 - view.x) / view.zoom - width / 2);
    let y = snap((rect.height / 2 - view.y) / view.zoom - height / 2);
    while (schema.blocks.some((b) => b.x === x && b.y === y)) {
      x += GRID * 2;
      y += GRID * 2;
    }
    return { x, y };
  }

  function addElement(block) {
    schema.blocks.push(block);
    followName(block);
    select({ type: 'block', id: block.id });
    commit();
  }

  function addTitle() {
    const { x, y } = freeSpot(240, 40);
    addElement(titleBlock(freshBlockId(new Set(schema.blocks.map((b) => b.id)), 'title'), x, y));
  }

  function addFrame() {
    const { x, y } = freeSpot(360, 240);
    addElement(frameBlock(freshBlockId(new Set(schema.blocks.map((b) => b.id)), 'frame'), x, y));
  }

  // Everything lying entirely inside a frame; these move with it.
  function frameContents(frame) {
    return schema.blocks.filter((b) => b !== frame
      && b.x >= frame.x && b.y >= frame.y
      && b.x + b.width <= frame.x + frame.width && b.y + b.height <= frame.y + frame.height);
  }

  function addJunction() {
    const rect = viewport.getBoundingClientRect();
    let x = snap((rect.width / 2 - view.x) / view.zoom);
    let y = snap((rect.height / 2 - view.y) / view.zoom);
    while (schema.blocks.some((b) => b.x === x && b.y === y)) {
      x += GRID * 2;
      y += GRID * 2;
    }
    const block = junctionBlock(freshBlockId(new Set(schema.blocks.map((b) => b.id)), 'junction'), x, y);
    schema.blocks.push(block);
    select({ type: 'block', id: block.id });
    commit();
  }

  function addBlock(at) {
    const rect = viewport.getBoundingClientRect();
    const { width, height } = defaultSizes.block || { width: 140, height: 90 };
    let x = snap((at ? at.x : (rect.width / 2 - view.x) / view.zoom) - width / 2);
    let y = snap((at ? at.y : (rect.height / 2 - view.y) / view.zoom) - height / 2);
    while (schema.blocks.some((b) => b.x === x && b.y === y)) {
      x += GRID * 2;
      y += GRID * 2;
    }
    const block = {
      id: freshBlockId(new Set(schema.blocks.map((b) => b.id))),
      name: 'Block',
      description: '',
      icon: '',
      background: '#ffffff',
      border: '#334155',
      borderWidth: 2,
      borderStyle: 'solid',
      x, y, width, height,
      attributes: [],
      connectors: [],
    };
    schema.blocks.push(block);
    followName(block);
    select({ type: 'block', id: block.id });
    justCreated = block;
    commit();
  }

  function duplicateBlock(block) {
    syncClones(block);
    const copy = JSON.parse(JSON.stringify(block));
    copy.id = freshBlockId(new Set(schema.blocks.map((b) => b.id)), block.kind || 'block');
    copy.x += GRID * 2;
    copy.y += GRID * 2;
    delete copy.cloneGroup;
    copy.connectors.forEach((c) => { c.id = uid('c'); delete c.ref; });
    schema.blocks.push(copy);
    delete copy.customId;
    followName(copy);
    select({ type: 'block', id: copy.id });
    commit();
  }

  function removeConnector(block, conn) {
    block.connectors = block.connectors.filter((c) => c !== conn);
    schema.links = schema.links.filter((l) => l.from !== conn.id && l.to !== conn.id);
  }

  // Deleting a link group only dissolves it: its links stay and run directly again.
  function deleteSelection() {
    const blocks = selectedBlocks();
    const links = selectedLinks();
    if (blocks.length) {
      const connIds = new Set(blocks.flatMap((b) => b.connectors.map((c) => c.id)));
      const blockIds = new Set(blocks.map((b) => b.id));
      schema.links = schema.links.filter((l) => !connIds.has(l.from) && !connIds.has(l.to));
      for (const l of schema.links) if (blockIds.has(l.via)) delete l.via;
      schema.blocks = schema.blocks.filter((b) => !blocks.includes(b));
      pruneCloneGroups();
    } else if (links.length) {
      schema.links = schema.links.filter((l) => !links.includes(l));
    } else {
      return;
    }
    select(null);
    commit();
  }

  // ---------- copy and paste ----------
  // The clipboard holds copies of the selected elements and of the links running between them. It is
  // kept in local storage, so it survives loading another schema and reaches other tabs.

  let pasteCount = 0;

  function copySelection() {
    const blocks = selectedBlocks();
    if (!blocks.length) return false;
    for (const b of blocks) syncClones(b);
    const connIds = new Set(blocks.flatMap((b) => b.connectors.map((c) => c.id)));
    const links = schema.links.filter((l) => connIds.has(l.from) && connIds.has(l.to));
    try {
      localStorage.setItem(CLIP_KEY, JSON.stringify({ blocks, links }));
    } catch (err) {
      toast('Could not copy: ' + err.message, true);
      return false;
    }
    pasteCount = 0;
    toast(`Copied ${blocks.length} element(s)`);
    return true;
  }

  function pasteClipboard() {
    let clip;
    try {
      clip = JSON.parse(localStorage.getItem(CLIP_KEY) || 'null');
    } catch {
      clip = null;
    }
    if (!clip?.blocks?.length) return;
    pasteCount++;
    const shift = GRID * 2 * pasteCount;
    const connMap = new Map();
    const blockMap = new Map();
    const pasted = [];
    for (const copy of clip.blocks) {
      const oldId = copy.id;
      // Copies are independent: not clones of the original, and with ids of their own.
      delete copy.cloneGroup;
      delete copy.customId;
      for (const c of copy.connectors) {
        const id = uid('c');
        connMap.set(c.id, id);
        c.id = id;
        delete c.ref;
      }
      copy.x += shift;
      copy.y += shift;
      copy.id = freshBlockId(new Set(schema.blocks.map((b) => b.id)), copy.kind || 'block');
      schema.blocks.push(copy);
      followName(copy);
      blockMap.set(oldId, copy.id);
      pasted.push(copy.id);
    }
    for (const link of clip.links || []) {
      link.from = connMap.get(link.from);
      link.to = connMap.get(link.to);
      if (!link.from || !link.to) continue;
      if (blockMap.has(link.via)) link.via = blockMap.get(link.via);
      else delete link.via;
      delete link.customId;
      link.id = freshBlockId(new Set(schema.links.map((l) => l.id)), 'link');
      schema.links.push(link);
      followName(link);
    }
    // Run the result through the same checks as an imported file.
    schema = normalizeSchema(schema);
    select(blockSelection(pasted.filter(findBlock)));
    commit();
    renderInspector();
  }

  // ---------- link groups ----------
  // A group block (kind: 'group') has no connectors. Links with `via` set to its id are drawn
  // into its left side and out of its right side, or, if its axis is 'vertical', in at the top and
  // out at the bottom.

  const groupBlocks = () => schema.blocks.filter((b) => b.kind === 'group');

  // Where each grouped link enters and leaves its group block.
  function groupRoutes() {
    const routes = new Map();
    const dist = (p, q) => Math.hypot(p.x - q.x, p.y - q.y);
    for (const g of groupBlocks()) {
      const vertical = g.axis === 'vertical';
      // The middles of the side links come in on and the side they leave on.
      const left = vertical ? { x: g.x + g.width / 2, y: g.y } : { x: g.x, y: g.y + g.height / 2 };
      const right = vertical ? { x: left.x, y: g.y + g.height } : { x: g.x + g.width, y: left.y };
      const items = [];
      for (const link of schema.links) {
        if (link.via !== g.id) continue;
        let a = linkEnd(link, 'from');
        let b = linkEnd(link, 'to');
        if (!a || !b) continue;
        // Links have no direction: the nearer end comes in on the left (or top).
        if (dist(b, left) + dist(a, right) < dist(a, left) + dist(b, right)) [a, b] = [b, a];
        items.push({ link, a, b });
      }
      // Same order on both sides, so a link can be followed through the block.
      items.sort((p, q) => (vertical ? p.a.x - q.a.x : p.a.y - q.a.y));
      items.forEach(({ link, a, b }, i) => {
        const t = (i + 1) / (items.length + 1);
        const entry = vertical ? { x: g.x + g.width * t, y: g.y, nx: 0, ny: -1 } : { x: g.x, y: g.y + g.height * t, nx: -1, ny: 0 };
        const exit = vertical ? { x: entry.x, y: g.y + g.height, nx: 0, ny: 1 } : { x: g.x + g.width, y: entry.y, nx: 1, ny: 0 };
        routes.set(link.id, { a: aim(a, entry), b: aim(b, exit), entry, exit, group: g });
      });
    }
    return routes;
  }

  // Frames around the connectors a group's links end at: one for each side of the group, when the
  // connectors there (two or more) lie on one horizontal or vertical line. Each is a rectangle
  // with round ends, in the colour of the group's border.
  function groupFrames(routes) {
    if (!schema.groupFrames) return [];
    const byGroup = new Map();
    for (const { group, a, b } of routes.values()) {
      if (!byGroup.has(group)) byGroup.set(group, { a: [], b: [] });
      byGroup.get(group).a.push(a);
      byGroup.get(group).b.push(b);
    }
    const frames = [];
    for (const [group, ends] of byGroup) {
      for (const points of [ends.a, ends.b]) {
        const unique = points.filter((p, i) => points.findIndex((q) => q.x === p.x && q.y === p.y) === i);
        if (unique.length < 2) continue;
        const x1 = Math.min(...unique.map((p) => p.x));
        const x2 = Math.max(...unique.map((p) => p.x));
        const y1 = Math.min(...unique.map((p) => p.y));
        const y2 = Math.max(...unique.map((p) => p.y));
        if (x2 - x1 > 0.5 && y2 - y1 > 0.5) continue; // not in one line
        // Only link connectors carry an axis; block connectors have a fixed size.
        const r = Math.max(...unique.map((p) => (p.axis ? schema.junctionSize : 12))) / 2 + 5;
        frames.push({
          x: x1 - r,
          y: y1 - r,
          width: x2 - x1 + 2 * r,
          height: y2 - y1 + 2 * r,
          r,
          color: group.border && group.border !== 'transparent' ? group.border : '#64748b',
        });
      }
    }
    return frames;
  }

  // Creates a group block between the ends of `links` and routes them through it.
  function addGroup(links) {
    const ends = links.flatMap((l) => [connectorWorld(l.from), connectorWorld(l.to)]).filter(Boolean);
    const { width, height } = defaultSizes.group || { width: 120, height: Math.max(60, snap(links.length * 20 + 20)) };
    const cx = ends.reduce((sum, p) => sum + p.x, 0) / ends.length;
    const cy = ends.reduce((sum, p) => sum + p.y, 0) / ends.length;
    const block = {
      id: freshBlockId(new Set(schema.blocks.map((b) => b.id)), 'group'),
      name: 'Group',
      description: '',
      icon: '',
      background: '#f1f5f9',
      border: '#64748b',
      borderWidth: 2,
      borderStyle: 'solid',
      x: snap(cx - width / 2),
      y: snap(cy - height / 2),
      width,
      height,
      attributes: [],
      connectors: [],
      kind: 'group',
      linkColor: '',
      axis: 'horizontal', // links run through it left to right, or top to bottom ('vertical')
    };
    schema.blocks.push(block);
    followName(block);
    for (const l of links) l.via = block.id;
    return block;
  }

  function groupLinks(links) {
    if (links.length < 2) return;
    const block = addGroup(links);
    select({ type: 'block', id: block.id });
    justCreated = block;
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
    const key = (sel) => (sel ? sel.type + ':' + (sel.ids ? sel.ids.join(',') : sel.id) : '');
    const same = key(selection) === key(next);
    // Moving on to something else ends the moment in which a resize sets the default size.
    if (justCreated && !(next?.type === 'block' && next.id === justCreated.id)) justCreated = null;
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
    trace = traceOn && hover ? tracePath(hover) : null;
    drawBlocks();
    drawLinks();
    world.style.transform = `translate(${view.x}px, ${view.y}px) scale(${view.zoom})`;
    framesLayer.style.transform = world.style.transform;
    viewport.style.setProperty('--link-width', schema.linkWidth + 'px');
    viewport.style.setProperty('--junction-size', schema.junctionSize + 'px');
    viewport.style.setProperty('--trace-width', schema.traceWidth + 'px');
    if (isHex(schema.traceColor)) viewport.style.setProperty('--trace', schema.traceColor);
    else viewport.style.removeProperty('--trace');
    viewport.classList.toggle('trace-none', schema.traceColor === 'none');
    viewport.classList.toggle('trace-own', schema.traceColor === 'link');
    linksG.setAttribute('transform', `translate(${view.x} ${view.y}) scale(${view.zoom})`);
    const cell = GRID * 2 * view.zoom;
    viewport.style.backgroundSize = `${cell}px ${cell}px`;
    // Zoomed out, the dots crowd together, so they fade to keep the grid from turning into a grey sheet.
    viewport.style.setProperty('--grid-alpha', clamp(view.zoom, 0.15, 1));
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
        (block.kind === 'frame' ? framesLayer : world).append(el);
      }
      el.style.left = block.x + 'px';
      el.style.top = block.y + 'px';
      el.style.width = block.width + 'px';
      el.style.height = block.height + 'px';
      const isSelected = selection?.type === 'block' && selection.id === block.id;
      el.classList.toggle('selected', isSelected);
      el.classList.toggle('multi', selection?.type === 'blocks' && selection.ids.includes(block.id));
      el.classList.toggle('clone-sibling', !isSelected && Boolean(activeGroup) && block.cloneGroup === activeGroup);

      // Rebuild the inside only when something visible changed, so elements survive clicks and drags.
      const sig = JSON.stringify([block.name, block.icon, block.background, block.border, block.borderWidth, block.borderStyle, schema.radius,
        block.width, block.height, block.connectors, Boolean(block.cloneGroup),
        block.kind, block.fontSize, block.color, block.align, block.borderColor]);
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
    // Keep each layer's elements in schema order (and in the right layer).
    for (const layer of [framesLayer, world]) {
      const list = schema.blocks.filter((b) => (b.kind === 'frame') === (layer === framesLayer));
      const ordered = list.length === layer.children.length && list.every((b, i) => layer.children[i] === blockEls.get(b.id));
      if (!ordered) layer.append(...list.map((b) => blockEls.get(b.id)));
    }

    for (const el of world.querySelectorAll('.connector.target')) el.classList.remove('target');
    const target = tempLink?.target || reattach?.target;
    if (target) world.querySelector(`[data-conn="${CSS.escape(target)}"]`)?.classList.add('target');
    for (const el of world.querySelectorAll('.connector')) {
      const traced = Boolean(trace?.conns.has(el.dataset.conn));
      el.classList.toggle('traced', traced);
      // Marked in its own colour when the mark follows the links' colours.
      if (traced && schema.traceColor === 'link') el.style.setProperty('--trace', findConnector(el.dataset.conn)?.conn.color || '#334155');
      else el.style.removeProperty('--trace');
    }
  }

  function buildJunction(el, block) {
    const conn = block.connectors[0];
    const dot = h('div', { class: 'connector', title: block.name || 'Link connector' });
    dot.dataset.conn = conn.id;
    if (conn.color) {
      dot.style.background = conn.color;
      dot.style.borderColor = `color-mix(in srgb, ${conn.color} 65%, black)`;
    }
    if (block.borderColor) dot.style.borderColor = block.borderColor;
    const parts = [dot, h('div', { class: 'mi junction-move', title: 'Drag to move' }, 'open_with')];
    if (block.name) parts.push(h('div', { class: 'conn-label junction-label' }, block.name));
    el.replaceChildren(...parts);
  }

  function resizeHandles() {
    return ['n', 'e', 's', 'w', 'nw', 'ne', 'se', 'sw'].map((dir) => {
      const handle = h('div', { class: 'handle ' + dir });
      handle.dataset.dir = dir;
      return handle;
    });
  }

  function buildTitle(el, block) {
    const body = h('div', { class: 'title-body' }, block.name);
    body.style.fontSize = block.fontSize + 'px';
    body.style.textAlign = block.align;
    if (block.color) body.style.color = block.color;
    el.replaceChildren(body, ...resizeHandles());
  }

  function buildFrame(el, block) {
    const body = h('div', { class: 'frame-body' });
    body.style.background = block.background;
    body.style.borderColor = block.border;
    body.style.borderWidth = block.borderWidth + 'px';
    body.style.borderStyle = block.borderStyle;
    body.style.borderRadius = schema.radius + 'px';
    const parts = [body];
    // Only the title and the border take the pointer; the inside stays free for panning and for its contents.
    for (const side of ['top', 'right', 'bottom', 'left']) parts.push(h('div', { class: 'frame-edge ' + side }));
    if (block.name) parts.push(h('div', { class: 'frame-title' }, block.name));
    el.replaceChildren(...parts, ...resizeHandles());
  }

  function buildBlock(el, block) {
    for (const kind of ['junction', 'title', 'frame']) el.classList.toggle(kind, block.kind === kind);
    if (block.kind === 'frame') {
      buildFrame(el, block);
      return;
    }
    if (block.kind === 'junction') {
      buildJunction(el, block);
      return;
    }
    if (block.kind === 'title') {
      buildTitle(el, block);
      return;
    }
    // Too small for a title: show just the icon, centred.
    const small = Boolean(block.icon) && (block.width < SMALL_W || block.height < SMALL_H);
    const body = h('div', { class: 'block-body' + (small ? ' small' : '') });
    body.style.background = block.background;
    body.style.borderColor = block.border;
    body.style.borderWidth = block.borderWidth + 'px';
    body.style.borderStyle = block.borderStyle;
    body.style.borderRadius = schema.radius + 'px';
    body.style.color = contrastColor(block.background);
    if (block.icon) {
      const ic = h('span', { class: 'mi block-icon' }, block.icon);
      ic.style.fontSize = (small ? clamp(Math.min(block.width, block.height) * 0.6, 12, 40) : 32) + 'px';
      body.append(ic);
    }
    if (!small) body.append(h('div', { class: 'block-title' }, block.name));
    if (block.cloneGroup && !small) body.append(h('span', { class: 'mi clone-badge', title: 'Clone' }, 'copy_all'));

    const parts = [body, ...resizeHandles()];
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

  // Preview of a link connector about to be created.
  function ghostDot(at) {
    const dot = document.createElementNS(SVG_NS, 'circle');
    dot.setAttribute('class', 'junction-ghost');
    dot.setAttribute('cx', at.x);
    dot.setAttribute('cy', at.y);
    dot.setAttribute('r', schema.junctionSize / 2 - 1);
    return dot;
  }

  // What to draw for each link: its line (as path data, with points that bound it), colour, dash
  // pattern and the point its name is written at.
  function linkShapes(routes) {
    const shapes = [];
    for (const link of schema.links) {
      const rawA = linkEnd(link, 'from');
      const rawB = linkEnd(link, 'to');
      if (!rawA || !rawB) continue;
      const a = aim(rawA, rawB);
      const b = aim(rawB, rawA);
      const route = routes.get(link.id);
      const parts = (route ? [[route.a, route.entry], [route.exit, route.b]] : [[a, b]]).map(([p, q]) => linkStretch(p, q));
      // Dash lengths grow with the line width so dashes and dots keep their look.
      const w = schema.linkWidth;
      shapes.push({
        link,
        d: parts.map((part) => part.d).join(' '),
        points: parts.flatMap((part) => part.points),
        color: linkColor(link),
        dash: { dashed: `${3.5 * w} ${3 * w}`, dotted: `0.01 ${2.75 * w}` }[link.style],
        mid: parts[0].mid, // a grouped link is labelled on its way into the group
      });
    }
    return shapes;
  }

  function drawLinks() {
    const nodes = [];
    const labels = []; // drawn last, above every line
    const routes = groupRoutes();
    for (const f of groupFrames(routes)) {
      const rect = document.createElementNS(SVG_NS, 'rect');
      rect.setAttribute('class', 'group-frame');
      for (const [key, value] of Object.entries({ x: f.x, y: f.y, width: f.width, height: f.height, rx: f.r })) rect.setAttribute(key, value);
      rect.style.stroke = f.color;
      nodes.push(rect);
    }
    for (const { link, d, color, dash, mid } of linkShapes(routes)) {
      if (selection?.type === 'link' && selection.ids.includes(link.id)) nodes.push(svgPath('link-halo', d));
      const traced = trace?.links.has(link.id);
      if (traced && schema.traceColor !== 'none') {
        const mark = svgPath('link-trace', d);
        if (schema.traceColor === 'link' && color) mark.style.stroke = color;
        nodes.push(mark);
      }
      // While a path is marked, every other link fades back.
      const line = svgPath(trace && !traced ? 'link dimmed' : 'link', d);
      if (color) line.style.stroke = color;
      // White and near-white lines get a thin grey edge so they stay visible on the canvas.
      if (dash) line.setAttribute('stroke-dasharray', dash);
      if (isPale(color)) {
        const outline = svgPath(trace && !traced ? 'link-outline dimmed' : 'link-outline', d);
        if (dash) outline.setAttribute('stroke-dasharray', dash);
        nodes.push(outline);
      }
      const hit = svgPath('link-hit', d);
      hit.dataset.link = link.id;
      nodes.push(line, hit);
      if (link.name) {
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
      // The far end: a connector under the pointer, the link connector about to be created, or the pointer.
      const b = (tempLink.target && connectorWorld(tempLink.target))
        || (tempLink.ghost && { ...tempLink.ghost, nx: 0, ny: 0, axis: 'horizontal' })
        || { x: tempLink.x, y: tempLink.y, nx: 0, ny: 0 };
      if (a) nodes.push(svgPath('link-temp', linkPath(aim(a, b), aim(b, a))));
      if (a && tempLink.ghost) nodes.push(ghostDot(tempLink.ghost));
    }
    for (const { from, ghost } of multiLink || []) {
      const a = connectorWorld(from);
      if (!a) continue;
      const b = { ...ghost, nx: 0, ny: 0, axis: a.axis };
      nodes.push(svgPath('link-temp', linkPath(aim(a, b), aim(b, a))), ghostDot(ghost));
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

  // Drags `block`; `others` (the rest of a multi-selection) and the contents of any frame among
  // them follow by the same amount. `onClick` runs instead of a commit if the pointer never moved.
  function startMove(e, block, others = [], onClick = null) {
    const start = toWorld(e);
    const origin = { x: block.x, y: block.y };
    const group = new Set(others);
    for (const b of [block, ...others]) if (b.kind === 'frame') for (const inner of frameContents(b)) group.add(inner);
    group.delete(block);
    const carried = [...group].map((b) => ({ b, x: b.x, y: b.y }));
    let moved = false;
    drag((ev) => {
      const p = toWorld(ev);
      const x = origin.x + p.x - start.x;
      const y = origin.y + p.y - start.y;
      block.x = ev.altKey ? Math.round(x) : snap(x);
      block.y = ev.altKey ? Math.round(y) : snap(y);
      for (const item of carried) {
        item.b.x = item.x + block.x - origin.x;
        item.b.y = item.y + block.y - origin.y;
      }
      moved = moved || block.x !== origin.x || block.y !== origin.y;
      render();
    }, () => {
      if (!moved && onClick) onClick();
      else commit();
    });
  }

  // Shift+drag on empty canvas: rubber-band selection of elements.
  function startMarquee(e) {
    const rect = viewport.getBoundingClientRect();
    const startScreen = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    const startWorld = toWorld(e);
    const box = h('div', { id: 'marquee' });
    viewport.append(box);
    drag((ev) => {
      const x = ev.clientX - rect.left;
      const y = ev.clientY - rect.top;
      box.style.left = Math.min(x, startScreen.x) + 'px';
      box.style.top = Math.min(y, startScreen.y) + 'px';
      box.style.width = Math.abs(x - startScreen.x) + 'px';
      box.style.height = Math.abs(y - startScreen.y) + 'px';
    }, (ev) => {
      box.remove();
      const end = toWorld(ev);
      const l = Math.min(startWorld.x, end.x);
      const r = Math.max(startWorld.x, end.x);
      const t = Math.min(startWorld.y, end.y);
      const b = Math.max(startWorld.y, end.y);
      const hit = schema.blocks.filter((k) => {
        const inside = k.x >= l && k.y >= t && k.x + k.width <= r && k.y + k.height <= b;
        // A frame surrounds whatever is dragged over inside it, so it must be enclosed to count.
        return k.kind === 'frame' ? inside : k.x <= r && k.x + k.width >= l && k.y <= b && k.y + k.height >= t;
      });
      select(blockSelection(hit.map((k) => k.id)));
    });
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
      if (block === justCreated) {
        // Resized straight after being added: the next new ones start at this size.
        defaultSizes[block.kind || 'block'] = { width: block.width, height: block.height };
        try {
          localStorage.setItem(SIZE_KEY, JSON.stringify(defaultSizes));
        } catch { /* not remembered beyond this session */ }
      }
      commit();
      renderInspector();
    });
  }

  // Alt+drag: the connector follows the pointer to the nearest side and slot.
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

  // The colour a new link drawn from this connector starts with: the connector's own colour, or,
  // for an uncoloured link connector, the one colour its coloured links share.
  function inheritedColor(connId) {
    const source = findConnector(connId);
    if (!source) return '';
    if (source.conn.color) return source.conn.color;
    if (source.block.kind !== 'junction') return '';
    const colors = new Set(schema.links.filter((l) => (l.from === connId || l.to === connId) && l.color).map((l) => l.color.toLowerCase()));
    return colors.size === 1 ? [...colors][0] : '';
  }

  // Changes a connector's colour. Links that took their colour from it keep following it.
  function setConnectorColor(conn, color, s = schema) {
    const old = (conn.color || '').toLowerCase();
    if (old && old !== color.toLowerCase()) {
      for (const l of s.links) if ((l.from === conn.id || l.to === conn.id) && l.color.toLowerCase() === old) l.color = color;
    }
    conn.color = color;
  }

  // Shift+drag: pick up the link ends on a connector and drop them on another one. Takes the
  // selected links attached there if any, otherwise every link attached.
  function startReattach(e, fromId, picked) {
    const attached = schema.links.filter((l) => l.from === fromId || l.to === fromId);
    const chosen = attached.filter((l) => picked.includes(l.id));
    const links = chosen.length ? chosen : attached;
    if (!links.length) {
      // Nothing to pick up: Shift+drag from a free connector draws a new link instead.
      startLink(e, fromId);
      return;
    }
    const targetAt = (ev) => {
      const id = document.elementFromPoint(ev.clientX, ev.clientY)?.closest?.('.connector')?.dataset.conn;
      return id && id !== fromId ? id : null;
    };
    reattach = { from: fromId, links: links.map((l) => l.id), ...toWorld(e), target: null };
    drag((ev) => {
      Object.assign(reattach, toWorld(ev), { target: targetAt(ev) });
      render();
    }, (ev) => {
      const to = targetAt(ev);
      reattach = null;
      let skipped = 0;
      for (const link of to ? links : []) {
        const key = link.from === fromId ? 'from' : 'to';
        const other = key === 'from' ? link.to : link.from;
        // Never create a link from a connector to itself, or a second link between the same pair.
        const clash = other === to
          || schema.links.some((l) => l !== link && ((l.from === to && l.to === other) || (l.from === other && l.to === to)));
        if (clash) skipped++;
        else {
          link[key] = to;
          delete link[key + 'Dir']; // the chosen side belonged to the old connector
        }
      }
      if (skipped) toast(`${skipped} link(s) left in place: the same link already exists there.`, true);
      commit();
      render();
      renderInspector();
    });
  }

  function startLink(e, fromId) {
    const p = toWorld(e);
    tempLink = { from: fromId, x: p.x, y: p.y, target: null, ghost: null };
    const targetAt = (ev) => {
      const id = document.elementFromPoint(ev.clientX, ev.clientY)?.closest?.('.connector')?.dataset.conn;
      return id && id !== fromId ? id : null;
    };
    // With Shift held over empty canvas, releasing creates a link connector: where it would go.
    const ghostAt = (ev, shift) => {
      const over = document.elementFromPoint(ev.clientX, ev.clientY);
      if (!shift || targetAt(ev) || !over || !viewport.contains(over) || over.closest('.block')) return null;
      const at = toWorld(ev);
      return { x: snap(at.x), y: snap(at.y) };
    };
    let last = e;
    const update = (shift) => {
      Object.assign(tempLink, toWorld(last), { target: targetAt(last), ghost: ghostAt(last, shift) });
      render();
    };
    // Shift can be pressed or released without the pointer moving.
    const onKey = (ev) => {
      if (ev.key === 'Shift') update(ev.type === 'keydown');
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('keyup', onKey);
    drag((ev) => {
      last = ev;
      update(ev.shiftKey);
    }, (ev) => {
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('keyup', onKey);
      let to = targetAt(ev);
      const ghost = ghostAt(ev, ev.shiftKey);
      tempLink = null;
      const color = inheritedColor(fromId);
      if (ghost) {
        // The new link connector continues the one the link was drawn from: same colour and name,
        // and the same border colour if that one is a link connector too.
        const source = findConnector(fromId);
        const name = source.block.kind === 'junction' ? source.block.name : source.conn.name;
        const borderColor = source.block.borderColor || '';
        const junction = junctionBlock(freshBlockId(new Set(schema.blocks.map((b) => b.id)), 'junction'), ghost.x, ghost.y, { color, name, borderColor });
        schema.blocks.push(junction);
        followName(junction);
        to = junction.connectors[0].id;
        select({ type: 'block', id: junction.id });
      }
      if (to) {
        const exists = schema.links.some((l) => (l.from === fromId && l.to === to) || (l.from === to && l.to === fromId));
        if (!exists) {
          schema.links.push({
            id: freshBlockId(new Set(schema.links.map((l) => l.id)), 'link'),
            from: fromId,
            to,
            color,
            style: 'solid',
            name: '',
            description: '',
            attributes: [],
          });
          commit();
          renderInspector(); // link counts shown in the panel
        }
      }
      render();
    });
  }

  // Shift+drag from one of several selected link connectors extends them all: each gets a new link
  // connector of the same name and colour, laid out as they are, and a link to it. The new links
  // run through a link group of their own. `onClick` runs instead if the pointer never moved.
  function startMultiLink(e, junctions, grabbed, onClick) {
    const place = (ev) => {
      const over = document.elementFromPoint(ev.clientX, ev.clientY);
      if (!over || !viewport.contains(over) || over.closest('.block')) return null; // only onto empty canvas
      const p = toWorld(ev);
      const dx = snap(p.x - grabbed.x);
      const dy = snap(p.y - grabbed.y);
      return junctions.map((j) => ({ from: j.connectors[0].id, ghost: { x: j.x + dx, y: j.y + dy } }));
    };
    let moved = false;
    drag((ev) => {
      moved = moved || Math.hypot(ev.clientX - e.clientX, ev.clientY - e.clientY) >= 4;
      multiLink = moved ? place(ev) : null;
      render();
    }, (ev) => {
      const items = moved ? place(ev) : null;
      multiLink = null;
      if (!moved) {
        onClick();
        return;
      }
      if (!items) {
        render();
        return;
      }
      const links = [];
      const created = [];
      items.forEach(({ from, ghost }, i) => {
        const source = junctions[i];
        const color = inheritedColor(from);
        const junction = junctionBlock(freshBlockId(new Set(schema.blocks.map((b) => b.id)), 'junction'), ghost.x, ghost.y,
          { color, name: source.name, borderColor: source.borderColor, axis: source.axis });
        schema.blocks.push(junction);
        followName(junction);
        created.push(junction.id);
        links.push({
          id: freshBlockId(new Set(schema.links.map((l) => l.id)), 'link'),
          from,
          to: junction.connectors[0].id,
          color,
          style: 'solid',
          name: '',
          description: '',
          attributes: [],
        });
        schema.links.push(links[i]);
      });
      addGroup(links);
      // The new set is selected, ready to be extended again.
      select(blockSelection(created));
      commit();
      renderInspector();
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

    if (block && e.shiftKey && !connEl && !handleEl) {
      // Shift+click adds an element to the selection or takes it out.
      const ids = selectedBlocks().map((b) => b.id);
      select(blockSelection(ids.includes(block.id) ? ids.filter((id) => id !== block.id) : [...ids, block.id]));
    } else if (block && !connEl && selection?.type === 'blocks' && selection.ids.includes(block.id)) {
      // Dragging one of several selected elements moves them all; a plain click selects just this one.
      startMove(e, block, selectedBlocks().filter((b) => b !== block), () => select({ type: 'block', id: block.id }));
    } else if (block) {
      const picked = selection?.type === 'link' ? selection.ids : []; // read before the selection changes
      if (e.shiftKey && connEl && block.kind === 'junction') {
        // A link connector is all dot, so Shift+click (no drag) on it toggles it in the selection.
        const ids = selectedBlocks().map((b) => b.id);
        const toggled = ids.includes(block.id) ? ids.filter((id) => id !== block.id) : [...ids, block.id];
        const set = selectedBlocks().filter((b) => b.kind === 'junction');
        if (set.length > 1 && set.includes(block)) {
          startMultiLink(e, set, block, () => select(blockSelection(toggled)));
          return;
        }
        window.addEventListener('pointerup', (ev) => {
          if (Math.hypot(ev.clientX - e.clientX, ev.clientY - e.clientY) < 4) select(blockSelection(toggled));
        }, { once: true });
      }
      select({ type: 'block', id: block.id });
      if (connEl) {
        const conn = block.connectors.find((c) => c.id === connEl.dataset.conn);
        if (!conn) return;
        if (e.altKey && block.kind === 'junction') startMove(e, block);
        else if (e.altKey) startConnectorMove(block, conn);
        else if (e.shiftKey) startReattach(e, conn.id, picked);
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
    } else if (e.shiftKey) {
      startMarquee(e);
    } else {
      select(null);
      startPan(e);
    }
  });

  // Trace: follow what the pointer is over. Left alone while a button is held, so a drag keeps its path.
  viewport.addEventListener('pointermove', (e) => {
    if (!traceOn || e.buttons) return;
    const conn = e.target.closest?.('.connector')?.dataset.conn;
    const link = e.target.closest?.('[data-link]')?.dataset.link;
    setHover(conn ? { conn } : link ? { link } : null);
  });
  viewport.addEventListener('pointerleave', () => setHover(null));

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
    const lines = e.deltaMode === 1 ? 33 : 1; // some browsers report the wheel in lines, not pixels
    if (!e.shiftKey) {
      // Scrolling zooms about the pointer. A trackpad pinch arrives with Ctrl set and in small steps.
      const rect = viewport.getBoundingClientRect();
      const rate = e.ctrlKey || e.metaKey ? 0.01 : 0.002;
      zoomAt(e.clientX - rect.left, e.clientY - rect.top, Math.exp(-e.deltaY * lines * rate));
    } else {
      view.x -= e.deltaX * lines;
      view.y -= e.deltaY * lines;
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
      if (block && (!block.kind || block.kind === 'title')) duplicateBlock(block);
    } else if (mod && key === 'c') {
      if (copySelection()) e.preventDefault();
    } else if (mod && key === 'x') {
      if (copySelection()) {
        e.preventDefault();
        deleteSelection();
      }
    } else if (mod && key === 'v') {
      e.preventDefault();
      pasteClipboard();
    } else if (mod && key === 'g') {
      e.preventDefault();
      groupLinks(selectedLinks());
    } else if (!mod && !e.altKey && key === 't') {
      toggleTrace();
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

  // Multi-line Description field shared by blocks, links and link connectors.
  function descriptionField(owner) {
    const area = h('textarea', { rows: 2, value: owner.description || '', spellcheck: false, placeholder: 'Description' });
    area.addEventListener('input', () => { owner.description = area.value; });
    area.addEventListener('change', commit);
    return field('Description', area);
  }

  // `mixed`: the selected elements differ, so no value is shown until the slider is moved.
  function slider(value, min, max, apply, mixed = false, unit = ' px') {
    const input = h('input', { type: 'range', min, max, step: 1, value });
    const label = h('span', { class: 'slider-value' }, mixed ? 'mixed' : value + unit);
    input.addEventListener('input', () => {
      apply(Number(input.value));
      label.textContent = input.value + unit;
      render();
    });
    input.addEventListener('change', commit);
    return h('div', { class: 'slider' }, input, label);
  }

  // Solid / dashed / dotted chooser. `current` is null when a multi-selection disagrees.
  function styleField(label, current, apply) {
    const buttons = LINE_STYLES.map((style) => {
      const svg = document.createElementNS(SVG_NS, 'svg');
      svg.setAttribute('viewBox', '0 0 30 10');
      svg.setAttribute('class', 'style-icon');
      const line = svgPath('', 'M3,5 H27');
      if (LINK_DASH[style]) line.setAttribute('stroke-dasharray', LINK_DASH[style]);
      svg.append(line);
      return h('button', {
        class: 'icon-only' + (style === current ? ' active' : ''),
        title: style[0].toUpperCase() + style.slice(1),
        onclick: (e) => {
          e.preventDefault();
          apply(style);
          commit();
          render();
          renderInspector();
        },
      }, svg);
    });
    // Not a <label>: clicking the caption must not press the first button.
    return h('div', { class: 'field' }, h('span', {}, label), h('div', { class: 'segmented' }, ...buttons));
  }

  // One-line colour setting: a button showing the current colour; the palette opens below on click.
  // `value` is null when a multi-selection disagrees.
  function colorField(label, key, value, apply, noneValue = 'transparent') {
    const mixed = value === null;
    const none = value === noneValue;
    const dot = h('span', { class: 'color-dot' + (mixed ? ' mixed' : none ? ' none' : '') });
    if (!none && !mixed) dot.style.background = value;
    const button = h('button', {
      class: 'color-button',
      title: 'Click to choose a colour',
      onclick: (e) => {
        e.preventDefault();
        colorPickerConn = colorPickerConn === key ? null : key;
        renderInspector();
      },
    }, dot, mixed ? 'mixed' : none ? 'none' : value);
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
    const colors = h('div', { class: 'conn-colors' }, swatches(conn.color || '', (c) => setConnectorColor(conn, c), ''));
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
  function idField(item) {
    const isLink = schema.links.includes(item);
    const clash = (v) => (isLink ? schema.links : schema.blocks).some((x) => x !== item && x.id === v);
    const input = h('input', {
      type: 'text',
      value: item.id,
      spellcheck: false,
      title: 'Follows the name until you type an ID here. Clear it to follow the name again.',
      'data-role': 'item-id',
    });
    input.addEventListener('input', () => input.classList.toggle('invalid', clash(input.value.trim())));
    input.addEventListener('change', () => {
      const v = input.value.trim();
      if (clash(v)) {
        toast(`ID "${v}" is already used by another ${isLink ? 'link' : 'block'}.`, true);
        input.value = item.id;
        input.classList.remove('invalid');
        return;
      }
      if (v) {
        item.customId = true;
        setId(item, v);
      } else {
        // Cleared: back to following the name.
        delete item.customId;
        followName(item);
      }
      input.value = item.id;
      commit();
      render();
    });
    return input;
  }

  // Call after an element's name was edited: its id follows unless the user set one.
  function nameEdited(item) {
    followName(item);
    const input = inspector.querySelector('[data-role="item-id"]');
    if (input && document.activeElement !== input) input.value = item.id;
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
    if (selection?.type === 'blocks') inspector.replaceChildren(...multiInspector(selectedBlocks()).filter(Boolean));
    else if (block) inspector.replaceChildren(...blockInspector(block));
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
        h('li', {}, 'Shift+drag a connector to pick up its links and reattach them to another connector.'),
        h('li', {}, 'Alt+drag a connector to move it along or between sides.'),
        h('li', {}, 'Click a link to select it; Delete removes the selection.'),
        h('li', {}, 'Shift+click links to select several, then group them into a block they all run through.'),
        h('li', {}, 'Clone a block to get linked copies that always change together.'),
        h('li', {}, 'Add a link connector for a free-standing dot where several links meet, or hold Shift when dropping a new link on empty canvas to create one there.'),
        h('li', {}, 'Title adds free text to the schema.'),
        h('li', {}, 'Frame adds a titled area behind the schema; what lies inside it moves with it.'),
        h('li', {}, 'Shift+drag on empty canvas, or Shift+click elements, to select several and move them together.'),
        h('li', {}, 'Hold Alt while moving or resizing to ignore the grid.'),
      ),
    ];
  }

  // Buttons that pick one of `options` ([value, icon, tooltip]). `current` is null when a
  // multi-selection disagrees.
  function choiceButtons(label, current, options, apply) {
    return h('div', { class: 'field' }, h('span', {}, label), h('div', { class: 'segmented' },
      ...options.map(([value, glyph, title]) => h('button', {
        class: 'icon-only' + (current === value ? ' active' : ''),
        title,
        onclick: () => {
          apply(value);
          commit();
          render();
          renderInspector();
        },
      }, icon(glyph))),
    ));
  }

  // Buttons that set block[key] to one of `options`.
  function choiceField(label, block, key, options) {
    return choiceButtons(label, block[key], options, (value) => { block[key] = value; });
  }

  const TITLE_ALIGN = [
    ['left', 'format_align_left', 'Align left'],
    ['center', 'format_align_center', 'Centre'],
    ['right', 'format_align_right', 'Align right'],
  ];

  function titleInspector(block) {
    const text = h('textarea', { rows: 2, value: block.name, spellcheck: false, 'data-role': 'block-name' });
    text.addEventListener('input', () => {
      block.name = text.value;
      nameEdited(block);
      render();
    });
    text.addEventListener('change', commit);
    return [
      h('h3', {}, 'Title'),
      field('Text', text),
      field('ID', idField(block)),
      descriptionField(block),
      h('h3', {}, 'Appearance'),
      field('Text size', slider(block.fontSize, 8, 96, (v) => { block.fontSize = v; })),
      ...colorField('Colour', 'block:title', block.color || '', (c) => { block.color = c; }, ''),
      choiceField('Align', block, 'align', TITLE_ALIGN),
      ...attributesSection(block),
      h('h3', {}, 'Actions'),
      h('div', { class: 'row wrap' },
        h('button', { onclick: () => duplicateBlock(block) }, icon('content_copy'), 'Duplicate'),
        h('button', { class: 'danger', onclick: deleteSelection }, icon('delete'), 'Delete title'),
      ),
    ];
  }

  // Moves the selected elements to line up, or spaces them evenly. `mode` is an edge or centre to
  // align on ('left', 'hcenter', 'right', 'top', 'vcenter', 'bottom') or 'hspread' / 'vspread'.
  function arrangeSelection(mode) {
    const blocks = selectedBlocks();
    if (blocks.length < 2) return;
    // A frame takes along the contents that are not themselves being arranged.
    const carried = new Map(blocks.map((b) => [b, b.kind === 'frame' ? frameContents(b).filter((x) => !blocks.includes(x)) : []]));
    const moveTo = (b, x, y) => {
      const dx = Math.round(x) - b.x;
      const dy = Math.round(y) - b.y;
      for (const item of [b, ...carried.get(b)]) {
        item.x += dx;
        item.y += dy;
      }
    };
    const horizontal = ['left', 'hcenter', 'right', 'hspread'].includes(mode);
    const pos = horizontal ? 'x' : 'y';
    const size = horizontal ? 'width' : 'height';
    const min = Math.min(...blocks.map((b) => b[pos]));
    const max = Math.max(...blocks.map((b) => b[pos] + b[size]));
    const place = (b, v) => (horizontal ? moveTo(b, v, b.y) : moveTo(b, b.x, v));

    if (mode === 'hspread' || mode === 'vspread') {
      // Equal gaps between neighbours; the two outermost elements stay where they are.
      const sorted = [...blocks].sort((a, b) => a[pos] + a[size] / 2 - (b[pos] + b[size] / 2));
      const gap = (max - min - sorted.reduce((sum, b) => sum + b[size], 0)) / (sorted.length - 1);
      let at = min;
      for (const b of sorted) {
        place(b, at);
        at += b[size] + gap;
      }
    } else if (mode === 'left' || mode === 'top') {
      for (const b of blocks) place(b, min);
    } else if (mode === 'right' || mode === 'bottom') {
      for (const b of blocks) place(b, max - b[size]);
    } else {
      for (const b of blocks) place(b, (min + max) / 2 - b[size] / 2);
    }
    commit();
    render();
  }

  // Settings the selected elements have in common, one section per kind of element. A setting on
  // which they differ shows as mixed; choosing a value gives it to all of them.
  function multiAppearance(blocks) {
    const out = [];
    const shared = (items, get) => (items.every((b) => get(b) === get(items[0])) ? get(items[0]) : null);
    const prop = (items, key) => shared(items, (b) => b[key] ?? '');
    const setAll = (items, key) => (v) => {
      for (const b of items) {
        b[key] = v;
        syncClones(b); // clones outside the selection follow too
      }
    };
    const sliderFor = (items, key, min, max) => {
      const value = prop(items, key);
      return slider(value ?? items[0][key], min, max, setAll(items, key), value === null);
    };

    const boxes = blocks.filter((b) => !b.kind || b.kind === 'group' || b.kind === 'frame');
    if (boxes.length) {
      const frames = boxes.filter((b) => b.kind === 'frame').length;
      out.push(
        h('h3', {}, `${frames === boxes.length ? 'Frames' : frames ? 'Blocks and frames' : 'Blocks'} (${boxes.length})`),
        ...colorField('Background', 'multi:background', prop(boxes, 'background'), setAll(boxes, 'background')),
        ...colorField('Border', 'multi:border', prop(boxes, 'border'), setAll(boxes, 'border')),
        field('Border width', sliderFor(boxes, 'borderWidth', 0, MAX_BORDER)),
        styleField('Border style', prop(boxes, 'borderStyle'), setAll(boxes, 'borderStyle')),
      );
    }

    const junctions = blocks.filter((b) => b.kind === 'junction');
    if (junctions.length) {
      out.push(
        h('h3', {}, `Link connectors (${junctions.length})`),
        ...colorField('Colour', 'multi:junction', shared(junctions, (b) => b.connectors[0].color || ''),
          (c) => { for (const b of junctions) setConnectorColor(b.connectors[0], c); }, ''),
        ...colorField('Border', 'multi:junction-border', prop(junctions, 'borderColor'), setAll(junctions, 'borderColor'), ''),
        choiceButtons('Links go', prop(junctions, 'axis'), [
          ['horizontal', 'swap_horiz', 'Links leave left or right'],
          ['vertical', 'swap_vert', 'Links leave up or down'],
        ], setAll(junctions, 'axis')),
      );
    }

    const titles = blocks.filter((b) => b.kind === 'title');
    if (titles.length) {
      out.push(
        h('h3', {}, `Titles (${titles.length})`),
        field('Text size', sliderFor(titles, 'fontSize', 8, 96)),
        ...colorField('Colour', 'multi:title', prop(titles, 'color'), setAll(titles, 'color'), ''),
        choiceButtons('Align', prop(titles, 'align'), TITLE_ALIGN, setAll(titles, 'align')),
      );
    }
    out.push(h('p', { class: 'note' }, '"Mixed" means the selected elements differ. Choosing a value applies it to all of them.'));
    return out;
  }

  function multiInspector(blocks) {
    const label = (b) => b.name || b.id;
    const tool = (mode, glyph, title, enabled = true) => h('button', {
      class: 'icon-only',
      title,
      disabled: !enabled,
      onclick: () => arrangeSelection(mode),
    }, icon(glyph));
    return [
      h('h3', {}, `${blocks.length} elements selected`),
      h('ul', {}, ...blocks.map((b) => h('li', {}, label(b)))),
      h('h3', {}, 'Align'),
      h('div', { class: 'row' },
        tool('left', 'align_horizontal_left', 'Align left edges'),
        tool('hcenter', 'align_horizontal_center', 'Align centres horizontally'),
        tool('right', 'align_horizontal_right', 'Align right edges'),
        h('span', { class: 'sep' }),
        tool('top', 'align_vertical_top', 'Align top edges'),
        tool('vcenter', 'align_vertical_center', 'Align centres vertically'),
        tool('bottom', 'align_vertical_bottom', 'Align bottom edges'),
      ),
      h('h3', {}, 'Spread'),
      h('div', { class: 'row' },
        tool('hspread', 'horizontal_distribute', 'Spread horizontally with equal gaps', blocks.length > 2),
        tool('vspread', 'vertical_distribute', 'Spread vertically with equal gaps', blocks.length > 2),
      ),
      blocks.length > 2 ? null : h('p', { class: 'note' }, 'Select three or more elements to spread them.'),
      ...multiAppearance(blocks),
      h('p', { class: 'note' }, 'Drag any of them to move them all (a link connector by its arrows handle). Shift+click an element to add it or take it out; click one to select it alone.'),
      h('h3', {}, 'Actions'),
      h('div', { class: 'row' }, h('button', { class: 'danger', onclick: deleteSelection }, icon('delete'), 'Delete selected')),
    ];
  }

  function frameInspector(block) {
    const inside = frameContents(block).length;
    return [
      h('h3', {}, 'Frame'),
      field('Title', boundInput(block.name, (v) => { block.name = v; nameEdited(block); }, { 'data-role': 'block-name' })),
      field('ID', idField(block)),
      descriptionField(block),
      h('h3', {}, 'Appearance'),
      ...colorField('Background', 'block:background', block.background, (c) => { block.background = c; }),
      ...colorField('Border', 'block:border', block.border, (c) => { block.border = c; }),
      field('Border width', slider(block.borderWidth, 0, MAX_BORDER, (v) => { block.borderWidth = v; })),
      styleField('Border style', block.borderStyle, (v) => { block.borderStyle = v; }),
      h('p', { class: 'note' }, `${inside} element(s) inside. Drag the frame by its title or border and everything lying entirely inside moves with it.`),
      ...attributesSection(block),
      h('h3', {}, 'Actions'),
      h('div', { class: 'row' }, h('button', { class: 'danger', onclick: deleteSelection }, icon('delete'), 'Delete frame')),
      h('p', { class: 'note' }, 'Deleting a frame leaves its contents in place.'),
    ];
  }

  // The links meeting at a link connector, each with the side it leaves on.
  function junctionLinksSection(block) {
    const conn = block.connectors[0];
    const links = schema.links.filter((l) => l.from === conn.id || l.to === conn.id);
    const out = [h('h3', {}, `Links (${links.length})`)];
    const choices = [['', 'autorenew', 'Automatic: follows "Links go"'], ['left', 'arrow_back', 'Leaves to the left'],
      ['up', 'arrow_upward', 'Leaves upwards'], ['down', 'arrow_downward', 'Leaves downwards'], ['right', 'arrow_forward', 'Leaves to the right']];
    for (const link of links) {
      const key = link.from === conn.id ? 'fromDir' : 'toDir';
      const other = findConnector(link.from === conn.id ? link.to : link.from);
      const label = link.name || (other ? other.block.name || other.block.id : link.id);
      out.push(h('div', { class: 'row' },
        h('span', { class: 'grow', title: describeLink(link) }, label),
        h('div', { class: 'segmented tight' }, ...choices.map(([dir, glyph, title]) => h('button', {
          class: 'icon-only' + ((link[key] || '') === dir ? ' active' : ''),
          title,
          onclick: () => {
            if (dir) link[key] = dir;
            else delete link[key];
            commit();
            render();
            renderInspector();
          },
        }, icon(glyph)))),
      ));
    }
    if (links.length) out.push(h('p', { class: 'note' }, 'Pick a side for a single link, or leave it automatic to follow "Links go".'));
    return out;
  }

  function junctionInspector(block) {
    const conn = block.connectors[0];
    return [
      h('h3', {}, 'Link connector'),
      field('Name', boundInput(block.name, (v) => { block.name = v; nameEdited(block); }, { 'data-role': 'block-name' })),
      field('ID', idField(block)),
      descriptionField(block),
      ...colorField('Colour', 'block:junction', conn.color || '', (c) => setConnectorColor(conn, c), ''),
      ...colorField('Border', 'block:junction-border', block.borderColor || '', (c) => { block.borderColor = c; }, ''),
      h('div', { class: 'field' }, h('span', {}, 'Links go'), h('div', { class: 'segmented' },
        ...[['horizontal', 'swap_horiz', 'Left/right'], ['vertical', 'swap_vert', 'Up/down']].map(([axis, glyph, label]) => h('button', {
          class: block.axis === axis ? 'active' : '',
          title: `Links leave this connector ${label.toLowerCase().replace('/', ' or ')}`,
          onclick: () => {
            block.axis = axis;
            commit();
            render();
            renderInspector();
          },
        }, icon(glyph), label)),
      )),
      h('p', { class: 'note' }, 'Drag from the dot to start a link, or drop a link on it. '
        + 'To move it, drag the arrows handle or Alt+drag the dot. Shift+drag the dot to reattach its links elsewhere.'),
      ...junctionLinksSection(block),
      ...attributesSection(block),
      h('h3', {}, 'Actions'),
      h('div', { class: 'row' }, h('button', { class: 'danger', onclick: deleteSelection }, icon('delete'), 'Delete link connector')),
    ];
  }

  function blockInspector(block) {
    if (block.kind === 'junction') return junctionInspector(block);
    if (block.kind === 'title') return titleInspector(block);
    if (block.kind === 'frame') return frameInspector(block);
    const out = [];
    const isGroup = block.kind === 'group';

    // --- basics
    const idInput = idField(block);

    const preview = h('span', { class: 'mi icon-preview' }, block.icon);
    const iconInput = boundInput(block.icon, (v) => {
      block.icon = v.trim().toLowerCase().replace(/\s+/g, '_');
      preview.textContent = block.icon;
    }, { placeholder: 'none' });

    out.push(
      h('h3', {}, isGroup ? 'Link group' : 'Block'),
      field('Name', boundInput(block.name, (v) => { block.name = v; nameEdited(block); }, { 'data-role': 'block-name' })),
      field('ID', idInput),
      descriptionField(block),
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
      styleField('Border style', block.borderStyle, (v) => { block.borderStyle = v; }),
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
      out.push(h('p', { class: 'note' }, 'Alt+drag a connector on the canvas to move or reorder it. Shift+drag it to reattach its links.'));
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
      if (found.block.kind === 'junction') return found.block.name || found.block.id;
      return `${found.block.name || found.block.id} · ${found.conn.name || found.conn.side}`;
    };
    return `${end(link.from)}  →  ${end(link.to)}`;
  }

  function groupedLinksSection(block) {
    const links = schema.links.filter((l) => l.via === block.id);
    const out = [
      h('h3', {}, `Grouped links (${links.length})`),
      choiceButtons('Links run', block.axis === 'vertical' ? 'vertical' : 'horizontal', [
        ['horizontal', 'swap_horiz', 'Horizontally: in on the left, out on the right'],
        ['vertical', 'swap_vert', 'Vertically: in at the top, out at the bottom'],
      ], (v) => { block.axis = v; }),
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
      out.push(h('p', { class: 'note' }, 'A link uses its own colour if it has one, then the group\'s links colour, then a block connector\'s colour, then a link connector\'s colour.'));
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
        field('Name', boundInput(link.name, (v) => { link.name = v; nameEdited(link); })),
        field('ID', idField(link)),
        descriptionField(link),
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

    // --- appearance
    const color = links.every((l) => l.color === links[0].color) ? links[0].color || '' : null;
    const style = links.every((l) => l.style === links[0].style) ? links[0].style : null;
    out.push(
      h('h3', {}, 'Appearance'),
      styleField('Line style', style, (v) => { for (const l of links) l.style = v; }),
      swatches(color, (c) => { for (const l of links) l.color = c; }, ''),
      h('p', { class: 'note' }, 'With no colour set (crossed swatch) a link takes, in this order: its group\'s links colour, the colour of a block connector it ends at, the colour of a link connector it ends at. Two block connectors (or two link connectors) with different colours give black.'),
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
    $('[data-action="trace"]').classList.toggle('active', traceOn);
    $('[data-action="trace"]').setAttribute('aria-pressed', traceOn);
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
    renderLinkParams();
    renderTraceParams();
    renderPalette();
    paletteDialog.showModal();
  }

  function renderLinkParams() {
    // Each link style is shown as a small drawing of a link in that style.
    const shapes = [
      ['curved', 'M3,8 C14,8 16,2 27,2', 'Curved'],
      ['straight', 'M3,8 L27,2', 'Straight'],
      ['polyline', 'M3,8 H15 V2 H27', 'Polyline: straight runs with right-angled turns'],
    ].map(([shape, d, title]) => {
      const svg = document.createElementNS(SVG_NS, 'svg');
      svg.setAttribute('viewBox', '0 0 30 10');
      svg.setAttribute('class', 'style-icon');
      svg.append(svgPath('', d));
      return h('button', {
        class: 'icon-only' + (schema.linkShape === shape ? ' active' : ''),
        title,
        onclick: () => {
          schema.linkShape = shape;
          commit();
          render();
          renderLinkParams();
        },
      }, svg);
    });
    const bend = slider(schema.linkBend, 0, 150, (v) => { schema.linkBend = v; }, false, ' %');
    bend.firstChild.disabled = schema.linkShape !== 'curved';
    $('#schema-link-params').replaceChildren(
      h('div', { class: 'field' }, h('span', {}, 'Link style'), h('div', { class: 'segmented' }, ...shapes)),
      field('Curve bend', bend),
      field('Line width', slider(schema.linkWidth, 1, 10, (v) => { schema.linkWidth = v; })),
      field('Link connector size', slider(schema.junctionSize, 6, 32, (v) => { schema.junctionSize = v; })),
      field('Frame grouped ends', h('input', {
        type: 'checkbox',
        checked: schema.groupFrames,
        title: 'Draw a frame around the connectors of grouped links when they lie in one line',
        onchange: (e) => {
          schema.groupFrames = e.target.checked;
          commit();
          render();
        },
      })),
    );
  }

  function renderTraceParams() {
    const colors = swatches(schema.traceColor, (c) => { schema.traceColor = c; }, 'none');
    colors.firstChild.title = 'None: no mark, other links just fade';
    colors.append(h('button', {
      class: 'text-choice' + (schema.traceColor === 'link' ? ' active' : ''),
      title: 'Mark each link in its own colour, so traced links look bolder',
      onclick: () => {
        schema.traceColor = 'link';
        commit();
        render();
      },
    }, 'Same as link'));
    // Show the new choice once it is made; a rebuild while the custom picker is open would close it.
    const refresh = (e) => { if (e.type === 'change' || e.target.type !== 'color') renderTraceParams(); };
    colors.addEventListener('click', refresh);
    colors.addEventListener('change', refresh);
    $('#schema-trace-params').replaceChildren(
      field('Mark colour', colors),
      field('Mark width', slider(schema.traceWidth, 1, 16, (v) => { schema.traceWidth = v; })),
      field('Ignore names', h('input', {
        type: 'checkbox',
        checked: schema.traceIgnoreNames,
        title: 'Trace every link joined to the hovered one, whatever the links and connectors are called',
        onchange: (e) => {
          schema.traceIgnoreNames = e.target.checked;
          commit();
          render();
        },
      })),
    );
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
    renderTraceParams();
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

  // ---------- JSON view ----------

  function openJson() {
    document.activeElement?.blur?.();
    commit();
    jsonText.value = JSON.stringify(schema, null, 2);
    jsonError.hidden = true;
    jsonDialog.showModal();
    jsonText.setSelectionRange(0, 0);
    jsonText.scrollTop = 0;
  }

  function parseJsonText() {
    try {
      const next = normalizeSchema(JSON.parse(jsonText.value));
      jsonError.hidden = true;
      return next;
    } catch (err) {
      jsonError.textContent = err.message;
      jsonError.hidden = false;
      return null;
    }
  }

  // Replaces the schema with the edited JSON as one undoable step.
  function applyJson() {
    const next = parseJsonText();
    if (!next) return;
    schema = next;
    validateSelection();
    commit();
    refreshAll();
    jsonDialog.close();
    toast('JSON applied to the schema');
  }

  jsonText.addEventListener('input', parseJsonText);

  jsonDialog.addEventListener('click', (e) => {
    if (e.target === jsonDialog) jsonDialog.close(); // backdrop
  });

  function downloadJson(fileName, data) {
    download(fileName, new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' }));
  }

  function download(fileName, blob) {
    const url = URL.createObjectURL(blob);
    const a = h('a', { href: url, download: fileName });
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  const exportName = () => (schema.name.trim() || 'schema').replace(/[^\w.-]+/g, '_');

  function exportJson() {
    document.activeElement?.blur?.();
    commit();
    downloadJson(exportName() + '.json', schema);
  }

  // ---------- picture export (PNG, PDF) ----------
  // The schema is painted from the model onto a canvas rather than captured from the page, so the
  // picture shows all of it at any zoom, on white, without the grid, selection or trace marks.

  const EXPORT_FONT = 'system-ui, -apple-system, "Segoe UI", Roboto, sans-serif';
  const EXPORT_PAD = 24; // white margin around the schema
  const EXPORT_SCALE = 2; // canvas pixels per schema pixel, less for a very large schema

  // Breaks text into lines no wider than maxWidth, the way the canvas wraps it: at spaces, and
  // inside a word that is too long for a line of its own.
  function wrapLines(ctx, text, maxWidth) {
    const fits = (s) => ctx.measureText(s).width <= maxWidth;
    const lines = [];
    for (const para of String(text).split('\n')) {
      let line = '';
      for (const token of para.split(/(\s+)/)) {
        if (fits(line + token)) {
          line += token;
          continue;
        }
        if (line.trim()) lines.push(line.trimEnd());
        line = '';
        if (!token.trim()) continue;
        let rest = token;
        while (rest.length > 1 && !fits(rest)) {
          let n = 1;
          while (n < rest.length - 1 && fits(rest.slice(0, n + 1))) n++;
          lines.push(rest.slice(0, n));
          rest = rest.slice(n);
        }
        line = rest;
      }
      lines.push(line.trimEnd());
    }
    return lines;
  }

  // Paints the whole schema in schema coordinates. `mark(x1, y1, x2, y2)` is told the area of
  // everything painted, so a first pass can measure the picture. `scale` is the canvas scale,
  // which shadows do not follow by themselves.
  function paintSchema(ctx, scale, mark) {
    const ink = '#0f172a';
    const muted = '#64748b';
    let fontSize = 13;
    const font = (weight, size, family = EXPORT_FONT) => {
      fontSize = size;
      ctx.font = `${weight} ${size}px ${family}`;
    };
    // Text centred vertically on y.
    const write = (str, x, y, align = 'left') => {
      const w = ctx.measureText(str).width;
      const left = align === 'left' ? x : align === 'center' ? x - w / 2 : x - w;
      mark(left, y - fontSize * 0.7, left + w, y + fontSize * 0.7);
      ctx.textAlign = align;
      ctx.textBaseline = 'middle';
      ctx.fillText(str, x, y);
    };
    const rounded = (x, y, w, hgt, r) => {
      ctx.beginPath();
      if (ctx.roundRect) ctx.roundRect(x, y, w, hgt, Math.max(0, Math.min(r, w / 2, hgt / 2)));
      else ctx.rect(x, y, w, hgt);
    };
    const visible = (color) => Boolean(color) && color !== 'transparent';
    // The darker edge a coloured connector gets: its colour mixed with black.
    const edge = (color) => {
      if (!isHex(color)) return '#334155';
      const n = parseInt(color.slice(1), 16);
      return `rgb(${[n >> 16, (n >> 8) & 255, n & 255].map((v) => Math.round(v * 0.65)).join(',')})`;
    };
    const box = (b, shadow) => {
      const bw = b.borderWidth;
      mark(b.x - 4, b.y - 4, b.x + b.width + 4, b.y + b.height + 6);
      if (visible(b.background)) {
        ctx.save();
        if (shadow) {
          ctx.shadowColor = 'rgba(15, 23, 42, .12)';
          ctx.shadowBlur = 3 * scale;
          ctx.shadowOffsetY = scale;
        }
        ctx.fillStyle = b.background;
        rounded(b.x, b.y, b.width, b.height, schema.radius);
        ctx.fill();
        ctx.restore();
      }
      if (bw > 0 && visible(b.border)) {
        ctx.save();
        ctx.strokeStyle = b.border;
        ctx.lineWidth = bw;
        if (b.borderStyle === 'dashed') ctx.setLineDash([bw * 3, bw * 2]);
        if (b.borderStyle === 'dotted') {
          ctx.setLineDash([0, bw * 2]);
          ctx.lineCap = 'round';
        }
        // The border lies inside the box, as on the canvas.
        rounded(b.x + bw / 2, b.y + bw / 2, b.width - bw, b.height - bw, schema.radius - bw / 2);
        ctx.stroke();
        ctx.restore();
      }
    };
    const dot = (x, y, size, fill, stroke) => {
      mark(x - size / 2 - 1, y - size / 2 - 1, x + size / 2 + 1, y + size / 2 + 1);
      ctx.beginPath();
      ctx.arc(x, y, Math.max(0.5, size / 2 - 1), 0, Math.PI * 2);
      ctx.fillStyle = fill || '#ffffff';
      ctx.fill();
      ctx.lineWidth = 2;
      ctx.strokeStyle = stroke;
      ctx.stroke();
    };

    // --- frames, beneath everything
    for (const b of schema.blocks) {
      if (b.kind !== 'frame') continue;
      box(b, false);
      if (!b.name) continue;
      font(600, 13);
      ctx.fillStyle = muted;
      let title = b.name;
      const room = b.width - 20;
      if (ctx.measureText(title).width > room) {
        while (title.length > 1 && ctx.measureText(title + '…').width > room) title = title.slice(0, -1);
        title += '…';
      }
      write(title, b.x + 10, b.y + 6 + 9.1);
    }

    // --- frames around grouped connectors, links, then the links' names above every line
    const routes = groupRoutes();
    for (const f of groupFrames(routes)) {
      mark(f.x - 1, f.y - 1, f.x + f.width + 1, f.y + f.height + 1);
      rounded(f.x, f.y, f.width, f.height, f.r);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = f.color;
      ctx.stroke();
    }
    const shapes = linkShapes(routes);
    ctx.save();
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    for (const { points, d, color, dash } of shapes) {
      const w = schema.linkWidth;
      for (const p of points) mark(p.x - w, p.y - w, p.x + w, p.y + w);
      const path = new Path2D(d);
      ctx.setLineDash(dash ? dash.split(' ').map(Number) : []);
      if (isPale(color)) {
        ctx.strokeStyle = '#94a3b8';
        ctx.lineWidth = w + 2;
        ctx.stroke(path);
      }
      ctx.strokeStyle = color || '#475569';
      ctx.lineWidth = w;
      ctx.stroke(path);
    }
    ctx.restore();
    for (const { link, mid } of shapes) {
      if (!link.name) continue;
      font(500, 10);
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.lineJoin = 'round';
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#ffffff';
      ctx.strokeText(link.name, mid.x, mid.y - 8.5);
      ctx.restore();
      ctx.fillStyle = ink;
      write(link.name, mid.x, mid.y - 8.5, 'center');
    }

    // --- everything else, in schema order
    for (const b of schema.blocks) {
      if (b.kind === 'frame') continue;
      if (b.kind === 'junction') {
        const conn = b.connectors[0];
        const size = schema.junctionSize;
        dot(b.x, b.y, size, conn.color, b.borderColor || (conn.color ? edge(conn.color) : '#334155'));
        if (b.name) {
          font(400, 10);
          ctx.fillStyle = muted;
          write(b.name, b.x, b.y + size / 2 + 6, 'center');
        }
        continue;
      }
      if (b.kind === 'title') {
        font(600, b.fontSize);
        ctx.fillStyle = b.color || ink;
        const x = b.align === 'center' ? b.x + b.width / 2 : b.align === 'right' ? b.x + b.width : b.x;
        wrapLines(ctx, b.name, b.width).forEach((line, i) => write(line, x, b.y + (i + 0.5) * b.fontSize * 1.2, b.align));
        continue;
      }

      box(b, true);
      // Contents: icon above the name, centred; cut off at the edge like on the canvas.
      const small = Boolean(b.icon) && (b.width < SMALL_W || b.height < SMALL_H);
      const cx = b.x + b.width / 2;
      ctx.save();
      rounded(b.x, b.y, b.width, b.height, schema.radius);
      ctx.clip();
      ctx.fillStyle = contrastColor(b.background);
      if (small) {
        font(400, clamp(Math.min(b.width, b.height) * 0.6, 12, 40), '"Material Symbols Outlined"');
        write(b.icon, cx, b.y + b.height / 2, 'center');
      } else {
        font(500, 13);
        const lines = b.name ? wrapLines(ctx, b.name, Math.max(1, b.width - 2 * (8 + b.borderWidth))) : [];
        const iconH = b.icon ? 32 + (lines.length ? 4 : 0) : 0;
        let y = b.y + b.height / 2 - (iconH + lines.length * 18.2) / 2;
        if (b.icon) {
          font(400, 32, '"Material Symbols Outlined"');
          write(b.icon, cx, y + 16, 'center');
          y += iconH;
          font(500, 13);
        }
        lines.forEach((line, i) => write(line, cx, y + (i + 0.5) * 18.2, 'center'));
      }
      ctx.restore();

      for (const conn of b.connectors) {
        const [lx, ly] = connectorLocal(b, conn);
        const x = b.x + lx;
        const y = b.y + ly;
        dot(x, y, 12, conn.color, conn.color ? edge(conn.color) : '#334155');
        if (!conn.name) continue;
        font(400, 10);
        ctx.fillStyle = muted;
        if (conn.side === 'left') write(conn.name, x - 9, y - 9, 'right');
        else if (conn.side === 'right') write(conn.name, x + 9, y - 9);
        else if (conn.side === 'top') write(conn.name, x + 9, y - 13);
        else write(conn.name, x + 9, y + 13);
      }
    }
  }

  // The schema painted on a canvas; null if there is nothing to paint.
  async function schemaCanvas() {
    // Icons are text in the icon font, which must be there before the canvas can draw them.
    await document.fonts.load('32px "Material Symbols Outlined"', 'home').catch(() => {});
    let area = null;
    paintSchema(document.createElement('canvas').getContext('2d'), 1, (x1, y1, x2, y2) => {
      area = area
        ? { x1: Math.min(area.x1, x1), y1: Math.min(area.y1, y1), x2: Math.max(area.x2, x2), y2: Math.max(area.y2, y2) }
        : { x1, y1, x2, y2 };
    });
    if (!area) return null;
    const width = Math.ceil(area.x2 - area.x1) + EXPORT_PAD * 2;
    const height = Math.ceil(area.y2 - area.y1) + EXPORT_PAD * 2;
    // Browsers refuse canvases beyond a certain size, so a very large schema gets fewer pixels.
    const scale = Math.min(EXPORT_SCALE, Math.sqrt(16e6 / (width * height)), 8000 / Math.max(width, height));
    const canvas = document.createElement('canvas');
    canvas.width = Math.round(width * scale);
    canvas.height = Math.round(height * scale);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.scale(scale, scale);
    ctx.translate(EXPORT_PAD - area.x1, EXPORT_PAD - area.y1);
    paintSchema(ctx, scale, () => {});
    return { canvas, width, height };
  }

  // A one-page PDF the size of the picture, holding it as an image.
  async function pdfBlob({ canvas, width, height }) {
    let image;
    let filter;
    if (typeof CompressionStream === 'function') {
      // Lossless, which keeps lines and text crisp.
      const rgba = canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height).data;
      const rgb = new Uint8Array(canvas.width * canvas.height * 3);
      for (let i = 0, j = 0; i < rgba.length; i += 4) {
        rgb[j++] = rgba[i];
        rgb[j++] = rgba[i + 1];
        rgb[j++] = rgba[i + 2];
      }
      const packed = new Blob([rgb]).stream().pipeThrough(new CompressionStream('deflate'));
      image = new Uint8Array(await new Response(packed).arrayBuffer());
      filter = 'FlateDecode';
    } else {
      const jpeg = await new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.95));
      image = new Uint8Array(await jpeg.arrayBuffer());
      filter = 'DCTDecode';
    }
    // Page size in points: 0.75 pt per schema pixel, so the page prints at the size seen at 100%.
    const w = (width * 0.75).toFixed(2);
    const hgt = (height * 0.75).toFixed(2);
    const content = `q ${w} 0 0 ${hgt} 0 0 cm /Im0 Do Q`;
    const objects = [
      ['<< /Type /Catalog /Pages 2 0 R >>'],
      ['<< /Type /Pages /Kids [3 0 R] /Count 1 >>'],
      [`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${w} ${hgt}] /Resources << /XObject << /Im0 4 0 R >> >> /Contents 5 0 R >>`],
      [`<< /Type /XObject /Subtype /Image /Width ${canvas.width} /Height ${canvas.height} /ColorSpace /DeviceRGB`
        + ` /BitsPerComponent 8 /Filter /${filter} /Length ${image.length} >>\nstream\n`, image, '\nendstream'],
      [`<< /Length ${content.length} >>\nstream\n${content}\nendstream`],
    ];
    const encoder = new TextEncoder();
    const parts = [];
    const offsets = [];
    let size = 0;
    const put = (chunk) => {
      const bytes = typeof chunk === 'string' ? encoder.encode(chunk) : chunk;
      parts.push(bytes);
      size += bytes.length;
    };
    put('%PDF-1.4\n');
    objects.forEach((body, i) => {
      offsets.push(size);
      put(`${i + 1} 0 obj\n`);
      body.forEach(put);
      put('\nendobj\n');
    });
    const xref = size;
    put(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n` + offsets.map((o) => String(o).padStart(10, '0') + ' 00000 n \n').join(''));
    put(`trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF\n`);
    return new Blob(parts, { type: 'application/pdf' });
  }

  async function exportPicture(kind) {
    document.activeElement?.blur?.();
    commit();
    try {
      const picture = await schemaCanvas();
      if (!picture) {
        toast('The schema is empty: there is nothing to export.', true);
        return;
      }
      const blob = kind === 'pdf'
        ? await pdfBlob(picture)
        : await new Promise((resolve) => picture.canvas.toBlob(resolve, 'image/png'));
      if (!blob) throw new Error('the picture is too large for this browser');
      download(`${exportName()}.${kind}`, blob);
    } catch (err) {
      toast('Export failed: ' + err.message, true);
    }
  }

  // Every saved schema in one file, which Import reads back into the library.
  function exportLibrary() {
    const schemas = readLibrary();
    const count = Object.keys(schemas).length;
    if (!count) {
      toast('There are no saved schemas to export.', true);
      return;
    }
    downloadJson('schematic-library.json', { format: 'schematic-library', version: 1, exportedAt: Date.now(), schemas });
    toast(`Exported ${count} saved schema(s)`);
  }

  function importLibrary(raw) {
    const incoming = {};
    for (const [name, entry] of Object.entries(raw.schemas || {})) {
      try {
        const normalized = normalizeSchema(entry?.schema);
        normalized.name = name;
        incoming[name] = { savedAt: num(entry.savedAt, Date.now()), schema: normalized };
      } catch { /* skip entries that are not schemas */ }
    }
    const names = Object.keys(incoming);
    if (!names.length) throw new Error('the file contains no schemas.');
    const lib = readLibrary();
    const clashes = names.filter((name) => lib[name]);
    if (clashes.length && !confirm(`${clashes.length} saved schema(s) with the same name will be replaced:\n${clashes.join(', ')}\n\nContinue?`)) return;
    if (!writeLibrary({ ...lib, ...incoming })) return;
    updateChrome();
    openLibrary();
    toast(`Imported ${names.length} schema(s) into saved schemas`);
  }

  importFile.addEventListener('change', async () => {
    const file = importFile.files[0];
    importFile.value = '';
    if (!file) return;
    try {
      const raw = JSON.parse(await file.text());
      if (raw?.format === 'schematic-library') {
        importLibrary(raw);
        return;
      }
      const imported = normalizeSchema(raw);
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
    'export-all': exportLibrary,
    'export-png': () => exportPicture('png'),
    'export-pdf': () => exportPicture('pdf'),
    'json': openJson,
    'json-apply': applyJson,
    'json-close': () => jsonDialog.close(),
    'import': () => importFile.click(),
    'add-block': () => addBlock(),
    'add-junction': addJunction,
    'add-title': addTitle,
    'add-frame': addFrame,
    'undo': undo,
    'redo': redo,
    'trace': toggleTrace,
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
  try {
    const sizes = JSON.parse(localStorage.getItem(SIZE_KEY) || '{}');
    for (const kind of ['block', 'group']) {
      const { width, height } = sizes?.[kind] || {};
      if (width >= MIN_SIZE && height >= MIN_SIZE) defaultSizes[kind] = { width, height };
    }
  } catch { /* no remembered sizes: the built-in ones apply */ }
  try {
    traceOn = localStorage.getItem(TRACE_KEY) === '1';
  } catch { /* storage unavailable: trace starts off */ }

  refreshAll();
})();
