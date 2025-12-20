'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'
import { Wallet, ArrowUpRight, ArrowDownLeft, Store, Truck } from 'lucide-react'

interface Transaction {
  id: string
  type: string
  amount: number
  status: string
  payment_method: string | null
  created_at: string
}

interface Settlement {
  id: string
  type: string
  amount: number
  commission: number | null
  status: string
  period_start: string
  period_end: string
  order_count: number | null
  restaurant: { name: string } | null
  driver: { user: { name: string } | null } | null
}

interface FinancePanelProps {
  transactions: Transaction[]
  settlements: Settlement[]
}

export function FinancePanel({ transactions, settlements }: FinancePanelProps) {
  const [activeTab, setActiveTab] = useState<'transactions' | 'settlements'>('transactions')

  const totalRevenue = transactions
    .filter(t => t.type === 'payment' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0)

  const pendingSettlements = settlements
    .filter(s => s.status === 'pending')
    .reduce((sum, s) => sum + s.amount, 0)

  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-zinc-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500">
              <Wallet className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-zinc-400">Total Revenue</p>
              <p className="text-2xl font-bold text-white">₹{totalRevenue.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-orange-500/10 to-red-500/10 border-zinc-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-orange-500 to-red-500">
              <ArrowUpRight className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-zinc-400">Pending Settlements</p>
              <p className="text-2xl font-bold text-white">₹{pendingSettlements.toLocaleString()}</p>
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-zinc-800 p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
              <ArrowDownLeft className="h-5 w-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-zinc-400">Total Transactions</p>
              <p className="text-2xl font-bold text-white">{transactions.length}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-zinc-800 pb-2">
        <Button
          variant={activeTab === 'transactions' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('transactions')}
          className={activeTab === 'transactions' ? 'bg-zinc-800' : 'text-zinc-400'}
        >
          Transactions
        </Button>
        <Button
          variant={activeTab === 'settlements' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('settlements')}
          className={activeTab === 'settlements' ? 'bg-zinc-800' : 'text-zinc-400'}
        >
          Settlements
        </Button>
      </div>

      {activeTab === 'transactions' ? (
        <Card className="bg-zinc-900 border-zinc-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">Type</th>
                  <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">Amount</th>
                  <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">Method</th>
                  <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-zinc-500">No transactions</td>
                  </tr>
                ) : (
                  transactions.map((tx) => (
                    <tr key={tx.id} className="hover:bg-zinc-800/50">
                      <td className="px-6 py-4">
                        <Badge className={`border capitalize ${
                          tx.type === 'payment' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                          tx.type === 'refund' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                          'bg-blue-500/10 text-blue-400 border-blue-500/30'
                        }`}>
                          {tx.type}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-white font-medium">₹{tx.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-zinc-300 capitalize">{tx.payment_method || '-'}</td>
                      <td className="px-6 py-4">
                        <Badge className={`border capitalize ${
                          tx.status === 'completed' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                          tx.status === 'failed' ? 'bg-red-500/10 text-red-400 border-red-500/30' :
                          'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                        }`}>
                          {tx.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-zinc-400 text-sm">{format(new Date(tx.created_at), 'MMM dd, yyyy HH:mm')}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      ) : (
        <Card className="bg-zinc-900 border-zinc-800">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-zinc-800">
                  <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">Partner</th>
                  <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">Type</th>
                  <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">Amount</th>
                  <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">Period</th>
                  <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">Orders</th>
                  <th className="text-left text-xs font-medium text-zinc-500 uppercase tracking-wider px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {settlements.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-zinc-500">No settlements</td>
                  </tr>
                ) : (
                  settlements.map((s) => (
                    <tr key={s.id} className="hover:bg-zinc-800/50">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          {s.type === 'restaurant' ? (
                            <Store className="h-4 w-4 text-orange-400" />
                          ) : (
                            <Truck className="h-4 w-4 text-blue-400" />
                          )}
                          <span className="text-white">
                            {s.type === 'restaurant' ? s.restaurant?.name : s.driver?.user?.name || 'Unknown'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-zinc-300 capitalize">{s.type}</td>
                      <td className="px-6 py-4 text-white font-medium">₹{s.amount.toLocaleString()}</td>
                      <td className="px-6 py-4 text-zinc-400 text-sm">
                        {format(new Date(s.period_start), 'MMM dd')} - {format(new Date(s.period_end), 'MMM dd')}
                      </td>
                      <td className="px-6 py-4 text-zinc-300">{s.order_count || 0}</td>
                      <td className="px-6 py-4">
                        <Badge className={`border capitalize ${
                          s.status === 'processed' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                          s.status === 'processing' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                          'bg-yellow-500/10 text-yellow-400 border-yellow-500/30'
                        }`}>
                          {s.status}
                        </Badge>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  )
}
