"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { createClient } from "@/lib/supabase/client"
import { 
  Layers, Users, Wallet, CheckSquare, BarChart3, Bot, 
  Check, ChevronRight, Zap
} from "lucide-react"

const MODULES = [
  { id: "crm", label: "CRM e Vendas", icon: Users },
  { id: "tasks", label: "Gestao de Projetos", icon: CheckSquare },
  { id: "finance", label: "Controle Financeiro", icon: Wallet },
  { id: "analytics", label: "Metricas e KPIs", icon: BarChart3 },
  { id: "automation", label: "Automacao com IA", icon: Bot },
]

export default function WelcomePage() {
  const router = useRouter()
  const [phase, setPhase] = useState<"loading" | "preparing" | "ready">("loading")
  const [userName, setUserName] = useState("")
  const [activatedModules, setActivatedModules] = useState<string[]>([])
  const [currentModuleIndex, setCurrentModuleIndex] = useState(-1)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) {
        window.location.href = "/auth/login"
        return
      }

      setUserName(user.user_metadata?.full_name?.split(" ")[0] || "")

      // Verificar se completou onboarding
      const { data: onboarding } = await supabase
        .from("onboarding")
        .select("completed, goals")
        .eq("user_id", user.id)
        .single()

      if (!onboarding || !onboarding.completed) {
        window.location.href = "/onboarding"
        return
      }

      // Guardar os módulos selecionados
      const selectedGoals = onboarding.goals || ["crm", "tasks", "finance"]
      const modulesToActivate = MODULES.filter(m => selectedGoals.includes(m.id))
      
      // Iniciar sequência de preparação
      setPhase("preparing")
      
      // Animar ativação de cada módulo
      for (let i = 0; i < modulesToActivate.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 600))
        setCurrentModuleIndex(i)
        setActivatedModules(prev => [...prev, modulesToActivate[i].id])
      }
      
      // Aguardar e mostrar tela final
      await new Promise(resolve => setTimeout(resolve, 1000))
      setPhase("ready")
    }

    loadData()
  }, [router])

  function handleEnterSystem() {
    window.location.href = "/dashboard?firstAccess=true"
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

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <AnimatePresence mode="wait">
          {/* Loading */}
          {phase === "loading" && (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-500/20 flex items-center justify-center"
              >
                <Layers className="w-8 h-8 text-indigo-400" />
              </motion.div>
              <p className="text-white/50">Carregando...</p>
            </motion.div>
          )}

          {/* Preparing */}
          {phase === "preparing" && (
            <motion.div
              key="preparing"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-lg"
            >
              <div className="text-center mb-8">
                <motion.div
                  animate={{ scale: [1, 1.05, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/25"
                >
                  <Layers className="w-10 h-10 text-white" />
                </motion.div>
                <h1 className="text-2xl font-bold text-white mb-2">
                  Configurando seu ambiente OpsCore...
                </h1>
                <p className="text-white/50">
                  Ativando os modulos selecionados
                </p>
              </div>

              {/* Modules being activated */}
              <div className="bg-[#0f0f16] rounded-xl border border-white/10 p-6 space-y-3">
                {MODULES.filter(m => activatedModules.includes(m.id) || MODULES.indexOf(m) <= currentModuleIndex + 1).slice(0, activatedModules.length + 1).map((module, index) => {
                  const Icon = module.icon
                  const isActivated = activatedModules.includes(module.id)
                  const isActivating = index === currentModuleIndex + 1 && !isActivated
                  
                  return (
                    <motion.div
                      key={module.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`flex items-center gap-3 p-3 rounded-lg transition-all ${
                        isActivated ? "bg-green-500/10" : isActivating ? "bg-indigo-500/10" : "bg-white/5"
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                        isActivated ? "bg-green-500 text-white" : isActivating ? "bg-indigo-500/50 text-indigo-300" : "bg-white/10 text-white/30"
                      }`}>
                        {isActivated ? (
                          <Check className="w-4 h-4" />
                        ) : isActivating ? (
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          >
                            <Icon className="w-4 h-4" />
                          </motion.div>
                        ) : (
                          <Icon className="w-4 h-4" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className={`text-sm font-medium ${
                          isActivated ? "text-green-400" : isActivating ? "text-indigo-300" : "text-white/50"
                        }`}>
                          {module.label}
                        </div>
                      </div>
                      {isActivated && (
                        <span className="text-xs text-green-400 font-mono">Ativado</span>
                      )}
                      {isActivating && (
                        <span className="text-xs text-indigo-400 font-mono">Ativando...</span>
                      )}
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          )}

          {/* Ready */}
          {phase === "ready" && (
            <motion.div
              key="ready"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center max-w-lg"
            >
              {/* Success animation */}
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="relative w-24 h-24 mx-auto mb-8"
              >
                <div className="absolute inset-0 rounded-full bg-green-500/20 animate-ping" />
                <div className="relative w-full h-full rounded-full bg-gradient-to-br from-green-400 to-green-500 flex items-center justify-center shadow-lg shadow-green-500/25">
                  <Check className="w-12 h-12 text-white" />
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
              >
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
                  Seu sistema esta pronto!
                </h1>
                <p className="text-white/50 text-lg mb-8">
                  {userName ? `${userName}, seu` : "Seu"} ambiente OpsCore foi configurado com sucesso.
                </p>
              </motion.div>

              {/* Activated modules summary */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="flex flex-wrap justify-center gap-2 mb-10"
              >
                {activatedModules.map(moduleId => {
                  const module = MODULES.find(m => m.id === moduleId)
                  if (!module) return null
                  const Icon = module.icon
                  return (
                    <div
                      key={moduleId}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-sm text-white/70"
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{module.label}</span>
                    </div>
                  )
                })}
              </motion.div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <button
                  onClick={handleEnterSystem}
                  className="px-8 py-4 bg-indigo-500 hover:bg-indigo-400 text-white font-medium rounded-xl transition-all hover:shadow-lg hover:shadow-indigo-500/25 hover:scale-[1.02] active:scale-[0.98] flex items-center gap-2 mx-auto"
                >
                  <Zap className="w-5 h-5" />
                  Acessar OpsCore
                  <ChevronRight className="w-4 h-4" />
                </button>
              </motion.div>

              {/* Status indicator */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
                className="mt-8 flex items-center justify-center gap-2 text-xs text-white/40"
              >
                <span className="w-2 h-2 rounded-full bg-green-500" />
                <span>Sistema operacional v2.0.0</span>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
