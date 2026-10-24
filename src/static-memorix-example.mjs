import assert from 'node:assert/strict';
import { mkdtemp, rm, writeFile, readFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve, sep } from 'node:path';
const temporaryRoot = await mkdtemp(join(tmpdir(), 'x12i-usage-'));
async function cleanup() {
  assert(resolve(temporaryRoot).startsWith(resolve(tmpdir()) + sep));
  assert(temporaryRoot.split(sep).at(-1).startsWith('x12i-usage-'));
  await rm(temporaryRoot, { recursive: true, force: true });
}
const previousMocks = process.env.MOCKS_DIR;
process.env.MOCKS_DIR = temporaryRoot;
let app;
try {
  const { buildServer } = await import('@x12i/static-memorix');
  app = await buildServer({ logger: false });
  const response = await app.inject({ method: 'GET', url: '/health' });
  assert.equal(response.statusCode, 200);
  assert.equal(typeof response.json(), 'object');
  console.log(response.json());
} finally {
  if (app) await app.close();
  if (previousMocks === undefined) delete process.env.MOCKS_DIR; else process.env.MOCKS_DIR = previousMocks;
  await cleanup();
}
// The fixture directory belongs only to this example. No live Memorix service is queried.
