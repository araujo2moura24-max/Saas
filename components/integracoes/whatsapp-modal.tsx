"use client"

import { useState, useEffect } from "react"
import { MessageSquare, AlertCircle, CheckCircle2, ExternalLink } from "lucide-react"
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

interface WhatsAppModalProps {
  open: boolean
  onClose: () => void
  onConnect: (config: Record<string, string>) => void
}

export function WhatsAppModal({ open, onClose, onConnect }: WhatsAppModalProps) {
  const [step, setStep] = useState<"info" | "config" | "success">("info")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Form fields
  const [accessToken, setAccessToken] = useState("")
  const [phoneNumberId, setPhoneNumberId] = useState("")
  const [businessAccountId, setBusinessAccountId] = useState("")
  const [accountName, setAccountName] = useState("")
  const [phoneNumber, setPhoneNumber] = useState("")

  // Reset form when modal closes
  useEffect(() => {
    if (!open) {
      // Delay reset to allow animation to complete
      const timeout = setTimeout(() => {
        setStep("info")
        setLoading(false)
        setError(null)
        setAccessToken("")
        setPhoneNumberId("")
        setBusinessAccountId("")
        setAccountName("")
        setPhoneNumber("")
      }, 200)
      return () => clearTimeout(timeout)
    }
  }, [open])

  function handleClose() {
    onClose()
  }

  async function handleConnect() {
    if (!accessToken.trim() || !phoneNumberId.trim() || !businessAccountId.trim()) {
      setError("Preencha todos os campos obrigatorios.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/whatsapp/connect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accessToken,
          phoneNumberId,
          businessAccountId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Erro ao conectar. Verifique suas credenciais.")
        setLoading(false)
        return
      }

      setLoading(false)
      setStep("success")

      // Salvar configuracao apos 1.5 segundos
      setTimeout(() => {
        onConnect({
          accessToken,
          phoneNumberId,
          businessAccountId,
          accountName: accountName || "WhatsApp Business",
          phoneNumber: data.integration?.phoneNumber || phoneNumber || phoneNumberId,
        })
      }, 1500)
    } catch (err) {
      setError("Erro de conexao. Tente novamente.")
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-500/10">
              <MessageSquare className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <DialogTitle>WhatsApp Business</DialogTitle>
              <DialogDescription>
                {step === "info" && "Conecte seu WhatsApp Business ao OpsCore"}
                {step === "config" && "Configure sua integracao"}
                {step === "success" && "Integracao configurada com sucesso!"}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="py-4">
          {/* Step: Info */}
          <div className={step === "info" ? "space-y-4" : "hidden"}>
            <div className="bg-muted/50 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-foreground">O que esta integracao faz:</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>Centraliza todas as conversas do WhatsApp Business no OpsCore</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>Permite enviar notificacoes automaticas para clientes</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>Vincula conversas aos leads do seu CRM</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  <span>Suporta templates de mensagem e automacoes</span>
                </li>
              </ul>
            </div>

            <div className="bg-amber-500/10 border border-amber-500/20 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-amber-600 mt-0.5 shrink-0" />
                <div className="space-y-1">
                  <p className="text-sm font-medium text-foreground">Requisitos</p>
                  <p className="text-sm text-muted-foreground">
                    Voce precisa de uma conta no Meta Business Suite e acesso a API do WhatsApp Business.
                    Nao e possivel conectar WhatsApp pessoal.
                  </p>
                </div>
              </div>
            </div>

            <a
              href="https://business.facebook.com/latest/whatsapp_manager"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-primary hover:underline"
            >
              <ExternalLink className="w-4 h-4" />
              Acessar Meta Business Suite
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
                <Label htmlFor="wa-accessToken">Access Token *</Label>
                <Input
                  id="wa-accessToken"
                  type="password"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                  placeholder="EAAGm0PX4ZCpsBALWU..."
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  Token de acesso permanente do sistema do Meta Business
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="wa-phoneNumberId">Phone Number ID *</Label>
                <Input
                  id="wa-phoneNumberId"
                  value={phoneNumberId}
                  onChange={(e) => setPhoneNumberId(e.target.value)}
                  placeholder="106540352789..."
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  ID do numero de telefone no WhatsApp Business
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="wa-businessAccountId">Business Account ID *</Label>
                <Input
                  id="wa-businessAccountId"
                  value={businessAccountId}
                  onChange={(e) => setBusinessAccountId(e.target.value)}
                  placeholder="102938475..."
                  disabled={loading}
                />
                <p className="text-xs text-muted-foreground">
                  ID da conta comercial no Meta Business Suite
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="wa-accountName">Nome da conta</Label>
                  <Input
                    id="wa-accountName"
                    value={accountName}
                    onChange={(e) => setAccountName(e.target.value)}
                    placeholder="Minha Empresa"
                    disabled={loading}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="wa-phoneNumber">Numero conectado</Label>
                  <Input
                    id="wa-phoneNumber"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="+55 11 99999-9999"
                    disabled={loading}
                  />
                </div>
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
            <div className="w-16 h-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <div>
              <h3 className="font-semibold text-lg text-foreground">WhatsApp Business conectado!</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Sua integracao foi configurada com sucesso. Voce ja pode receber e enviar mensagens pelo OpsCore.
              </p>
            </div>
            <p className="text-xs text-muted-foreground">Fechando automaticamente...</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
