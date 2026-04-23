import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CRMContent } from "@/components/crm/crm-content"

export default async function CRMPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: leads } = await supabase
    .from("leads")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return <CRMContent initialLeads={leads || []} userId={user.id} />
}
