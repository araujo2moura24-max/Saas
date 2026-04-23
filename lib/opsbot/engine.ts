// OpsBot Engine - Motor de Intencoes e Fluxos Multietapa

export type Intent = 
  // CRM
  | 'create_lead' | 'edit_lead' | 'delete_lead' | 'list_leads' | 'search_lead' | 'count_leads'
  // Financeiro
  | 'create_income' | 'create_expense' | 'list_incomes' | 'list_expenses' | 'get_balance' | 'get_financial_summary'
  // Operacoes
  | 'create_task' | 'edit_task' | 'delete_task' | 'list_tasks' | 'complete_task' | 'count_tasks'
  // Empresa
  | 'update_company' | 'get_company'
  // Navegacao
  | 'navigate'
  // Ajuda
  | 'help' | 'explain'
  // Saudacao
  | 'greeting'
  // Desconhecido
  | 'unknown'

export interface FlowState {
  intent: Intent
  step: number
  data: Record<string, unknown>
  awaitingField?: string
  completed: boolean
}

export interface IntentMatch {
  intent: Intent
  confidence: number
  params?: Record<string, string>
}

// Patterns de reconhecimento de intencao
const INTENT_PATTERNS: { intent: Intent; patterns: RegExp[]; keywords: string[] }[] = [
  // CRM - Criar Lead
  {
    intent: 'create_lead',
    patterns: [
      /(?:criar|adicionar|cadastrar|novo|nova|registrar)\s*(?:um|uma)?\s*lead/i,
      /quero\s*(?:um|uma)?\s*(?:novo|nova)?\s*lead/i,
      /(?:add|new)\s*lead/i,
    ],
    keywords: ['criar lead', 'adicionar lead', 'novo lead', 'cadastrar lead', 'registrar lead'],
  },
  // CRM - Listar Leads
  {
    intent: 'list_leads',
    patterns: [
      /(?:mostrar?|listar?|ver|exibir)\s*(?:todos?\s*)?(?:os?\s*)?leads/i,
      /(?:quais|quantos)\s*(?:sao\s*)?(?:os?\s*)?(?:meus?\s*)?leads/i,
      /meus\s*leads/i,
    ],
    keywords: ['listar leads', 'mostrar leads', 'ver leads', 'meus leads'],
  },
  // CRM - Contar Leads
  {
    intent: 'count_leads',
    patterns: [
      /quantos\s*leads/i,
      /total\s*de\s*leads/i,
      /numero\s*de\s*leads/i,
    ],
    keywords: ['quantos leads', 'total leads', 'numero leads'],
  },
  // Financeiro - Criar Receita
  {
    intent: 'create_income',
    patterns: [
      /(?:criar|adicionar|cadastrar|registrar|lancar)\s*(?:uma?\s*)?receita/i,
      /(?:nova|novo)\s*receita/i,
      /(?:entrada|recebimento)\s*(?:de)?\s*(?:dinheiro|valor)/i,
    ],
    keywords: ['criar receita', 'adicionar receita', 'nova receita', 'registrar receita', 'lancar receita'],
  },
  // Financeiro - Criar Despesa
  {
    intent: 'create_expense',
    patterns: [
      /(?:criar|adicionar|cadastrar|registrar|lancar)\s*(?:uma?\s*)?despesa/i,
      /(?:nova|novo)\s*despesa/i,
      /(?:saida|gasto|pagamento)\s*(?:de)?\s*(?:dinheiro|valor)?/i,
    ],
    keywords: ['criar despesa', 'adicionar despesa', 'nova despesa', 'registrar despesa', 'lancar despesa', 'registrar gasto'],
  },
  // Financeiro - Saldo
  {
    intent: 'get_balance',
    patterns: [
      /(?:qual|quanto)\s*(?:e|eh)?\s*(?:o\s*)?(?:meu\s*)?saldo/i,
      /(?:quanto\s*)?(?:eu\s*)?tenho\s*(?:em\s*)?(?:caixa|dinheiro|conta)/i,
      /saldo\s*(?:atual|total)/i,
    ],
    keywords: ['meu saldo', 'saldo atual', 'quanto tenho', 'saldo total'],
  },
  // Financeiro - Resumo
  {
    intent: 'get_financial_summary',
    patterns: [
      /(?:resumo|relatorio)\s*financeiro/i,
      /como\s*(?:esta|estao)\s*(?:minhas?\s*)?financas/i,
      /(?:mostrar?|ver)\s*(?:resumo\s*)?financeiro/i,
    ],
    keywords: ['resumo financeiro', 'relatorio financeiro', 'minhas financas'],
  },
  // Financeiro - Listar Receitas
  {
    intent: 'list_incomes',
    patterns: [
      /(?:mostrar?|listar?|ver)\s*(?:todas?\s*)?(?:as?\s*)?receitas/i,
      /minhas\s*receitas/i,
    ],
    keywords: ['listar receitas', 'mostrar receitas', 'ver receitas', 'minhas receitas'],
  },
  // Financeiro - Listar Despesas
  {
    intent: 'list_expenses',
    patterns: [
      /(?:mostrar?|listar?|ver)\s*(?:todas?\s*)?(?:as?\s*)?despesas/i,
      /minhas\s*despesas/i,
      /meus\s*gastos/i,
    ],
    keywords: ['listar despesas', 'mostrar despesas', 'ver despesas', 'minhas despesas', 'meus gastos'],
  },
  // Operacoes - Criar Tarefa
  {
    intent: 'create_task',
    patterns: [
      /(?:criar|adicionar|cadastrar|nova|novo)\s*(?:uma?\s*)?tarefa/i,
      /(?:criar|adicionar)\s*(?:uma?\s*)?(?:atividade|task)/i,
    ],
    keywords: ['criar tarefa', 'adicionar tarefa', 'nova tarefa', 'criar atividade'],
  },
  // Operacoes - Listar Tarefas
  {
    intent: 'list_tasks',
    patterns: [
      /(?:mostrar?|listar?|ver|quais)\s*(?:todas?\s*)?(?:as?\s*)?tarefas/i,
      /minhas\s*tarefas/i,
      /tarefas\s*pendentes/i,
    ],
    keywords: ['listar tarefas', 'mostrar tarefas', 'ver tarefas', 'minhas tarefas', 'tarefas pendentes'],
  },
  // Operacoes - Contar Tarefas
  {
    intent: 'count_tasks',
    patterns: [
      /quantas\s*tarefas/i,
      /total\s*de\s*tarefas/i,
    ],
    keywords: ['quantas tarefas', 'total tarefas'],
  },
  // Empresa
  {
    intent: 'update_company',
    patterns: [
      /(?:atualizar?|alterar?|mudar?|editar?)\s*(?:dados?\s*)?(?:da\s*)?empresa/i,
      /(?:atualizar?|alterar?|mudar?)\s*(?:o\s*)?(?:nome|cnpj|endereco)\s*(?:da\s*)?empresa/i,
    ],
    keywords: ['atualizar empresa', 'alterar empresa', 'editar empresa', 'dados empresa'],
  },
  {
    intent: 'get_company',
    patterns: [
      /(?:mostrar?|ver|exibir)\s*(?:dados?\s*)?(?:da\s*)?empresa/i,
      /(?:qual|quais)\s*(?:sao\s*)?(?:os?\s*)?dados?\s*(?:da\s*)?empresa/i,
    ],
    keywords: ['ver empresa', 'dados empresa', 'mostrar empresa'],
  },
  // Navegacao
  {
    intent: 'navigate',
    patterns: [
      /(?:abrir?|ir\s*(?:para)?|acessar?|mostrar?|abra|va\s*para|leve\s*(?:me\s*)?para)\s*(?:o\s*)?(?:modulo\s*)?(?:de\s*)?(crm|financeiro|operacoes|tarefas|dashboard|configuracoes|integracoes|conversas|relatorios)/i,
    ],
    keywords: ['abrir crm', 'ir para crm', 'abrir financeiro', 'ir para financeiro', 'abrir operacoes', 'abrir dashboard', 'abrir configuracoes', 'abrir integracoes', 'abrir conversas'],
  },
  // Ajuda
  {
    intent: 'explain',
    patterns: [
      /(?:como|o\s*que)\s*(?:funciona|faz|e|eh|serve)\s*(?:o\s*)?(crm|financeiro|operacoes|dashboard|integracoes)/i,
      /(?:explica|explicar?|me\s*explica)\s*(?:o\s*)?(crm|financeiro|operacoes|dashboard|integracoes)/i,
      /(?:pra|para)\s*(?:que|quem)\s*serve\s*(?:o\s*)?(crm|financeiro|operacoes|dashboard|integracoes)/i,
    ],
    keywords: ['como funciona', 'o que faz', 'pra que serve', 'explica'],
  },
  {
    intent: 'help',
    patterns: [
      /(?:ajuda|help|socorro)/i,
      /(?:o\s*que|como)\s*(?:voce|vc)\s*(?:pode|consegue)\s*(?:fazer|me\s*ajudar)/i,
    ],
    keywords: ['ajuda', 'help', 'o que voce faz'],
  },
  // Saudacao
  {
    intent: 'greeting',
    patterns: [
      /^(?:ola|oi|hey|hi|hello|e\s*ai|eai|bom\s*dia|boa\s*tarde|boa\s*noite)[\s!.,?]*$/i,
    ],
    keywords: ['ola', 'oi', 'bom dia', 'boa tarde', 'boa noite'],
  },
]

