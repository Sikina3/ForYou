import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { extname, resolve, sep } from 'node:path';
import { nodeHandler } from './nodeHandler.js';

const root = fileURLToPath(new URL('../dist/', import.meta.url));
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml' };
try { await readFile(resolve(root, 'index.html')); } catch { console.error('Compile le site avec npm run build avant npm start.'); process.exit(1); }
const server = createServer(async (req, res) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', 'no-store');
  if (req.url?.split('?')[0] === '/api/answers') return nodeHandler(req, res);
  if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405).end(); return; }
  try {
    const pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    const file = resolve(root, `.${pathname === '/' ? '/index.html' : pathname}`);
    // Only compiled public assets are served. The data directory and source are never exposed.
    if (!file.startsWith(root.endsWith(sep) ? root : root + sep)) { res.writeHead(404).end(); return; }
    const body = await readFile(file);
    res.setHeader('Content-Type', mime[extname(file)] || 'application/octet-stream');
    res.writeHead(200).end(req.method === 'HEAD' ? undefined : body);
  } catch { res.writeHead(404).end(); }
});
server.listen(3000, '127.0.0.1', () => console.log('Site prêt : http://127.0.0.1:3000 — tunnel : ngrok http 3000'));
