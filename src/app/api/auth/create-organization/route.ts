import { supabaseAdmin } from '@/lib/supabase/admin'
import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { user_id, email, full_name } = body

    if (!user_id) {
      return NextResponse.json(
        { error: 'user_id es requerido' },
        { status: 400 }
      )
    }

    console.log('Creating organization for user:', user_id)

    // 1. VERIFICAR SI YA EXISTE (evitar duplicados)
    const { data: existingOrg, error: checkError } = await supabaseAdmin
      .from('organizations')
      .select('id')
      .eq('owner_id', user_id)
      .single()

    if (!checkError && existingOrg) {
      console.log('✅ Organization already exists:', existingOrg.id)
      
      // Crear profile si no existe
      const { data: existingProfile } = await supabaseAdmin
        .from('organization_profiles')
        .select('id')
        .eq('organization_id', existingOrg.id)
        .single()

      if (!existingProfile) {
        await supabaseAdmin
          .from('organization_profiles')
          .insert({
            organization_id: existingOrg.id,
            ideal_monthly_salary: 0,
            fixed_costs: 0,
            variable_costs: 0,
            province: 'Buenos Aires',
            socioeconomic_level: 'medium',
            is_setup_complete: false,
          })
      }

      return NextResponse.json(
        { 
          success: true, 
          organization_id: existingOrg.id,
          message: 'Organización ya existía'
        },
        { status: 200 }
      )
    }

    // 2. CREAR NUEVA ORGANIZACIÓN
    const emailBase = email?.split('@')[0] || 'usuario'
    const timestamp = Date.now().toString(36)
    const randomStr = crypto.randomBytes(4).toString('hex')
    const slug = `${emailBase}-${timestamp}-${randomStr}`.toLowerCase().substring(0, 100)

    console.log('Generated slug:', slug)

    const { data: org, error: orgError } = await supabaseAdmin
      .from('organizations')
      .insert({
        owner_id: user_id,
        name: full_name || 'Mi Negocio',
        slug: slug,
      })
      .select()
      .single()

    if (orgError) {
      console.error('❌ Organization error:', orgError)
      
      // Si es error de constraint unique, el trigger ya creó la org
      if (orgError.code === '23505' && orgError.details?.includes('owner_id')) {
        console.log('Organization already created by trigger, fetching it...')
        
        const { data: org2 } = await supabaseAdmin
          .from('organizations')
          .select('id')
          .eq('owner_id', user_id)
          .single()

        if (org2) {
          return NextResponse.json(
            { 
              success: true, 
              organization_id: org2.id,
              message: 'Organización creada por trigger'
            },
            { status: 200 }
          )
        }
      }

      return NextResponse.json(
        { error: `Error al crear organización: ${orgError.message}` },
        { status: 500 }
      )
    }

    if (!org) {
      return NextResponse.json(
        { error: 'No se creó la organización' },
        { status: 500 }
      )
    }

    console.log('✅ Organization created:', org.id)

    // 3. CREAR PROFILE
    const { error: profileError } = await supabaseAdmin
      .from('organization_profiles')
      .insert({
        organization_id: org.id,
        ideal_monthly_salary: 0,
        fixed_costs: 0,
        variable_costs: 0,
        province: 'Buenos Aires',
        socioeconomic_level: 'medium',
        is_setup_complete: false,
      })

    if (profileError) {
      console.error('⚠️ Profile error:', profileError)
    }

    console.log('✅ Profile created')

    return NextResponse.json(
      { 
        success: true, 
        organization_id: org.id,
        message: 'Organización y perfil creados correctamente'
      },
      { status: 200 }
    )

  } catch (error: any) {
    console.error('❌ Unexpected error:', error)
    return NextResponse.json(
      { error: error.message || 'Error inesperado' },
      { status: 500 }
    )
  }
}
