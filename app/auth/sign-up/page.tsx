"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Layers, Mail, Lock, User, AlertCircle, Check, Terminal, ChevronRight } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function SignUpPage() {
  const router = useRouter()
  const [step, setStep] = useState<"form" | "activating" | "success">("form")
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [activationLines, setActivationLines] = useState<string[]>([])

  const ACTIVATION_SEQUENCE = [
    "Verificando credenciais...",
    "Criando ambiente seguro...",
    "Configurando espaco de trabalho...",
    "Preparando modulos iniciais...",
    "Ambiente ativado com sucesso!",
  ]

  async function runActivationSequence() {
    setStep("activating")
    setActivationLines([])
    
    for (let i = 0; i < ACTIVATION_SEQUENCE.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600))
      setActivationLines(prev => [...prev, ACTIVATION_SEQUENCE[i]])
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    setStep("success")
    
    // Wait briefly then redirect
    await new Promise(resolve => setTimeout(resolve, 1800))
    
    // Force navigation to onboarding
    window.location.href = "/onboarding"
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError("As senhas nao conferem")
      return
    }

    if (password.length < 6) {
      setError("A senha deve ter pelo menos 6 caracteres")
      return
    }

    setLoading(true)

    try {
      const supabase = createClient()

      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo:
            process.env.NEXT_PUBLIC_DEV_SUPABASE_REDIRECT_URL ??
            `${window.location.origin}/auth/callback`,
          data: {
            full_name: fullName,
          },
        },
      })

      if (signUpError) {
        const errorMessage = signUpError.message === "User already registered"
          ? "Este email ja esta cadastrado"
          : signUpError.message
        setError(errorMessage)
        setLoading(false)
        return
      }

      // User created successfully - run activation regardless of session
      // (some Supabase configs auto-confirm, others require email)
      if (data.user) {
        // Create initial profile
        await supabase.from("profiles").upsert({
          id: data.user.id,
          full_name: fullName,
        }, { onConflict: "id" })

        // Run the activation sequence animation
        await runActivationSequence()
      } else {
        // Fallback - should not happen but handle gracefully
        setError("Erro ao criar conta. Tente novamente.")
        setLoading(false)
      }
    } catch {
      setError("Erro de conexao. Tente novamente.")
      setLoading(false)
    }
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
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[120px]" />

      {/* Header */}
      <header className="relative z-10 p-6">
        <Link href="/" className="inline-flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-600 flex items-center justify-center">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <span className="text-lg font-semibold text-white/90 group-hover:text-white transition-colors">OpsCore</span>
        </Link>
      </header>

      {/* Content */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-100px)] px-4 py-8">
        <AnimatePresence mode="wait">
          {/* Form */}
          {step === "form" && (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="w-full max-w-md"
            >
              {/* Terminal header */}
              <div className="bg-[#12121a] rounded-t-xl border border-white/10 border-b-0 p-3 flex items-center gap-2">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-xs text-white/40 ml-2 font-mono">ativar-ambiente.sh</span>
              </div>

              {/* Form container */}
              <div className="bg-[#0f0f16] rounded-b-xl border border-white/10 border-t-0 p-8">
                <div className="mb-8">
                  <div className="flex items-center gap-2 text-indigo-400 text-sm font-mono mb-2">
                    <Terminal className="w-4 h-4" />
                    <span>$ opscore activate --new-environment</span>
                  </div>
                  <h1 className="text-2xl font-bold text-white mb-2">
                    Ativar seu ambiente OpsCore
                  </h1>
                  <p className="text-white/50 text-sm">
                    Essas informacoes definem como o OpsCore sera configurado para voce
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {error && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                    >
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      {error}
                    </motion.div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm text-white/60 font-medium">Nome completo</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        type="text"
                        placeholder="Seu nome"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-white/60 font-medium">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-white/60 font-medium">Senha</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        type="password"
                        placeholder="Minimo 6 caracteres"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm text-white/60 font-medium">Confirmar senha</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                      <input
                        type="password"
                        placeholder="Repita a senha"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder:text-white/30 focus:outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/50 transition-all"
                        required
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 bg-indigo-500 hover:bg-indigo-400 disabled:bg-indigo-500/50 text-white font-medium rounded-lg transition-all flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Ativando...
                      </>
                    ) : (
                      <>
                        Ativar Ambiente
                        <ChevronRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <p className="mt-6 text-center text-sm text-white/40">
                  Ja tem um ambiente?{" "}
                  <Link href="/auth/login" className="text-indigo-400 hover:text-indigo-300 transition-colors">
                    Acessar
                  </Link>
                </p>
              </div>
            </motion.div>
          )}

          {/* Activating */}
          {step === "activating" && (
            <motion.div
              key="activating"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="w-full max-w-lg"
            >
              <div className="text-center mb-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-indigo-500/20 flex items-center justify-center"
                >
                  <Layers className="w-8 h-8 text-indigo-400" />
                </motion.div>
                <h2 className="text-xl font-semibold text-white">Ativando seu ambiente...</h2>
              </div>

              <div className="bg-[#0f0f16] rounded-xl border border-white/10 p-6 font-mono text-sm">
                {activationLines.map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="flex items-center gap-2 text-indigo-300/80 mb-2"
                  >
                    <span className="text-green-400">✓</span>
                    <span>{line}</span>
                  </motion.div>
                ))}
                {activationLines.length < ACTIVATION_SEQUENCE.length && (
                  <div className="flex items-center gap-2 text-white/50">
                    <div className="w-3 h-3 border border-indigo-400 border-t-transparent rounded-full animate-spin" />
                    <span>Processando...</span>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Success */}
          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-500/20 flex items-center justify-center"
              >
                <Check className="w-10 h-10 text-green-400" />
              </motion.div>
              <h2 className="text-2xl font-bold text-white mb-2">Ambiente ativado!</h2>
              <p className="text-white/50">Preparando configuracao do sistema...</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
