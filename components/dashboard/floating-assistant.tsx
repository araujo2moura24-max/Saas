"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Bot, Send, User, X, Sparkles, ArrowRight, Minimize2, Maximize2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  navigate?: string
}

const WELCOME_MESSAGE = `Ola! Sou o **OpsBot**, seu assistente operacional.

Posso te ajudar a:
- **Criar registros**: leads, receitas, despesas, tarefas
- **Consultar dados**: saldo, numero de leads, tarefas pendentes
- **Navegar**: "abrir CRM", "ir para financeiro"

O que voce gostaria de fazer?`

const QUICK_ACTIONS = [
  { label: "Criar lead", message: "criar lead" },
  { label: "Nova receita", message: "registrar receita" },
  { label: "Nova tarefa", message: "criar tarefa" },
  { label: "Meu saldo", message: "qual meu saldo" },
  { label: "Abrir CRM", message: "abrir crm" },
  { label: "Ajuda", message: "ajuda" },
]

export function FloatingAssistant() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [hasShownWelcome, setHasShownWelcome] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Scroll para o final quando mensagens mudam
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus no input quando abre
  useEffect(() => {
    if (isOpen && !isMinimized) {
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [isOpen, isMinimized])

  // Auto-abrir no primeiro acesso
  useEffect(() => {
    const isFirstAccess = searchParams.get("firstAccess") === "true"
    if (isFirstAccess && !hasShownWelcome) {
      setTimeout(() => {
        setIsOpen(true)
        setMessages([{
          id: "welcome",
          role: "assistant",
          content: WELCOME_MESSAGE,
        }])
        setHasShownWelcome(true)
        window.history.replaceState({}, "", "/dashboard")
      }, 800)
    }
  }, [searchParams, hasShownWelcome])

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: text.trim(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(m => ({
            id: m.id,
            role: m.role,
            parts: [{ type: "text", text: m.content }],
          })),
        }),
      })

      const data = await response.json()
      
      const assistantMessage: Message = {
        id: data.id || crypto.randomUUID(),
        role: "assistant",
        content: data.content || "Desculpe, nao consegui processar sua mensagem.",
        navigate: data.navigate,
      }

      setMessages(prev => [...prev, assistantMessage])

      // Executar navegacao se houver comando
      if (data.navigate) {
        setTimeout(() => {
          router.push(data.navigate)
        }, 1200)
      }
    } catch (error) {
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        role: "assistant",
        content: "Desculpe, ocorreu um erro. Por favor, tente novamente.",
      }
      setMessages(prev => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
      inputRef.current?.focus()
    }
  }, [messages, isLoading, router])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    sendMessage(input)
  }

  function handleOpen() {
    setIsOpen(true)
    if (messages.length === 0) {
      setMessages([{
        id: "welcome",
        role: "assistant",
        content: WELCOME_MESSAGE,
      }])
    }
  }

  function handleReset() {
    setMessages([{
      id: "welcome-reset",
      role: "assistant",
      content: WELCOME_MESSAGE,
    }])
    setInput("")
  }

  // Renderizar markdown simples (negrito)
  function renderMarkdown(text: string) {
    if (!text) return null
    return text.split(/\*\*(.*?)\*\*/g).map((part, i) => 
      i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : part
    )
  }

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={handleOpen}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary shadow-lg shadow-primary/25 flex items-center justify-center text-primary-foreground hover:scale-105 transition-transform"
          >
            <Bot className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-background animate-pulse" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className={`fixed bottom-6 right-6 z-50 bg-card border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col ${
              isMinimized ? "w-80 h-14" : "w-[400px] h-[540px]"
            } transition-all duration-300`}
          >
            {/* Header */}
            <div className="h-14 px-4 bg-primary flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-foreground/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
                <div className="text-primary-foreground">
                  <p className="text-sm font-medium">OpsBot</p>
                  {!isMinimized && (
                    <p className="text-xs text-primary-foreground/70">
                      {isLoading ? "Pensando..." : "Assistente Operacional"}
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                {!isMinimized && messages.length > 1 && (
                  <button
                    onClick={handleReset}
                    className="w-8 h-8 rounded-lg hover:bg-primary-foreground/10 flex items-center justify-center text-primary-foreground/80 transition-colors"
                    title="Reiniciar conversa"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsMinimized(!isMinimized)}
                  className="w-8 h-8 rounded-lg hover:bg-primary-foreground/10 flex items-center justify-center text-primary-foreground/80 transition-colors"
                >
                  {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-8 h-8 rounded-lg hover:bg-primary-foreground/10 flex items-center justify-center text-primary-foreground/80 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Body */}
            {!isMinimized && (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center px-2">
                      <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-3">
                        <Sparkles className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="text-sm font-semibold text-card-foreground mb-1">
                        Como posso ajudar?
                      </h3>
                      <p className="text-xs text-muted-foreground mb-4">
                        Navegue, crie registros ou pergunte qualquer coisa
                      </p>
                      
                      <div className="grid grid-cols-2 gap-2 w-full">
                        {QUICK_ACTIONS.slice(0, 4).map((action) => (
                          <button
                            key={action.label}
                            onClick={() => sendMessage(action.message)}
                            className="flex items-center gap-1.5 px-3 py-2 bg-muted/50 hover:bg-muted rounded-lg text-xs text-left transition-colors"
                          >
                            <ArrowRight className="w-3 h-3 text-primary shrink-0" />
                            <span className="text-foreground truncate">{action.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <>
                      {messages.map((message) => (
                        <div
                          key={message.id}
                          className={`flex gap-2 ${message.role === "user" ? "justify-end" : ""}`}
                        >
                          {message.role === "assistant" && (
                            <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0 mt-0.5">
                              <Bot className="w-3.5 h-3.5 text-primary-foreground" />
                            </div>
                          )}
                          
                          <div
                            className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-[13px] ${
                              message.role === "user"
                                ? "bg-primary text-primary-foreground"
                                : "bg-muted text-foreground"
                            }`}
                          >
                            <div className="whitespace-pre-wrap leading-relaxed">
                              {renderMarkdown(message.content)}
                            </div>
                            {message.navigate && (
                              <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-current/10 text-[11px] opacity-80">
                                <Spinner className="w-3 h-3" />
                                Navegando...
                              </div>
                            )}
                          </div>

                          {message.role === "user" && (
                            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                              <User className="w-3.5 h-3.5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {isLoading && (
                        <div className="flex gap-2">
                          <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center shrink-0">
                            <Bot className="w-3.5 h-3.5 text-primary-foreground" />
                          </div>
                          <div className="bg-muted rounded-2xl px-3.5 py-2.5">
                            <div className="flex items-center gap-2 text-[13px] text-muted-foreground">
                              <span className="flex gap-1">
                                <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                                <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                                <span className="w-1.5 h-1.5 bg-muted-foreground/50 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                      
                      <div ref={messagesEndRef} />
                    </>
                  )}
                </div>

                {/* Quick actions after messages */}
                {messages.length > 0 && !isLoading && (
                  <div className="px-4 pb-2">
                    <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
                      {QUICK_ACTIONS.map((action) => (
                        <button
                          key={action.label}
                          onClick={() => sendMessage(action.message)}
                          className="shrink-0 px-2.5 py-1 bg-muted/50 hover:bg-muted rounded-full text-[11px] text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Input */}
                <div className="border-t border-border p-3 shrink-0">
                  <form onSubmit={handleSubmit} className="flex gap-2">
                    <input
                      ref={inputRef}
                      type="text"
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      placeholder="Digite sua mensagem..."
                      disabled={isLoading}
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 placeholder:text-muted-foreground"
                    />
                    <Button 
                      type="submit" 
                      size="icon"
                      disabled={!input.trim() || isLoading}
                      className="h-10 w-10 rounded-xl"
                    >
                      {isLoading ? <Spinner className="w-4 h-4" /> : <Send className="w-4 h-4" />}
                    </Button>
                  </form>
                </div>
              </>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
