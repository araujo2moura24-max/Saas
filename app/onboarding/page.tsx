"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { 
  Layers, Users, Wallet, CheckSquare, BarChart3, Bot, Target,
  User, Building2, Building, Briefcase, ShoppingBag, Laptop, 
  Wrench, GraduationCap, Heart, ChevronRight, ChevronLeft, Check
} from "lucide-react"

// Modelos operacionais (múltipla seleção)
const OPERATIONAL_MODELS = [
  { id: "crm", label: "CRM e Vendas", description: "Gerenciar leads e clientes", icon: Users },
  { id: "tasks", label: "Gestao de Projetos", description: "Organizar tarefas e equipe", icon: CheckSquare },
  { id: "finance", label: "Controle Financeiro", description: "Receitas, despesas e fluxo", icon: Wallet },
  { id: "analytics", label: "Metricas e KPIs", description: "Acompanhar performance", icon: BarChart3 },
  { id: "automation", label: "Automacao com IA", description: "Processos inteligentes", icon: Bot },
  { id: "growth", label: "Escala e Crescimento", description: "Expandir operacoes", icon: Target },
]

// Tamanhos de equipe
const TEAM_SIZES = [
  { id: "solo", label: "Empreendedor Solo", icon: User },
  { id: "small", label: "2-5 pessoas", icon: Users },
  { id: "medium", label: "6-20 pessoas", icon: Building2 },
  { id: "large", label: "21+ pessoas", icon: Building },
]

