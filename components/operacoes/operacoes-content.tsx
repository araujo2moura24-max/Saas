"use client"

import { useState } from "react"
import { Plus, Search, ListTodo, CheckCircle2, Circle, Clock, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { TaskModal } from "./task-modal"

interface Task {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  due_date: string | null
  created_at: string
}

const STATUS_OPTIONS = [
  { value: "pending", label: "Pendente", icon: Circle, color: "text-muted-foreground" },
  { value: "in_progress", label: "Em andamento", icon: Clock, color: "text-warning" },
  { value: "completed", label: "Concluida", icon: CheckCircle2, color: "text-success" },
]

const PRIORITY_OPTIONS = [
  { value: "low", label: "Baixa", color: "bg-muted text-muted-foreground" },
  { value: "medium", label: "Media", color: "bg-warning/10 text-warning" },
  { value: "high", label: "Alta", color: "bg-destructive/10 text-destructive" },
]

interface OperacoesContentProps {
  initialTasks: Task[]
  userId: string
}

export function OperacoesContent({ initialTasks, userId }: OperacoesContentProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(search.toLowerCase()) ||
      (task.description?.toLowerCase().includes(search.toLowerCase()))
    const matchesStatus = !statusFilter || task.status === statusFilter
    return matchesSearch && matchesStatus
  })

  // Agrupar por status
  const pendingTasks = filteredTasks.filter(t => t.status === "pending")
  const inProgressTasks = filteredTasks.filter(t => t.status === "in_progress")
  const completedTasks = filteredTasks.filter(t => t.status === "completed")

  async function handleSaveTask(data: Partial<Task>) {
    const supabase = createClient()
    
    if (editingTask) {
      const { data: updated, error } = await supabase
        .from("tasks")
        .update(data)
        .eq("id", editingTask.id)
        .select()
        .single()

      if (!error && updated) {
        setTasks(tasks.map(t => t.id === updated.id ? updated : t))
      }
    } else {
      const { data: created, error } = await supabase
        .from("tasks")
        .insert({ ...data, user_id: userId })
        .select()
        .single()

      if (!error && created) {
        setTasks([created, ...tasks])
      }
    }

    setShowModal(false)
    setEditingTask(null)
  }

  async function handleDeleteTask(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from("tasks").delete().eq("id", id)
    
    if (!error) {
      setTasks(tasks.filter(t => t.id !== id))
    }
    setOpenMenuId(null)
  }

  async function handleToggleStatus(task: Task) {
    const newStatus = task.status === "completed" ? "pending" : "completed"
    const supabase = createClient()
    const { error } = await supabase
      .from("tasks")
      .update({ status: newStatus })
      .eq("id", task.id)

    if (!error) {
      setTasks(tasks.map(t => t.id === task.id ? { ...t, status: newStatus } : t))
    }
  }

  function handleEdit(task: Task) {
    setEditingTask(task)
    setShowModal(true)
    setOpenMenuId(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Operacoes</h1>
          <p className="text-muted-foreground">Gerencie suas tarefas e atividades</p>
        </div>
        <Button onClick={() => { setEditingTask(null); setShowModal(true) }}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Tarefa
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar tarefas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={statusFilter === null ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(null)}
          >
            Todas ({tasks.length})
          </Button>
          {STATUS_OPTIONS.map((status) => {
            const count = tasks.filter(t => t.status === status.value).length
            return (
              <Button
                key={status.value}
                variant={statusFilter === status.value ? "default" : "outline"}
                size="sm"
                onClick={() => setStatusFilter(status.value)}
              >
                {status.label} ({count})
              </Button>
            )
          })}
        </div>
      </div>

      {/* Tasks - Kanban style */}
      {filteredTasks.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <ListTodo className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-card-foreground mb-2">
            {search || statusFilter ? "Nenhuma tarefa encontrada" : "Nenhuma tarefa ainda"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {search || statusFilter 
              ? "Tente ajustar os filtros de busca" 
              : "Crie sua primeira tarefa para comecar"}
          </p>
          {!search && !statusFilter && (
            <Button onClick={() => setShowModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Criar Tarefa
            </Button>
          )}
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Pending column */}
          <TaskColumn
            title="Pendentes"
            tasks={pendingTasks}
            icon={Circle}
            iconColor="text-muted-foreground"
            onToggle={handleToggleStatus}
            onEdit={handleEdit}
            onDelete={handleDeleteTask}
            openMenuId={openMenuId}
            setOpenMenuId={setOpenMenuId}
          />
          
          {/* In Progress column */}
          <TaskColumn
            title="Em Andamento"
            tasks={inProgressTasks}
            icon={Clock}
            iconColor="text-warning"
            onToggle={handleToggleStatus}
            onEdit={handleEdit}
            onDelete={handleDeleteTask}
            openMenuId={openMenuId}
            setOpenMenuId={setOpenMenuId}
          />
          
          {/* Completed column */}
          <TaskColumn
            title="Concluidas"
            tasks={completedTasks}
            icon={CheckCircle2}
            iconColor="text-success"
            onToggle={handleToggleStatus}
            onEdit={handleEdit}
            onDelete={handleDeleteTask}
            openMenuId={openMenuId}
            setOpenMenuId={setOpenMenuId}
          />
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <TaskModal
          task={editingTask}
          onSave={handleSaveTask}
          onClose={() => { setShowModal(false); setEditingTask(null) }}
        />
      )}
    </div>
  )
}

