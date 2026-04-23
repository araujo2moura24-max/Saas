"use client"

import { useState } from "react"
import { ArrowRight, ArrowLeft, User, Users, Building2, Building } from "lucide-react"
import { Button } from "@/components/ui/button"

const TEAM_SIZES = [
  { id: "solo", label: "So eu", description: "Empreendedor solo", icon: User },
  { id: "small", label: "2-5 pessoas", description: "Equipe pequena", icon: Users },
  { id: "medium", label: "6-20 pessoas", description: "Equipe media", icon: Building2 },
  { id: "large", label: "21+ pessoas", description: "Grande empresa", icon: Building },
]

interface OnboardingStep2Props {
  initialData: {
    team_size: string
  }
  onNext: (data: { team_size: string }) => void
  onBack: () => void
}

export function OnboardingStep2({ initialData, onNext, onBack }: OnboardingStep2Props) {
  const [teamSize, setTeamSize] = useState(initialData.team_size)

  function handleSubmit() {
    onNext({ team_size: teamSize })
  }

  const canContinue = teamSize !== ""

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          Qual o tamanho da sua equipe?
        </h1>
        <p className="text-muted-foreground text-lg">
          Isso nos ajuda a personalizar sua experiencia
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        {TEAM_SIZES.map((size) => {
          const Icon = size.icon
          const isSelected = teamSize === size.id
          return (
            <button
              key={size.id}
              type="button"
              onClick={() => setTeamSize(size.id)}
              className={`flex items-center gap-4 p-4 rounded-xl border-2 text-left transition-all ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/50"
              }`}
            >
              <div
                className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                  isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <div className={`font-medium ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                  {size.label}
                </div>
                <div className="text-sm text-muted-foreground">{size.description}</div>
              </div>
            </button>
          )
        })}
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Button onClick={handleSubmit} disabled={!canContinue} size="lg">
          Continuar
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
