import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { IntegracoesContent } from "@/components/integracoes/integracoes-content"

export default async function IntegracoesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return <IntegracoesContent userId={user.id} />
}