// Tipos de negócio
const BUSINESS_TYPES = [
  { id: "services", label: "Servicos", icon: Briefcase },
  { id: "ecommerce", label: "E-commerce", icon: ShoppingBag },
  { id: "tech", label: "Tecnologia", icon: Laptop },
  { id: "consulting", label: "Consultoria", icon: Wrench },
  { id: "education", label: "Educacao", icon: GraduationCap },
  { id: "health", label: "Saude", icon: Heart },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [onboardingData, setOnboardingData] = useState({
    goals: [] as string[],
    team_size: "",
    business_type: "",
  })

  useEffect(() => {
    async function checkAuth() {
      const supabase = createClient()
      
      // Try to get user - might not have session yet if email not confirmed
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        // Check if there's a session being established
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          // No user and no session - redirect to login
          window.location.href = "/auth/login"
          return
        }
      }

      const currentUser = user || (await supabase.auth.getSession()).data.session?.user
      
      if (!currentUser) {
        window.location.href = "/auth/login"
        return
      }

      setUserId(currentUser.id)

      // Verificar se já tem onboarding
      const { data: existingOnboarding } = await supabase
        .from("onboarding")
        .select("*")
        .eq("user_id", currentUser.id)
        .single()

      if (existingOnboarding) {
        if (existingOnboarding.completed === true) {
          window.location.href = "/welcome"
          return
        }
        setOnboardingData({
          goals: existingOnboarding.goals || [],
          team_size: existingOnboarding.team_size || "",
          business_type: existingOnboarding.business_type || "",
        })
        setCurrentStep(existingOnboarding.current_step || 1)
      }

      setLoading(false)
    }

    checkAuth()
  }, [router])

  async function saveProgress(data: Partial<typeof onboardingData>, step: number) {
    if (!userId) return

    const supabase = createClient()
    const updatedData = { ...onboardingData, ...data }
    setOnboardingData(updatedData)

    await supabase.from("onboarding").upsert({
      user_id: userId,
      ...updatedData,
      current_step: step,
      completed: false,
    }, {
      onConflict: "user_id",
    })
  }

  async function handleComplete() {
    if (!userId) return

    const supabase = createClient()
    await supabase.from("onboarding").upsert({
      user_id: userId,
      ...onboardingData,
      current_step: 3,
      completed: true,
    }, {
      onConflict: "user_id",
    })

    window.location.href = "/welcome"
  }

  function handleNext(data: Partial<typeof onboardingData>) {
    const nextStep = currentStep + 1
    saveProgress(data, nextStep)
    setCurrentStep(nextStep)
  }

  function handleBack() {
    setCurrentStep(currentStep - 1)
  }

  function toggleGoal(goalId: string) {
    setOnboardingData(prev => ({
      ...prev,
      goals: prev.goals.includes(goalId)
        ? prev.goals.filter(id => id !== goalId)
        : [...prev.goals, goalId]
    }))
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="w-12 h-12 rounded-xl bg-indigo-500/20 flex items-center justify-center"
        >
          <Layers className="w-6 h-6 text-indigo-400" />
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white overflow-hidden relative">
      {/* Grid background */}
      <div className="absolute inset-0 opacity-[0.03]">
        <div 
          className="absolute inset-0" 
          style={{
            backgroundImage: `
              linear-gradient(rgba(99, 102, 241, 0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(99, 102, 241, 0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
          }}
        />
      </div>

      {/* Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-500/5 rounded-full blur-[120px]" />

      {/* Header */}
      <header className="relative z-10 border-b border-white/5 bg-[#0a0a0f]/80 backdrop-blur-sm">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
              <Layers className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-white/90">OpsCore</span>
          </div>
          <div className="text-sm text-white/40 font-mono">
            Configuracao {currentStep}/3
          </div>
        </div>
      </header>

      {/* Progress bar */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-6">
        <div className="flex gap-2">
          {[1, 2, 3].map((step) => (
            <div
              key={step}
              className={`h-1 flex-1 rounded-full transition-all duration-500 ${
                step <= currentStep ? "bg-indigo-500" : "bg-white/10"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-12">
        <AnimatePresence mode="wait">
          {/* Step 1: Modelo Operacional */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-sm font-mono mb-4">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                  Selecionando modelo operacional...
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  Quais modulos voce quer ativar?
                </h1>
                <p className="text-white/50">
                  Selecione todos os modulos que fazem sentido para seu negocio
                </p>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {OPERATIONAL_MODELS.map((model) => {
                  const Icon = model.icon
                  const isSelected = onboardingData.goals.includes(model.id)
                  return (
                    <button
                      key={model.id}
                      type="button"
                      onClick={() => toggleGoal(model.id)}
                      className={`flex items-center gap-4 p-4 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-500/10"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        isSelected ? "bg-indigo-500 text-white" : "bg-white/10 text-white/50"
                      }`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className={`font-medium ${isSelected ? "text-white" : "text-white/70"}`}>
                          {model.label}
                        </div>
                        <div className="text-sm text-white/40 truncate">{model.description}</div>
                      </div>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-indigo-500 flex items-center justify-center">
                          <Check className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>

              <div className="flex justify-end">
                <button
                  onClick={() => handleNext({ goals: onboardingData.goals })}
                  disabled={onboardingData.goals.length === 0}
                  className="px-6 py-3 bg-indigo-500 hover:bg-indigo-400 disabled:bg-white/10 disabled:text-white/30 text-white font-medium rounded-xl transition-all flex items-center gap-2"
                >
                  Continuar
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 2: Tamanho da Equipe */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-sm font-mono mb-4">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                  Definindo objetivos do sistema...
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  Qual o tamanho da sua operacao?
                </h1>
                <p className="text-white/50">
                  Isso ajuda a configurar o ambiente ideal para voce
                </p>
              </div>

              <div className="grid sm:grid-cols-2 gap-3 max-w-2xl mx-auto">
                {TEAM_SIZES.map((size) => {
                  const Icon = size.icon
                  const isSelected = onboardingData.team_size === size.id
                  return (
                    <button
                      key={size.id}
                      type="button"
                      onClick={() => setOnboardingData(prev => ({ ...prev, team_size: size.id }))}
                      className={`flex items-center gap-4 p-5 rounded-xl border text-left transition-all ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-500/10"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        isSelected ? "bg-indigo-500 text-white" : "bg-white/10 text-white/50"
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className={`font-medium text-lg ${isSelected ? "text-white" : "text-white/70"}`}>
                        {size.label}
                      </div>
                    </button>
                  )
                })}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white/70 font-medium rounded-xl transition-all flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Voltar
                </button>
                <button
                  onClick={() => handleNext({ team_size: onboardingData.team_size })}
                  disabled={!onboardingData.team_size}
                  className="px-6 py-3 bg-indigo-500 hover:bg-indigo-400 disabled:bg-white/10 disabled:text-white/30 text-white font-medium rounded-xl transition-all flex items-center gap-2"
                >
                  Continuar
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Tipo de Negócio */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8"
            >
              <div className="text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-sm font-mono mb-4">
                  <span className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
                  Configurando ambiente inicial...
                </div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  Qual o tipo do seu negocio?
                </h1>
                <p className="text-white/50">
                  Isso personaliza a experiencia do sistema
                </p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-2xl mx-auto">
                {BUSINESS_TYPES.map((type) => {
                  const Icon = type.icon
                  const isSelected = onboardingData.business_type === type.id
                  return (
                    <button
                      key={type.id}
                      type="button"
                      onClick={() => setOnboardingData(prev => ({ ...prev, business_type: type.id }))}
                      className={`flex flex-col items-center gap-3 p-5 rounded-xl border text-center transition-all ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-500/10"
                          : "border-white/10 bg-white/5 hover:border-white/20"
                      }`}
                    >
                      <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                        isSelected ? "bg-indigo-500 text-white" : "bg-white/10 text-white/50"
                      }`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <span className={`font-medium ${isSelected ? "text-white" : "text-white/70"}`}>
                        {type.label}
                      </span>
                    </button>
                  )
                })}
              </div>

              <div className="flex justify-between">
                <button
                  onClick={handleBack}
                  className="px-6 py-3 bg-white/5 hover:bg-white/10 text-white/70 font-medium rounded-xl transition-all flex items-center gap-2"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Voltar
                </button>
                <button
                  onClick={handleComplete}
                  disabled={!onboardingData.business_type}
                  className="px-6 py-3 bg-indigo-500 hover:bg-indigo-400 disabled:bg-white/10 disabled:text-white/30 text-white font-medium rounded-xl transition-all flex items-center gap-2"
                >
                  Finalizar Configuracao
                  <Check className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