// Mapeamento de navegacao
export const NAVIGATION_TARGETS: Record<string, { path: string; name: string }> = {
  crm: { path: '/dashboard/crm', name: 'CRM' },
  financeiro: { path: '/dashboard/financeiro', name: 'Financeiro' },
  operacoes: { path: '/dashboard/operacoes', name: 'Operacoes' },
  tarefas: { path: '/dashboard/operacoes', name: 'Tarefas' },
  dashboard: { path: '/dashboard', name: 'Dashboard' },
  configuracoes: { path: '/dashboard/configuracoes', name: 'Configuracoes' },
  integracoes: { path: '/dashboard/integracoes', name: 'Integracoes' },
  conversas: { path: '/dashboard/conversas', name: 'Conversas' },
  relatorios: { path: '/dashboard', name: 'Relatorios' },
}

// Funcao para normalizar texto
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
}

// Funcao para detectar intencao
export function detectIntent(message: string): IntentMatch {
  const normalized = normalizeText(message)
  
  // Verificar patterns
  for (const { intent, patterns, keywords } of INTENT_PATTERNS) {
    // Verificar regex patterns
    for (const pattern of patterns) {
      const match = normalized.match(pattern)
      if (match) {
        return { intent, confidence: 0.9, params: match.groups }
      }
    }
    
    // Verificar keywords
    for (const keyword of keywords) {
      const normalizedKeyword = normalizeText(keyword)
      if (normalized.includes(normalizedKeyword)) {
        return { intent, confidence: 0.8 }
      }
    }
  }
  
  // Fallback - tentar detectar contexto geral
  if (normalized.includes('lead') || normalized.includes('cliente')) {
    return { intent: 'unknown', confidence: 0.5, params: { context: 'crm' } }
  }
  if (normalized.includes('tarefa') || normalized.includes('task') || normalized.includes('atividade')) {
    return { intent: 'unknown', confidence: 0.5, params: { context: 'operacoes' } }
  }
  if (normalized.includes('financ') || normalized.includes('dinheiro') || normalized.includes('receita') || normalized.includes('despesa')) {
    return { intent: 'unknown', confidence: 0.5, params: { context: 'financeiro' } }
  }
  
  return { intent: 'unknown', confidence: 0.3 }
}

