// OpsBot - Assistente Operacional Local (sem OpenAI)

import { detectIntent, extractNavigationTarget, extractModuleForExplanation, FLOW_FIELDS, processFieldValue, NAVIGATION_TARGETS, type Intent, type FlowState } from '@/lib/opsbot/engine'
import { createLead, listLeads, countLeads, createFinance, getBalance, listFinances, createTask, listTasks, countTasks, getCompany } from '@/lib/opsbot/actions'

export const maxDuration = 30

// Armazenamento temporario de fluxos (em producao, usar Redis ou similar)
const flowStates = new Map<string, FlowState>()

// Respostas padrao
const RESPONSES: Record<string, string | ((params?: Record<string, string>) => string)> = {
  greeting: () => {
    const hour = new Date().getHours()
    let greeting = 'Ola'
    if (hour < 12) greeting = 'Bom dia'
    else if (hour < 18) greeting = 'Boa tarde'
    else greeting = 'Boa noite'
    
    return `${greeting}! Sou o **OpsBot**, seu assistente operacional.

Posso ajudar voce a:
- **Criar registros**: leads, receitas, despesas, tarefas
- **Consultar dados**: saldo, numero de leads, tarefas pendentes
- **Navegar**: "abrir CRM", "ir para financeiro"

O que voce gostaria de fazer?`
  },
  
  help: `Posso te ajudar com varias coisas! Experimente:

**CRM:**
- "criar lead" - cadastrar novo lead
- "listar leads" - ver seus leads
- "quantos leads tenho"

**Financeiro:**
- "registrar receita" - nova entrada
- "registrar despesa" - nova saida
- "qual meu saldo"

**Tarefas:**
- "criar tarefa" - nova atividade
- "listar tarefas" - ver pendentes
- "quantas tarefas tenho"

**Navegacao:**
- "abrir CRM"
- "ir para financeiro"
- "abrir operacoes"

Basta digitar o que precisa!`,

  unknown: `Desculpe, nao entendi muito bem. Tente ser mais especifico ou diga **"ajuda"** para ver o que posso fazer.

Exemplos:
- "criar lead"
- "qual meu saldo"
- "abrir CRM"`,
}

// Explicacoes dos modulos
const MODULE_EXPLANATIONS: Record<string, string> = {
  crm: `O **CRM** (Customer Relationship Management) e onde voce gerencia seus leads e clientes.

**Funcionalidades:**
- Cadastrar novos leads
- Acompanhar o funil de vendas
- Registrar valor estimado de negocios
- Adicionar notas e observacoes

Diga "abrir CRM" para acessar ou "criar lead" para adicionar um novo contato.`,

  financeiro: `O modulo **Financeiro** centraliza o controle de receitas e despesas.

**Funcionalidades:**
- Registrar receitas e entradas
- Registrar despesas e saidas
- Acompanhar saldo em tempo real
- Categorizar lancamentos

Diga "qual meu saldo" para ver o resumo ou "registrar receita" para adicionar.`,

  operacoes: `O modulo de **Operacoes** e sua central de tarefas e atividades.

**Funcionalidades:**
- Criar e gerenciar tarefas
- Definir prioridades (alta, media, baixa)
- Acompanhar status (pendente, em andamento, concluido)
- Definir prazos

Diga "criar tarefa" para adicionar ou "listar tarefas" para ver pendentes.`,

  dashboard: `O **Dashboard** e sua visao geral do negocio.

Mostra em tempo real:
- Metricas de leads e vendas
- Resumo financeiro
- Tarefas pendentes
- Graficos e indicadores

Diga "abrir dashboard" para acessar.`,

  integracoes: `O modulo de **Integracoes** conecta o OpsCore com outras ferramentas.

**Disponivel:**
- WhatsApp Business - receba mensagens direto no sistema
- Em breve: mais integracoes

Diga "abrir integracoes" para configurar.`,
}

