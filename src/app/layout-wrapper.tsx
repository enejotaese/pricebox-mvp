'use client'

import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

/**
 * COMPONENT: Layout Wrapper
 * 
 * Detecta automáticamente si el usuario necesita onboarding
 * Redirige al lugar correcto
 */

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const pathname = usePathname()
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const checkSetupStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()

        // Si no hay usuario y no está en auth, ignorar
        if (!user) {
          setChecking(false)
          return
        }

        // Si está en /onboarding, permitir
        if (pathname?.startsWith('/onboarding')) {
          setChecking(false)
          return
        }

        // Si está en /auth, permitir
        if (pathname?.startsWith('/auth')) {
          setChecking(false)
          return
        }

        // Obtener org
        const { data: org } = await supabase
          .from('organizations')
          .select('id')
          .eq('owner_id', user.id)
          .single()

        if (!org) {
          setChecking(false)
          return
        }

        // Obtener profile
        const { data: profile } = await supabase
          .from('organization_profiles')
          .select('is_setup_complete')
          .eq('organization_id', org.id)
          .single()

        // Si setup NO está completo, redirigir
        if (profile && !profile.is_setup_complete) {
          router.push('/onboarding/setup-profile')
          return
        }

        setChecking(false)
      } catch (error) {
        console.error('Error checking setup:', error)
        setChecking(false)
      }
    }

    checkSetupStatus()
  }, [router, pathname])

  if (checking) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 dark:border-teal-400"></div>
      </div>
    )
  }

  return <>{children}</>
}
