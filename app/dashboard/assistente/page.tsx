"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Bot, Send, User, Sparkles, ArrowRight, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  navigate?: string
}

const QUICK_ACTIONS = [
  { label: "Como adicionar um lead?", icon: "crm" },
  { label: "Criar uma tarefa", icon: "task" },
  { label: "Registrar uma receita", icon: "finance" },
  { label: "Abrir CRM", icon: "navigate" },
  { label: "Conectar WhatsApp", icon: "integration" },
  { label: "Ver integracoes", icon: "integration" },
]

const SHORTCUT_LINKS = [
  { label: "CRM", href: "/dashboard/crm" },
  { label: "Tarefas", href: "/dashboard/operacoes" },
  { label: "Financeiro", href: "/dashboard/financeiro" },
  { label: "Integracoes", href: "/dashboard/integracoes" },
]

export default function AssistentePage() {
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  async function sendMessage(text: string) {
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

      if (!response.ok) throw new Error("Erro na resposta")

      const data = await response.json()
      
      const assistantMessage: Message = {
        id: data.id || crypto.randomUUID(),
        role: "assistant",
        content: data.content,
        navigate: data.navigate,
      }

      setMessages(prev => [...prev, assistantMessage])

      // Executar navegacao se houver comando
      if (data.navigate) {
        setTimeout(() => {
          router.push(data.navigate)
        }, 1500)
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
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    sendMessage(input)
  }

  function handleQuickAction(question: string) {
    sendMessage(question)
  }

  function clearChat() {
    setMessages([])
  }

  return (
    <div className="flex flex-col h-[calc(100vh-7rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Assistente IA</h1>
          <p className="text-muted-foreground">Converse com o OpsBot para obter ajuda e navegar na plataforma</p>
        </div>
        {messages.length > 0 && (
          <Button variant="outline" size="sm" onClick={clearChat}>
            <Trash2 className="w-4 h-4 mr-2" />
            Limpar
          </Button>
        )}
      </div>

      {/* Chat container */}
      <div className="flex-1 flex flex-col bg-card border border-border rounded-xl overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center px-4">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Sparkles className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg font-semibold text-card-foreground mb-2">
                Ola! Sou o OpsBot
              </h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Posso ajudar voce a navegar, gerenciar leads, tarefas, financas e configurar integracoes.
                Experimente dizer &quot;abrir CRM&quot; ou pergunte sobre qualquer modulo!
              </p>
              
              {/* Quick actions */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 w-full max-w-2xl">
                {QUICK_ACTIONS.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => handleQuickAction(action.label)}
                    className="flex items-center gap-2 px-4 py-3 bg-muted/50 hover:bg-muted rounded-lg text-sm text-left transition-colors"
                  >
                    <ArrowRight className="w-4 h-4 text-primary shrink-0" />
                    <span className="text-foreground">{action.label}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === "user" ? "justify-end" : ""}`}
                >
                  {message.role === "assistant" && (
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-primary-foreground" />
                    </div>
                  )}
                  
                  <div
                    className={`max-w-[80%] rounded-xl px-4 py-3 ${
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground"
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content.split(/\*\*(.*?)\*\*/g).map((part, i) => 
                        i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                      )}
                    </p>
                    {message.navigate && (
                      <p className="text-xs mt-2 opacity-70">
                        Navegando em 1.5 segundos...
                      </p>
                    )}
                  </div>

                  {message.role === "user" && (
                    <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center shrink-0">
                      <User className="w-4 h-4 text-muted-foreground" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shrink-0">
                    <Bot className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <div className="bg-muted rounded-xl px-4 py-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Spinner className="w-4 h-4" />
                      Pensando...
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Input */}
        <div className="border-t border-border p-4">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua mensagem ou comando (ex: abrir CRM)..."
              disabled={isLoading}
              className="flex-1 px-4 py-2 rounded-lg border border-input bg-background text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            />
            <Button type="submit" disabled={!input.trim() || isLoading}>
              {isLoading ? <Spinner className="w-4 h-4" /> : <Send className="w-4 h-4" />}
            </Button>
          </form>
          
          {/* Shortcuts */}
          <div className="flex flex-wrap gap-2 mt-3">
            {SHORTCUT_LINKS.map((link) => (
              <Button
                key={link.label}
                variant="ghost"
                size="sm"
                className="text-xs h-7"
                onClick={() => router.push(link.href)}
              >
                Ir para {link.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
