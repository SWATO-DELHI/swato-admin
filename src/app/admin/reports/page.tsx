// @ts-nocheck
import { Card } from '@/components/ui/card'
import { BarChart3, TrendingUp, Users, Store, Truck, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function ReportsPage() {
  const reports = [
    {
      title: 'Sales Report',
      description: 'Daily, weekly, and monthly sales data',
      icon: TrendingUp,
      gradient: 'from-emerald-500 to-teal-500',
    },
    {
      title: 'Customer Analytics',
      description: 'Customer acquisition and retention metrics',
      icon: Users,
      gradient: 'from-blue-500 to-cyan-500',
    },
    {
      title: 'Restaurant Performance',
      description: 'Revenue, ratings, and order metrics by restaurant',
      icon: Store,
      gradient: 'from-orange-500 to-red-500',
    },
    {
      title: 'Driver Performance',
      description: 'Delivery times, ratings, and earnings',
      icon: Truck,
      gradient: 'from-purple-500 to-pink-500',
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Reports</h1>
        <p className="text-zinc-400 mt-1">Generate and export business reports</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {reports.map((report) => (
          <Card key={report.title} className="bg-zinc-900 border-zinc-800 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-gradient-to-br ${report.gradient}`}>
                  <report.icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white">{report.title}</h3>
                  <p className="text-sm text-zinc-400 mt-1">{report.description}</p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex gap-2">
              <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                <BarChart3 className="mr-2 h-4 w-4" />
                View Report
              </Button>
              <Button variant="outline" className="border-zinc-700 text-zinc-300 hover:bg-zinc-800">
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </Card>
        ))}
      </div>

      <Card className="bg-zinc-900 border-zinc-800 p-8 text-center">
        <BarChart3 className="h-12 w-12 text-zinc-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white">Advanced Analytics Coming Soon</h3>
        <p className="text-zinc-400 mt-2 max-w-md mx-auto">
          Detailed analytics dashboards with charts, trends, and AI-powered insights are being developed.
        </p>
      </Card>
    </div>
  )
}
