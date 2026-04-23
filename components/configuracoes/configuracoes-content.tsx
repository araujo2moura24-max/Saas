"use client"

import { useState } from "react"
import { User as UserIcon, Building2, Mail, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"

interface Profile {
  id: string
  full_name: string | null
}

interface Company {
  id: string
  name: string
  segment: string | null
}

interface ConfiguracoesContentProps {
  user: User
  profile: Profile | null
  company: Company | null
}

export function ConfiguracoesContent({ user, profile, company }: ConfiguracoesContentProps) {
  const [fullName, setFullName] = useState(profile?.full_name || user.user_metadata?.full_name || "")
  const [companyName, setCompanyName] = useState(company?.name || "")
  const [segment, setSegment] = useState(company?.segment || "")
  const [loading, setLoading] = useState(false)
  const [saved, setSaved] = useState(false)

  async function handleSave() {
    setLoading(true)
    setSaved(false)

    const supabase = createClient()

    // Update profile
    await supabase.from("profiles").upsert({
      id: user.id,
      full_name: fullName,
    }, { onConflict: "id" })

    // Update or create company
    if (company) {
      await supabase.from("companies").update({
        name: companyName,
        segment: segment || null,
      }).eq("id", company.id)
    } else if (companyName) {
      await supabase.from("companies").insert({
        user_id: user.id,
        name: companyName,
        segment: segment || null,
      })
    }

    // Update auth metadata
    await supabase.auth.updateUser({
      data: { full_name: fullName }
    })

    setLoading(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Configuracoes</h1>
        <p className="text-muted-foreground">Gerencie suas informacoes pessoais e da empresa</p>
      </div>

      {/* Profile section */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <UserIcon className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-card-foreground">Perfil</h2>
            <p className="text-sm text-muted-foreground">Suas informacoes pessoais</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fullName">Nome completo</Label>
            <Input
              id="fullName"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Seu nome"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="email"
                value={user.email || ""}
                disabled
                className="pl-10 bg-muted"
              />
            </div>
            <p className="text-xs text-muted-foreground">O email nao pode ser alterado</p>
          </div>
        </div>
      </div>

      {/* Company section */}
      <div className="bg-card border border-border rounded-xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-card-foreground">Empresa</h2>
            <p className="text-sm text-muted-foreground">Informacoes do seu negocio</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Nome da empresa</Label>
            <Input
              id="companyName"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="Minha Empresa Ltda"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="segment">Segmento</Label>
            <Input
              id="segment"
              value={segment}
              onChange={(e) => setSegment(e.target.value)}
              placeholder="Ex: Tecnologia, Servicos, Varejo"
            />
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="flex items-center gap-4">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? (
            <>
              <Spinner className="mr-2" />
              Salvando...
            </>
          ) : saved ? (
            <>
              <Check className="w-4 h-4 mr-2" />
              Salvo!
            </>
          ) : (
            "Salvar alteracoes"
          )}
        </Button>
        {saved && (
          <span className="text-sm text-success">Alteracoes salvas com sucesso</span>
        )}
      </div>
    </div>
  )
}
