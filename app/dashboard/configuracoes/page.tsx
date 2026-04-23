import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { ConfiguracoesContent } from "@/components/configuracoes/configuracoes-content"

export default async function ConfiguracoesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  const { data: company } = await supabase
    .from("companies")
    .select("*")
    .eq("user_id", user.id)
    .single()

  return (
    <ConfiguracoesContent 
      user={user}
      profile={profile}
      company={company}
    />
  )
}
