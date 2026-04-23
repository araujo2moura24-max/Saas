"use client"

import { useState, useEffect } from "react"
import { Instagram, AlertCircle, CheckCircle2, ExternalLink, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface InstagramModalProps {
  open: boolean
  onClose: () => void
  onConnect: (config: Record<string, string>) => void
}

export function InstagramModal({ open, onClose, onConnect }: InstagramModalProps) {
  const [step, setStep] = useState<"info" | "config" | "success">("info")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form fields
  const [accessToken, setAccessToken] = useState("")
  const [instagramAccountId, setInstagramAccountId] = useState("")
  const [username, setUsername] = useState("")

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      const timeout = setTimeout(() => {
        setStep("info")
        setLoading(false)
        setError(null)
        setAccessToken("")
        setInstagramAccountId("")
        setUsername("")
      }, 200)
      return () => clearTimeout(timeout)
    }
  }, [open])

  function handleClose() {
    onClose()
  }

  async function handleConnect() {
    if (!accessToken.trim() || !instagramAccountId.trim()) {
      setError("Preencha todos os campos obrigatorios.")
      return
    }

    setLoading(true)
    setError(null)

    // Simular validacao da API
    await new Promise(resolve => setTimeout(resolve, 1500))

    setLoading(false)
    setStep("success")

    // Salvar configuracao apos 1 segundo
    setTimeout(() => {
      onConnect({
        accessToken,
        instagramAccountId,
        username: username || "instagram_business",
      })
    }, 1500)
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10">
              <Instagram className="w-6 h-6 text-pink-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <DialogTitle>Instagram Profissional</DialogTitle>
                <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-warning/10 text-warning-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Beta
                </span>
              </div>
              <DialogDescription>
                {step === "info" && "Conecte sua conta profissional do Instagram"}
                {step === "config" && "Configure sua integracao"}
                {step === "success" && "Integracao configurada com sucesso!"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          {/* Step: Info */}
          <div className={step === "info" ? "space-y-4" : "hidden"}>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Funcionalidade em Beta</p>
                  <p className="text-sm text-muted-foreground">
                    Esta integracao esta em fase de testes. Algumas funcionalidades podem estar limitadas ou sofrer alteracoes.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-foreground">O que esta integracao faz:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>Centraliza mensagens diretas (DMs) do Instagram no OpsCore</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>Monitora comentarios e interacoes em suas publicacoes</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>Vincula contatos do Instagram aos seus leads no CRM</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>Permite respostas rapidas e automacoes basicas</span>
                </li>
              </ul>
            </div>

            <div className="bg-muted/50 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-muted-foreground mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Requisitos</p>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    <li>- Conta Instagram Profissional ou Creator</li>
                    <li>- Pagina do Facebook vinculada a conta</li>
                    <li>- Acesso ao Meta Business Suite</li>
                  </ul>
                </div>
              </div>
            </div>

            <a
              href="https://business.facebook.com/latest/inbox/instagram"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ExternalLink className="w-4 h-4" />
              Acessar Instagram no Meta Business Suite
            </a>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={handleClose} className="flex-1">
                Cancelar
              </Button>
              <Button onClick={() => setStep("config")} className="flex-1">
                Continuar
              </Button>
            </div>
          </div>

          {/* Step: Config */}
          <div className={step === "config" ? "space-y-4" : "hidden"}>
            {error && (
              <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-destructive shrink-0" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="ig-accessToken">Access Token *</Label>
                <Input
                  id="ig-accessToken"
                  type="password"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="IGQ......"
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Token de acesso da Instagram Graph API
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ig-instagramAccountId">Instagram Business Account ID *</Label>
                <Input
                  id="ig-instagramAccountId"
                  value={instagramAccountId}
                  onChange={(e) => setInstagramAccountId(e.target.value)}
                  placeholder="17841405822..."
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  ID da conta comercial do Instagram vinculada a sua pagina
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ig-username">Nome de usuario (@)</Label>
                <Input
                  id="ig-username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="@minhaempresa"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button variant="outline" onClick={() => setStep("info")} disabled={loading}>
                Voltar
              </Button>
              <Button onClick={handleConnect} disabled={loading} className="flex-1">
                {loading ? (
                  <span className="flex items-center gap-2">
                    <Spinner className="w-4 h-4" />
                    Conectando...
                  </span>
                ) : (
                  "Conectar"
                )}
              </Button>
            </div>
          </div>

          {/* Step: Success */}
          <div className={step === "success" ? "py-4 text-center space-y-4" : "hidden"}>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-pink-500" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">Instagram conectado!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Sua conta profissional do Instagram foi vinculada ao OpsCore.
                Voce ja pode gerenciar suas interacoes por aqui.
              </p>
            </div>
            <p className="text-xs text-muted-foreground">Fechando automaticamente...</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
