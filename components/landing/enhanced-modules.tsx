"use client"

import { useState, useRef, useEffect } from "react"
import { motion } from "framer-motion"
import { 
  Users, ListTodo, Wallet, BarChart3, Bot, MessageCircle,
  Zap, TrendingUp, PieChart, Activity
} from "lucide-react"

// Dados dos modulos
const MODULES = [
  { 
    icon: Users, 
    title: "CRM", 
    description: "Gerencie leads, clientes e todo o funil de vendas em um unico lugar inteligente.",
    color: "#6366f1",
    stats: { label: "Leads ativos", value: "247", trend: "+12%" }
  },
  { 
    icon: ListTodo, 
    title: "Operacoes", 
    description: "Controle tarefas, projetos e fluxos de trabalho com automacao integrada.",
    color: "#8b5cf6",
    stats: { label: "Tarefas hoje", value: "18", trend: "+5%" }
  },
  { 
    icon: Wallet, 
    title: "Financeiro", 
    description: "Receitas, despesas, fluxo de caixa e relatorios financeiros completos.",
    color: "#10b981",
    stats: { label: "Saldo mensal", value: "R$ 47k", trend: "+23%" }
  },
  { 
    icon: BarChart3, 
    title: "Relatorios", 
    description: "Dashboards em tempo real com insights automaticos sobre seu negocio.",
    color: "#f59e0b",
    stats: { label: "Metricas", value: "32", trend: "ativas" }
  },
  { 
    icon: Bot, 
    title: "Assistente IA", 
    description: "IA que entende seu negocio, sugere acoes e automatiza tarefas repetitivas.",
    color: "#06b6d4",
    stats: { label: "Automacoes", value: "156", trend: "executadas" }
  },
  { 
    icon: MessageCircle, 
    title: "Conversas", 
    description: "WhatsApp Business integrado para atendimento centralizado.",
    color: "#22c55e",
    stats: { label: "Mensagens", value: "1.2k", trend: "hoje" }
  },
]

// Mini grafico animado
function MiniChart({ color }: { color: string }) {
  const bars = [40, 65, 45, 80, 55, 90, 70]
  
  return (
    <div className="flex items-end gap-0.5 h-8">
      {bars.map((h, i) => (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          whileInView={{ height: `${h}%` }}
          viewport={{ once: true }}
          transition={{ delay: i * 0.05, duration: 0.4 }}
          className="w-1 rounded-t-sm"
          style={{ backgroundColor: `${color}80` }}
        />
      ))}
    </div>
  )
}

