"use client"

import { useState } from "react"
import { X, TrendingUp, TrendingDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"

interface Finance {
  id: string
  type: "income" | "expense"
  description: string
  amount: number
  category: string
  date: string
}

interface FinanceModalProps {
  finance: Finance | null
  type: "income" | "expense"
  onSave: (data: Partial<Finance>) => Promise<void>
  onClose: () => void
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

export function FinanceModal({ finance, type, onSave, onClose }: FinanceModalProps) {
  const [description, setDescription] = useState(finance?.description || "")
  const [amount, setAmount] = useState(finance?.amount?.toString() || "")
  const [category, setCategory] = useState(finance?.category || CATEGORIES[type][0].value)
  const [date, setDate] = useState(finance?.date || new Date().toISOString().split("T")[0])
  const [loading, setLoading] = useState(false)

  const isIncome = type === "income"
  const categories = CATEGORIES[type]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    
    await onSave({
      type,
      description,
      amount: parseFloat(amount),
      category,
      date,
    })
    
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl shadow-lg w-full max-w-lg mx-4 p-6 max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isIncome ? "bg-success/10" : "bg-destructive/10"
          }`}>
            {isIncome ? (
              <TrendingUp className="w-5 h-5 text-success" />
            ) : (
              <TrendingDown className="w-5 h-5 text-destructive" />
            )}
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">
              {finance ? "Editar" : "Nova"} {isIncome ? "Receita" : "Despesa"}
            </h2>
            <p className="text-sm text-muted-foreground">
              {finance ? "Atualize as informacoes" : "Preencha os dados"}
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="description">Descricao *</Label>
            <Input
              id="description"
              placeholder={isIncome ? "Ex: Venda de produto" : "Ex: Conta de luz"}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$) *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0"
                placeholder="0,00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Data *</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={!description || !amount || loading} 
              className={`flex-1 ${isIncome ? "bg-success hover:bg-success/90" : "bg-destructive hover:bg-destructive/90"}`}
            >
              {loading ? <Spinner className="mr-2" /> : null}
              {finance ? "Salvar" : "Adicionar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
