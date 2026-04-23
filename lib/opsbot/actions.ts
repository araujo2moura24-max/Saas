// OpsBot Actions - Acoes reais no banco de dados

import { createClient } from '@/lib/supabase/server'

export interface ActionResult {
  success: boolean
  message: string
  data?: unknown
  error?: string
}

// ==========================================
// CRM ACTIONS
// ==========================================

export async function createLead(data: {
  name: string
  company?: string
  email?: string
  phone?: string
  value?: number
  notes?: string
}): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, message: 'Usuario nao autenticado', error: 'auth' }
    }

    const { data: lead, error } = await supabase
      .from('leads')
      .insert({
        user_id: user.id,
        name: data.name,
        company: data.company || null,
        email: data.email || null,
        phone: data.phone || null,
        value: data.value || null,
        notes: data.notes || null,
        status: 'novo',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating lead:', error)
      return { success: false, message: 'Erro ao criar lead', error: error.message }
    }

    return {
      success: true,
      message: `Lead **${data.name}** criado com sucesso!`,
      data: lead,
    }
  } catch (err) {
    console.error('Create lead error:', err)
    return { success: false, message: 'Erro interno ao criar lead', error: String(err) }
  }
}

export async function listLeads(limit = 5): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, message: 'Usuario nao autenticado', error: 'auth' }
    }

    const { data: leads, error } = await supabase
      .from('leads')
      .select('id, name, company, status, value, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      return { success: false, message: 'Erro ao listar leads', error: error.message }
    }

    if (!leads || leads.length === 0) {
      return {
        success: true,
        message: 'Voce ainda nao tem leads cadastrados. Quer criar um agora? Diga "criar lead".',
        data: [],
      }
    }

    const leadList = leads.map((l, i) => 
      `${i + 1}. **${l.name}**${l.company ? ` - ${l.company}` : ''} (${l.status})${l.value ? ` - R$ ${l.value.toLocaleString('pt-BR')}` : ''}`
    ).join('\n')

    return {
      success: true,
      message: `Seus ultimos ${leads.length} leads:\n\n${leadList}`,
      data: leads,
    }
  } catch (err) {
    return { success: false, message: 'Erro interno ao listar leads', error: String(err) }
  }
}

export async function countLeads(): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, message: 'Usuario nao autenticado', error: 'auth' }
    }

    const { count, error } = await supabase
      .from('leads')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)

    if (error) {
      return { success: false, message: 'Erro ao contar leads', error: error.message }
    }

    // Buscar por status
    const { data: statusCounts } = await supabase
      .from('leads')
      .select('status')
      .eq('user_id', user.id)

    const byStatus: Record<string, number> = {}
    statusCounts?.forEach(l => {
      byStatus[l.status] = (byStatus[l.status] || 0) + 1
    })

    const statusText = Object.entries(byStatus)
      .map(([status, cnt]) => `- ${status}: **${cnt}**`)
      .join('\n')

    return {
      success: true,
      message: `Voce tem **${count || 0}** leads no total.\n\nPor status:\n${statusText || '- Nenhum lead ainda'}`,
      data: { total: count, byStatus },
    }
  } catch (err) {
    return { success: false, message: 'Erro interno ao contar leads', error: String(err) }
  }
}

// ==========================================
// FINANCEIRO ACTIONS
// ==========================================

export async function createFinance(data: {
  type: 'receita' | 'despesa'
  amount: number
  description: string
  category?: string
  date?: string
}): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, message: 'Usuario nao autenticado', error: 'auth' }
    }

    const { data: finance, error } = await supabase
      .from('finances')
      .insert({
        user_id: user.id,
        type: data.type,
        amount: data.amount,
        description: data.description,
        category: data.category || 'outros',
        date: data.date || new Date().toISOString().split('T')[0],
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating finance:', error)
      return { success: false, message: `Erro ao criar ${data.type}`, error: error.message }
    }

    const typeLabel = data.type === 'receita' ? 'Receita' : 'Despesa'
    return {
      success: true,
      message: `${typeLabel} de **R$ ${data.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}** registrada com sucesso!\n\nDescricao: ${data.description}`,
      data: finance,
    }
  } catch (err) {
    return { success: false, message: `Erro interno ao criar ${data.type}`, error: String(err) }
  }
}

export async function getBalance(): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, message: 'Usuario nao autenticado', error: 'auth' }
    }

    const { data: finances, error } = await supabase
      .from('finances')
      .select('type, amount')
      .eq('user_id', user.id)

    if (error) {
      return { success: false, message: 'Erro ao calcular saldo', error: error.message }
    }

    let totalIncome = 0
    let totalExpense = 0

    finances?.forEach(f => {
      if (f.type === 'receita') {
        totalIncome += Number(f.amount)
      } else {
        totalExpense += Number(f.amount)
      }
    })

    const balance = totalIncome - totalExpense
    const balanceFormatted = balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
    const incomeFormatted = totalIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })
    const expenseFormatted = totalExpense.toLocaleString('pt-BR', { minimumFractionDigits: 2 })

    return {
      success: true,
      message: `**Resumo Financeiro**\n\nReceitas: R$ ${incomeFormatted}\nDespesas: R$ ${expenseFormatted}\n\n**Saldo atual: R$ ${balanceFormatted}**`,
      data: { balance, totalIncome, totalExpense },
    }
  } catch (err) {
    return { success: false, message: 'Erro interno ao calcular saldo', error: String(err) }
  }
}

