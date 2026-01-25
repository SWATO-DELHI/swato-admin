// @ts-nocheck
'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import { Search, MoreHorizontal, Ban, CheckCircle } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Customer {
  id: string
  name: string
  email: string
  phone: string | null
  avatar_url: string | null
  status: string
  created_at: string
}

interface CustomersTableProps {
  customers: Customer[]
}

export function CustomersTable({ customers: initialCustomers }: CustomersTableProps) {
  const [customers, setCustomers] = useState(initialCustomers)
  const [searchQuery, setSearchQuery] = useState('')
  const supabase = createClient()

  const filteredCustomers = customers.filter((customer) =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    customer.phone?.includes(searchQuery)
  )

  async function toggleCustomerStatus(customerId: string, currentStatus: string) {
    const newStatus = currentStatus === 'active' ? 'blocked' : 'active'

    const { error } = await supabase
      .from('users')
      .update({ status: newStatus })
      .eq('id', customerId)

    if (error) {
      toast.error('Failed to update customer status')
      return
    }

    setCustomers(customers.map(c =>
      c.id === customerId ? { ...c, status: newStatus } : c
    ))
    toast.success(`Customer ${newStatus === 'blocked' ? 'blocked' : 'unblocked'} successfully`)
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <div className="p-4 border-b border-zinc-800">
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            placeholder="Search by name, email or phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-zinc-800 border-zinc-700 text-white"
          />
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-zinc-800">
              <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">
                Customer
              </th>
              <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">
                Email
              </th>
              <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">
                Phone
              </th>
              <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">
                Status
              </th>
              <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">
                Joined
              </th>
              <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {filteredCustomers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">
                  No customers found
                </td>
              </tr>
            ) : (
              filteredCustomers.map((customer) => (
                <tr key={customer.id} className="hover:bg-zinc-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={customer.avatar_url || ''} />
                        <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-500 text-white">
                          {customer.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <span className="text-sm font-medium text-white">{customer.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-300">
                    {customer.email}
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-300">
                    {customer.phone || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      className={`border capitalize ${
                        customer.status === 'active'
                          ? 'bg-green-500/10 text-green-400 border-green-500/30'
                          : 'bg-red-500/10 text-red-400 border-red-500/30'
                      }`}
                    >
                      {customer.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-400">
                    {formatDistanceToNow(new Date(customer.created_at), { addSuffix: true })}
                  </td>
                  <td className="px-6 py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                          <MoreHorizontal size={16} />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700">
                        <DropdownMenuItem
                          onClick={() => toggleCustomerStatus(customer.id, customer.status)}
                          className="cursor-pointer"
                        >
                          {customer.status === 'active' ? (
                            <>
                              <Ban className="mr-2 h-4 w-4 text-red-400" />
                              <span className="text-red-400">Block Customer</span>
                            </>
                          ) : (
                            <>
                              <CheckCircle className="mr-2 h-4 w-4 text-green-400" />
                              <span className="text-green-400">Unblock Customer</span>
                            </>
                          )}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