// Handler principal
export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { messages } = body
    
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return Response.json({ error: 'Formato de mensagens invalido' }, { status: 400 })
    }

    // Pegar a ultima mensagem do usuario
    const lastMessage = messages[messages.length - 1]
    let userText = ''
    
    if (lastMessage.parts && Array.isArray(lastMessage.parts)) {
      userText = lastMessage.parts
        .filter((p: { type: string; text?: string }) => p.type === 'text')
        .map((p: { type: string; text?: string }) => p.text || '')
        .join(' ')
        .trim()
    } else if (lastMessage.content) {
      userText = lastMessage.content
    }

    if (!userText) {
      return Response.json({ 
        id: crypto.randomUUID(),
        content: 'Nao entendi sua mensagem. Pode repetir?'
      })
    }

    // Detectar intencao
    const intentMatch = detectIntent(userText)
    let response = ''
    let navigateTo: string | undefined

    // Processar com base na intencao
    switch (intentMatch.intent) {
      case 'greeting':
        response = typeof RESPONSES.greeting === 'function' 
          ? RESPONSES.greeting() 
          : RESPONSES.greeting
        break

      case 'help':
        response = RESPONSES.help as string
        break

      case 'navigate':
        const target = extractNavigationTarget(userText)
        if (target) {
          response = `Abrindo **${target.name}**...`
          navigateTo = target.path
        } else {
          response = 'Para onde voce quer ir? Diga "abrir CRM", "ir para financeiro", etc.'
        }
        break

      case 'explain':
        const module = extractModuleForExplanation(userText)
        if (module && MODULE_EXPLANATIONS[module]) {
          response = MODULE_EXPLANATIONS[module]
        } else {
          response = 'Sobre qual modulo voce quer saber? CRM, Financeiro, Operacoes, Dashboard ou Integracoes?'
        }
        break

      // CRM Actions
      case 'create_lead':
        response = `Vamos criar um novo lead!

Para cadastrar, preciso de algumas informacoes. Por favor, acesse o **CRM** e clique em "Novo Lead".

Ou me diga o nome do lead que vou te ajudar a cadastrar.`
        navigateTo = '/dashboard/crm'
        break

      case 'list_leads':
        const leadsResult = await listLeads()
        response = leadsResult.message
        break

      case 'count_leads':
        const countLeadsResult = await countLeads()
        response = countLeadsResult.message
        break

      // Financeiro Actions
      case 'create_income':
        response = `Vamos registrar uma nova **receita**!

Acesse o modulo **Financeiro** para adicionar o lancamento com todos os detalhes.`
        navigateTo = '/dashboard/financeiro'
        break

      case 'create_expense':
        response = `Vamos registrar uma nova **despesa**!

Acesse o modulo **Financeiro** para adicionar o lancamento com todos os detalhes.`
        navigateTo = '/dashboard/financeiro'
        break

      case 'get_balance':
      case 'get_financial_summary':
        const balanceResult = await getBalance()
        response = balanceResult.message
        break

      case 'list_incomes':
        const incomesResult = await listFinances('receita')
        response = incomesResult.message
        break

      case 'list_expenses':
        const expensesResult = await listFinances('despesa')
        response = expensesResult.message
        break

      // Operacoes Actions
      case 'create_task':
        response = `Vamos criar uma nova **tarefa**!

Acesse o modulo **Operacoes** para adicionar a tarefa com titulo, descricao, prioridade e prazo.`
        navigateTo = '/dashboard/operacoes'
        break

      case 'list_tasks':
        const tasksResult = await listTasks()
        response = tasksResult.message
        break

      case 'count_tasks':
        const countTasksResult = await countTasks()
        response = countTasksResult.message
        break

      // Empresa
      case 'get_company':
        const companyResult = await getCompany()
        response = companyResult.message
        break

      case 'update_company':
        response = `Para atualizar os dados da empresa, acesse **Configuracoes**.`
        navigateTo = '/dashboard/configuracoes'
        break

      // Desconhecido
      case 'unknown':
      default:
        // Tentar dar uma resposta contextual
        if (intentMatch.params?.context === 'crm') {
          response = `Parece que voce quer algo relacionado ao **CRM**. Tente:
- "criar lead"
- "listar leads"
- "quantos leads tenho"
- "abrir CRM"`
        } else if (intentMatch.params?.context === 'financeiro') {
          response = `Parece que voce quer algo relacionado ao **Financeiro**. Tente:
- "registrar receita"
- "registrar despesa"
- "qual meu saldo"
- "abrir financeiro"`
        } else if (intentMatch.params?.context === 'operacoes') {
          response = `Parece que voce quer algo relacionado a **Operacoes**. Tente:
- "criar tarefa"
- "listar tarefas"
- "quantas tarefas tenho"
- "abrir operacoes"`
        } else {
          response = RESPONSES.unknown as string
        }
        break
    }

    return Response.json({
      id: crypto.randomUUID(),
      content: response,
      navigate: navigateTo,
    })

  } catch (error) {
    console.error('Chat API error:', error)
    return Response.json({
      id: crypto.randomUUID(),
      content: 'Desculpe, ocorreu um erro. Por favor, tente novamente.',
    }, { status: 500 })
  }
}