// Extrair destino de navegacao
export function extractNavigationTarget(message: string): { path: string; name: string } | null {
  const normalized = normalizeText(message)
  
  for (const [key, target] of Object.entries(NAVIGATION_TARGETS)) {
    if (normalized.includes(key)) {
      return target
    }
  }
  
  return null
}

// Extrair modulo para explicacao
export function extractModuleForExplanation(message: string): string | null {
  const normalized = normalizeText(message)
  const modules = ['crm', 'financeiro', 'operacoes', 'dashboard', 'integracoes', 'conversas']
  
  for (const module of modules) {
    if (normalized.includes(module)) {
      return module
    }
  }
  
  return null
}

// Definicao de campos para fluxos
export const FLOW_FIELDS: Record<string, { field: string; question: string; required: boolean; type: string }[]> = {
  create_lead: [
    { field: 'name', question: 'Qual o **nome** do lead?', required: true, type: 'text' },
    { field: 'company', question: 'Qual a **empresa** dele?', required: false, type: 'text' },
    { field: 'email', question: 'Qual o **email** para contato?', required: false, type: 'email' },
    { field: 'phone', question: 'Qual o **telefone**?', required: false, type: 'phone' },
    { field: 'value', question: 'Qual o **valor estimado** do negocio? (apenas numeros, ex: 5000)', required: false, type: 'number' },
    { field: 'notes', question: 'Alguma **observacao** adicional? (ou digite "nao")', required: false, type: 'text' },
  ],
  create_income: [
    { field: 'amount', question: 'Qual o **valor** da receita? (apenas numeros, ex: 1500)', required: true, type: 'number' },
    { field: 'description', question: 'Qual a **descricao** dessa receita?', required: true, type: 'text' },
    { field: 'category', question: 'Qual a **categoria**? (vendas, servicos, investimento, outros)', required: false, type: 'select' },
    { field: 'date', question: 'Qual a **data**? (formato: DD/MM/AAAA ou "hoje")', required: false, type: 'date' },
  ],
  create_expense: [
    { field: 'amount', question: 'Qual o **valor** da despesa? (apenas numeros, ex: 500)', required: true, type: 'number' },
    { field: 'description', question: 'Qual a **descricao** dessa despesa?', required: true, type: 'text' },
    { field: 'category', question: 'Qual a **categoria**? (operacional, marketing, software, impostos, outros)', required: false, type: 'select' },
    { field: 'date', question: 'Qual a **data**? (formato: DD/MM/AAAA ou "hoje")', required: false, type: 'date' },
  ],
  create_task: [
    { field: 'title', question: 'Qual o **titulo** da tarefa?', required: true, type: 'text' },
    { field: 'description', question: 'Qual a **descricao**? (ou digite "nenhuma")', required: false, type: 'text' },
    { field: 'priority', question: 'Qual a **prioridade**? (alta, media, baixa)', required: false, type: 'select' },
    { field: 'due_date', question: 'Qual o **prazo**? (formato: DD/MM/AAAA ou "nenhum")', required: false, type: 'date' },
  ],
}

// Processar valor de campo
export function processFieldValue(value: string, fieldType: string): unknown {
  const normalized = value.toLowerCase().trim()
  
  // Skip values
  if (['nao', 'não', 'nenhum', 'nenhuma', 'pular', 'skip', '-'].includes(normalized)) {
    return null
  }
  
  switch (fieldType) {
    case 'number':
      const num = parseFloat(value.replace(/[^\d.,]/g, '').replace(',', '.'))
      return isNaN(num) ? null : num
    
    case 'date':
      if (normalized === 'hoje') {
        return new Date().toISOString().split('T')[0]
      }
      // Tentar parse DD/MM/YYYY
      const parts = value.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/)
      if (parts) {
        return `${parts[3]}-${parts[2].padStart(2, '0')}-${parts[1].padStart(2, '0')}`
      }
      return null
    
    case 'select':
      return normalized
    
    default:
      return value.trim()
  }
}
