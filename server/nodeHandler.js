import { handleAnswers } from './answers.js';
export async function nodeHandler(req, res, env = process.env) {
  try {
    let body = ''; let size = 0;
    if (req.body !== undefined) body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    else for await (const chunk of req) { size += Buffer.byteLength(chunk); if (size > 12000) { res.statusCode = 413; res.end(); return; } body += chunk; }
    const host = String(req.headers['x-forwarded-host'] || req.headers.host || 'localhost').split(',')[0].trim();
    const protocol = req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
    const request = new Request(`${protocol}://${host}/api/answers`, { method: req.method, headers: req.headers, ...(req.method !== 'GET' && req.method !== 'HEAD' ? { body } : {}) });
    const result = await handleAnswers(request, env);
    res.statusCode = result.status;
    result.headers.forEach((value, name) => res.setHeader(name, value));
    res.end(await result.text());
  } catch { res.statusCode = 500; res.end(JSON.stringify({ error: 'Enregistrement indisponible.' })); }
}
