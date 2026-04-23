"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Users, ListTodo, Wallet, Bot, ArrowDown, TrendingUp, CheckCircle2, Send, Sparkles } from "lucide-react"

// Dados dos cards
const FEATURES = [
  {
    id: "leads",
    icon: Users,
    title: "Organize seus leads",
    desc: "Capture, qualifique e acompanhe cada oportunidade",
    color: "#6366f1",
    gradient: "from-indigo-500/20 to-purple-500/10",
  },
  {
    id: "operations",
    icon: ListTodo,
    title: "Gerencie operacoes",
    desc: "Tarefas, projetos e fluxos automatizados",
    color: "#8b5cf6",
    gradient: "from-purple-500/20 to-pink-500/10",
  },
  {
    id: "finance",
    icon: Wallet,
    title: "Controle financeiro",
    desc: "Receitas, despesas e fluxo de caixa",
    color: "#10b981",
    gradient: "from-emerald-500/20 to-cyan-500/10",
  },
  {
    id: "ai",
    icon: Bot,
    title: "Receba ajuda da IA",
    desc: "Sugestoes, automacoes e insights",
    color: "#06b6d4",
    gradient: "from-cyan-500/20 to-blue-500/10",
  },
]

// Componente de demonstracao do CRM
function CRMDemo() {
  const [activeStatus, setActiveStatus] = useState(0)
  
  useEffect(() => {
    const interval = setInterval(() => {
      setActiveStatus((prev) => (prev + 1) % 4)
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  const leads = [
    { name: "Maria Silva", company: "Tech Corp", status: "Novo", value: "R$ 15.000" },
    { name: "Joao Santos", company: "StartupX", status: "Qualificado", value: "R$ 28.500" },
    { name: "Ana Costa", company: "Digital Co", status: "Proposta", value: "R$ 42.000" },
    { name: "Pedro Lima", company: "Inovacao", status: "Fechado", value: "R$ 67.000" },
  ]

  const statusColors: Record<string, string> = {
    "Novo": "bg-blue-500/20 text-blue-400 border-blue-500/30",
    "Qualificado": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    "Proposta": "bg-purple-500/20 text-purple-400 border-purple-500/30",
    "Fechado": "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  }

  return (
    <div className="relative">
      {/* Pipeline visual */}
      <div className="flex gap-2 mb-4">
        {["Novo", "Qualificado", "Proposta", "Fechado"].map((status, i) => (
          <motion.div
            key={status}
            className={`flex-1 h-1 rounded-full ${i <= activeStatus ? "bg-indigo-500" : "bg-white/10"}`}
            animate={{ opacity: i === activeStatus ? [0.5, 1, 0.5] : 1 }}
            transition={{ duration: 1, repeat: i === activeStatus ? Infinity : 0 }}
          />
        ))}
      </div>

      {/* Lista de leads */}
      <div className="space-y-2">
        {leads.map((lead, i) => (
          <motion.div
            key={lead.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ 
              opacity: 1, 
              x: 0,
              scale: i === activeStatus ? 1.02 : 1,
              borderColor: i === activeStatus ? "rgba(99, 102, 241, 0.5)" : "rgba(255, 255, 255, 0.05)"
            }}
            transition={{ delay: i * 0.1, duration: 0.3 }}
            className={`flex items-center justify-between p-3 rounded-xl bg-white/[0.03] border transition-all duration-300`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500/30 to-purple-500/30 flex items-center justify-center text-xs font-medium text-white">
                {lead.name.split(" ").map(n => n[0]).join("")}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{lead.name}</p>
                <p className="text-xs text-white/40">{lead.company}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-2 py-0.5 rounded-full text-[10px] border ${statusColors[lead.status]}`}>
                {lead.status}
              </span>
              <span className="text-xs text-emerald-400 font-medium">{lead.value}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Indicador de movimento */}
      <motion.div
        className="absolute -right-2 top-1/2 -translate-y-1/2"
        animate={{ x: [0, 5, 0] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        <div className="w-1 h-16 rounded-full bg-gradient-to-b from-indigo-500/50 via-indigo-500/20 to-transparent" />
      </motion.div>
    </div>
  )
}

// Componente de demonstracao de Operacoes (Kanban)
function OperationsDemo() {
  const [movingTask, setMovingTask] = useState<number | null>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setMovingTask((prev) => (prev === null ? 0 : prev === 2 ? null : prev + 1))
    }, 1500)
    return () => clearInterval(interval)
  }, [])

  const columns = [
    { title: "A fazer", tasks: ["Reuniao cliente", "Revisar proposta"] },
    { title: "Em andamento", tasks: ["Desenvolver MVP", "Criar relatorio"] },
    { title: "Concluido", tasks: ["Setup inicial", "Analise de dados"] },
  ]

  return (
    <div className="grid grid-cols-3 gap-3">
      {columns.map((col, colIndex) => (
        <div key={col.title} className="space-y-2">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-white/60">{col.title}</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-white/40">
              {col.tasks.length}
            </span>
          </div>
          <div className="space-y-2">
            {col.tasks.map((task, taskIndex) => (
              <motion.div
                key={task}
                animate={{
                  scale: movingTask === colIndex && taskIndex === 0 ? [1, 1.05, 1] : 1,
                  boxShadow: movingTask === colIndex && taskIndex === 0 
                    ? "0 0 20px rgba(139, 92, 246, 0.3)" 
                    : "none"
                }}
                transition={{ duration: 0.5 }}
                className="p-2 rounded-lg bg-white/[0.05] border border-white/5 text-xs text-white/70"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 className={`w-3 h-3 ${colIndex === 2 ? "text-emerald-400" : "text-white/30"}`} />
                  {task}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// Componente de demonstracao Financeiro
function FinanceDemo() {
  const [animatedValues, setAnimatedValues] = useState({ receita: 0, despesa: 0, saldo: 0 })

  useEffect(() => {
    const duration = 1500
    const steps = 30
    const interval = duration / steps
    let step = 0

    const timer = setInterval(() => {
      step++
      const progress = step / steps
      const eased = 1 - Math.pow(1 - progress, 3)
      
      setAnimatedValues({
        receita: Math.round(47850 * eased),
        despesa: Math.round(18320 * eased),
        saldo: Math.round(29530 * eased),
      })

      if (step >= steps) clearInterval(timer)
    }, interval)

    return () => clearInterval(timer)
  }, [])

  const chartData = [40, 65, 45, 80, 55, 90, 70, 85, 75, 95, 80, 100]

  return (
    <div className="space-y-4">
      {/* Metricas */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
          <p className="text-[10px] text-emerald-400/60 uppercase tracking-wider mb-1">Receitas</p>
          <p className="text-lg font-bold text-emerald-400">
            R$ {animatedValues.receita.toLocaleString("pt-BR")}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20">
          <p className="text-[10px] text-red-400/60 uppercase tracking-wider mb-1">Despesas</p>
          <p className="text-lg font-bold text-red-400">
            R$ {animatedValues.despesa.toLocaleString("pt-BR")}
          </p>
        </div>
        <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/20">
          <p className="text-[10px] text-cyan-400/60 uppercase tracking-wider mb-1">Saldo</p>
          <p className="text-lg font-bold text-cyan-400">
            R$ {animatedValues.saldo.toLocaleString("pt-BR")}
          </p>
        </div>
      </div>

      {/* Grafico */}
      <div className="relative h-24 flex items-end gap-1">
        {chartData.map((h, i) => (
          <motion.div
            key={i}
            initial={{ height: 0 }}
            animate={{ height: `${h}%` }}
            transition={{ delay: i * 0.05, duration: 0.5, ease: "easeOut" }}
            className="flex-1 rounded-t-sm bg-gradient-to-t from-emerald-500/60 to-cyan-400/80 relative group"
          >
            <motion.div
              className="absolute inset-0 bg-white/20 rounded-t-sm"
              animate={{ opacity: [0, 0.5, 0] }}
              transition={{ delay: i * 0.1, duration: 1, repeat: Infinity, repeatDelay: 2 }}
            />
          </motion.div>
        ))}
        {/* Linha de tendencia */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500/50 to-transparent" />
      </div>

      {/* Indicador de crescimento */}
      <div className="flex items-center justify-center gap-2 text-xs">
        <TrendingUp className="w-4 h-4 text-emerald-400" />
        <span className="text-emerald-400 font-medium">+23% este mes</span>
      </div>
    </div>
  )
}

// Componente de demonstracao da IA
function AIDemo() {
  const [messages, setMessages] = useState<{ role: string; text: string; typing?: boolean }[]>([])
  const [currentMessage, setCurrentMessage] = useState(0)

  const conversation = [
    { role: "user", text: "Quais leads preciso contatar hoje?" },
    { role: "ai", text: "Encontrei 3 leads que precisam de follow-up: Maria Silva (proposta pendente), Joao Santos (reuniao agendada) e Ana Costa (nova oportunidade)." },
    { role: "user", text: "Crie uma tarefa para ligar para Maria" },
    { role: "ai", text: "Tarefa criada: 'Ligar para Maria Silva' para hoje as 14h. Tambem adicionei um lembrete 15 minutos antes." },
  ]

  useEffect(() => {
    if (currentMessage >= conversation.length) {
      setTimeout(() => {
        setMessages([])
        setCurrentMessage(0)
      }, 2000)
      return
    }

    const timer = setTimeout(() => {
      const msg = conversation[currentMessage]
      setMessages((prev) => [...prev, { ...msg, typing: msg.role === "ai" }])
      
      if (msg.role === "ai") {
        setTimeout(() => {
          setMessages((prev) => 
            prev.map((m, i) => i === prev.length - 1 ? { ...m, typing: false } : m)
          )
        }, 800)
      }
      
      setCurrentMessage((prev) => prev + 1)
    }, 1500)

    return () => clearTimeout(timer)
  }, [currentMessage])

  return (
    <div className="space-y-3">
      <div className="space-y-2 min-h-[180px]">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[85%] p-3 rounded-xl text-xs ${
                msg.role === "user" 
                  ? "bg-indigo-500/20 border border-indigo-500/30 text-white" 
                  : "bg-white/[0.05] border border-white/10 text-white/80"
              }`}>
                {msg.role === "ai" && (
                  <div className="flex items-center gap-2 mb-1">
                    <Bot className="w-3 h-3 text-cyan-400" />
                    <span className="text-[10px] text-cyan-400 font-medium">OpsBot</span>
                    {msg.typing && (
                      <motion.div
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1, repeat: Infinity }}
                      >
                        <Sparkles className="w-3 h-3 text-cyan-400" />
                      </motion.div>
                    )}
                  </div>
                )}
                {msg.typing ? (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-white/50"
                  >
                    Digitando...
                  </motion.span>
                ) : (
                  msg.text
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Input simulado */}
      <div className="flex items-center gap-2 p-2 rounded-xl bg-white/[0.03] border border-white/10">
        <span className="flex-1 text-xs text-white/30 px-2">Digite uma mensagem...</span>
        <div className="w-7 h-7 rounded-lg bg-cyan-500/20 flex items-center justify-center">
          <Send className="w-3 h-3 text-cyan-400" />
        </div>
      </div>
    </div>
  )
}

// Componente da seta/conector energetico
function EnergyConnector({ isActive, color }: { isActive: boolean; color: string }) {
  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          exit={{ opacity: 0, scaleY: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative flex flex-col items-center py-6 origin-top"
        >
          {/* Linha principal com glow */}
          <div className="relative w-px h-16">
            {/* Glow externo */}
            <motion.div
              className="absolute inset-0 w-4 -left-1.5 blur-md"
              style={{ backgroundColor: color }}
              animate={{ opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            
            {/* Linha central */}
            <div 
              className="absolute inset-0 w-px left-1/2 -translate-x-1/2"
              style={{ backgroundColor: color }}
            />

            {/* Particulas fluindo */}
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full left-1/2 -translate-x-1/2"
                style={{ 
                  backgroundColor: color,
                  boxShadow: `0 0 10px ${color}, 0 0 20px ${color}` 
                }}
                animate={{
                  top: ["0%", "100%"],
                  opacity: [0, 1, 0],
                  scale: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 1.5,
                  delay: i * 0.5,
                  repeat: Infinity,
                  ease: "linear",
                }}
              />
            ))}
          </div>

          {/* Seta com ponta energetica */}
          <motion.div
            animate={{ y: [0, 3, 0] }}
            transition={{ duration: 1, repeat: Infinity }}
            className="relative"
          >
            <ArrowDown 
              className="w-5 h-5" 
              style={{ color, filter: `drop-shadow(0 0 8px ${color})` }} 
            />
            {/* Glow da seta */}
            <div 
              className="absolute inset-0 blur-lg opacity-50"
              style={{ backgroundColor: color }}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Componente principal
export function InteractiveFeatureCards() {
  const [activeFeature, setActiveFeature] = useState<string | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  // Track mouse position for background effect
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      setMousePosition({
        x: ((e.clientX - rect.left) / rect.width) * 100,
        y: ((e.clientY - rect.top) / rect.height) * 100,
      })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const renderDemo = () => {
    switch (activeFeature) {
      case "leads": return <CRMDemo />
      case "operations": return <OperationsDemo />
      case "finance": return <FinanceDemo />
      case "ai": return <AIDemo />
      default: return null
    }
  }

  const activeFeatureData = FEATURES.find((f) => f.id === activeFeature)

  return (
    <div ref={containerRef} className="relative">
      {/* Background dinamico */}
      <div 
        className="absolute inset-0 -z-10 transition-all duration-700 rounded-3xl"
        style={{
          background: activeFeature 
            ? `radial-gradient(ellipse at ${mousePosition.x}% ${mousePosition.y}%, ${activeFeatureData?.color}15 0%, transparent 50%)`
            : `radial-gradient(ellipse at ${mousePosition.x}% ${mousePosition.y}%, rgba(99, 102, 241, 0.05) 0%, transparent 50%)`,
        }}
      />

      {/* Grid de cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {FEATURES.map((feature, i) => {
          const isActive = activeFeature === feature.id
          const Icon = feature.icon

          return (
            <motion.div
              key={feature.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              onMouseEnter={() => setActiveFeature(feature.id)}
              onMouseLeave={() => setActiveFeature(null)}
              className="relative cursor-pointer"
            >
              {/* Card */}
              <motion.div
                animate={{
                  scale: isActive ? 1.03 : 1,
                  y: isActive ? -5 : 0,
                }}
                transition={{ duration: 0.3 }}
                className={`relative p-6 rounded-2xl border transition-all duration-500 ${
                  isActive 
                    ? "border-white/20 bg-gradient-to-b from-white/[0.08] to-white/[0.02]" 
                    : "border-white/5 bg-white/[0.02]"
                }`}
                style={{
                  boxShadow: isActive ? `0 0 40px ${feature.color}20, 0 0 80px ${feature.color}10` : "none",
                }}
              >
                {/* Glow overlay */}
                <motion.div
                  className="absolute inset-0 rounded-2xl opacity-0"
                  animate={{ opacity: isActive ? 1 : 0 }}
                  transition={{ duration: 0.3 }}
                  style={{ 
                    background: `radial-gradient(circle at 50% 0%, ${feature.color}20, transparent 70%)` 
                  }}
                />

                {/* Icone */}
                <motion.div
                  animate={{ scale: isActive ? 1.1 : 1 }}
                  className={`relative w-10 h-10 rounded-xl flex items-center justify-center mb-4 bg-gradient-to-br ${feature.gradient}`}
                  style={{ 
                    boxShadow: isActive ? `0 0 20px ${feature.color}40` : "none" 
                  }}
                >
                  <Icon className="w-5 h-5" style={{ color: feature.color }} />
                </motion.div>

                {/* Titulo e descricao */}
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-white/40">{feature.desc}</p>

                {/* Numero do card */}
                <div className="absolute top-6 right-6 text-4xl font-bold text-white/5">
                  0{i + 1}
                </div>
              </motion.div>

              {/* Conector energetico */}
              <EnergyConnector isActive={isActive} color={feature.color} />
            </motion.div>
          )
        })}
      </div>

      {/* Area de demonstracao */}
      <AnimatePresence mode="wait">
        {activeFeature && (
          <motion.div
            key={activeFeature}
            initial={{ opacity: 0, y: 20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
            className="mt-8 overflow-hidden"
          >
            <div 
              className="p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent backdrop-blur-sm"
              style={{
                boxShadow: `0 0 60px ${activeFeatureData?.color}10`,
              }}
            >
              {/* Header da demonstracao */}
              <div className="flex items-center gap-3 mb-4 pb-4 border-b border-white/5">
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${activeFeatureData?.color}20` }}
                >
                  {activeFeatureData && <activeFeatureData.icon className="w-4 h-4" style={{ color: activeFeatureData.color }} />}
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white">{activeFeatureData?.title}</h4>
                  <p className="text-xs text-white/40">Demonstracao interativa</p>
                </div>
              </div>

              {/* Conteudo da demonstracao */}
              {renderDemo()}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
