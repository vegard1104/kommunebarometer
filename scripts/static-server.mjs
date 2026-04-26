// Enkelt statisk-fil-serveren for lokaltest av kommunebarometer.
// Brukes via .claude/launch.json eller direkte: node scripts/static-server.mjs
import { createServer } from 'http';
import { readFileSync } from 'fs';
import { extname, join, resolve } from 'path';

const root = process.cwd();
const port = Number(process.env.PORT || 8080);

const types = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.ico': 'image/x-icon'
};

createServer((req, res) => {
  let p = (req.url || '/').split('?')[0];
  if (p.endsWith('/')) p += 'index.html';
  const fp = resolve(join(root, p));
  if (!fp.startsWith(root)) {
    res.writeHead(403).end('forbidden');
    return;
  }
  try {
    const buf = readFileSync(fp);
    res.writeHead(200, { 'Content-Type': types[extname(fp)] || 'application/octet-stream' });
    res.end(buf);
  } catch (e) {
    res.writeHead(404).end(`404 ${p}`);
  }
}).listen(port, () => console.log(`serving ${root} on :${port}`));
