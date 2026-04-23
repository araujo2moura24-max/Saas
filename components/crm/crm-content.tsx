"use client"

import { useState } from "react"
import { Plus, Search, Users, Mail, Phone, MoreHorizontal, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/client"
import { LeadModal } from "./lead-modal"

interface Lead {
  id: string
  name: string
  email: string | null
  phone: string | null
  status: string
  notes: string | null
  created_at: string
}

const STATUS_OPTIONS = [
  { value: "new", label: "Novo", color: "bg-primary/10 text-primary" },
  { value: "contacted", label: "Contatado", color: "bg-warning/10 text-warning" },
  { value: "qualified", label: "Qualificado", color: "bg-accent/10 text-accent" },
  { value: "proposal", label: "Proposta", color: "bg-chart-4/10 text-chart-4" },
  { value: "won", label: "Ganho", color: "bg-success/10 text-success" },
  { value: "lost", label: "Perdido", color: "bg-destructive/10 text-destructive" },
]

interface CRMContentProps {
  initialLeads: Lead[]
  userId: string
}

export function CRMContent({ initialLeads, userId }: CRMContentProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [editingLead, setEditingLead] = useState<Lead | null>(null)
  const [openMenuId, setOpenMenuId] = useState<string | null>(null)

  const filteredLeads = leads.filter((lead) => {
    const matchesSearch = lead.name.toLowerCase().includes(search.toLowerCase()) ||
      (lead.email?.toLowerCase().includes(search.toLowerCase())) ||
      (lead.phone?.includes(search))
    const matchesStatus = !statusFilter || lead.status === statusFilter
    return matchesSearch && matchesStatus
  })

  async function handleSaveLead(data: Partial<Lead>) {
    const supabase = createClient()
    
    if (editingLead) {
      const { data: updated, error } = await supabase
        .from("leads")
        .update(data)
        .eq("id", editingLead.id)
        .select()
        .single()

      if (!error && updated) {
        setLeads(leads.map(l => l.id === updated.id ? updated : l))
      }
    } else {
      const { data: created, error } = await supabase
        .from("leads")
        .insert({ ...data, user_id: userId })
        .select()
        .single()

      if (!error && created) {
        setLeads([created, ...leads])
      }
    }

    setShowModal(false)
    setEditingLead(null)
  }

  async function handleDeleteLead(id: string) {
    const supabase = createClient()
    const { error } = await supabase.from("leads").delete().eq("id", id)
    
    if (!error) {
      setLeads(leads.filter(l => l.id !== id))
    }
    setOpenMenuId(null)
  }

  async function handleStatusChange(id: string, newStatus: string) {
    const supabase = createClient()
    const { error } = await supabase
      .from("leads")
      .update({ status: newStatus })
      .eq("id", id)

    if (!error) {
      setLeads(leads.map(l => l.id === id ? { ...l, status: newStatus } : l))
    }
  }

  function handleEdit(lead: Lead) {
    setEditingLead(lead)
    setShowModal(true)
    setOpenMenuId(null)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">CRM</h1>
          <p className="text-muted-foreground">Gerencie seus leads e clientes</p>
        </div>
        <Button onClick={() => { setEditingLead(null); setShowModal(true) }}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Lead
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome, email ou telefone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant={statusFilter === null ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(null)}
          >
            Todos
          </Button>
          {STATUS_OPTIONS.map((status) => (
            <Button
              key={status.value}
              variant={statusFilter === status.value ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status.value)}
            >
              {status.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {STATUS_OPTIONS.map((status) => {
          const count = leads.filter(l => l.status === status.value).length
          return (
            <div 
              key={status.value} 
              className="bg-card border border-border rounded-lg p-3 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onClick={() => setStatusFilter(statusFilter === status.value ? null : status.value)}
            >
              <p className="text-2xl font-bold text-card-foreground">{count}</p>
              <p className="text-xs text-muted-foreground">{status.label}</p>
            </div>
          )
        })}
      </div>

      {/* Leads list */}
      {filteredLeads.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-primary" />
          </div>
          <h3 className="text-lg font-semibold text-card-foreground mb-2">
            {search || statusFilter ? "Nenhum lead encontrado" : "Nenhum lead ainda"}
          </h3>
          <p className="text-muted-foreground mb-4">
            {search || statusFilter 
              ? "Tente ajustar os filtros de busca" 
              : "Adicione seu primeiro lead para comecar"}
          </p>
          {!search && !statusFilter && (
            <Button onClick={() => setShowModal(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Lead
            </Button>
          )}
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50">
                <tr>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Nome</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3 hidden sm:table-cell">Contato</th>
                  <th className="text-left text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Status</th>
                  <th className="text-right text-xs font-medium text-muted-foreground uppercase tracking-wider px-4 py-3">Acoes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                          <span className="text-sm font-medium text-primary">
                            {lead.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-card-foreground truncate">{lead.name}</p>
                          <p className="text-xs text-muted-foreground sm:hidden">
                            {lead.email || lead.phone || "Sem contato"}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden sm:table-cell">
                      <div className="space-y-1">
                        {lead.email && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Mail className="w-3.5 h-3.5" />
                            <span className="truncate max-w-[200px]">{lead.email}</span>
                          </div>
                        )}
                        {lead.phone && (
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Phone className="w-3.5 h-3.5" />
                            <span>{lead.phone}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer ${
                          STATUS_OPTIONS.find(s => s.value === lead.status)?.color || "bg-muted text-muted-foreground"
                        }`}
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status.value} value={status.value}>
                            {status.label}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="relative inline-block">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setOpenMenuId(openMenuId === lead.id ? null : lead.id)}
                        >
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                        {openMenuId === lead.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-10" 
                              onClick={() => setOpenMenuId(null)} 
                            />
                            <div className="absolute right-0 top-full mt-1 z-20 bg-popover border border-border rounded-lg shadow-lg py-1 min-w-[120px]">
                              <button
                                onClick={() => handleEdit(lead)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-muted transition-colors"
                              >
                                <Pencil className="w-4 h-4" />
                                Editar
                              </button>
                              <button
                                onClick={() => handleDeleteLead(lead.id)}
                                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/10 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                Excluir
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <LeadModal
          lead={editingLead}
          onSave={handleSaveLead}
          onClose={() => { setShowModal(false); setEditingLead(null) }}
        />
      )}
    </div>
  )
}
