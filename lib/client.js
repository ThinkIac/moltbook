import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const file = fileURLToPath(new URL('../.private/settings.json', import.meta.url));
export const tutorial = 'Registre um agente ou conecte uma chave existente. Após o registro, abra o link de reivindicação e conclua a verificação no Moltbook.';
async function read() { try { return JSON.parse(await readFile(file, 'utf8')); } catch (e) { if (e.code === 'ENOENT') return {}; throw e; } }
async function save(data) { await mkdir(dirname(file), { recursive: true, mode: 0o700 }); const tmp = `${file}.${process.pid}.tmp`; await writeFile(tmp, JSON.stringify(data), { mode: 0o600 }); await rename(tmp, file); }
export async function state() { const c = await read(); return { configured: !!c.apiKey, agentName: c.agentName || '', claimUrl: c.claimUrl || '', verificationCode: c.verificationCode || '', tutorial }; }
export async function configure({ apiKey } = {}) { if (!String(apiKey || '').trim()) throw new Error('Informe a API key.'); await save({ apiKey: String(apiKey).trim() }); return state(); }
export async function disconnect() { await save({}); return state(); }
export async function request({ path, method = 'GET', query, body, anonymous = false } = {}) {
  if (typeof path !== 'string' || !/^\/[A-Za-z0-9_~%/.-]*$/.test(path) || path.includes('..') || /%2f|%5c|%2e/i.test(path) || path.startsWith('//')) throw new Error('Caminho de API inválido.');
  method = String(method).toUpperCase(); if (!['GET','POST','PATCH','PUT','DELETE'].includes(method)) throw new Error('Método inválido.');
  const c = await read(); if (!anonymous && !c.apiKey) return { ok: false, needsLogin: true, tutorial };
  const url = new URL('https://www.moltbook.com/api/v1' + path);
  for (const [k,v] of Object.entries(query || {})) if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
  const headers = { accept: 'application/json' }; if (!anonymous) headers.authorization = `Bearer ${c.apiKey}`; if (body !== undefined) headers['content-type'] = 'application/json';
  const response = await fetch(url, { method, headers, redirect: 'error', ...(body === undefined ? {} : { body: JSON.stringify(body) }) });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) { const e = new Error(data.error || data.message || `Moltbook HTTP ${response.status}`); e.status = response.status; e.payload = data; throw e; }
  return { ok: true, status: response.status, data };
}
export async function register({ name, description } = {}) {
  if ((await read()).apiKey) throw new Error('Desconecte a conta existente antes de registrar outra.');
  if (!String(name || '').trim() || !String(description || '').trim()) throw new Error('Informe nome e descrição do agente.');
  const result = await request({ path: '/agents/register', method: 'POST', body: { name: name.trim(), description: description.trim() }, anonymous: true });
  const agent = result.data.agent || {}; if (!agent.api_key) throw new Error('Moltbook não retornou uma API key.');
  const claim = new URL(agent.claim_url); if (claim.protocol !== 'https:' || claim.hostname !== 'www.moltbook.com') throw new Error('Link de reivindicação inválido.');
  await save({ apiKey: agent.api_key, agentName: name.trim(), claimUrl: claim.href, verificationCode: agent.verification_code || '' }); return state();
}
