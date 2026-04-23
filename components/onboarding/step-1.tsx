"use client"

import { useState } from "react"
import { ArrowRight, Users, Wallet, CheckSquare, BarChart3, Bot, Target } from "lucide-react"
import { Button } from "@/components/ui/button"

const GOALS = [
  { id: "crm", label: "Gerenciar leads e clientes", icon: Users },
  { id: "tasks", label: "Organizar tarefas e projetos", icon: CheckSquare },
  { id: "finance", label: "Controlar financas", icon: Wallet },
  { id: "analytics", label: "Acompanhar metricas", icon: BarChart3 },
  { id: "automation", label: "Automatizar processos", icon: Bot },
  { id: "growth", label: "Escalar meu negocio", icon: Target },
]

interface OnboardingStep1Props {
  initialData: {
    goals: string[]
  }
  onNext: (data: { goals: string[] }) => void
}

export function OnboardingStep1({ initialData, onNext }: OnboardingStep1Props) {
  const [selectedGoals, setSelectedGoals] = useState<string[]>(initialData.goals)

  function toggleGoal(goalId: string) {
    setSelectedGoals((prev) =>
      prev.includes(goalId)
        ? prev.filter((id) => id !== goalId)
        : [...prev, goalId]
    )
  }

  function handleSubmit() {
    onNext({ goals: selectedGoals })
  }

  const canContinue = selectedGoals.length > 0

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          O que voce quer conquistar com o OpsCore?
        </h1>
        <p className="text-muted-foreground text-lg">
          Selecione todos os objetivos que se aplicam ao seu negocio
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {GOALS.map((goal) => {
          const Icon = goal.icon
          const isSelected = selectedGoals.includes(goal.id)
          return (
            <button
              key={goal.id}
              type="button"
              onClick={() => toggleGoal(goal.id)}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/50"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className={`font-medium ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                {goal.label}
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} disabled={!canContinue} size="lg">
          Continuar
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
