"use client"

import { useState, useEffect } from "react"
import { Search, Filter, MessageSquare, Zap, Calendar, CreditCard, Users, BarChart3, Instagram, type LucideIcon } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { IntegrationCard } from "./integration-card"
import { WhatsAppModal } from "./whatsapp-modal"
import { InstagramModal } from "./instagram-modal"

export interface Integration {
  id: string
  name: string
  description: string
  category: "comunicacao" | "crm" | "produtividade" | "financeiro" | "analytics"
  iconName: string
  status: "available" | "connected" | "beta" | "coming_soon"
  connectedAt?: string
  config?: Record<string, string>
}

const CATEGORY_LABELS: Record<string, string> = {
  comunicacao: "Comunicacao",
  crm: "CRM & Vendas",
  produtividade: "Produtividade",
  financeiro: "Financeiro",
  analytics: "Analytics",
}

// Mapeamento de nomes de icones para componentes
const ICON_MAP: Record<string, LucideIcon> = {
  "message-square": MessageSquare,
  "instagram": Instagram,
  "users": Users,
  "zap": Zap,
  "calendar": Calendar,
  "credit-card": CreditCard,
  "bar-chart": BarChart3,
}

const INITIAL_INTEGRATIONS: Integration[] = [
  {
    id: "whatsapp-business",
    name: "WhatsApp Business",
    description: "Conecte seu WhatsApp Business para centralizar conversas, notificacoes e automacoes no OpsCore.",
    category: "comunicacao",
    iconName: "message-square",
    status: "available",
  },
  {
    id: "instagram-professional",
    name: "Instagram Profissional",
    description: "Conecte sua conta profissional do Instagram para centralizar interacoes, atendimento e automacoes.",
    category: "comunicacao",
    iconName: "instagram",
    status: "beta",
  },
  {
    id: "hubspot",
    name: "HubSpot",
    description: "Sincronize contatos e negocios entre OpsCore e HubSpot para gestao unificada de clientes.",
    category: "crm",
    iconName: "users",
    status: "coming_soon",
  },
  {
    id: "slack",
    name: "Slack",
    description: "Receba notificacoes importantes e interaja com o OpsCore direto pelo Slack.",
    category: "produtividade",
    iconName: "zap",
    status: "coming_soon",
  },
  {
    id: "google-calendar",
    name: "Google Calendar",
    description: "Sincronize tarefas e compromissos entre o OpsCore e seu Google Calendar.",
    category: "produtividade",
    iconName: "calendar",
    status: "coming_soon",
  },
  {
    id: "stripe",
    name: "Stripe",
    description: "Conecte sua conta Stripe para sincronizar pagamentos e transacoes automaticamente.",
    category: "financeiro",
    iconName: "credit-card",
    status: "coming_soon",
  },
  {
    id: "google-analytics",
    name: "Google Analytics",
    description: "Visualize metricas do seu site diretamente no dashboard do OpsCore.",
    category: "analytics",
    iconName: "bar-chart",
    status: "coming_soon",
  },
]

// Funcao helper para obter o componente de icone
export function getIntegrationIcon(iconName: string): LucideIcon {
  return ICON_MAP[iconName] || MessageSquare
}

interface IntegracoesContentProps {
  userId: string
}