// Card de modulo aprimorado
function ModuleCard({ 
  module, 
  index,
  mousePosition 
}: { 
  module: typeof MODULES[0]
  index: number
  mousePosition: { x: number; y: number }
}) {
  const [isHovered, setIsHovered] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const [cardPosition, setCardPosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    if (cardRef.current && isHovered) {
      const rect = cardRef.current.getBoundingClientRect()
      setCardPosition({
        x: ((mousePosition.x - rect.left) / rect.width) * 100,
        y: ((mousePosition.y - rect.top) / rect.height) * 100,
      })
    }
  }, [mousePosition, isHovered])

  const Icon = module.icon

  return (
    <motion.div
      ref={cardRef}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className="group relative"
    >
      <motion.div
        animate={{
          y: isHovered ? -8 : 0,
          scale: isHovered ? 1.02 : 1,
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={`relative p-6 rounded-2xl border transition-all duration-500 overflow-hidden ${
          isHovered 
            ? "border-white/20 bg-gradient-to-b from-white/[0.08] to-white/[0.02]" 
            : "border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent"
        }`}
        style={{
          boxShadow: isHovered 
            ? `0 20px 40px -20px ${module.color}30, 0 0 60px ${module.color}10` 
            : "none",
        }}
      >
        {/* Spotlight effect following mouse */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `radial-gradient(circle at ${cardPosition.x}% ${cardPosition.y}%, ${module.color}15 0%, transparent 50%)`,
          }}
        />

        {/* Gradient glow on hover */}
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{ 
            background: `radial-gradient(circle at 50% 0%, ${module.color}20, transparent 70%)` 
          }}
        />

        {/* Animated border glow */}
        <motion.div
          className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
          style={{
            boxShadow: `inset 0 1px 0 ${module.color}30`,
          }}
        />

        {/* Icon container */}
        <motion.div 
          animate={{ 
            scale: isHovered ? 1.1 : 1,
            rotate: isHovered ? 5 : 0,
          }}
          transition={{ duration: 0.3 }}
          className="relative w-12 h-12 rounded-xl flex items-center justify-center mb-4"
          style={{ 
            background: `linear-gradient(135deg, ${module.color}30, ${module.color}10)`,
            boxShadow: isHovered ? `0 0 30px ${module.color}40` : "none",
          }}
        >
          <Icon className="w-6 h-6" style={{ color: module.color }} />
          
          {/* Pulse ring on hover */}
          {isHovered && (
            <motion.div
              className="absolute inset-0 rounded-xl"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ duration: 1, repeat: Infinity }}
              style={{ border: `2px solid ${module.color}` }}
            />
          )}
        </motion.div>

        {/* Content */}
        <h3 className="text-lg font-semibold text-white mb-2">{module.title}</h3>
        <p className="text-sm text-white/50 leading-relaxed mb-4">{module.description}</p>

        {/* Stats row - appears on hover */}
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ 
            opacity: isHovered ? 1 : 0, 
            height: isHovered ? "auto" : 0 
          }}
          transition={{ duration: 0.3 }}
          className="overflow-hidden"
        >
          <div className="flex items-center justify-between pt-4 border-t border-white/5">
            <div>
              <p className="text-[10px] text-white/40 uppercase tracking-wider">{module.stats.label}</p>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold text-white">{module.stats.value}</span>
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3" />
                  {module.stats.trend}
                </span>
              </div>
            </div>
            <MiniChart color={module.color} />
          </div>
        </motion.div>

        {/* Decorative elements */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <Zap className="w-4 h-4" style={{ color: `${module.color}60` }} />
        </div>
      </motion.div>
    </motion.div>
  )
}

// Componente principal
export function EnhancedModules() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div ref={containerRef} className="relative">
      {/* Background glow */}
      <div 
        className="absolute inset-0 -z-10 opacity-30"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)`,
        }}
      />

      {/* Header com grafico decorativo */}
      <div className="text-center mb-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 mb-6"
        >
          <Activity className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-white/60">Todos os modulos conectados</span>
        </motion.div>
        
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-sm text-indigo-400 uppercase tracking-widest mb-4"
        >
          Modulos principais
        </motion.p>
        <motion.h2
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="text-4xl md:text-5xl font-bold"
        >
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Substitua </span>
          <span className="text-white">5 ferramentas </span>
          <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">por uma.</span>
        </motion.h2>
      </div>

      {/* Grid de modulos */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MODULES.map((module, i) => (
          <ModuleCard 
            key={module.title} 
            module={module} 
            index={i}
            mousePosition={mousePosition}
          />
        ))}
      </div>

      {/* Indicadores de conexao entre modulos */}
      <motion.div
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="flex justify-center mt-12"
      >
        <div className="flex items-center gap-3 px-6 py-3 rounded-full border border-white/10 bg-white/5">
          <div className="flex -space-x-2">
            {[Users, Wallet, Bot].map((Icon, i) => (
              <div 
                key={i}
                className="w-8 h-8 rounded-full bg-gradient-to-br from-white/10 to-white/5 border border-white/10 flex items-center justify-center"
              >
                <Icon className="w-4 h-4 text-white/60" />
              </div>
            ))}
          </div>
          <span className="text-xs text-white/50">+3 modulos integrados</span>
          <motion.div
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-2 h-2 rounded-full bg-emerald-500"
          />
        </div>
      </motion.div>
    </div>
  )
}
