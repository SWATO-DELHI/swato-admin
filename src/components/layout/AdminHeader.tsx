'use client'

import { Bell, Search, User, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Input } from '@/components/ui/input'
import { ThemeToggle } from '@/components/ui/theme-toggle'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

interface AdminHeaderProps {
  sidebarCollapsed?: boolean
}

export function AdminHeader({ sidebarCollapsed }: AdminHeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <header
      className={`fixed top-0 right-0 z-30 h-16 bg-background/80 dark:bg-zinc-950/80 backdrop-blur-sm border-b border-border dark:border-zinc-800 transition-all duration-300 ${
        sidebarCollapsed ? 'left-16' : 'left-64'
      }`}
    >
      <div className="flex h-full items-center justify-between px-6">
        <div className="flex items-center gap-4 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search orders, customers, restaurants..."
              className="pl-10 bg-background dark:bg-zinc-900 border-border dark:border-zinc-800 text-foreground placeholder:text-muted-foreground focus:border-orange-500/50"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <ThemeToggle />

          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground hover:text-foreground hover:bg-secondary dark:hover:bg-zinc-800"
          >
            <Bell size={20} />
            <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-orange-500" />
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 text-muted-foreground hover:text-foreground hover:bg-secondary dark:hover:bg-zinc-800"
              >
                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                  <User size={16} className="text-white" />
                </div>
                <span className="hidden md:inline text-sm">Admin</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 bg-background dark:bg-zinc-900 border-border dark:border-zinc-800">
              <DropdownMenuLabel className="text-muted-foreground">My Account</DropdownMenuLabel>
              <DropdownMenuSeparator className="bg-border dark:bg-zinc-800" />
              <DropdownMenuItem className="text-foreground focus:bg-secondary dark:focus:bg-zinc-800 cursor-pointer">
                <User className="mr-2 h-4 w-4" />
                Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-border dark:bg-zinc-800" />
              <DropdownMenuItem
                onClick={handleSignOut}
                className="text-red-500 dark:text-red-400 focus:bg-secondary dark:focus:bg-zinc-800 cursor-pointer"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