export function IntegracoesContent({ userId }: IntegracoesContentProps) {
  const [integrations, setIntegrations] = useState<Integration[]>(INITIAL_INTEGRATIONS)
  const [search, setSearch] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [whatsappModalOpen, setWhatsappModalOpen] = useState(false)
  const [instagramModalOpen, setInstagramModalOpen] = useState(false)

  // Carregar estado das integracoes do localStorage
  useEffect(() => {
    const saved = localStorage.getItem(`integrations_${userId}`)
    if (saved) {
      try {
        const savedData = JSON.parse(saved)
        setIntegrations(prev => prev.map(int => {
          const savedInt = savedData.find((s: Integration) => s.id === int.id)
          if (savedInt) {
            return { ...int, status: savedInt.status, connectedAt: savedInt.connectedAt, config: savedInt.config }
          }
          return int
        }))
      } catch {
        // Ignorar erro de parse
      }
    }
  }, [userId])

  // Salvar estado das integracoes
  function saveIntegrations(updated: Integration[]) {
    setIntegrations(updated)
    localStorage.setItem(`integrations_${userId}`, JSON.stringify(
      updated.map(i => ({ id: i.id, status: i.status, connectedAt: i.connectedAt, config: i.config }))
    ))
  }

  function handleConnect(integrationId: string) {
    if (integrationId === "whatsapp-business") {
      setWhatsappModalOpen(true)
    } else if (integrationId === "instagram-professional") {
      setInstagramModalOpen(true)
    }
  }

  function handleDisconnect(integrationId: string) {
    const updated = integrations.map(int => {
      if (int.id === integrationId) {
        return { ...int, status: int.id === "instagram-professional" ? "beta" : "available" as const, connectedAt: undefined, config: undefined }
      }
      return int
    })
    saveIntegrations(updated)
  }

  function handleWhatsAppConnect(config: Record<string, string>) {
    const updated = integrations.map(int => {
      if (int.id === "whatsapp-business") {
        return { ...int, status: "connected" as const, connectedAt: new Date().toISOString(), config }
      }
      return int
    })
    saveIntegrations(updated)
    setWhatsappModalOpen(false)
  }

  function handleInstagramConnect(config: Record<string, string>) {
    const updated = integrations.map(int => {
      if (int.id === "instagram-professional") {
        return { ...int, status: "connected" as const, connectedAt: new Date().toISOString(), config }
      }
      return int
    })
    saveIntegrations(updated)
    setInstagramModalOpen(false)
  }

  // Filtrar integracoes
  const filtered = integrations.filter(int => {
    const matchesSearch = int.name.toLowerCase().includes(search.toLowerCase()) ||
                         int.description.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = filterStatus === "all" || 
                         (filterStatus === "connected" && int.status === "connected") ||
                         (filterStatus === "available" && (int.status === "available" || int.status === "beta"))
    return matchesSearch && matchesStatus
  })

  // Agrupar por categoria
  const grouped = filtered.reduce((acc, int) => {
    if (!acc[int.category]) {
      acc[int.category] = []
    }
    acc[int.category].push(int)
    return acc
  }, {} as Record<string, Integration[]>)

  const connectedCount = integrations.filter(i => i.status === "connected").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Central de Integracoes</h1>
          <p className="text-muted-foreground">
            Conecte suas ferramentas favoritas ao OpsCore
            {connectedCount > 0 && (
              <span className="ml-2 text-primary font-medium">
                ({connectedCount} {connectedCount === 1 ? "conectada" : "conectadas"})
              </span>
            )}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar integracoes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={filterStatus === "all" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("all")}
          >
            <Filter className="w-4 h-4 mr-2" />
            Todas
          </Button>
          <Button
            variant={filterStatus === "connected" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("connected")}
          >
            Conectadas
          </Button>
          <Button
            variant={filterStatus === "available" ? "default" : "outline"}
            size="sm"
            onClick={() => setFilterStatus("available")}
          >
            Disponiveis
          </Button>
        </div>
      </div>

      {/* Integrations by category */}
      <div className="space-y-8">
        {Object.entries(grouped).map(([category, items]) => (
          <div key={category}>
            <h2 className="text-lg font-semibold text-foreground mb-4">
              {CATEGORY_LABELS[category] || category}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {items.map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onConnect={() => handleConnect(integration.id)}
                  onDisconnect={() => handleDisconnect(integration.id)}
                />
              ))}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Nenhuma integracao encontrada.</p>
          </div>
        )}
      </div>

      {/* Modals */}
      <WhatsAppModal
        open={whatsappModalOpen}
        onClose={() => setWhatsappModalOpen(false)}
        onConnect={handleWhatsAppConnect}
      />
      <InstagramModal
        open={instagramModalOpen}
        onClose={() => setInstagramModalOpen(false)}
        onConnect={handleInstagramConnect}
      />
    </div>
  )
}
