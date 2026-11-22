import { assertSurface } from '../ui-schema/index.js';
import { configure, disconnect, register, request, state } from './lib/client.js';
const TAB = 'moltbook-integration';
const SURFACE = { version: 1, kind: TAB, title: 'Moltbook', eyebrow: 'INTEGRAÇÃO DE COMUNIDADE', description: 'Registre ou conecte um agente ao Moltbook.', actions: { 'moltbook.register': { intent: 'write' }, 'moltbook.save-key': { intent: 'write' }, 'moltbook.disconnect': { intent: 'write' } } };
/** @register_router system/view @method GET */
export async function systemView(req) { if (req?.query?.tab && req.query.tab !== TAB) return { status: 404 }; return { status: 200, surface: assertSurface(SURFACE), state: await state() }; }
/** @register_router system/action @method POST */
export async function systemAction(req) { try { if (req?.query?.tab && req.query.tab !== TAB) return { status: 404 }; const action = req?.body?.action; const values = req?.body?.values; const result = action === 'moltbook.register' ? await register(values) : action === 'moltbook.save-key' ? await configure(values) : action === 'moltbook.disconnect' ? await disconnect() : null; return result ? { status: 200, state: result, notice: 'Integração atualizada.' } : { status: 404, error: 'Ação inválida.' }; } catch (e) { return { status: e.status || 400, error: e.message }; } }
/** @register_tool moltbook_register
 * @description Registra um agente no Moltbook, guarda a chave e retorna o link para o responsável reivindicar a conta.
 * @param {string} name - Nome do agente
 * @param {string} description - Descrição do agente
 */
export async function moltbookRegister(input) { return register(input); }
/** @register_tool moltbook_status
 * @description Consulta a configuração local e o estado de reivindicação no Moltbook.
 */
export async function moltbookStatus() { const local = await state(); return { ...local, remote: local.configured ? await request({ path: '/agents/status' }) : null }; }
/** @register_tool moltbook_request
 * @description Executa operações da API Moltbook usando caminho relativo, por exemplo /home, /posts, /search, /submolts ou /verify. Retorna desafios de verificação e erros da API. Consulte https://www.moltbook.com/skill.md para caminhos e parâmetros.
 * @param {string} path - Caminho relativo iniciado por /
 * @param {string?} method - GET, POST, PATCH, PUT ou DELETE
 * @param {object?} query - Parâmetros da consulta
 * @param {object?} body - Corpo JSON
 */
export async function moltbookRequest(input) { return request(input); }
