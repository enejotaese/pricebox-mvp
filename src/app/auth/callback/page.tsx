'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

export default function CallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleCallback = async () => {
      await new Promise(resolve => setTimeout(resolve, 500))

      const { data, error } = await supabase.auth.getSession()

      if (error || !data.session) {
        router.push('/auth/login?error=auth_failed')
        return
      }

      const { data: orgs } = await supabase
        .from('organizations')
        .select('id')
        .eq('owner_id', data.session.user.id)
        .limit(1)

      if (!orgs || orgs.length === 0) {
        const slug = data.session.user.email?.split('@')[0] || 'negocio'
        
        await supabase
          .from('organizations')
          .insert({
            name: data.session.user.email?.split('@')[0] || 'Mi Negocio',
            slug: slug,
            owner_id: data.session.user.id,
          })
      }

      router.push('/dashboard')
    }

    handleCallback()
  }, [router])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Procesando autenticación...</p>
    </div>
  )
}
