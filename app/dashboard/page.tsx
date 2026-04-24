import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardContent } from "@/components/dashboard/dashboard-content"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Verificar se completou onboarding
  const { data: onboarding } = await supabase
    .from("onboarding")
    .select("completed")
    .eq("user_id", user.id)
    .single()

  // Se não existe registro de onboarding ou não está completo, redireciona
  if (!onboarding || onboarding.completed !== true) {
    redirect("/onboarding")
  }

  // Buscar dados para o dashboard
  const [leadsRes, tasksRes, financesRes] = await Promise.all([
    supabase.from("leads").select("id, status, created_at").eq("user_id", user.id),
    supabase.from("tasks").select("id, status, priority, created_at").eq("user_id", user.id),
    supabase.from("finances").select("id, type, amount, date").eq("user_id", user.id),
  ])

  const leads = leadsRes.data || []
  const tasks = tasksRes.data || []
  const finances = financesRes.data || []

  // Calcular métricas
  const totalLeads = leads.length
  const newLeads = leads.filter(l => l.status === "new").length
  const pendingTasks = tasks.filter(t => t.status === "pending").length
  const completedTasks = tasks.filter(t => t.status === "completed").length
  
  const income = finances
    .filter(f => f.type === "income")
    .reduce((sum, f) => sum + (f.amount || 0), 0)
  const expenses = finances
    .filter(f => f.type === "expense")
    .reduce((sum, f) => sum + (f.amount || 0), 0)
  const balance = income - expenses

  return (
    <DashboardContent
      metrics={{
        totalLeads,
        newLeads,
        pendingTasks,
        completedTasks,
        income,
        expenses,
        balance,
      }}
      recentLeads={leads.slice(0, 5)}
      recentTasks={tasks.slice(0, 5)}
    />
  )
}
