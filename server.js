#!/usr/bin/env node
// Serves Schematic over HTTP with its saved schemas kept as JSON files in a folder on the server.
// The app is the same as when index.html is opened from disk; the server only tells it, in the
// page, that its folder is here, and answers its file requests:
//
//   GET    /api/files         names of the .json files in the folder
//   GET    /api/files/<name>  a file, its last change (ms) in the X-Last-Modified header
//   PUT    /api/files/<name>  writes a file
//   DELETE /api/files/<name>  removes a file
//
// Usage: node server.js [folder] [--port 8080] [--host 127.0.0.1]
// No dependencies beyond Node itself.

'use strict';

const http = require('http');
const fs = require('fs');
const fsp = fs.promises;
const path = require('path');

const args = process.argv.slice(2);
const option = (name, fallback) => {
  const i = args.indexOf('--' + name);
  if (i < 0) return fallback;
  const value = args[i + 1];
  args.splice(i, 2);
  return value;
};
const port = Number(option('port', process.env.PORT || 8080));
const host = option('host', process.env.HOST || '127.0.0.1');
const folder = path.resolve(args[0] || 'schemas');
const appDir = __dirname;
const MAX_BODY = 50 * 1024 * 1024;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=utf-8',
};

// Only the app itself and its docs are served from the app's directory.
const STATIC = new Set(['index.html', 'app.js', 'style.css']);
const isStatic = (rel) => STATIC.has(rel) || (rel.startsWith('docs/') && !rel.includes('..'));

// A schema file is a plain .json name in the folder itself: no paths, no hidden files.
const validName = (name) => /\.json$/i.test(name) && !/[\\/\0]/.test(name) && !name.startsWith('.');

function send(res, status, body, headers = {}) {
  res.writeHead(status, { 'Cache-Control': 'no-store', ...headers });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(Object.assign(new Error('Too large'), { status: 413 }));
        req.destroy();
      } else chunks.push(chunk);
    });
    req.on('end', () => resolve(Buffer.concat(chunks)));
    req.on('error', reject);
  });
}

const stamp = (stat) => Math.floor(stat.mtimeMs);

async function api(req, res, rest) {
  if (rest === '') {
    if (req.method !== 'GET') return send(res, 405, 'Method not allowed');
    const entries = await fsp.readdir(folder, { withFileTypes: true });
    const names = entries.filter((e) => e.isFile() && validName(e.name)).map((e) => e.name);
    return send(res, 200, JSON.stringify(names), { 'Content-Type': TYPES['.json'] });
  }
  const name = decodeURIComponent(rest.slice(1));
  if (!rest.startsWith('/') || !validName(name)) return send(res, 400, 'Not a schema file name');
  const file = path.join(folder, name);
  if (req.method === 'GET') {
    try {
      const [text, stat] = await Promise.all([fsp.readFile(file), fsp.stat(file)]);
      return send(res, 200, text, { 'Content-Type': TYPES['.json'], 'X-Last-Modified': String(stamp(stat)) });
    } catch (err) {
      if (err.code === 'ENOENT') return send(res, 404, 'No such file');
      throw err;
    }
  }
  if (req.method === 'PUT') {
    const body = await readBody(req);
    // Written next to it and renamed into place, so nobody reads a half-written file.
    const temp = path.join(folder, `.${name}.${process.pid}.${Date.now()}.tmp`);
    await fsp.writeFile(temp, body);
    await fsp.rename(temp, file);
    return send(res, 200, JSON.stringify({ lastModified: stamp(await fsp.stat(file)) }), { 'Content-Type': TYPES['.json'] });
  }
  if (req.method === 'DELETE') {
    await fsp.rm(file, { force: true });
    return send(res, 204, '');
  }
  return send(res, 405, 'Method not allowed');
}

async function serveStatic(res, rel) {
  if (!isStatic(rel)) return send(res, 404, 'Not found');
  const file = path.join(appDir, rel);
  let body;
  try {
    body = await fsp.readFile(file);
  } catch {
    return send(res, 404, 'Not found');
  }
  if (rel === 'index.html') {
    // Tells the app where its schemas are, before it starts.
    const config = JSON.stringify({ folder: path.basename(folder) }).replace(/</g, '\\u003c');
    body = body.toString('utf8').replace('<script src="app.js">', `<script>window.SCHEMATIC_SERVER = ${config};</script>\n  <script src="app.js">`);
  }
  send(res, 200, body, { 'Content-Type': TYPES[path.extname(rel).toLowerCase()] || 'application/octet-stream' });
}

const server = http.createServer(async (req, res) => {
  try {
    const { pathname } = new URL(req.url, 'http://localhost');
    if (pathname === '/api/files' || pathname.startsWith('/api/files/')) {
      await api(req, res, pathname.slice('/api/files'.length));
    } else if (req.method === 'GET' || req.method === 'HEAD') {
      await serveStatic(res, pathname === '/' ? 'index.html' : decodeURIComponent(pathname.slice(1)));
    } else {
      send(res, 405, 'Method not allowed');
    }
  } catch (err) {
    send(res, err.status || 500, err.message || 'Server error');
  }
});

fs.mkdirSync(folder, { recursive: true });
server.listen(port, host, () => {
  console.log(`Schematic: http://${host === '0.0.0.0' ? 'localhost' : host}:${port}/`);
  console.log(`Schemas in ${folder}`);
  if (host !== '127.0.0.1' && host !== 'localhost') console.log('Anyone who can reach this address can read and change the schemas: there is no login.');
});
