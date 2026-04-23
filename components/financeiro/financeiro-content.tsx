"use client"

import { useState } from "react"
import { Plus, Search, TrendingUp, TrendingDown, Wallet, MoreHorizontal, Pencil, Trash2, ArrowUpRight, ArrowDownRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { FinanceModal } from "./finance-modal"

interface Finance {
  id: string
  type: "income" | "expense"
  description: string
  amount: number
  category: string
  date: string
  created_at: string
}

const CATEGORIES = {
  income: [
    { value: "vendas", label: "Vendas" },
    { value: "servicos", label: "Servicos" },
    { value: "investimentos", label: "Investimentos" },
    { value: "outros", label: "Outros" },
  ],
  expense: [
    { value: "operacional", label: "Operacional" },
    { value: "marketing", label: "Marketing" },
    { value: "pessoal", label: "Pessoal" },
    { value: "infraestrutura", label: "Infraestrutura" },
    { value: "impostos", label: "Impostos" },
    { value: "outros", label: "Outros" },
  ],
}

interface FinanceiroContentProps {
  initialFinances: Finance[]
  userId: string
}

export function FinanceiroContent({ initialFinances, userId }: FinanceiroContentProps) {
  const [finances, setFinances] = useState<Finance[]>(initialFinances)
  const [search, setSearch] = useState("")
  const [typeFilter, setTypeFilter] = useState<"all" | "income" | "expense">("all")
  const [showModal, setShowModal] = useState(false)
  const [editingFinance, setEditingFinance] = useState<Finance | null>(null)
  const [modalType, setModalType] = useState<"income" | "expense">("income")
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const filteredFinances = finances.filter((finance) => {
    const matchesSearch = finance.description.toLowerCase().includes(search.toLowerCase())
    const matchesType = typeFilter === "all" || finance.type === typeFilter
    return matchesSearch && matchesType
  })

  // Calcular totais
  const totalIncome = finances
    .filter(f => f.type === "income")
    .reduce((sum, f) => sum + f.amount, 0)
  const totalExpenses = finances
    .filter(f => f.type === "expense")
    .reduce((sum, f) => sum + f.amount, 0)
  const balance = totalIncome - totalExpenses

  async function handleSaveFinance(data: Partial<Finance>) {
    const supabase = createClient()
    
    if (editingFinance) {
      const { data: updated, error } = await supabase
        .from("finances")
        .update(data)
        .eq("id", editingFinance.id)
        .select()
        .single()

      if (!error && updated) {
        setFinances(finances.map(f => f.id === updated.id ? updated : f))
      }
    } else {
      const { data: created, error } = await supabase
        .from("finances")
        .insert({ ...data, user_id: userId })
        .select()
        .single()

      if (!error && created) {
        setFinances([created, ...finances])
      }
    }

    setShowModal(false)
    setEditingFinance(null)
  }

  async function handleDeleteFinance(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from("finances").delete().eq("id", id)
    
    if (!error) {
      setFinances(finances.filter(f => f.id !== id))
    }
    setOpenMenuId(null)
  }

  function handleEdit(finance: Finance) {
    setEditingFinance(finance)
    setModalType(finance.type)
    setShowModal(true)
    setOpenMenuId(null)
  }

  function handleNewIncome() {
    setEditingFinance(null)
    setModalType("income")
    setShowModal(true)
  }

  function handleNewExpense() {
    setEditingFinance(null)
    setModalType("expense")
    setShowModal(true)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Financeiro</h1>
          <p className="text-muted-foreground">Controle suas receitas e despesas</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleNewExpense}>
            <TrendingDown className="w-4 h-4 mr-2 text-destructive" />
            Despesa
          </Button>
          <Button onClick={handleNewIncome}>
            <TrendingUp className="w-4 h-4 mr-2" />
            Receita
          </Button>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid sm:grid-cols-3 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Receitas</p>
              <p className="text-2xl font-bold text-success">{formatCurrency(totalIncome)}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5 text-success" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Total Despesas</p>
              <p className="text-2xl font-bold text-destructive">{formatCurrency(totalExpenses)}</p>
            </div>
            <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5 text-destructive" />
            </div>
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Saldo</p>
              <p className={`text-2xl font-bold ${balance >= 0 ? "text-success" : "text-destructive"}`}>
                {formatCurrency(balance)}
              </p>
            </div>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${balance >= 0 ? "bg-success/10" : "bg-destructive/10"}`}>
              <Wallet className={`w-5 h-5 ${balance >= 0 ? "text-success" : "text-destructive"}`} />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar lancamentos..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={typeFilter === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setTypeFilter("all")}
          >
            Todos
          </Button>
          <Button
            variant={typeFilter === "income" ? "default" : "outline"}
            size="sm"
            onClick={() => setTypeFilter("income")}
          >
            Receitas
          </Button>
          <Button
            variant={typeFilter === "expense" ? "default" : "outline"}
            size="sm"
            onClick={() => setTypeFilter("expense")}
          >
            Despesas
          </Button>
        </div>
      </div>

      {/* Transactions list */}
      {filteredFinances.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Wallet className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-card-foreground mb-2">
            {search || typeFilter !== "all" ? "Nenhum lancamento encontrado" : "Nenhum lancamento ainda"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {search || typeFilter !== "all"
              ? "Tente ajustar os filtros de busca" 
              : "Registre sua primeira receita ou despesa"}
          </p>
          {!search && typeFilter === "all" && (
            <div className="flex justify-center gap-3">
              <Button variant="outline" onClick={handleNewExpense}>
                <TrendingDown className="w-4 h-4 mr-2 text-destructive" />
                Despesa
              </Button>
              <Button onClick={handleNewIncome}>
                <TrendingUp className="w-4 h-4 mr-2" />
                Receita
              </Button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Descricao</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Categoria</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden md:table-cell">Data</th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Valor</th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredFinances.map((finance) => (
                  <tr key={finance.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 ${
                          finance.type === "income" ? "bg-success/10" : "bg-destructive/10"
                        }`}>
                          {finance.type === "income" ? (
                            <ArrowUpRight className="w-4 h-4 text-success" />
                          ) : (
                            <ArrowDownRight className="w-4 h-4 text-destructive" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-card-foreground truncate">{finance.description}</p>
                          <p className="text-xs text-muted-foreground sm:hidden">
                            {getCategoryLabel(finance.type, finance.category)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {getCategoryLabel(finance.type, finance.category)}
                      </span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">
                        {new Date(finance.date).toLocaleDateString("pt-BR")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-semibold ${
                        finance.type === "income" ? "text-success" : "text-destructive"
                      }`}>
                        {finance.type === "income" ? "+" : "-"} {formatCurrency(finance.amount)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="relative inline-block">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setOpenMenuId(openMenuId === finance.id ? null : finance.id)}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                        {openMenuId === finance.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setOpenMenuId(null)} 
                            />
                            <div className="absolute right-0 top-full mt-1 z-20 bg-popover border border-border rounded-lg shadow-lg py-1 min-w-[120px]">
                              <button
                                onClick={() => handleEdit(finance)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                              >
                                <Pencil className="w-4 h-4" />
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteFinance(finance.id)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                Excluir
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <FinanceModal
          finance={editingFinance}
          type={modalType}
          onSave={handleSaveFinance}
          onClose={() => { setShowModal(false); setEditingFinance(null) }}
        />
      )}
    </div>
  )
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}

function getCategoryLabel(type: "income" | "expense", category: string): string {
  const categories = CATEGORIES[type]
  return categories.find(c => c.value === category)?.label || category
}
