'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatDistanceToNow } from 'date-fns'
import { Search, Filter, MessageSquare, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Ticket {
  id: string
  ticket_number: string
  subject: string
  description: string
  category: string | null
  status: string
  priority: string | null
  created_at: string
  user: { name: string; email: string } | null
  order: { order_number: string } | null
}

interface SupportTicketsProps {
  tickets: Ticket[]
}

const statusColors: Record<string, string> = {
  open: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  in_progress: 'bg-blue-500/10 text-blue-400 border-blue-500/30',
  resolved: 'bg-green-500/10 text-green-400 border-green-500/30',
  closed: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30',
}

const priorityColors: Record<string, string> = {
  low: 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30',
  medium: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30',
  high: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
  urgent: 'bg-red-500/10 text-red-400 border-red-500/30',
}

export function SupportTickets({ tickets: initialTickets }: SupportTicketsProps) {
  const [tickets, setTickets] = useState(initialTickets)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const supabase = createClient()

  const filteredTickets = tickets.filter((ticket) => {
    const matchesSearch =
      ticket.ticket_number.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.user?.name.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter

    return matchesSearch && matchesStatus
  })

  async function updateTicketStatus(id: string, status: string) {
    const { error } = await supabase
      .from('support_tickets')
      .update({ status, resolved_at: status === 'resolved' ? new Date().toISOString() : null })
      .eq('id', id)

    if (error) {
      toast.error('Failed to update ticket')
      return
    }

    setTickets(tickets.map(t =>
      t.id === id ? { ...t, status } : t
    ))
    toast.success('Ticket updated')
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search tickets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-zinc-800 border-zinc-700 text-white"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40 bg-zinc-800 border-zinc-700 text-white">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700">
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {filteredTickets.length === 0 ? (
          <Card className="bg-zinc-900 border-zinc-800 p-8 text-center">
            <MessageSquare className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-500">No support tickets</p>
          </Card>
        ) : (
          filteredTickets.map((ticket) => (
            <Card key={ticket.id} className="bg-zinc-900 border-zinc-800 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-sm font-mono text-zinc-500">{ticket.ticket_number}</span>
                    <Badge className={`${statusColors[ticket.status]} border capitalize`}>
                      {ticket.status.replace('_', ' ')}
                    </Badge>
                    {ticket.priority && (
                      <Badge className={`${priorityColors[ticket.priority]} border capitalize`}>
                        {ticket.priority === 'urgent' && <AlertCircle className="h-3 w-3 mr-1" />}
                        {ticket.priority}
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-white font-medium">{ticket.subject}</h3>
                  <p className="text-sm text-zinc-400 mt-1 line-clamp-2">{ticket.description}</p>
                  <div className="flex items-center gap-4 mt-3 text-xs text-zinc-500">
                    <span>From: {ticket.user?.name || 'Unknown'}</span>
                    {ticket.order && <span>Order: {ticket.order.order_number}</span>}
                    <span>{formatDistanceToNow(new Date(ticket.created_at), { addSuffix: true })}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {ticket.status === 'open' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateTicketStatus(ticket.id, 'in_progress')}
                      className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                    >
                      Start
                    </Button>
                  )}
                  {ticket.status === 'in_progress' && (
                    <Button
                      size="sm"
                      onClick={() => updateTicketStatus(ticket.id, 'resolved')}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      Resolve
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
