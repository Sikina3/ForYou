import { saveSubmission } from './storage.js';
import { questions } from '../src/data/questions.js';

const reply = (status, message) => Response.json(status === 200 ? { ok: true } : { error: message }, { status, headers: { 'Cache-Control': 'no-store' } });
export function validateSubmission(data) {
  if (!data || !/^[0-9a-f-]{36}$/i.test(data.id || '') || !Number.isInteger(data.attempts) || data.attempts < 0 || data.attempts > 3 || typeof data.date !== 'string' || !Number.isFinite(Date.parse(data.date))) return false;
  const a = data.answers;
  if (!a || a.final !== 'OUI' || !Number.isInteger(a.love) || a.love < 1 || a.love > 10) return false;
  for (const q of questions.filter(q => q.options)) if (!q.options.includes(a[q.id])) return false;
  const validText = value => typeof value === 'string' && value.trim().length > 0 && value.length <= 2000;
  return validText(a.favorite) && (a.meeting !== 'Autre...' || validText(a.other));
}
export async function handleAnswers(request, env = process.env, save = saveSubmission) {
  if (request.method !== 'POST') return reply(405, 'Méthode non autorisée.');
  const origin = request.headers.get('origin');
  let sameOrigin = false;
  try { sameOrigin = new URL(origin).origin === (env.APP_ORIGIN || new URL(request.url).origin).replace(/\/$/, ''); } catch {}
  if (!sameOrigin) return reply(403, 'Origine non autorisée.');
  if (!request.headers.get('content-type')?.includes('application/json')) return reply(415, 'Format non accepté.');
  let data;
  try { const raw = await request.text(); if (raw.length > 12000) return reply(413, 'Requête trop longue.'); data = JSON.parse(raw); }
  catch { return reply(400, 'Requête invalide.'); }
  if (!validateSubmission(data)) return reply(400, 'Réponses invalides.');
  const a = data.answers;
  const record = { id: data.id, date: data.date, receivedAt: new Date().toISOString(), attempts: data.attempts,
    answers: Object.fromEntries(questions.map(q => [q.id, a[q.id]])),
    ...(a.meeting === 'Autre...' ? { other: a.other.trim() } : {}) };
  try {
    await save(record);
    return reply(200);
  } catch { return reply(500, 'Enregistrement indisponible.'); }
}
