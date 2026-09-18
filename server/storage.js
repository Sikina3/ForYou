import { mkdir, readFile, open } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

export const answersFile = fileURLToPath(new URL('../data/reponses.jsonl', import.meta.url));
export function createStore(file = answersFile) {
  let queue = Promise.resolve();
  return record => {
    const job = queue.then(async () => {
      await mkdir(dirname(file), { recursive: true });
      let existing = '';
      try { existing = await readFile(file, 'utf8'); } catch (error) { if (error.code !== 'ENOENT') throw error; }
      // Check on disk as well, so retrying after a server restart does not duplicate a response.
      if (existing.split('\n').some(line => { try { return JSON.parse(line).id === record.id; } catch { return false; } })) return;
      const handle = await open(file, 'a', 0o600);
      try {
        await handle.writeFile(`${existing && !existing.endsWith('\n') ? '\n' : ''}${JSON.stringify(record)}\n`, 'utf8');
        await handle.sync();
      } finally { await handle.close(); }
    });
    queue = job.catch(() => {});
    return job;
  };
}
export const saveSubmission = createStore();