export async function listFinances(type: 'receita' | 'despesa', limit = 5): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, message: 'Usuario nao autenticado', error: 'auth' }
    }

    const { data: finances, error } = await supabase
      .from('finances')
      .select('id, description, amount, category, date')
      .eq('user_id', user.id)
      .eq('type', type)
      .order('date', { ascending: false })
      .limit(limit)

    if (error) {
      return { success: false, message: `Erro ao listar ${type}s`, error: error.message }
    }

    if (!finances || finances.length === 0) {
      return {
        success: true,
        message: `Voce ainda nao tem ${type}s cadastradas. Quer criar uma agora?`,
        data: [],
      }
    }

    const total = finances.reduce((sum, f) => sum + Number(f.amount), 0)
    const list = finances.map((f, i) => 
      `${i + 1}. **${f.description}** - R$ ${Number(f.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${f.category || 'outros'})`
    ).join('\n')

    const typeLabel = type === 'receita' ? 'receitas' : 'despesas'
    return {
      success: true,
      message: `Suas ultimas ${finances.length} ${typeLabel}:\n\n${list}\n\n**Total: R$ ${total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}**`,
      data: finances,
    }
  } catch (err) {
    return { success: false, message: `Erro interno ao listar ${type}s`, error: String(err) }
  }
}

// ==========================================
// OPERACOES ACTIONS
// ==========================================

export async function createTask(data: {
  title: string
  description?: string
  priority?: string
  due_date?: string
}): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, message: 'Usuario nao autenticado', error: 'auth' }
    }

    const { data: task, error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        title: data.title,
        description: data.description || null,
        priority: data.priority || 'media',
        due_date: data.due_date || null,
        status: 'pendente',
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating task:', error)
      return { success: false, message: 'Erro ao criar tarefa', error: error.message }
    }

    return {
      success: true,
      message: `Tarefa **${data.title}** criada com sucesso!${data.priority ? ` Prioridade: ${data.priority}.` : ''}${data.due_date ? ` Prazo: ${data.due_date}.` : ''}`,
      data: task,
    }
  } catch (err) {
    return { success: false, message: 'Erro interno ao criar tarefa', error: String(err) }
  }
}

export async function listTasks(limit = 5): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, message: 'Usuario nao autenticado', error: 'auth' }
    }

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('id, title, status, priority, due_date')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      return { success: false, message: 'Erro ao listar tarefas', error: error.message }
    }

    if (!tasks || tasks.length === 0) {
      return {
        success: true,
        message: 'Voce ainda nao tem tarefas cadastradas. Quer criar uma agora? Diga "criar tarefa".',
        data: [],
      }
    }

    const priorityIcon: Record<string, string> = {
      alta: '[!]',
      media: '[-]',
      baixa: '[ ]',
    }

    const list = tasks.map((t, i) => 
      `${i + 1}. ${priorityIcon[t.priority] || '[-]'} **${t.title}** (${t.status})${t.due_date ? ` - prazo: ${t.due_date}` : ''}`
    ).join('\n')

    return {
      success: true,
      message: `Suas ultimas ${tasks.length} tarefas:\n\n${list}`,
      data: tasks,
    }
  } catch (err) {
    return { success: false, message: 'Erro interno ao listar tarefas', error: String(err) }
  }
}

export async function countTasks(): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, message: 'Usuario nao autenticado', error: 'auth' }
    }

    const { data: tasks, error } = await supabase
      .from('tasks')
      .select('status')
      .eq('user_id', user.id)

    if (error) {
      return { success: false, message: 'Erro ao contar tarefas', error: error.message }
    }

    const byStatus: Record<string, number> = {}
    tasks?.forEach(t => {
      byStatus[t.status] = (byStatus[t.status] || 0) + 1
    })

    const total = tasks?.length || 0
    const statusText = Object.entries(byStatus)
      .map(([status, cnt]) => `- ${status}: **${cnt}**`)
      .join('\n')

    return {
      success: true,
      message: `Voce tem **${total}** tarefas no total.\n\nPor status:\n${statusText || '- Nenhuma tarefa ainda'}`,
      data: { total, byStatus },
    }
  } catch (err) {
    return { success: false, message: 'Erro interno ao contar tarefas', error: String(err) }
  }
}

// ==========================================
// EMPRESA ACTIONS
// ==========================================

export async function getCompany(): Promise<ActionResult> {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return { success: false, message: 'Usuario nao autenticado', error: 'auth' }
    }

    const { data: company, error } = await supabase
      .from('companies')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (error || !company) {
      return {
        success: true,
        message: 'Voce ainda nao cadastrou os dados da sua empresa. Acesse Configuracoes para adicionar.',
        data: null,
      }
    }

    return {
      success: true,
      message: `**Dados da Empresa**\n\nNome: ${company.name || 'Nao informado'}\nCNPJ: ${company.cnpj || 'Nao informado'}\nSegmento: ${company.segment || 'Nao informado'}\nCidade: ${company.city || 'Nao informado'}`,
      data: company,
    }
  } catch (err) {
    return { success: false, message: 'Erro interno ao buscar empresa', error: String(err) }
  }
}
