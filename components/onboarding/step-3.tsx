"use client"

import { useState } from "react"
import { ArrowLeft, Check, Briefcase, ShoppingBag, Laptop, Wrench, GraduationCap, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

const BUSINESS_TYPES = [
  { id: "services", label: "Servicos", icon: Briefcase },
  { id: "ecommerce", label: "E-commerce", icon: ShoppingBag },
  { id: "tech", label: "Tecnologia", icon: Laptop },
  { id: "consulting", label: "Consultoria", icon: Wrench },
  { id: "education", label: "Educacao", icon: GraduationCap },
  { id: "health", label: "Saude", icon: Heart },
]

interface OnboardingStep3Props {
  initialData: {
    business_type: string
  }
  onComplete: () => void
  onBack: () => void
}

export function OnboardingStep3({ initialData, onComplete, onBack }: OnboardingStep3Props) {
  const [businessType, setBusinessType] = useState(initialData.business_type)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setLoading(true)
    await onComplete()
  }

  const canContinue = businessType !== ""

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
          Qual o seu tipo de negocio?
        </h1>
        <p className="text-muted-foreground text-lg">
          Escolha a categoria que melhor descreve sua empresa
        </p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {BUSINESS_TYPES.map((type) => {
          const Icon = type.icon
          const isSelected = businessType === type.id
          return (
            <button
              key={type.id}
              type="button"
              onClick={() => setBusinessType(type.id)}
              className={`flex flex-col items-center gap-3 p-6 rounded-xl border-2 text-center transition-all ${
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-card hover:border-primary/50"
              }`}
            >
              <div
                className={`w-14 h-14 rounded-xl flex items-center justify-center ${
                  isSelected ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                <Icon className="w-7 h-7" />
              </div>
              <span className={`font-medium ${isSelected ? "text-foreground" : "text-muted-foreground"}`}>
                {type.label}
              </span>
            </button>
          )
        })}
      </div>

      <div className="flex justify-between">
        <Button variant="ghost" onClick={onBack} disabled={loading}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar
        </Button>
        <Button onClick={handleSubmit} disabled={!canContinue || loading} size="lg">
          {loading ? (
            <>
              <Spinner className="mr-2" />
              Finalizando...
            </>
          ) : (
            <>
              Comecar a usar
              <Check className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
