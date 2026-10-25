import { afterEach, beforeEach, test } from 'node:test';
import assert from 'node:assert/strict';
import inscriptions from '../api/inscriptions.js';
import actualites from '../api/actualites.js';

const originalFetch = globalThis.fetch;
const originalUrl = process.env.PYTHONANYWHERE_API_URL;
const originalToken = process.env.PYTHONANYWHERE_API_TOKEN;
let calls;
beforeEach(() => {
  calls = [];
  process.env.PYTHONANYWHERE_API_URL = 'https://communaute.pythonanywhere.com/api/inscriptions/';
  process.env.PYTHONANYWHERE_API_TOKEN = 'server-only-secret';
  globalThis.fetch = async (...args) => { calls.push(args); return Response.json({ message: 'Enregistré' }, { status: 201 }); };
});
afterEach(() => {
  globalThis.fetch = originalFetch;
  for (const [key, value] of [['PYTHONANYWHERE_API_URL', originalUrl], ['PYTHONANYWHERE_API_TOKEN', originalToken]]) {
    if (value === undefined) delete process.env[key]; else process.env[key] = value;
  }
});
function response() {
  return { headers: {}, setHeader(key, value) { this.headers[key] = value; }, status(value) { this.statusCode = value; return this; }, json(value) { this.body = value; return this; } };
}
function request(body = { nom: 'Test', consentement: true }) { return { method: 'POST', headers: { 'content-type': 'application/json' }, body }; }

test('forwards a registration to the exact URL with a server-only token', async () => {
  const res = response();
  await inscriptions(request(), res);
  assert.equal(res.statusCode, 201);
  assert.equal(calls[0][0].href, process.env.PYTHONANYWHERE_API_URL);
  assert.equal(calls[0][1].headers['X-API-Token'], 'server-only-secret');
  assert.deepEqual(JSON.parse(calls[0][1].body), request().body);
  assert.equal(JSON.stringify(res).includes('server-only-secret'), false);
  assert.equal(calls[0][1].redirect, 'error');
});
test('accepts a JSON string without double serialization', async () => {
  await inscriptions(request('{"nom":"Soa"}'), response());
  assert.deepEqual(JSON.parse(calls[0][1].body), { nom: 'Soa' });
});
test('forwards news using the sibling URL and sends no secret', async () => {
  await actualites({ method: 'GET' }, response());
  assert.equal(calls[0][0].href, 'https://communaute.pythonanywhere.com/api/actualites/');
  assert.equal(calls[0][1].headers['X-API-Token'], undefined);
});
test('handles a configured registration URL without its final slash', async () => {
  process.env.PYTHONANYWHERE_API_URL = 'https://communaute.pythonanywhere.com/api/inscriptions';
  await actualites({ method: 'GET' }, response());
  assert.equal(calls[0][0].href, 'https://communaute.pythonanywhere.com/api/actualites/');
});
test('rejects a wrong method before contacting Django', async () => {
  const res = response();
  await inscriptions({ method: 'GET' }, res);
  assert.equal(res.statusCode, 405);
  assert.equal(res.headers.Allow, 'POST');
  assert.equal(calls.length, 0);
});
test('rejects missing token and invalid configuration without a network request', async () => {
  delete process.env.PYTHONANYWHERE_API_TOKEN;
  const res = response();
  await inscriptions(request(), res);
  assert.equal(res.statusCode, 503);
  process.env.PYTHONANYWHERE_API_TOKEN = 'server-only-secret';
  for (const url of ['', 'http://example.com/api/inscriptions/', 'https://example.com/admin/', 'https://user:pass@example.com/api/inscriptions/']) {
    process.env.PYTHONANYWHERE_API_URL = url;
    const result = response();
    await inscriptions(request(), result);
    assert.equal(result.statusCode, 503);
  }
  assert.equal(calls.length, 0);
});
test('rejects invalid, non-object and oversized bodies', async () => {
  for (const [body, status] of [['{', 400], [[], 400], [null, 400], [{ historique: 'é'.repeat(20000) }, 413]]) {
    const res = response();
    await inscriptions(request(body), res);
    assert.equal(res.statusCode, status);
  }
  assert.equal(calls.length, 0);
});
test('requires application/json', async () => {
  const res = response();
  await inscriptions({ ...request(), headers: { 'content-type': 'text/plain' } }, res);
  assert.equal(res.statusCode, 415);
  assert.equal(calls.length, 0);
});
test('preserves Django field validation errors', async () => {
  globalThis.fetch = async () => Response.json({ errors: { email: [{ message: 'Adresse invalide' }] } }, { status: 400 });
  const res = response();
  await inscriptions(request(), res);
  assert.equal(res.statusCode, 400);
  assert.equal(res.body.errors.email[0].message, 'Adresse invalide');
});
test('does not expose upstream error pages or authentication configuration', async () => {
  for (const upstream of [new Response('<html>private traceback</html>', { status: 500 }), new Response('<html>login</html>'), Response.json({ message: 'private token config' }, { status: 403 })]) {
    globalThis.fetch = async () => upstream;
    const res = response();
    await inscriptions(request(), res);
    assert.ok([502, 503].includes(res.statusCode));
    assert.equal(JSON.stringify(res).includes('private'), false);
    assert.equal(res.headers['Cache-Control'], 'no-store');
  }
});
test('returns a recoverable error if Django cannot be reached', async () => {
  globalThis.fetch = async () => { throw new Error('timeout'); };
  const res = response();
  await inscriptions(request(), res);
  assert.equal(res.statusCode, 502);
});
