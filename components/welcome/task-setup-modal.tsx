"use client"

import { useState } from "react"
import { X, ListTodo } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { createClient } from "@/lib/supabase/client"

interface TaskSetupModalProps {
  userId: string
  onComplete: () => void
  onClose: () => void
}

export function TaskSetupModal({ userId, onComplete, onClose }: TaskSetupModalProps) {
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const supabase = createClient()
      const { error: insertError } = await supabase.from("tasks").insert({
        user_id: userId,
        title,
        description: description || null,
        status: "pending",
        priority: "medium",
      })

      if (insertError) {
        setError("Erro ao salvar tarefa. Tente novamente.")
        setLoading(false)
        return
      }

      onComplete()
    } catch {
      setError("Erro inesperado. Tente novamente.")
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-xl shadow-lg w-full max-w-md mx-4 p-6">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <ListTodo className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Crie sua primeira tarefa</h2>
            <p className="text-sm text-muted-foreground">Organize suas atividades</p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titulo da tarefa</Label>
            <Input
              id="title"
              placeholder="Ex: Ligar para cliente"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descricao (opcional)</Label>
            <Input
              id="description"
              placeholder="Detalhes da tarefa"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={!title || loading} className="flex-1">
              {loading ? <Spinner className="mr-2" /> : null}
              Salvar
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
