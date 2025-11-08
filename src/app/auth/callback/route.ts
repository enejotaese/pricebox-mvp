/**
 * AUTH CALLBACK - Se ejecuta después de login/signup
 * 
 * Redirige automáticamente al onboarding si no está completo
 */

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')

  if (code) {
    const supabase = createRouteHandlerClient({ cookies })
    await supabase.auth.exchangeCodeForSession(code)

    // Obtener usuario
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      // Obtener organización
      const { data: org } = await supabase
        .from('organizations')
        .select('id')
        .eq('owner_id', user.id)
        .single()

      if (org) {
        // Obtener profile
        const { data: profile } = await supabase
          .from('organization_profiles')
          .select('is_setup_complete')
          .eq('organization_id', org.id)
          .single()

        // Si setup NO está completo, ir a onboarding
        if (profile && !profile.is_setup_complete) {
          return NextResponse.redirect(new URL('/onboarding/setup-profile', request.url))
        }

        // Si está completo, ir al dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  }

  return NextResponse.redirect(new URL('/auth/login', request.url))
}
