import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { OperacoesContent } from "@/components/operacoes/operacoes-content"

export default async function OperacoesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return <OperacoesContent initialTasks={tasks || []} userId={user.id} />
}
