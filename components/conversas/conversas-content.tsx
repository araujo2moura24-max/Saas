"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { 
  Search, Send, Phone, MoreVertical, Check, CheckCheck, 
  MessageCircle, Plug, ArrowLeft, RefreshCw
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useRouter } from "next/navigation"
import useSWR from "swr"

interface Conversation {
  id: string
  contact_phone: string
  contact_name: string
  last_message: string | null
  last_message_at: string | null
  unread_count: number
  channel: string
}

interface Message {
  id: string
  direction: "incoming" | "outgoing"
  content: string
  message_type: string
  status: string
  created_at: string
}

const fetcher = (url: string) => fetch(url).then(res => res.json())

// Dados de demonstracao
const DEMO_CONVERSATIONS: Conversation[] = [
  {
    id: "demo-1",
    contact_phone: "5511999887766",
    contact_name: "Maria Silva",
    last_message: "Ola, gostaria de saber mais sobre os servicos",
    last_message_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    unread_count: 2,
    channel: "whatsapp",
  },
  {
    id: "demo-2",
    contact_phone: "5511988776655",
    contact_name: "Joao Santos",
    last_message: "Obrigado pelo atendimento!",
    last_message_at: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    unread_count: 0,
    channel: "whatsapp",
  },
  {
    id: "demo-3",
    contact_phone: "5511977665544",
    contact_name: "Ana Costa",
    last_message: "Qual o horario de funcionamento?",
    last_message_at: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    unread_count: 1,
    channel: "whatsapp",
  },
]

