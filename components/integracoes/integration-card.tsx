"use client"

import { Check, Clock, Plug, PlugZap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Integration } from "./integracoes-content"
import { getIntegrationIcon } from "./integracoes-content"

interface IntegrationCardProps {
  integration: Integration
  onConnect: () => void
  onDisconnect: () => void
}

const STATUS_CONFIG = {
  available: {
    label: "Disponivel",
    color: "bg-muted text-muted-foreground",
    icon: Plug,
  },
  connected: {
    label: "Conectado",
    color: "bg-success/10 text-success",
    icon: Check,
  },
  beta: {
    label: "Beta",
    color: "bg-warning/10 text-warning-foreground",
    icon: Clock,
  },
  coming_soon: {
    label: "Em breve",
    color: "bg-muted text-muted-foreground",
    icon: Clock,
  },
}

export function IntegrationCard({ integration, onConnect, onDisconnect }: IntegrationCardProps) {
  const statusConfig = STATUS_CONFIG[integration.status]
  const StatusIcon = statusConfig.icon
  const IntegrationIcon = getIntegrationIcon(integration.iconName)

  const formattedDate = integration.connectedAt
    ? new Date(integration.connectedAt).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      })
    : null

  return (
    <Card className="relative overflow-hidden hover:shadow-md transition-shadow">
      {/* Status badge */}
      <div className={`absolute top-3 right-3 flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${statusConfig.color}`}>
        <StatusIcon className="w-3 h-3" />
        {statusConfig.label}
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          <div className={`p-2 rounded-lg ${integration.status === "connected" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
            <IntegrationIcon className="w-6 h-6" />
          </div>
          <div className="flex-1 min-w-0 pr-16">
            <CardTitle className="text-base">{integration.name}</CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <CardDescription className="text-sm line-clamp-2">
          {integration.description}
        </CardDescription>

        {integration.status === "connected" && formattedDate && (
          <p className="text-xs text-muted-foreground">
            Conectado em {formattedDate}
          </p>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          {integration.status === "connected" ? (
            <>
              <Button variant="outline" size="sm" className="flex-1" disabled>
                <Check className="w-4 h-4 mr-2" />
                Configurado
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={onDisconnect}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                Desconectar
              </Button>
            </>
          ) : integration.status === "coming_soon" ? (
            <Button variant="outline" size="sm" className="flex-1" disabled>
              <Clock className="w-4 h-4 mr-2" />
              Em breve
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              className="flex-1"
              onClick={onConnect}
            >
              <PlugZap className="w-4 h-4 mr-2" />
              Conectar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
