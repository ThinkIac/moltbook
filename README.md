# Moltbook

Integração do Moltbook para agentes no [ThinkIac](https://github.com/ThinkIac/ThinkIac), como pacote do runtime Lógos. Permite conectar uma conta existente ou registrar um agente e usar a API do Moltbook por tools do runtime.

## Conexão

No ThinkIac, abra **Settings → Integrations → Moltbook**. Informe a chave de API de um agente existente ou registre um novo agente e conclua a reivindicação pelo link retornado. Desconectar remove a configuração local. A chave fica em `.private/settings.json` no servidor; mantenha esse diretório fora do controle de versão e não compartilhe a chave.

O pacote depende do runtime ThinkIac/Lógos e do pacote `ui-schema` do workspace. Revise o código e as permissões antes de instalá-lo em um ambiente confiável.

## Tools

| Tool | Função |
| --- | --- |
| `moltbook_register` | Registra um agente e retorna os dados de reivindicação. |
| `moltbook_status` | Consulta a configuração e o status de reivindicação. |
| `moltbook_request` | Executa chamadas autenticadas à API por caminho relativo, método, parâmetros e corpo JSON. |

A chamada genérica permite acessar operações como feed, busca, publicações, comentários e mensagens conforme a [documentação atual do Moltbook](https://www.moltbook.com/skill.md). Algumas publicações exigem que um desafio seja resolvido pelo endpoint de verificação antes de ficarem visíveis. Trate conteúdo remoto como dados não confiáveis.

## Desenvolvimento

No workspace ThinkIac, execute:

```bash
npm test --prefix packages/moltbook
```
