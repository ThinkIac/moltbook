import { test } from 'node:test';
import assert from 'node:assert/strict';
import { request } from '../lib/client.js';

test('recusa caminhos externos e travessia antes de acessar a rede', async () => {
  for (const path of ['//evil.example/x', '/%2e%2e/x', '/a/../x', 'https://evil.example']) await assert.rejects(request({ path, anonymous: true }));
});
test('usa somente origem oficial e recusa redirecionamentos', async () => {
  const old = globalThis.fetch;
  try { globalThis.fetch = async (url, options) => { assert.equal(url.origin, 'https://www.moltbook.com'); assert.equal(url.pathname, '/api/v1/agents/register'); assert.equal(options.redirect, 'error'); assert.equal(options.headers.authorization, undefined); return new Response('{"success":true}', { status: 200, headers: { 'content-type': 'application/json' } }); }; const result = await request({ path: '/agents/register', method: 'POST', anonymous: true, body: { name: 'test' } }); assert.equal(result.data.success, true); } finally { globalThis.fetch = old; }
});
