"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useRouter } from "next/navigation"
import { motion, useScroll, useTransform, useSpring, useMotionValue } from "framer-motion"
import { 
  Users, ListTodo, Wallet, BarChart3, Bot, MessageCircle, 
  Zap, Shield, Globe, ArrowRight, ChevronDown
} from "lucide-react"
import Image from "next/image"
import { MouseTrail } from "@/components/landing/mouse-trail"
import { AnimatedLogo } from "@/components/landing/animated-logo"
import { InteractiveFeatureCards } from "@/components/landing/interactive-feature-cards"
import { EnhancedModules } from "@/components/landing/enhanced-modules"

// Hook para tracking do mouse com parallax
function useMousePosition() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth - 0.5) * 2,
        y: (e.clientY / window.innerHeight - 0.5) * 2,
      })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])
  
  return mousePosition
}

// Componente de janela flutuante
function FloatingWindow({ 
  children, 
  title, 
  className = "",
  delay = 0,
  mouseX,
  mouseY,
  depth = 1,
  glowColor = "rgba(99, 102, 241, 0.15)"
}: { 
  children: React.ReactNode
  title: string
  className?: string
  delay?: number
  mouseX: number
  mouseY: number
  depth?: number
  glowColor?: string
}) {
  const offsetX = mouseX * 20 * depth
  const offsetY = mouseY * 15 * depth
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ delay, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      style={{
        transform: `translate(${offsetX}px, ${offsetY}px)`,
        boxShadow: `0 0 60px ${glowColor}`,
      }}
      className={`relative rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.08] to-white/[0.02] backdrop-blur-xl overflow-hidden ${className}`}
    >
      {/* Window header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 bg-white/[0.02]">
        <div className="flex gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
          <div className="w-2.5 h-2.5 rounded-full bg-white/20" />
        </div>
        <span className="text-[11px] text-white/40 font-medium uppercase tracking-wider ml-2">{title}</span>
      </div>
      {/* Window content */}
      <div className="p-4">
        {children}
      </div>
    </motion.div>
  )
}

