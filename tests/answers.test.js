import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
import { handleAnswers, validateSubmission } from '../server/answers.js';
import { createStore } from '../server/storage.js';
import { escapePosition } from '../src/hooks/escapePosition.js';
const data = { id: '3a0256dc-6b1c-4141-8d22-433bd41d679f', attempts: 3, date: '2026-09-18T10:00:00.000Z', answers: { reason: 'Pas du tout', love: 1, first: 'Moi', most: 'Toi', meeting: 'Autre...', other: 'Te sourire', favorite: 'Ta gentillesse', final: 'OUI' } };
const request = (body = data, origin = 'https://example.ngrok.app') => new Request('https://example.ngrok.app/api/answers', { method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: JSON.stringify(body) });
test('validation rejects four attempts and empty custom text', () => {
  assert.ok(validateSubmission(data));
  assert.equal(validateSubmission({ ...data, attempts: 4 }), false);
  assert.equal(validateSubmission({ ...data, answers: { ...data.answers, other: ' ' } }), false);
});
test('foreign origins and malformed submissions never reach storage', async () => {
  const fail = () => { assert.fail('Must not write'); };
  assert.equal((await handleAnswers(request(data, 'https://other.com'), {}, fail)).status, 403);
  assert.equal((await handleAnswers(request({}), {}, fail)).status, 400);
});
test('save all answers once across concurrent retries and restart', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'pour-toi-test-'));
  const file = join(dir, 'reponses.jsonl');
  const save = createStore(file);
  try {
    const results = await Promise.all(Array.from({ length: 5 }, () => handleAnswers(request(), {}, save)));
    assert.ok(results.every(r => r.status === 200));
    await handleAnswers(request(), {}, createStore(file));
    const rows = (await readFile(file, 'utf8')).trim().split('\n').map(JSON.parse);
    assert.equal(rows.length, 1);
    assert.equal(rows[0].other, 'Te sourire');
    assert.equal(rows[0].answers.favorite, 'Ta gentillesse');
    assert.equal(rows[0].attempts, 3);
    await handleAnswers(request({ ...data, id: '4a0256dc-6b1c-4141-8d22-433bd41d679f' }), {}, save);
    assert.equal((await readFile(file, 'utf8')).trim().split('\n').length, 2);
  } finally {
    if (!resolve(dir).startsWith(resolve(tmpdir()) + sep)) throw new Error('Unsafe temporary path');
    await rm(dir, { recursive: true, force: true });
  }
});
test('disk failure never reports success', async () => {
  assert.equal((await handleAnswers(request(), {}, async () => { throw new Error('Disk full'); })).status, 500);
});
test('escape positions remain in mobile and desktop viewports', () => {
  for (const bounds of [{ left: 0, top: 0, width: 390, height: 844 }, { left: 0, top: 0, width: 1440, height: 900 }]) {
    for (let i = 0; i < 100; i++) {
      const p = escapePosition(bounds, 104, 50, { x: 100, y: 200 });
      assert.ok(p.x >= 0 && p.y >= 0 && p.x + 104 <= bounds.width && p.y + 50 <= bounds.height);
    }
  }
});
