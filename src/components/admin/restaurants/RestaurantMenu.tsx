'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Plus, Edit, Trash2, IndianRupee } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

interface Category {
  id: string
  name: string
  description: string | null
  sort_order: number | null
  is_active: boolean | null
}

interface MenuItem {
  id: string
  name: string
  description: string | null
  price: number
  discounted_price: number | null
  category_id: string | null
  is_available: boolean | null
  is_veg: boolean | null
}

interface RestaurantMenuProps {
  restaurantId: string
  categories: Category[]
  menuItems: MenuItem[]
}

export function RestaurantMenu({ restaurantId, categories: initialCategories, menuItems: initialMenuItems }: RestaurantMenuProps) {
  const [categories, setCategories] = useState(initialCategories)
  const [menuItems, setMenuItems] = useState(initialMenuItems)
  const [addCategoryOpen, setAddCategoryOpen] = useState(false)
  const [addItemOpen, setAddItemOpen] = useState(false)
  const supabase = createClient()

  const groupedItems = categories.map(cat => ({
    ...cat,
    items: menuItems.filter(item => item.category_id === cat.id),
  }))

  const uncategorizedItems = menuItems.filter(item => !item.category_id)

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <div className="p-6 border-b border-zinc-800 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-white">Menu Items</h3>
          <p className="text-sm text-zinc-400 mt-1">Manage categories and menu items</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={addCategoryOpen} onOpenChange={setAddCategoryOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="border-zinc-700">
                <Plus className="mr-2 h-4 w-4" />
                Add Category
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800">
              <DialogHeader>
                <DialogTitle className="text-white">Add Category</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  Create a new menu category
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Category Name</Label>
                  <Input className="bg-zinc-800 border-zinc-700 text-white" placeholder="e.g., Main Course" />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Description</Label>
                  <Textarea className="bg-zinc-800 border-zinc-700 text-white" placeholder="Optional description" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddCategoryOpen(false)} className="border-zinc-700">
                  Cancel
                </Button>
                <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => {
                  toast.info('Category creation - implement API call')
                  setAddCategoryOpen(false)
                }}>
                  Add Category
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={addItemOpen} onOpenChange={setAddItemOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                <Plus className="mr-2 h-4 w-4" />
                Add Item
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-zinc-900 border-zinc-800 max-w-md">
              <DialogHeader>
                <DialogTitle className="text-white">Add Menu Item</DialogTitle>
                <DialogDescription className="text-zinc-400">
                  Add a new item to the menu
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 mt-4">
                <div className="space-y-2">
                  <Label className="text-zinc-300">Item Name</Label>
                  <Input className="bg-zinc-800 border-zinc-700 text-white" placeholder="e.g., Margherita Pizza" />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Price (₹)</Label>
                  <Input type="number" className="bg-zinc-800 border-zinc-700 text-white" placeholder="299" />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-300">Category</Label>
                  <select className="w-full bg-zinc-800 border border-zinc-700 text-white rounded-md px-3 py-2">
                    <option value="">Select category</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setAddItemOpen(false)} className="border-zinc-700">
                  Cancel
                </Button>
                <Button className="bg-orange-500 hover:bg-orange-600" onClick={() => {
                  toast.info('Menu item creation - implement API call')
                  setAddItemOpen(false)
                }}>
                  Add Item
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {groupedItems.length > 0 ? (
          groupedItems.map((category) => (
            <div key={category.id} className="space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-lg font-semibold text-white">{category.name}</h4>
                <Badge className={`border ${
                  category.is_active
                    ? 'bg-green-500/10 text-green-400 border-green-500/30'
                    : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/30'
                }`}>
                  {category.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              {category.items.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {category.items.map((item) => (
                    <div key={item.id} className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h5 className="font-medium text-white">{item.name}</h5>
                            {item.is_veg !== null && (
                              <Badge className={`text-xs ${
                                item.is_veg
                                  ? 'bg-green-500/10 text-green-400 border-green-500/30'
                                  : 'bg-red-500/10 text-red-400 border-red-500/30'
                              }`}>
                                {item.is_veg ? 'Veg' : 'Non-Veg'}
                              </Badge>
                            )}
                          </div>
                          {item.description && (
                            <p className="text-sm text-zinc-400 mt-1">{item.description}</p>
                          )}
                          <div className="flex items-center gap-2 mt-2">
                            {item.discounted_price ? (
                              <>
                                <span className="text-zinc-500 line-through">₹{item.price}</span>
                                <span className="text-white font-semibold">₹{item.discounted_price}</span>
                              </>
                            ) : (
                              <span className="text-white font-semibold">₹{item.price}</span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-white">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-zinc-400 hover:text-red-400">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      <Badge className={`mt-2 border ${
                        item.is_available
                          ? 'bg-green-500/10 text-green-400 border-green-500/30'
                          : 'bg-red-500/10 text-red-400 border-red-500/30'
                      }`}>
                        {item.is_available ? 'Available' : 'Unavailable'}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-zinc-500 text-sm">No items in this category</p>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-8">
            <p className="text-zinc-500">No menu categories. Add a category to get started.</p>
          </div>
        )}

        {uncategorizedItems.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-lg font-semibold text-white">Other Items</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {uncategorizedItems.map((item) => (
                <div key={item.id} className="p-4 bg-zinc-800 rounded-lg border border-zinc-700">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h5 className="font-medium text-white">{item.name}</h5>
                      {item.description && (
                        <p className="text-sm text-zinc-400 mt-1">{item.description}</p>
                      )}
                      <span className="text-white font-semibold mt-2 block">₹{item.price}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
