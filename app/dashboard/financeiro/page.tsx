import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { FinanceiroContent } from "@/components/financeiro/financeiro-content"

export default async function FinanceiroPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: finances } = await supabase
    .from("finances")
    .select("*")
    .eq("user_id", user.id)
    .order("date", { ascending: false })

  return <FinanceiroContent initialFinances={finances || []} userId={user.id} />
}
