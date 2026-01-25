/**
 * Script to create a demo admin user for testing
 * Run with: npm run create-demo-user
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'
import { join } from 'path'

// Load environment variables from .env.local
function loadEnv() {
  try {
    const envPath = join(process.cwd(), '.env.local')
    const envFile = readFileSync(envPath, 'utf-8')
    const envVars: Record<string, string> = {}

    envFile.split('\n').forEach(line => {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        if (key && valueParts.length > 0) {
          envVars[key.trim()] = valueParts.join('=').trim()
        }
      }
    })

    Object.assign(process.env, envVars)
  } catch (error) {
    console.warn('Could not load .env.local file:', error)
  }
}

loadEnv()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY are set in .env.local')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

async function createDemoUser() {
  const demoEmail = 'admin@swato.com'
  const demoPassword = 'Admin@123'
  const demoName = 'Demo Admin'

  try {
    console.log('Creating demo admin user...')

    // Create auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email: demoEmail,
      password: demoPassword,
      email_confirm: true, // Auto-confirm email for demo
      user_metadata: {
        name: demoName,
        role: 'admin',
      },
    })

    if (authError) {
      if (authError.message.includes('already registered')) {
        console.log('⚠️  User already exists. Updating password...')

        // Try to update the existing user's password
        const { data: users } = await supabase.auth.admin.listUsers()
        const existingUser = users.users.find(u => u.email === demoEmail)

        if (existingUser) {
          const { error: updateError } = await supabase.auth.admin.updateUserById(
            existingUser.id,
            { password: demoPassword }
          )

          if (updateError) {
            console.error('Error updating password:', updateError.message)
            return
          }

          console.log('✅ Password updated successfully!')
        }
      } else {
        console.error('Error creating user:', authError.message)
        return
      }
    } else if (authData.user) {
      console.log('✅ Auth user created successfully!')

      // Create user profile in users table
      const { error: profileError } = await supabase.from('users').upsert({
        id: authData.user.id,
        email: demoEmail,
        name: demoName,
        role: 'admin',
        phone: '+1234567890',
      }, {
        onConflict: 'id',
      })

      if (profileError) {
        console.warn('⚠️  Warning: Could not create user profile:', profileError.message)
        console.warn('You may need to create the profile manually in the Supabase dashboard')
      } else {
        console.log('✅ User profile created successfully!')
      }
    }

    console.log('\n📋 Demo Credentials:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`Email:    ${demoEmail}`)
    console.log(`Password: ${demoPassword}`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n✅ You can now log in to the admin panel with these credentials!')
  } catch (error) {
    console.error('Unexpected error:', error)
  }
}

createDemoUser()