const DEMO_MESSAGES: Record<string, Message[]> = {
  "demo-1": [
    { id: "m1", direction: "incoming", content: "Ola, bom dia!", message_type: "text", status: "received", created_at: new Date(Date.now() - 1000 * 60 * 10).toISOString() },
    { id: "m2", direction: "outgoing", content: "Ola! Bom dia, como posso ajudar?", message_type: "text", status: "read", created_at: new Date(Date.now() - 1000 * 60 * 9).toISOString() },
    { id: "m3", direction: "incoming", content: "Gostaria de saber mais sobre os servicos", message_type: "text", status: "received", created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
  ],
  "demo-2": [
    { id: "m4", direction: "incoming", content: "Boa tarde!", message_type: "text", status: "received", created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
    { id: "m5", direction: "outgoing", content: "Boa tarde! Em que posso ajudar?", message_type: "text", status: "read", created_at: new Date(Date.now() - 1000 * 60 * 55).toISOString() },
    { id: "m6", direction: "incoming", content: "Preciso de um orcamento", message_type: "text", status: "received", created_at: new Date(Date.now() - 1000 * 60 * 50).toISOString() },
    { id: "m7", direction: "outgoing", content: "Claro! Vou preparar e enviar para voce", message_type: "text", status: "read", created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString() },
    { id: "m8", direction: "incoming", content: "Obrigado pelo atendimento!", message_type: "text", status: "received", created_at: new Date(Date.now() - 1000 * 60 * 30).toISOString() },
  ],
  "demo-3": [
    { id: "m9", direction: "incoming", content: "Qual o horario de funcionamento?", message_type: "text", status: "received", created_at: new Date(Date.now() - 1000 * 60 * 60).toISOString() },
  ],
}

export function ConversasContent({ userId }: { userId: string }) {
  const router = useRouter()
  const [isDemo, setIsDemo] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [sending, setSending] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  // Verificar conexao WhatsApp
  const { data: whatsappStatus, isLoading: loadingStatus } = useSWR("/api/whatsapp/connect", fetcher)
  const isConnected = whatsappStatus?.connected || isDemo

  // Buscar conversas
  const { data: conversationsData, mutate: mutateConversations } = useSWR(
    isConnected && !isDemo ? "/api/conversations" : null,
    fetcher,
    { refreshInterval: 10000 }
  )

  const conversations: Conversation[] = isDemo 
    ? DEMO_CONVERSATIONS 
    : (conversationsData?.conversations || [])

  // Filtrar conversas pela busca
  const filteredConversations = conversations.filter(c =>
    c.contact_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.contact_phone.includes(searchTerm)
  )

  // Carregar mensagens quando selecionar conversa
  const loadMessages = useCallback(async (conversationId: string) => {
    if (isDemo) {
      setMessages(DEMO_MESSAGES[conversationId] || [])
      return
    }

    setLoadingMessages(true)
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`)
      const data = await res.json()
      setMessages(data.messages || [])
    } catch (error) {
      console.error("Error loading messages:", error)
    }
    setLoadingMessages(false)
  }, [isDemo])

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.id)
    }
  }, [selectedConversation, loadMessages])

  // Scroll para ultima mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Enviar mensagem
  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return

    const messageText = newMessage.trim()
    setNewMessage("")
    setSending(true)

    if (isDemo) {
      // Modo demo - simular envio
      const newMsg: Message = {
        id: `demo-${Date.now()}`,
        direction: "outgoing",
        content: messageText,
        message_type: "text",
        status: "sent",
        created_at: new Date().toISOString(),
      }
      setMessages(prev => [...prev, newMsg])

      // Simular resposta automatica apos 2 segundos
      setTimeout(() => {
        const autoReply: Message = {
          id: `demo-reply-${Date.now()}`,
          direction: "incoming",
          content: "Obrigado pela mensagem! Em breve retornaremos.",
          message_type: "text",
          status: "received",
          created_at: new Date().toISOString(),
        }
        setMessages(prev => [...prev, autoReply])
      }, 2000)

      setSending(false)
      return
    }

    try {
      const res = await fetch("/api/whatsapp/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          message: messageText,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        if (data.message) {
          setMessages(prev => [...prev, data.message])
        }
        mutateConversations()
      }
    } catch (error) {
      console.error("Error sending message:", error)
    }
    setSending(false)
  }

  // Formatar hora
  function formatTime(dateString: string | null) {
    if (!dateString) return ""
    const date = new Date(dateString)
    return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
  }

  // Formatar data para lista
  function formatListTime(dateString: string | null) {
    if (!dateString) return ""
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const diffDays = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (diffDays === 0) {
      return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })
    } else if (diffDays === 1) {
      return "Ontem"
    } else if (diffDays < 7) {
      return date.toLocaleDateString("pt-BR", { weekday: "short" })
    }
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" })
  }

  // Formatar data para separador
  function formatDate(dateString: string) {
    const date = new Date(dateString)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return "Hoje"
    } else if (date.toDateString() === yesterday.toDateString()) {
      return "Ontem"
    }
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" })
  }

  // Iniciais do nome
  function getInitials(name: string): string {
    return name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2)
  }

  // Icone de status da mensagem
  function MessageStatus({ status }: { status: string }) {
    if (status === "sent") return <Check className="w-3.5 h-3.5 text-primary-foreground/70" />
    if (status === "delivered") return <CheckCheck className="w-3.5 h-3.5 text-primary-foreground/70" />
    if (status === "read") return <CheckCheck className="w-3.5 h-3.5 text-primary-foreground" />
    return null
  }

  // Loading state
  if (loadingStatus) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <RefreshCw className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  // Tela de nao conectado
  if (!isConnected) {
    return (
      <div className="h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center max-w-md px-4">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
            <MessageCircle className="w-8 h-8 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Central de Conversas</h2>
          <p className="text-muted-foreground mb-6">
            Conecte seu WhatsApp Business para centralizar todas as suas conversas aqui no OpsCore.
          </p>
          <div className="space-y-3">
            <Button className="w-full gap-2" onClick={() => router.push("/dashboard/integracoes")}>
              <Plug className="w-4 h-4" />
              Conectar WhatsApp Business
            </Button>
            <Button variant="outline" className="w-full" onClick={() => setIsDemo(true)}>
              Usar modo demonstracao
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-4rem)] flex bg-background">
      {/* Lista de conversas */}
      <div className={`w-full md:w-96 border-r border-border flex flex-col bg-card ${selectedConversation ? "hidden md:flex" : "flex"}`}>
        {/* Header da lista */}
        <div className="p-4 border-b border-border">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold">Conversas</h1>
            <div className="flex items-center gap-2">
              {isDemo && (
                <span className="text-xs px-2 py-1 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400">
                  Demo
                </span>
              )}
              {!isDemo && (
                <Button variant="ghost" size="icon" onClick={() => mutateConversations()}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar conversa..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Lista de conversas */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Nenhuma conversa encontrada</p>
            </div>
          ) : (
            filteredConversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full p-3 flex items-start gap-3 hover:bg-muted/50 transition-colors border-b border-border ${
                  selectedConversation?.id === conv.id ? "bg-muted" : ""
                }`}
              >
                <Avatar className="w-12 h-12 shrink-0">
                  <AvatarFallback className="bg-primary/10 text-primary font-medium">
                    {getInitials(conv.contact_name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium truncate">{conv.contact_name}</span>
                    <span className="text-xs text-muted-foreground flex-shrink-0">
                      {formatListTime(conv.last_message_at)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground truncate pr-2">
                      {conv.last_message || "Sem mensagens"}
                    </p>
                    {conv.unread_count > 0 && (
                      <span className="flex-shrink-0 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-medium">
                        {conv.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Area do chat */}
      <div className={`flex-1 flex flex-col ${selectedConversation ? "flex" : "hidden md:flex"}`}>
        {selectedConversation ? (
          <>
            {/* Header do chat */}
            <div className="p-4 border-b border-border flex items-center gap-3 bg-card">
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setSelectedConversation(null)}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-primary/10 text-primary font-medium">
                  {getInitials(selectedConversation.contact_name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <h2 className="font-medium truncate">{selectedConversation.contact_name}</h2>
                <p className="text-xs text-muted-foreground">
                  +{selectedConversation.contact_phone.replace(/(\d{2})(\d{2})(\d{5})(\d{4})/, "$1 ($2) $3-$4")}
                </p>
              </div>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <Phone className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="text-muted-foreground">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>

            {/* Mensagens */}
            <div 
              className="flex-1 overflow-y-auto p-4 space-y-2"
              style={{ 
                backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
              }}
            >
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full">
                  <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
                </div>
              ) : messages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  <div className="text-center">
                    <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>Nenhuma mensagem ainda</p>
                  </div>
                </div>
              ) : (
                <>
                  {messages.map((message, index) => {
                    const showDate = index === 0 || 
                      formatDate(message.created_at) !== formatDate(messages[index - 1].created_at)

                    return (
                      <div key={message.id}>
                        {showDate && (
                          <div className="flex justify-center my-4">
                            <span className="text-xs bg-muted px-3 py-1 rounded-full text-muted-foreground">
                              {formatDate(message.created_at)}
                            </span>
                          </div>
                        )}
                        <div className={`flex ${message.direction === "outgoing" ? "justify-end" : "justify-start"}`}>
                          <div
                            className={`max-w-[75%] rounded-lg px-3 py-2 ${
                              message.direction === "outgoing"
                                ? "bg-primary text-primary-foreground rounded-br-none"
                                : "bg-card border border-border rounded-bl-none"
                            }`}
                          >
                            <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                            <div className={`flex items-center justify-end gap-1 mt-1 ${
                              message.direction === "outgoing" ? "text-primary-foreground/70" : "text-muted-foreground"
                            }`}>
                              <span className="text-[10px]">{formatTime(message.created_at)}</span>
                              {message.direction === "outgoing" && <MessageStatus status={message.status} />}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  <div ref={messagesEndRef} />
                </>
              )}
            </div>

            {/* Input de mensagem */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-border bg-card">
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Digite uma mensagem..."
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  className="flex-1"
                  disabled={sending}
                />
                <Button type="submit" size="icon" disabled={!newMessage.trim() || sending}>
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </form>
          </>
        ) : (
          // Nenhuma conversa selecionada
          <div className="flex-1 flex items-center justify-center bg-muted/30">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <MessageCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-lg font-medium mb-1">OpsCore Conversas</h2>
              <p className="text-sm text-muted-foreground">
                Selecione uma conversa para comecar
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