// Componente de modulo do sistema
function ModuleCard({ 
  icon: Icon, 
  title, 
  description,
  color,
  delay = 0
}: {
  icon: React.ElementType
  title: string
  description: string
  color: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay, duration: 0.6 }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="group relative p-6 rounded-2xl border border-white/10 bg-gradient-to-b from-white/[0.05] to-transparent backdrop-blur-sm hover:border-white/20 transition-all duration-500"
    >
      <div 
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(circle at 50% 0%, ${color}15, transparent 70%)` }}
      />
      <div 
        className="w-12 h-12 rounded-xl flex items-center justify-center mb-4"
        style={{ background: `linear-gradient(135deg, ${color}30, ${color}10)` }}
      >
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-white/50 leading-relaxed">{description}</p>
    </motion.div>
  )
}

// Dados dos modulos
const MODULES = [
  { 
    icon: Users, 
    title: "CRM", 
    description: "Gerencie leads, clientes e todo o funil de vendas em um unico lugar inteligente.",
    color: "#6366f1"
  },
  { 
    icon: ListTodo, 
    title: "Operacoes", 
    description: "Controle tarefas, projetos e fluxos de trabalho com automacao integrada.",
    color: "#8b5cf6"
  },
  { 
    icon: Wallet, 
    title: "Financeiro", 
    description: "Receitas, despesas, fluxo de caixa e relatorios financeiros completos.",
    color: "#10b981"
  },
  { 
    icon: BarChart3, 
    title: "Relatorios", 
    description: "Dashboards em tempo real com insights automaticos sobre seu negocio.",
    color: "#f59e0b"
  },
  { 
    icon: Bot, 
    title: "Assistente A", 
    description: "IA que entende seu negocio, sugere acoes e automatiza tarefas repetitivas.",
    color: "#06b6d4"
  },
  { 
    icon: MessageCircle, 
    title: "Conversas", 
    description: "WhatsApp Business integrado para atendimento centralizado.",
    color: "#22c55e"
  },
]

export default function LandingPage() {
  const router = useRouter()
  const { x: mouseX, y: mouseY } = useMousePosition()
  const containerRef = useRef<HTMLDivElement>(null)
  const { scrollYProgress } = useScroll()
  
  const smoothProgress = useSpring(scrollYProgress, { stiffness: 100, damping: 30 })
  const heroOpacity = useTransform(smoothProgress, [0, 0.15], [1, 0])
  const heroScale = useTransform(smoothProgress, [0, 0.15], [1, 0.95])

  return (
    <div ref={containerRef} className="min-h-screen bg-[#050508] text-white overflow-x-hidden">
      {/* Mouse Trail Effect */}
      <MouseTrail />
      
      {/* Animated Logo that follows scroll */}
      <AnimatedLogo mouseX={mouseX} mouseY={mouseY} />

      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none">
        {/* Grid pattern */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px)
            `,
            backgroundSize: '80px 80px',
          }}
        />
        {/* Radial glow */}
        <div 
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[1200px] h-[800px] opacity-30"
          style={{
            background: 'radial-gradient(ellipse at center, rgba(99, 102, 241, 0.15) 0%, transparent 70%)',
          }}
        />
        {/* Noise texture */}
        <div className="absolute inset-0 opacity-[0.02]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox="0 0 256 256" xmlns="http://www.w3.org/2000/svg"%3E%3Cfilter id="noise"%3E%3CfeTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch"/%3E%3C/filter%3E%3Crect width="100%" height="100%" filter="url(%23noise)"/%3E%3C/svg%3E")' }} />
      </div>

      {/* Navigation */}
      <motion.nav 
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-cyan-500/30">
              <Image 
                src="/logo-3d.jpg" 
                alt="OpsCore" 
                width={40} 
                height={40}
                className="w-full h-full object-cover"
              />
            </div>
            <span className="text-lg font-semibold text-white/90">OpsCore</span>
          </div>
          <div className="flex items-center gap-4">
            <button 
              onClick={() => router.push("/auth/login")}
              className="px-4 py-2 text-sm text-white/60 hover:text-white transition-colors"
            >
              Entrar
            </button>
            <button 
              onClick={() => router.push("/auth/sign-up")}
              className="px-5 py-2.5 text-sm font-medium bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/20 rounded-lg transition-all"
            >
              Comecar agora
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <motion.section 
        style={{ opacity: heroOpacity, scale: heroScale }}
        className="relative z-10 min-h-screen flex items-center justify-center pt-20"
      >
        <div className="max-w-7xl mx-auto px-6 w-full">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left: Text content */}
            <div className="relative z-10">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.8 }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/10 bg-white/5 text-xs text-white/60 mb-6"
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Sistema operacional empresarial
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
                className="text-5xl md:text-6xl lg:text-7xl font-bold leading-[1.1] mb-6"
              >
                <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">O sistema </span>
                <span className="text-white">operacional </span>
                <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">com IA </span>
                <span className="bg-gradient-to-r from-emerald-400 via-green-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(16,185,129,0.3)]">que gerencia seu negocio </span>
                <span className="text-white">inteiro.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.8 }}
                className="text-lg text-white/50 max-w-xl mb-8 leading-relaxed"
              >
                Vendas, clientes, operacao e financeiro em uma unica plataforma inteligente. 
                Substitua 5 ferramentas por uma.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
                className="flex flex-wrap gap-4"
              >
                <button 
                  onClick={() => router.push("/auth/sign-up")}
                  className="group px-6 py-3.5 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-medium rounded-xl transition-all hover:shadow-lg hover:shadow-indigo-500/25 flex items-center gap-2"
                >
                  Iniciar no OpsCore
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <button 
                  onClick={() => {
                    document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  className="px-6 py-3.5 text-white/70 hover:text-white font-medium transition-colors flex items-center gap-2"
                >
                  Ver como funciona
                  <ChevronDown className="w-4 h-4" />
                </button>
              </motion.div>
            </div>

            {/* Right: Floating windows */}
            <div className="relative h-[600px] hidden lg:block">
              {/* CRM Window */}
              <FloatingWindow 
                title="CRM" 
                className="absolute top-0 left-0 w-64" 
                delay={0.5}
                mouseX={mouseX}
                mouseY={mouseY}
                depth={1.2}
                glowColor="rgba(99, 102, 241, 0.1)"
              >
                <div className="space-y-2">
                  {["Lead qualificado", "Proposta enviada", "Negociacao"].map((item, i) => (
                    <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-white/5">
                      <div className="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-xs text-indigo-400">
                        {item[0]}
                      </div>
                      <span className="text-xs text-white/70">{item}</span>
                    </div>
                  ))}
                </div>
              </FloatingWindow>

              {/* Financeiro Window */}
              <FloatingWindow 
                title="Financeiro" 
                className="absolute top-20 right-0 w-56" 
                delay={0.7}
                mouseX={mouseX}
                mouseY={mouseY}
                depth={0.8}
                glowColor="rgba(16, 185, 129, 0.1)"
              >
                <div className="space-y-3">
                  <div className="text-2xl font-bold text-white">R$ 47.850</div>
                  <div className="text-xs text-emerald-400 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    +23% este mes
                  </div>
                  <div className="h-8 flex items-end gap-1">
                    {[40, 65, 45, 80, 55, 90, 70].map((h, i) => (
                      <div 
                        key={i} 
                        className="flex-1 bg-gradient-to-t from-emerald-500/50 to-emerald-400/80 rounded-sm"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                </div>
              </FloatingWindow>

              {/* Assistente Window */}
              <FloatingWindow 
                title="Assistente A" 
                className="absolute bottom-20 left-10 w-72" 
                delay={0.9}
                mouseX={mouseX}
                mouseY={mouseY}
                depth={1.5}
                glowColor="rgba(6, 182, 212, 0.1)"
              >
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <div className="w-6 h-6 rounded-full bg-cyan-500/20 flex items-center justify-center">
                      <Bot className="w-3 h-3 text-cyan-400" />
                    </div>
                    <div className="flex-1 p-2 rounded-lg bg-white/5 text-xs text-white/70">
                      Identifiquei 3 leads que precisam de follow-up hoje.
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    <div className="p-2 rounded-lg bg-indigo-500/20 text-xs text-indigo-300">
                      Enviar lembretes automaticos
                    </div>
                  </div>
                </div>
              </FloatingWindow>

              {/* Operacoes Window */}
              <FloatingWindow 
                title="Operacoes" 
                className="absolute bottom-0 right-10 w-48" 
                delay={1.1}
                mouseX={mouseX}
                mouseY={mouseY}
                depth={0.6}
                glowColor="rgba(139, 92, 246, 0.1)"
              >
                <div className="space-y-2">
                  {[
                    { label: "Em andamento", value: 12, color: "bg-purple-500" },
                    { label: "Concluidas", value: 38, color: "bg-emerald-500" },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${item.color}`} />
                        <span className="text-white/50">{item.label}</span>
                      </div>
                      <span className="text-white font-medium">{item.value}</span>
                    </div>
                  ))}
                </div>
              </FloatingWindow>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2"
        >
          <motion.div 
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border border-white/20 flex items-start justify-center p-2"
          >
            <div className="w-1 h-2 rounded-full bg-white/40" />
          </motion.div>
        </motion.div>
      </motion.section>

      {/* O que e o OpsCore */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm text-indigo-400 uppercase tracking-widest mb-4"
          >
            O que e o OpsCore
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-6 leading-tight"
          >
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Um </span>
            <span className="text-white">sistema operacional empresarial </span>
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">com inteligencia artificial no centro.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-white/50 leading-relaxed"
          >
            O OpsCore reune CRM, operacoes, financeiro, relatorios, assistente com IA, 
            automacoes e conversas em uma unica plataforma. Tudo conectado. Tudo inteligente.
          </motion.p>
        </div>
      </section>

      {/* Como funciona - Cards Interativos Premium */}
      <section id="como-funciona" className="relative z-10 py-32 px-6 overflow-hidden">
        {/* Background dinamico que reage ao scroll */}
        <div className="absolute inset-0 -z-10">
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                "radial-gradient(ellipse at 20% 50%, rgba(16, 185, 129, 0.08) 0%, transparent 50%)",
                "radial-gradient(ellipse at 80% 50%, rgba(6, 182, 212, 0.08) 0%, transparent 50%)",
                "radial-gradient(ellipse at 50% 50%, rgba(99, 102, 241, 0.08) 0%, transparent 50%)",
                "radial-gradient(ellipse at 20% 50%, rgba(16, 185, 129, 0.08) 0%, transparent 50%)",
              ],
            }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
          />
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-sm text-indigo-400 uppercase tracking-widest mb-4"
            >
              Como funciona
            </motion.p>
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-5xl font-bold mb-4"
            >
              <span className="text-white">Tudo em um. </span>
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Simples assim.</span>
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-white/40 text-sm"
            >
              Passe o mouse sobre cada card para ver a demonstracao
            </motion.p>
          </div>

          {/* Cards Interativos com Demonstracao */}
          <InteractiveFeatureCards />
        </div>
      </section>

      {/* Modulos - Substitua 5 ferramentas */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-6xl mx-auto">
          <EnhancedModules />
        </div>
      </section>

      {/* IA Section */}
      <section className="relative z-10 py-32 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-indigo-500/5 via-transparent to-transparent" />
        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="w-20 h-20 mx-auto mb-8 rounded-3xl bg-gradient-to-br from-cyan-500/20 to-indigo-500/20 border border-white/10 flex items-center justify-center"
          >
            <Bot className="w-10 h-10 text-cyan-400" />
          </motion.div>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-sm text-cyan-400 uppercase tracking-widest mb-4"
          >
            IA no centro do sistema
          </motion.p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            <span className="text-white">O Assistente A </span>
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">acompanha, sugere e automatiza toda a sua operacao.</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-lg text-white/50 leading-relaxed mb-8"
          >
            Nao e um chatbot generico. E uma IA que entende seu negocio, aprende com seus dados 
            e trabalha junto com voce para tomar decisoes melhores.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="flex flex-wrap justify-center gap-4"
          >
            {["Sugestoes proativas", "Automacoes inteligentes", "Relatorios automaticos", "Insights em tempo real"].map((item, i) => (
              <span key={i} className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm text-white/60">
                {item}
              </span>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl md:text-5xl font-bold mb-6"
          >
            <span className="text-white">Pronto para centralizar </span>
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">sua operacao?</span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-lg text-white/50 mb-10"
          >
            Comece agora e transforme a forma como voce gerencia seu negocio.
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            <button 
              onClick={() => router.push("/auth/sign-up")}
              className="group px-8 py-4 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 text-white font-medium rounded-xl transition-all hover:shadow-lg hover:shadow-indigo-500/25 flex items-center gap-2 mx-auto"
            >
              Iniciar no OpsCore
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 py-16 px-6 border-t border-white/5">
        <div className="max-w-6xl mx-auto">
          {/* Logo central no footer */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="flex flex-col items-center mb-12"
          >
            <div className="relative w-24 h-24 mb-6">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-cyan-500/20 blur-2xl rounded-full" />
              <div className="relative w-full h-full rounded-full overflow-hidden ring-2 ring-cyan-500/30">
                <Image 
                  src="/logo-3d.jpg" 
                  alt="OpsCore" 
                  width={96} 
                  height={96}
                  className="w-full h-full object-cover"
                />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">OpsCore</h3>
            <p className="text-sm text-white/40 text-center max-w-md">
              Sistema operacional empresarial com inteligencia artificial no centro.
            </p>
          </motion.div>

          {/* Bottom bar */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-8 border-t border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full overflow-hidden ring-1 ring-cyan-500/20">
                <Image 
                  src="/logo-3d.jpg" 
                  alt="OpsCore" 
                  width={32} 
                  height={32}
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="text-sm text-white/40">OpsCore - Sistema operacional com IA</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-white/40">
              <span>2024 OpsCore</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
