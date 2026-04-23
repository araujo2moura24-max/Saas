"use client"

import Link from "next/link"
import { Users, ListTodo, TrendingUp, TrendingDown, Wallet, ArrowRight, Plus, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DashboardContentProps {
  metrics: {
    totalLeads: number
    newLeads: number
    pendingTasks: number
    completedTasks: number
    income: number
    expenses: number
    balance: number
  }
  recentLeads: Array<{ id: string; status: string; created_at: string }>
  recentTasks: Array<{ id: string; status: string; priority: string; created_at: string }>
}

export function DashboardContent({ metrics, recentLeads, recentTasks }: DashboardContentProps) {
  const hasData = metrics.totalLeads > 0 || metrics.pendingTasks > 0 || metrics.income > 0

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Visao geral do seu negocio</p>
        </div>
      </div>

      {/* Metrics cards */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total de Leads"
          value={metrics.totalLeads}
          subtitle={`${metrics.newLeads} novos`}
          icon={Users}
          href="/dashboard/crm"
        />
        <MetricCard
          title="Tarefas Pendentes"
          value={metrics.pendingTasks}
          subtitle={`${metrics.completedTasks} concluidas`}
          icon={ListTodo}
          href="/dashboard/operacoes"
        />
        <MetricCard
          title="Receitas"
          value={formatCurrency(metrics.income)}
          subtitle="Este mes"
          icon={TrendingUp}
          iconColor="text-success"
          href="/dashboard/financeiro"
        />
        <MetricCard
          title="Saldo"
          value={formatCurrency(metrics.balance)}
          subtitle={`Despesas: ${formatCurrency(metrics.expenses)}`}
          icon={Wallet}
          iconColor={metrics.balance >= 0 ? "text-success" : "text-destructive"}
          href="/dashboard/financeiro"
        />
      </div>

      {/* Content area */}
      {!hasData ? (
        <EmptyState />
      ) : (
        <div className="grid lg:grid-cols-2 gap-6">
          {/* Recent activity */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-card-foreground">Leads Recentes</h2>
              <Link href="/dashboard/crm">
                <Button variant="ghost" size="sm">
                  Ver todos
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            {recentLeads.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">
                Nenhum lead ainda
              </p>
            ) : (
              <div className="space-y-3">
                {recentLeads.map((lead) => (
                  <div key={lead.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <Users className="w-4 h-4 text-primary" />
                      </div>
                      <span className="text-sm text-foreground">Lead #{lead.id.slice(0, 8)}</span>
                    </div>
                    <StatusBadge status={lead.status} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Tasks */}
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-card-foreground">Tarefas</h2>
              <Link href="/dashboard/operacoes">
                <Button variant="ghost" size="sm">
                  Ver todas
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>
            </div>
            {recentTasks.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">
                Nenhuma tarefa ainda
              </p>
            ) : (
              <div className="space-y-3">
                {recentTasks.map((task) => (
                  <div key={task.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        task.status === "completed" ? "bg-success/10" : "bg-muted"
                      }`}>
                        {task.status === "completed" ? (
                          <CheckCircle2 className="w-4 h-4 text-success" />
                        ) : (
                          <ListTodo className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                      <span className="text-sm text-foreground">Tarefa #{task.id.slice(0, 8)}</span>
                    </div>
                    <PriorityBadge priority={task.priority} />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconColor = "text-primary",
  href,
}: {
  title: string
  value: string | number
  subtitle: string
  icon: React.ElementType
  iconColor?: string
  href: string
}) {
  return (
    <Link href={href}>
      <div className="bg-card border border-border rounded-xl p-5 hover:border-primary/50 transition-colors">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold text-card-foreground">{value}</p>
            <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
          </div>
          <div className={`w-10 h-10 rounded-lg bg-muted flex items-center justify-center ${iconColor}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
      </div>
    </Link>
  )
}

function EmptyState() {
  return (
    <div className="bg-card border border-border rounded-xl p-12 text-center">
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
        <Plus className="w-8 h-8 text-primary" />
      </div>
      <h3 className="text-lg font-semibold text-card-foreground mb-2">
        Comece a usar o OpsCore
      </h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Adicione seus primeiros leads, tarefas e registros financeiros para ver suas metricas aqui.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        <Link href="/dashboard/crm">
          <Button variant="outline">
            <Users className="w-4 h-4 mr-2" />
            Adicionar Lead
          </Button>
        </Link>
        <Link href="/dashboard/operacoes">
          <Button variant="outline">
            <ListTodo className="w-4 h-4 mr-2" />
            Criar Tarefa
          </Button>
        </Link>
        <Link href="/dashboard/financeiro">
          <Button>
            <Wallet className="w-4 h-4 mr-2" />
            Registrar Financas
          </Button>
        </Link>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    new: "bg-primary/10 text-primary",
    contacted: "bg-warning/10 text-warning",
    qualified: "bg-success/10 text-success",
    proposal: "bg-accent/10 text-accent",
    won: "bg-success/10 text-success",
    lost: "bg-destructive/10 text-destructive",
  }

  const labels: Record<string, string> = {
    new: "Novo",
    contacted: "Contatado",
    qualified: "Qualificado",
    proposal: "Proposta",
    won: "Ganho",
    lost: "Perdido",
  }

  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${styles[status] || "bg-muted text-muted-foreground"}`}>
      {labels[status] || status}
    </span>
  )
}

function PriorityBadge({ priority }: { priority: string }) {
  const styles: Record<string, string> = {
    low: "bg-muted text-muted-foreground",
    medium: "bg-warning/10 text-warning",
    high: "bg-destructive/10 text-destructive",
  }

  const labels: Record<string, string> = {
    low: "Baixa",
    medium: "Media",
    high: "Alta",
  }

  return (
    <span className={`text-xs px-2 py-1 rounded-full font-medium ${styles[priority] || "bg-muted text-muted-foreground"}`}>
      {labels[priority] || priority}
    </span>
  )
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value)
}
