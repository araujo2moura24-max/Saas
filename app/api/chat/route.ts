// OpsBot - Assistente Operacional Inteligente com IA Real

import { streamText, convertToModelMessages } from 'ai'

export const maxDuration = 60

// System prompt rico com contexto completo do OpsCore
const SYSTEM_PROMPT = `Você é o **OpsBot**, o assistente de inteligência artificial do OpsCore - um sistema operacional empresarial completo.

## Sua Personalidade
- Você é prestativo, objetivo e profissional, mas com um toque de simpatia
- Responde em português brasileiro, de forma clara e direta
- Usa formatação markdown para organizar informações (negrito, listas, etc.)
- Se não souber algo, seja honesto

## Sobre o OpsCore
O OpsCore é um sistema operacional empresarial que centraliza:

1. **CRM (Gestão de Clientes)** - Funil de vendas, cadastro de leads
2. **Financeiro** - Controle de receitas e despesas
3. **Operações (Tarefas)** - Gestão de atividades
4. **Integrações** - WhatsApp Business, etc.
5. **Dashboard** - Visão geral de métricas

## Módulos Disponíveis
- Dashboard: /dashboard
- CRM: /dashboard/crm
- Financeiro: /dashboard/financeiro
- Operações: /dashboard/operacoes
- Integrações: /dashboard/integracoes
- Conversas: /dashboard/conversas
- Configurações: /dashboard/configuracoes

Ajude o usuário a ser mais produtivo!`

// Handler principal
export async function POST(req: Request) {
  console.log('[v0] Chat API called')
  
  try {
    const body = await req.json()
    console.log('[v0] Request body keys:', Object.keys(body))
    
    const { messages } = body
    
    if (!messages || !Array.isArray(messages)) {
      console.log('[v0] Invalid messages format')
      return new Response(
        JSON.stringify({ error: 'Formato de mensagens invalido' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    console.log('[v0] Messages count:', messages.length)
    
    // Filtrar apenas mensagens com conteúdo válido
    const validMessages = messages.filter(m => {
      if (m.parts && Array.isArray(m.parts)) {
        return m.parts.some((p: { type: string; text?: string }) => p.type === 'text' && p.text?.trim())
      }
      return false
    })
    
    console.log('[v0] Valid messages count:', validMessages.length)

    if (validMessages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Nenhuma mensagem valida' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      )
    }

    // Converter mensagens do formato UIMessage para ModelMessage
    console.log('[v0] Converting messages...')
    const modelMessages = await convertToModelMessages(validMessages)
    console.log('[v0] Converted messages count:', modelMessages.length)

    // Stream com OpenAI usando AI SDK
    console.log('[v0] Starting streamText with model: openai/gpt-4o-mini')
    const result = streamText({
      model: 'openai/gpt-4o-mini',
      system: SYSTEM_PROMPT,
      messages: modelMessages,
      temperature: 0.7,
      onFinish: ({ text, usage }) => {
        console.log('[v0] Stream finished. Text length:', text?.length || 0)
        console.log('[v0] Token usage:', usage)
      },
    })

    console.log('[v0] Returning stream response')
    return result.toUIMessageStreamResponse()

  } catch (error) {
    console.error('[v0] Chat API error:', error)
    console.error('[v0] Error message:', error instanceof Error ? error.message : String(error))
    
    return new Response(
      JSON.stringify({
        error: 'Desculpe, ocorreu um erro ao processar sua mensagem.',
        details: error instanceof Error ? error.message : String(error),
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    )
  }
}
