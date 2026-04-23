"use client"

import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { Bot, Send, User, X, Sparkles, ArrowRight, Minimize2, Maximize2, RotateCcw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { useChat } from "@ai-sdk/react"
import { DefaultChatTransport, type UIMessage } from "ai"

const WELCOME_MESSAGE = `Ola! Sou o **OpsBot**, seu assistente operacional com inteligencia artificial.

Posso te ajudar a:
- **Criar registros**: leads, receitas, despesas, tarefas
- **Consultar dados**: saldo, numero de leads, tarefas pendentes
- **Navegar**: "abrir CRM", "ir para financeiro"
- **Responder perguntas**: sobre o OpsCore ou seu negocio

O que voce gostaria de fazer?`

const QUICK_ACTIONS = [
  { label: "Criar lead", message: "criar lead" },
  { label: "Nova receita", message: "registrar receita" },
  { label: "Nova tarefa", message: "criar tarefa" },
  { label: "Meu saldo", message: "qual meu saldo" },
  { label: "Abrir CRM", message: "abrir crm" },
  { label: "Ajuda", message: "o que voce pode fazer?" },
]

export function FloatingAssistant() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isOpen, setIsOpen] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [hasShownWelcome, setHasShownWelcome] = useState(false)
  const [localInput, setLocalInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Criar transport apenas uma vez
  const transport = useMemo(() => new DefaultChatTransport({ api: "/api/chat" }), [])

  // useChat do AI SDK com streaming
  const { messages, status, sendMessage, setMessages, error } = useChat({
    transport,
    initialMessages: [],
    onError: (err) => {
      console.error('[v0] useChat error:', err)
    },
  })
  
  // Log de erros
  useEffect(() => {
    if (error) {
      console.error('[v0] Chat error state:', error)
    }
  }, [error])

  const isLoading = status === "streaming" || status === "submitted"

  // Extrair texto das partes da mensagem
  const getMessageText = useCallback((msg: UIMessage): string => {
    if (!msg.parts || !Array.isArray(msg.parts)) return ""
    return msg.parts
      .filter((p): p is { type: "text"; text: string } => p.type === "text")
      .map((p) => p.text)
      .join("")
  }, [])

  // Verificar se há navegação nas tool calls
  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.role === "assistant" && lastMessage.parts) {
      for (const part of lastMessage.parts) {
        if (part.type === "tool-invocation" && part.toolInvocation.toolName === "navigate") {
          const result = part.toolInvocation.result
          if (result?.navigate) {
            setTimeout(() => {
              router.push(result.navigate)
            }, 1000)
          }
        }
      }
    }
  }, [messages, router])

  // Auto-abrir no primeiro acesso
  useEffect(() => {
    const isFirstAccess = searchParams.get("firstAccess") === "true"
    if (isFirstAccess && !hasShownWelcome) {
      setTimeout(() => {
        setIsOpen(true)
        setMessages([{
          id: "welcome",
          role: "assistant",
          parts: [{ type: "text", text: WELCOME_MESSAGE }],
          createdAt: new Date(),
        } as UIMessage])
        setHasShownWelcome(true)
        window.history.replaceState({}, "", "/dashboard")
      }, 800)
    }
  }, [searchParams, hasShownWelcome, setMessages])

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

  const handleSendMessage = useCallback((text: string) => {
    if (!text.trim() || isLoading) return
    console.log('[v0] Sending message:', text.trim())
    console.log('[v0] Current status:', status)
    console.log('[v0] Current messages count:', messages.length)
    setLocalInput("")
    sendMessage({ text: text.trim() })
    console.log('[v0] sendMessage called')
  }, [isLoading, sendMessage, status, messages.length])

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    handleSendMessage(localInput)
  }

  function handleOpen() {
    setIsOpen(true)
    if (messages.length === 0) {
      setMessages([{
        id: "welcome",
        role: "assistant",
        parts: [{ type: "text", text: WELCOME_MESSAGE }],
        createdAt: new Date(),
      } as UIMessage])
    }
  }

  function handleReset() {
    setMessages([{
      id: "welcome-reset",
      role: "assistant",
      parts: [{ type: "text", text: WELCOME_MESSAGE }],
      createdAt: new Date(),
    } as UIMessage])
    setLocalInput("")
  }

  // Renderizar markdown simples (negrito)
  function renderMarkdown(text: string) {
    if (!text) return null
    return text.split(/\*\*(.*?)\*\*/g).map((part, i) => 
      i % 2 === 1 ? <strong key={i} className="font-semibold">{part}</strong> : part
    )
  }

  // Renderizar mensagem com suporte a tool invocations
  function renderMessage(message: UIMessage) {
    const textParts = message.parts?.filter(p => p.type === "text") || []
    const toolParts = message.parts?.filter(p => p.type === "tool-invocation") || []
    
    return (
      <>
        {textParts.map((part, i) => (
          <div key={i} className="whitespace-pre-wrap leading-relaxed">
            {renderMarkdown((part as { type: "text"; text: string }).text)}
          </div>
        ))}
        {toolParts.map((part, i) => {
          const toolInvocation = (part as { type: "tool-invocation"; toolInvocation: { toolName: string; state: string; result?: { message?: string; navigate?: string } } }).toolInvocation
          
          // Mostrar resultado da tool se disponível
          if (toolInvocation.state === "output-available" && toolInvocation.result) {
            if (toolInvocation.toolName === "navigate" && toolInvocation.result.navigate) {
              return (
                <div key={i} className="flex items-center gap-1.5 mt-2 pt-2 border-t border-current/10 text-[11px] opacity-80">
                  <Spinner className="w-3 h-3" />
                  Navegando...
                </div>
              )
            }
            if (toolInvocation.result.message) {
              return (
                <div key={i} className="mt-2 pt-2 border-t border-current/10">
                  <div className="whitespace-pre-wrap leading-relaxed">
                    {renderMarkdown(toolInvocation.result.message)}
                  </div>
                </div>
              )
            }
          }
          
          // Mostrar loading enquanto tool está executando
          if (toolInvocation.state === "input-available" || toolInvocation.state === "input-streaming") {
            return (
              <div key={i} className="flex items-center gap-1.5 mt-2 text-[11px] opacity-70">
                <Spinner className="w-3 h-3" />
                Processando...
              </div>
            )
          }
          
          return null
        })}
      </>
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
                      {isLoading ? "Pensando..." : "Assistente com IA"}
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
                            onClick={() => handleSendMessage(action.message)}
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
                            {renderMessage(message)}
                          </div>

                          {message.role === "user" && (
                            <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
                              <User className="w-3.5 h-3.5 text-muted-foreground" />
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {isLoading && messages[messages.length - 1]?.role === "user" && (
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
                          onClick={() => handleSendMessage(action.message)}
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
                      value={localInput}
                      onChange={(e) => setLocalInput(e.target.value)}
                      placeholder="Digite sua mensagem..."
                      disabled={isLoading}
                      className="flex-1 px-3.5 py-2.5 rounded-xl border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:opacity-50 placeholder:text-muted-foreground"
                    />
                    <Button 
                      type="submit" 
                      size="icon"
                      disabled={!localInput.trim() || isLoading}
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