function TaskColumn({
  title,
  tasks,
  icon: Icon,
  iconColor,
  onToggle,
  onEdit,
  onDelete,
  openMenuId,
  setOpenMenuId,
}: {
  title: string
  tasks: Task[]
  icon: React.ElementType
  iconColor: string
  onToggle: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  openMenuId: string | null
  setOpenMenuId: (id: string | null) => void
}) {
  return (
    <div className="bg-muted/30 rounded-xl p-4">
      <div className="flex items-center gap-2 mb-4">
        <Icon className={`w-5 h-5 ${iconColor}`} />
        <h3 className="font-semibold text-foreground">{title}</h3>
        <span className="text-sm text-muted-foreground">({tasks.length})</span>
      </div>
      
      <div className="space-y-3">
        {tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
            openMenuId={openMenuId}
            setOpenMenuId={setOpenMenuId}
          />
        ))}
        {tasks.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhuma tarefa
          </p>
        )}
      </div>
    </div>
  )
}

function TaskCard({
  task,
  onToggle,
  onEdit,
  onDelete,
  openMenuId,
  setOpenMenuId,
}: {
  task: Task
  onToggle: (task: Task) => void
  onEdit: (task: Task) => void
  onDelete: (id: string) => void
  openMenuId: string | null
  setOpenMenuId: (id: string | null) => void
}) {
  const priority = PRIORITY_OPTIONS.find(p => p.value === task.priority)

  return (
    <div className="bg-card border border-border rounded-lg p-4 hover:border-primary/50 transition-colors">
      <div className="flex items-start gap-3">
        <button
          onClick={() => onToggle(task)}
          className="mt-0.5 shrink-0"
        >
          {task.status === "completed" ? (
            <CheckCircle2 className="w-5 h-5 text-success" />
          ) : (
            <Circle className="w-5 h-5 text-muted-foreground hover:text-primary transition-colors" />
          )}
        </button>
        
        <div className="flex-1 min-w-0">
          <p className={`font-medium ${task.status === "completed" ? "text-muted-foreground line-through" : "text-card-foreground"}`}>
            {task.title}
          </p>
          {task.description && (
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {task.description}
            </p>
          )}
          <div className="flex items-center gap-2 mt-2">
            {priority && (
              <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${priority.color}`}>
                {priority.label}
              </span>
            )}
            {task.due_date && (
              <span className="text-xs text-muted-foreground">
                {new Date(task.due_date).toLocaleDateString("pt-BR")}
              </span>
            )}
          </div>
        </div>

        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => setOpenMenuId(openMenuId === task.id ? null : task.id)}
          >
            <MoreHorizontal className="w-4 h-4" />
          </Button>
          {openMenuId === task.id && (
            <>
              <div 
                className="fixed inset-0 z-10" 
                onClick={() => setOpenMenuId(null)} 
              />
              <div className="absolute right-0 top-full mt-1 z-20 bg-popover border border-border rounded-lg shadow-lg py-1 min-w-[120px]">
                <button
                  onClick={() => onEdit(task)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  Editar
                </button>
                <button
                  onClick={() => onDelete(task.id)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Excluir
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
