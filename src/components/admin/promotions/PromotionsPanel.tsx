'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Plus, Tag, Percent, IndianRupee, Loader2, MoreHorizontal, Trash2, Power } from 'lucide-react'
import { format } from 'date-fns'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Promotion {
  id: string
  code: string
  title: string
  description: string | null
  type: string
  value: number
  min_order: number | null
  max_discount: number | null
  valid_from: string
  valid_until: string
  usage_limit: number | null
  used_count: number | null
  is_active: boolean | null
}

interface PromotionsPanelProps {
  promotions: Promotion[]
}

export function PromotionsPanel({ promotions: initialPromotions }: PromotionsPanelProps) {
  const [promotions, setPromotions] = useState(initialPromotions)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const supabase = createClient()

  const [formData, setFormData] = useState({
    code: '',
    title: '',
    type: 'percentage',
    value: '',
    minOrder: '',
    maxDiscount: '',
    validFrom: '',
    validUntil: '',
    usageLimit: '',
  })

  async function handleCreatePromotion(e: React.FormEvent) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const { data, error } = await supabase
        .from('promotions')
        .insert({
          code: formData.code.toUpperCase(),
          title: formData.title,
          type: formData.type,
          value: parseFloat(formData.value),
          min_order: formData.minOrder ? parseFloat(formData.minOrder) : null,
          max_discount: formData.maxDiscount ? parseFloat(formData.maxDiscount) : null,
          valid_from: formData.validFrom,
          valid_until: formData.validUntil,
          usage_limit: formData.usageLimit ? parseInt(formData.usageLimit) : null,
          is_active: true,
        })
        .select()
        .single()

      if (error) throw error

      setPromotions([data, ...promotions])
      setIsOpen(false)
      setFormData({
        code: '',
        title: '',
        type: 'percentage',
        value: '',
        minOrder: '',
        maxDiscount: '',
        validFrom: '',
        validUntil: '',
        usageLimit: '',
      })
      toast.success('Promotion created successfully!')
    } catch {
      toast.error('Failed to create promotion')
    } finally {
      setIsLoading(false)
    }
  }

  async function togglePromotion(id: string, isActive: boolean) {
    const { error } = await supabase
      .from('promotions')
      .update({ is_active: !isActive })
      .eq('id', id)

    if (error) {
      toast.error('Failed to update promotion')
      return
    }

    setPromotions(promotions.map(p =>
      p.id === id ? { ...p, is_active: !isActive } : p
    ))
    toast.success(`Promotion ${!isActive ? 'activated' : 'deactivated'}`)
  }

  async function deletePromotion(id: string) {
    const { error } = await supabase
      .from('promotions')
      .delete()
      .eq('id', id)

    if (error) {
      toast.error('Failed to delete promotion')
      return
    }

    setPromotions(promotions.filter(p => p.id !== id))
    toast.success('Promotion deleted')
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
              <Plus className="mr-2 h-4 w-4" />
              Create Promotion
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-zinc-900 border-zinc-800 max-w-md">
            <DialogHeader>
              <DialogTitle className="text-white">Create Promotion</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreatePromotion} className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Code</Label>
                  <Input
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="SAVE20"
                    required
                    className="bg-zinc-800 border-zinc-700 text-white uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Type</Label>
                  <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v })}>
                    <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 border-zinc-700">
                      <SelectItem value="percentage">Percentage</SelectItem>
                      <SelectItem value="flat">Flat Amount</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-zinc-300">Title</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="20% off on your order"
                  required
                  className="bg-zinc-800 border-zinc-700 text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Value ({formData.type === 'percentage' ? '%' : '₹'})</Label>
                  <Input
                    type="number"
                    value={formData.value}
                    onChange={(e) => setFormData({ ...formData, value: e.target.value })}
                    placeholder={formData.type === 'percentage' ? '20' : '100'}
                    required
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Min Order (₹)</Label>
                  <Input
                    type="number"
                    value={formData.minOrder}
                    onChange={(e) => setFormData({ ...formData, minOrder: e.target.value })}
                    placeholder="200"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Max Discount (₹)</Label>
                  <Input
                    type="number"
                    value={formData.maxDiscount}
                    onChange={(e) => setFormData({ ...formData, maxDiscount: e.target.value })}
                    placeholder="100"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Usage Limit</Label>
                  <Input
                    type="number"
                    value={formData.usageLimit}
                    onChange={(e) => setFormData({ ...formData, usageLimit: e.target.value })}
                    placeholder="1000"
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Valid From</Label>
                  <Input
                    type="datetime-local"
                    value={formData.validFrom}
                    onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
                    required
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Valid Until</Label>
                  <Input
                    type="datetime-local"
                    value={formData.validUntil}
                    onChange={(e) => setFormData({ ...formData, validUntil: e.target.value })}
                    required
                    className="bg-zinc-800 border-zinc-700 text-white"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Promotion'
                )}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {promotions.length === 0 ? (
          <Card className="col-span-full bg-zinc-900 border-zinc-800 p-8 text-center">
            <Tag className="h-12 w-12 text-zinc-600 mx-auto mb-3" />
            <p className="text-zinc-500">No promotions created yet</p>
          </Card>
        ) : (
          promotions.map((promo) => {
            const isExpired = new Date(promo.valid_until) < new Date()
            const isActive = promo.is_active && !isExpired

            return (
              <Card key={promo.id} className="bg-zinc-900 border-zinc-800 p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${isActive ? 'bg-gradient-to-br from-orange-500 to-red-500' : 'bg-zinc-700'}`}>
                      {promo.type === 'percentage' ? (
                        <Percent className="h-5 w-5 text-white" />
                      ) : (
                        <IndianRupee className="h-5 w-5 text-white" />
                      )}
                    </div>
                    <div>
                      <p className="font-mono font-bold text-white">{promo.code}</p>
                      <p className="text-xs text-zinc-400">{promo.title}</p>
                    </div>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                        <MoreHorizontal size={16} />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700">
                      <DropdownMenuItem
                        onClick={() => togglePromotion(promo.id, promo.is_active || false)}
                        className="cursor-pointer"
                      >
                        <Power className="mr-2 h-4 w-4" />
                        {promo.is_active ? 'Deactivate' : 'Activate'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => deletePromotion(promo.id)}
                        className="cursor-pointer text-red-400 focus:text-red-400"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">Discount</span>
                    <span className="text-white font-medium">
                      {promo.type === 'percentage' ? `${promo.value}%` : `₹${promo.value}`}
                      {promo.max_discount && ` (max ₹${promo.max_discount})`}
                    </span>
                  </div>
                  {promo.min_order && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-zinc-400">Min Order</span>
                      <span className="text-zinc-300">₹{promo.min_order}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">Usage</span>
                    <span className="text-zinc-300">
                      {promo.used_count || 0}{promo.usage_limit ? `/${promo.usage_limit}` : ''}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-400">Valid Until</span>
                    <span className="text-zinc-300">{format(new Date(promo.valid_until), 'MMM dd, yyyy')}</span>
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Badge
                    className={`border ${
                      isActive
                        ? 'bg-green-500/10 text-green-400 border-green-500/30'
                        : isExpired
                        ? 'bg-red-500/10 text-red-400 border-red-500/30'
                        : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30'
                    }`}
                  >
                    {isExpired ? 'Expired' : isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
