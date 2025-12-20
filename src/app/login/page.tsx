'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SignInPage, type Testimonial } from '@/components/ui/sign-in'
import { toast } from 'sonner'

// Testimonials for the sign-in page
const testimonials: Testimonial[] = [
  {
    avatarSrc: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop&crop=face',
    name: 'Sarah Johnson',
    handle: '@sarahj',
    text: 'The admin panel makes managing our restaurant operations so much easier!',
  },
  {
    avatarSrc: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face',
    name: 'Michael Chen',
    handle: '@mchen',
    text: 'Real-time order tracking and analytics help us make better decisions.',
  },
  {
    avatarSrc: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&h=100&fit=crop&crop=face',
    name: 'Emily Rodriguez',
    handle: '@emilyr',
    text: 'Love how intuitive and powerful this admin dashboard is!',
  },
]

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSignIn(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        toast.error(error.message)
        return
      }

      toast.success('Welcome back!')
      router.push('/admin/dashboard')
      router.refresh()
    } catch {
      toast.error('An error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  function handleGoogleSignIn() {
    toast.info('Google sign-in coming soon!')
    // TODO: Implement Google OAuth
  }

  function handleResetPassword() {
    toast.info('Password reset feature coming soon!')
    // TODO: Implement password reset
  }

  function handleCreateAccount() {
    toast.info('Account creation is managed separately. Contact your administrator.')
  }

  return (
    <SignInPage
      title={
        <>
          <span className="font-light text-foreground tracking-tighter">Welcome to</span>
          <br />
          <span className="font-bold bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent">Swato Admin</span>
        </>
      }
      description="Sign in to access the admin panel and manage your food delivery platform"
      heroImageSrc="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800&h=1200&fit=crop"
      testimonials={testimonials}
      onSignIn={handleSignIn}
      onGoogleSignIn={handleGoogleSignIn}
      onResetPassword={handleResetPassword}
      onCreateAccount={handleCreateAccount}
    />
  )
}
