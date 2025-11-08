# 📦 PRICEBOX MVP - CÓDIGO COMPLETO

**Fecha de exportación:** 2025-11-08
**Propósito:** Documentación completa para transferir contexto a otras IAs

---

## 📁 ESTRUCTURA DEL PROYECTO

{
  "name": "next-entree",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "format": "pnpm prettier ./src --write",
    "format:check": "pnpm prettier ./src --check"
  },
  "dependencies": {
    "@hookform/resolvers": "^5.2.2",
    "@radix-ui/react-dropdown-menu": "^2.0.6",
    "@radix-ui/react-slot": "^1.0.2",
    "@supabase/auth-helpers-nextjs": "^0.10.0",
    "@supabase/supabase-js": "^2.80.0",
    "@t3-oss/env-nextjs": "^0.9.2",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.1",
    "lucide-react": "^0.330.0",
    "next": "14.1.0",
    "next-themes": "^0.2.1",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "react-hook-form": "^7.66.0",
    "tailwind-merge": "^2.6.0",
    "tailwindcss-animate": "^1.0.7",
    "zod": "^3.25.76"
  },
  "devDependencies": {
    "@ianvs/prettier-plugin-sort-imports": "^4.1.1",
    "@types/node": "^20.11.17",
    "@types/react": "^18.2.55",
    "@types/react-dom": "^18.2.19",
    "@typescript-eslint/eslint-plugin": "^7.1.0",
    "@typescript-eslint/parser": "^7.1.0",
    "autoprefixer": "^10.4.21",
    "eslint": "^8.56.0",
    "eslint-config-next": "14.1.0",
    "postcss": "^8.5.6",
    "prettier": "^3.2.5",
    "prettier-plugin-tailwindcss": "^0.5.11",
    "tailwindcss": "^3.4.18",
    "typescript": "^5.3.3"
  }
}
```

## 🔐 SISTEMA DE AUTENTICACIÓN


### 📄 `src/app/auth/signup/page.tsx`

'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import Link from 'next/link'

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)

    try {
      if (!email || !password || !confirmPassword) {
        throw new Error('Por favor completa todos los campos')
      }

      if (password !== confirmPassword) {
        throw new Error('Las contraseñas no coinciden')
      }

      if (password.length < 8) {
        throw new Error('La contraseña debe tener al menos 8 caracteres')
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) {
        throw new Error(authError.message)
      }

      if (!authData?.user) {
        throw new Error('Error al crear usuario')
      }

      const userId = authData.user.id
      console.log('User registered:', userId)

      await new Promise(resolve => setTimeout(resolve, 2000))

      const orgResponse = await fetch('/api/auth/create-organization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_id: userId,
          email: email,
          full_name: email.split('@')[0],
        }),
      })

      if (!orgResponse.ok) {
        const errorData = await orgResponse.json()
        console.error('Error creating organization:', errorData)
        throw new Error(errorData.error || 'Error al crear organización')
      }

      const orgData = await orgResponse.json()

      if (!orgData.success) {
        throw new Error('No se pudo crear la organización')
      }

      console.log('Organization created:', orgData.organization_id)

      await new Promise(resolve => setTimeout(resolve, 1000))

      const { data: { session }, error: sessionError } = await supabase.auth.getSession()

      if (sessionError || !session) {
        console.warn('Session not established yet, redirecting to setup-profile anyway')
      }

      router.push('/onboarding/setup-profile')

    } catch (error: any) {
      console.error('Error during signup:', error)
      setError(error.message || 'Error al registrarse')
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        
        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-slate-800">
          
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Crear cuenta</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-2">
              Únete a PriceBox y empieza a calcular tus precios
            </p>
          </div>

          <form onSubmit={handleSignUp} className="space-y-4">
            
            {error && (
              <div className="p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-200">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="tu@email.com"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 8 caracteres"
                  className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  disabled={loading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                >
                  {showPassword ? '👁️' : '👁️‍🗨️'}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Confirmar contraseña
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite tu contraseña"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                disabled={loading}
              />
            </div>

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                className="w-5 h-5 rounded mt-0.5"
                disabled={loading}
              />
              <span className="text-xs text-gray-600 dark:text-gray-400">
                Acepto los términos de servicio y la política de privacidad
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg font-bold text-base hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed mt-6"
            >
              {loading ? '⏳ Creando cuenta...' : '✅ Crear cuenta'}
            </button>
          </form>

          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-300 dark:bg-slate-700"></div>
            <span className="text-xs text-gray-600 dark:text-gray-400">o</span>
            <div className="flex-1 h-px bg-gray-300 dark:bg-slate-700"></div>
          </div>

          <p className="text-center text-sm text-gray-600 dark:text-gray-400">
            ¿Ya tienes cuenta?{' '}
            <Link href="/auth/login" className="text-teal-600 dark:text-teal-400 hover:underline font-semibold">
              Inicia sesión
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-gray-600 dark:text-gray-400 mt-6">
          PriceBox te ayuda a calcular precios rentables para tu negocio
        </p>
      </div>
    </div>
  )
}
```

### 📄 `src/app/auth/callback/route.ts`

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
```

### 📄 `src/app/auth/callback/page.tsx`

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
```

### 📄 `src/app/auth/login/page.tsx`

'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (signInError) {
      setError(signInError.message)
      setLoading(false)
    } else {
      router.push('/dashboard')
    }
  }

  const handleGoogleLogin = async () => {
    setLoading(true)
    setError(null)

    const { error: googleError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (googleError) {
      setError(googleError.message)
      setLoading(false)
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-t-lg">
            <CardTitle className="text-center text-2xl">PriceBox</CardTitle>
            <p className="text-center text-sm text-blue-100 mt-2">Inicia sesión en tu cuenta</p>
          </CardHeader>
          <CardContent className="pt-8">
            <form onSubmit={handleEmailLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  required
                  className="text-gray-900"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Contraseña</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="text-gray-900"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2"
              >
                {loading ? 'Iniciando sesión...' : 'Iniciar sesión'}
              </Button>
            </form>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-600">O continúa con</span>
              </div>
            </div>

            <Button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full bg-white hover:bg-gray-50 text-gray-900 border border-gray-300 font-semibold py-2"
            >
              📧 Google
            </Button>

            <p className="text-center text-sm text-gray-700 mt-6">
              ¿No tienes cuenta?{' '}
              <Link href="/auth/signup" className="text-blue-600 hover:text-blue-700 font-semibold">
                Regístrate aquí
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
```

## 🔌 API ROUTES


### �� `src/app/api/auth/create-organization/route.ts`

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
```

## 📝 DEFINICIONES DE TIPOS


### 📄 `src/types/profile.ts`

/**
 * TIPOS - Profile
 * Definiciones de TypeScript para profiles de usuario
 */

export interface OrganizationProfile {
  id: string
  organization_id: string
  ideal_monthly_salary: number
  fixed_costs: number
  variable_costs: number
  province: string
  socioeconomic_level: string
  is_setup_complete: boolean
  created_at: string
  updated_at: string
}

export const ARGENTINA_PROVINCES = [
  'Buenos Aires',
  'CABA',
  'Catamarca',
  'Córdoba',
  'Corrientes',
  'Chaco',
  'Chubut',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán',
]

export const SOCIOECONOMIC_LEVELS = [
  {
    value: 'low',
    label: 'Bajo',
    description: 'Barrios con economía reducida',
  },
  {
    value: 'medium',
    label: 'Medio',
    description: 'Barrios de clase media',
  },
  {
    value: 'high',
    label: 'Alto',
    description: 'Barrios de clase alta',
  },
]
```

### 📄 `src/types/index.d.ts`

export type SiteConfig = {
  name: string
  author: string
  description: string
  keywords: Array<string>
  url: {
    base: string
    author: string
  }
  links: {
    github: string
  }
  ogImage: string
}
```

## 📊 DASHBOARD


### 📄 `src/app/dashboard/products/page.tsx`

'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Organization, Product } from '@/types/database'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import Link from 'next/link'

export default function ProductsPage() {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    const loadProducts = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) return

      const { data: org } = await supabase
        .from('organizations')
        .select('*')
        .eq('owner_id', user.id)
        .single()

      if (org) {
        setOrganization(org)

        const { data: prods } = await supabase
          .from('products')
          .select('*')
          .eq('organization_id', org.id)
          .order('created_at', { ascending: false })

        setProducts(prods || [])
      }

      setLoading(false)
    }

    loadProducts()
  }, [])

  const handleDelete = async (productId: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?'))
      return

    setDeleting(productId)

    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', productId)

    if (error) {
      alert('Error al eliminar: ' + error.message)
    } else {
      setProducts(products.filter(p => p.id !== productId))
    }

    setDeleting(null)
  }

  if (loading) {
    return <div className="text-center py-12">Cargando productos...</div>
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle>Mis Productos</CardTitle>
          <Link href="/dashboard/calculator">
            <Button size="sm">+ Nuevo Producto</Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {products.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No tienes productos aún</p>
            <Link href="/dashboard/calculator">
              <Button>Crear Primer Producto</Button>
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Costo Total</TableHead>
                  <TableHead>Precio Final</TableHead>
                  <TableHead>Ganancia</TableHead>
                  <TableHead>Margen %</TableHead>
                  <TableHead>Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map(product => {
                  const totalCost =
                    (product.base_cost || 0) +
                    (product.materials_cost || 0) +
                    (product.labor_hours || 0) * (product.hourly_rate || 0)

                  return (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">
                        {product.name}
                      </TableCell>
                      <TableCell>${totalCost.toFixed(2)}</TableCell>
                      <TableCell className="font-bold text-blue-600">
                        ${product.final_price?.toFixed(2)}
                      </TableCell>
                      <TableCell className="text-green-600 font-semibold">
                        +${product.profit_margin?.toFixed(2)}
                      </TableCell>
                      <TableCell>{product.markup_percentage}%</TableCell>
                      <TableCell>
                        <button
                          onClick={() => handleDelete(product.id)}
                          disabled={deleting === product.id}
                          className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                        >
                          {deleting === product.id ? 'Eliminando...' : '🗑️'}
                        </button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
```

### 📄 `src/app/dashboard/calculator/results/page.tsx`

'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Organization } from '@/types/database'
import type { CalculatorData } from '../page'

/**
 * PÁGINA DE RESULTADOS - PASO 2
 * 
 * Minimalista, limpio, profesional
 * Muestra el análisis completo de rentabilidad
 */

interface AnalysisResult {
  directCostPerUnit: number
  operativePerUnit: number
  equipmentPerUnit: number
  platformCommissionAmount: number
  ivaAmount: number
  finalCost: number
  finalPrice: number
  profitPerUnit: number
  netMarginPercentage: number
  breakevenUnits: number
  breakevenRevenue: number
  hoursPerMonth: number
  hourlyRateActual: number
  totalPersonalExpenses: number
  monthlyProfitBest: number
  isSustainable: boolean
}

interface Recommendation {
  title: string
  description: string
  impact: number
  difficulty: 'easy' | 'medium' | 'hard'
}

export default function ResultsPage() {
  const router = useRouter()
  const [data, setData] = useState<CalculatorData | null>(null)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const calculatorData = sessionStorage.getItem('calculatorData')
    if (!calculatorData) {
      router.push('/dashboard/calculator/new')
      return
    }
    setData(JSON.parse(calculatorData))
  }, [router])

  useEffect(() => {
    const loadOrg = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: org } = await supabase
        .from('organizations')
        .select('*')
        .eq('owner_id', user.id)
        .single()

      setOrganization(org)
    }

    loadOrg()
  }, [])

  // CALCULAR ANÁLISIS
  const analysis = useMemo(() => {
    if (!data) return null

    const totalMaterials = data.materials.reduce((sum, m) => sum + (m.quantity * m.unitPrice), 0)
    const laborCost = (data.laborMinutes / 60) * data.hourlyRate
    const directCostPerUnit = totalMaterials + laborCost

    const totalOperativeExpenses = data.operativeExpenses.reduce((sum, exp) => {
      return sum + (exp.amount * (exp.percentage / 100))
    }, 0)
    const operativePerUnit = totalOperativeExpenses / data.monthlyVolume

    const monthlyEquipmentCost = data.equipment.reduce((sum, eq) => {
      return sum + (eq.cost / (eq.lifeYears * 12))
    }, 0)
    const equipmentPerUnit = monthlyEquipmentCost / data.monthlyVolume

    const indirectCostPerUnit = operativePerUnit + equipmentPerUnit
    const subtotalCostPerUnit = directCostPerUnit + indirectCostPerUnit

    let platformCommissionAmount = 0
    let finalCostBeforeIVA = subtotalCostPerUnit
    if (data.sellPlatform !== 'presencial') {
      platformCommissionAmount = subtotalCostPerUnit * (data.platformFee / 100)
      finalCostBeforeIVA = subtotalCostPerUnit + platformCommissionAmount
    }

    let ivaAmount = 0
    let finalCost = finalCostBeforeIVA
    if (data.includeIVA) {
      ivaAmount = finalCostBeforeIVA * 0.21
      finalCost = finalCostBeforeIVA + ivaAmount
    }

    let finalPrice = 0
    if (data.profitOption === 'percentage') {
      finalPrice = finalCost * (1 + data.profitPercentage / 100)
    } else {
      finalPrice = finalCost + data.profitAmount
    }

    const marginContribution = finalPrice - (directCostPerUnit + operativePerUnit + platformCommissionAmount)
    const breakevenUnits = marginContribution > 0 ? Math.ceil(0 / marginContribution) : 0

    const hoursPerMonth = data.hoursPerDay * data.daysPerWeek * 4.33
    const hourlyRateActual = (finalPrice - finalCost) / (data.laborMinutes / 60)

    const profitPerUnit = finalPrice - finalCost
    const netMarginPercentage = (profitPerUnit / finalPrice) * 100

    const totalPersonalExpenses = data.personalExpenses.reduce((sum, e) => sum + e.amount, 0)
    const monthlyProfitBest = data.monthlyVolume * profitPerUnit
    const isSustainable = monthlyProfitBest >= totalPersonalExpenses

    return {
      directCostPerUnit,
      operativePerUnit,
      equipmentPerUnit,
      platformCommissionAmount,
      ivaAmount,
      finalCost,
      finalPrice,
      profitPerUnit,
      netMarginPercentage,
      breakevenUnits,
      breakevenRevenue: breakevenUnits * finalPrice,
      hoursPerMonth,
      hourlyRateActual,
      totalPersonalExpenses,
      monthlyProfitBest,
      isSustainable,
    } as AnalysisResult
  }, [data])

  // GENERAR RECOMENDACIONES
  const recommendations = useMemo(() => {
    if (!analysis) return []

    const recs: Recommendation[] = []

    if (!analysis.isSustainable) {
      const needed = Math.abs(analysis.monthlyProfitBest - analysis.totalPersonalExpenses)
      const volumeNeeded = Math.ceil(needed / analysis.profitPerUnit)

      recs.push({
        title: `Aumenta volumen a ${volumeNeeded} unidades/mes`,
        description: `Necesitas vender ${volumeNeeded} unidades para cubrir tus gastos personales`,
        impact: needed,
        difficulty: 'hard',
      })

      recs.push({
        title: 'Agrega otro producto complementario',
        description: 'Crea un segundo producto para diversificar ingresos',
        impact: analysis.profitPerUnit * (data?.monthlyVolume || 100),
        difficulty: 'medium',
      })

      const priceIncrease = needed / (data?.monthlyVolume || 1)
      recs.push({
        title: `Aumenta precio a $${(analysis.finalPrice + priceIncrease).toFixed(2)}`,
        description: 'Un pequeño aumento podría hacerlo viable sin cambiar volumen',
        impact: needed,
        difficulty: 'easy',
      })
    }

    return recs
  }, [analysis, data])

  const handleSaveProduct = async () => {
    if (!organization || !data || !analysis) return

    setSaving(true)

    try {
      const { data: product } = await supabase
        .from('products')
        .insert({
          organization_id: organization.id,
          name: data.productName,
          base_cost: analysis.finalCost,
          final_price: analysis.finalPrice,
          profit_margin: analysis.profitPerUnit,
          markup_percentage: data.profitOption === 'percentage' 
            ? data.profitPercentage
            : (analysis.profitPerUnit / analysis.finalCost) * 100,
        })
        .select()
        .single()

      if (product) {
        const materialsToInsert = data.materials.map(m => ({
          product_id: product.id,
          name: m.name,
          quantity: m.quantity,
          unit: m.unit,
          unit_price: m.unitPrice,
          total_price: m.quantity * m.unitPrice,
        }))

        await supabase.from('product_materials').insert(materialsToInsert)

        await supabase.from('product_overhead').insert({
          product_id: product.id,
          monthly_fixed_costs: data.operativeExpenses.reduce((sum, e) => sum + e.amount, 0),
          variable_cost_per_unit: analysis.operativePerUnit,
          estimated_monthly_volume: data.monthlyVolume,
        })

        await supabase.from('product_analysis').insert({
          product_id: product.id,
          direct_cost_per_unit: analysis.directCostPerUnit,
          indirect_cost_per_unit: analysis.operativePerUnit,
          total_cost_per_unit: analysis.finalCost,
          desired_profit_percentage: data.profitOption === 'percentage' ? data.profitPercentage : null,
          desired_profit_amount: data.profitOption === 'amount' ? data.profitAmount : null,
          final_price: analysis.finalPrice,
          breakeven_units: analysis.breakevenUnits,
          breakeven_revenue: analysis.breakevenRevenue,
          gross_margin_percentage: analysis.netMarginPercentage,
          net_margin_percentage: analysis.netMarginPercentage,
        })

        setSaved(true)
        sessionStorage.removeItem('calculatorData')
        
        setTimeout(() => {
          router.push('/dashboard')
        }, 1500)
      }
    } catch (error: any) {
      alert('Error al guardar: ' + error.message)
    } finally {
      setSaving(false)
    }
  }

  if (!data || !analysis) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 dark:border-teal-400"></div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen overflow-auto">
      <div className="max-w-2xl mx-auto px-8 py-12">
        
        {/* PROGRESS */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400 rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Datos ingresados</span>
              </div>
            </div>
            <div className="h-1 flex-1 bg-gray-200 dark:bg-slate-700 mx-4"></div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Análisis completo</span>
              </div>
            </div>
          </div>
        </div>

        {/* TÍTULO */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Análisis de {data.productName}</h1>
          <p className="text-gray-600 dark:text-gray-400">Aquí están los resultados</p>
        </div>

        {saved && (
          <div className="mb-6 p-4 bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-lg text-green-800 dark:text-green-100 text-sm font-semibold animate-fade-in">
            ✅ ¡Producto guardado exitosamente! Redirigiendo...
          </div>
        )}

        {/* VIABILIDAD - PRINCIPAL */}
        <div className={`mb-12 p-8 rounded-lg border-2 animate-fade-in ${
          analysis.isSustainable
            ? 'bg-green-50 dark:bg-green-900 border-green-300 dark:border-green-700'
            : 'bg-red-50 dark:bg-red-900 border-red-300 dark:border-red-700'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className={`text-sm font-semibold uppercase ${
                analysis.isSustainable
                  ? 'text-green-700 dark:text-green-200'
                  : 'text-red-700 dark:text-red-200'
              }`}>
                {analysis.isSustainable ? '✅ NEGOCIO VIABLE' : '❌ NO ES VIABLE AÚN'}
              </p>
              <p className={`text-3xl font-bold mt-1 ${
                analysis.isSustainable
                  ? 'text-green-900 dark:text-green-100'
                  : 'text-red-900 dark:text-red-100'
              }`}>
                ${analysis.monthlyProfitBest.toFixed(2)}
              </p>
            </div>
            <div className="text-6xl">
              {analysis.isSustainable ? '🎉' : '⚠️'}
            </div>
          </div>
          <p className={`text-sm ${
            analysis.isSustainable
              ? 'text-green-700 dark:text-green-200'
              : 'text-red-700 dark:text-red-200'
          }`}>
            {analysis.isSustainable
              ? `Tu ganancia mensual cubre tus gastos personales ($${analysis.totalPersonalExpenses.toFixed(2)})`
              : `Te falta $${(analysis.totalPersonalExpenses - analysis.monthlyProfitBest).toFixed(2)}/mes`
            }
          </p>
        </div>

        {/* PRECIO DESTACADO */}
        <div className="mb-12 p-8 rounded-lg bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 animate-fade-in">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">PRECIO RECOMENDADO</p>
          <p className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            ${analysis.finalPrice.toFixed(2)}
          </p>
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-200 dark:border-slate-800">
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold mb-1">Ganancia por venta</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">${analysis.profitPerUnit.toFixed(2)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold mb-1">Margen neto</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{analysis.netMarginPercentage.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        {/* DESGLOSE DE COSTOS - MINIMALISTA */}
        <div className="mb-12 space-y-2 animate-fade-in">
          <p className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Desglose de costos</p>
          
          <CostRow label="Materiales" value={analysis.directCostPerUnit} />
          <CostRow label="Mano de obra" value={(data.laborMinutes / 60) * data.hourlyRate} />
          <CostRow label="Gastos operativos" value={analysis.operativePerUnit} />
          {analysis.equipmentPerUnit > 0 && <CostRow label="Equipos (amortización)" value={analysis.equipmentPerUnit} />}
          {analysis.platformCommissionAmount > 0 && <CostRow label="Comisiones" value={analysis.platformCommissionAmount} />}
          {analysis.ivaAmount > 0 && <CostRow label="IVA 21%" value={analysis.ivaAmount} />}
          
          <div className="flex items-center justify-between pt-3 border-t border-gray-200 dark:border-slate-800">
            <span className="font-semibold text-gray-900 dark:text-white">Costo total</span>
            <span className="text-lg font-bold text-gray-900 dark:text-white">${analysis.finalCost.toFixed(2)}</span>
          </div>
        </div>

        {/* MÉTRICAS IMPORTANTES */}
        <div className="grid grid-cols-2 gap-4 mb-12 animate-fade-in">
          <MetricBox
            label="Punto de equilibrio"
            value={`${analysis.breakevenUnits} unidades`}
            description="por mes"
          />
          <MetricBox
            label="Horas dedicadas"
            value={`${analysis.hoursPerMonth.toFixed(0)} horas`}
            description="por mes"
          />
          <MetricBox
            label="Tu tarifa real"
            value={`$${analysis.hourlyRateActual.toFixed(2)}`}
            description="por hora"
          />
          <MetricBox
            label="Ingreso de equilibrio"
            value={`$${analysis.breakevenRevenue.toFixed(2)}`}
            description="por mes"
          />
        </div>

        {/* RECOMENDACIONES */}
        {recommendations.length > 0 && (
          <div className="mb-12 animate-fade-in">
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Opciones para mejorarlo</p>
            <div className="space-y-3">
              {recommendations.map((rec, idx) => (
                <div key={idx} className="p-4 bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-lg">
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-1">{rec.title}</p>
                  <p className="text-xs text-blue-800 dark:text-blue-200 mb-2">{rec.description}</p>
                  <div className="flex items-center justify-between">
                    <span className={`text-xs px-2 py-1 rounded ${
                      rec.difficulty === 'easy' ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-200' :
                      rec.difficulty === 'medium' ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-200' :
                      'bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-200'
                    }`}>
                      {rec.difficulty === 'easy' ? '✓ Fácil' : rec.difficulty === 'medium' ? '◐ Medio' : '◑ Difícil'}
                    </span>
                    <span className="text-xs font-semibold text-blue-900 dark:text-blue-100">
                      Impacto: +${rec.impact.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* BOTONES DE ACCIÓN */}
        <div className="flex items-center gap-4 pt-8 border-t border-gray-200 dark:border-slate-800">
          <button
            onClick={() => {
              sessionStorage.removeItem('calculatorData')
              router.push('/dashboard/calculator/new')
            }}
            className="flex-1 px-6 py-3 border border-gray-300 dark:border-slate-700 rounded-lg text-gray-900 dark:text-white font-semibold text-sm hover:bg-gray-50 dark:hover:bg-slate-800 transition"
          >
            ← Editar
          </button>
          <button
            onClick={handleSaveProduct}
            disabled={saving || saved}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition disabled:opacity-50"
          >
            {saved ? '✅ Guardado' : saving ? '⏳ Guardando...' : '✅ Guardar Producto'}
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-in-out;
        }
      `}</style>
    </div>
  )
}

/**
 * COMPONENTES MINIMALISTAS
 */

function CostRow({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between py-2">
      <span className="text-sm text-gray-600 dark:text-gray-400">{label}</span>
      <span className="text-sm font-semibold text-gray-900 dark:text-white">${value.toFixed(2)}</span>
    </div>
  )
}

interface MetricBoxProps {
  label: string
  value: string
  description: string
}

function MetricBox({ label, value, description }: MetricBoxProps) {
  return (
    <div className="bg-white dark:bg-slate-900 rounded-lg p-5 border border-gray-200 dark:border-slate-800">
      <p className="text-xs text-gray-600 dark:text-gray-400 uppercase font-semibold mb-2">{label}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{description}</p>
    </div>
  )
}
```

### 📄 `src/app/dashboard/calculator/new/page.tsx`

'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

/**
 * Página redirector para mantener URLs limpias
 * /calculator/new → /calculator
 */
export default function NewCalculatorPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/dashboard/calculator')
  }, [router])

  return null
}
```

### 📄 `src/app/dashboard/calculator/page.tsx`

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Organization } from '@/types/database'
import { Input } from '@/components/ui/input'
import { FieldHint } from '@/components/calculator/FieldHint'
import { SelectWithCustom } from '@/components/calculator/SelectWithCustom'
import {
  BUSINESS_TYPES,
  UNITS,
  EXPENSE_TEMPLATES,
  PLATFORMS,
  PERSONAL_EXPENSES,
  FIELD_HINTS,
} from '@/constants/calculator'

export interface CalculatorData {
  productName: string
  businessTypeValue: string
  businessTypeCustom: string
  monthlyVolume: number
  materials: Array<{
    id: number
    name: string
    quantity: number
    unitValue: string
    unitCustom: string
    unitPrice: number
  }>
  laborTimeType: 'minutes' | 'hours'
  laborTime: number
  hourlyRate: number
  hoursPerDay: number
  daysPerWeek: number
  operativeExpenses: Array<{
    id: number
    name: string
    amount: number
    percentage: number
  }>
  sellPlatformValue: string
  sellPlatformCustom: string
  platformFee: number
  includeIVA: boolean
  equipment: Array<{ id: number; name: string; cost: number; lifeYears: number }>
  profitOption: 'percentage' | 'amount'
  profitPercentage: number
  profitAmount: number
  personalExpenses: Array<{ id: number; name: string; amount: number }>
}

const DEFAULT_DATA: CalculatorData = {
  productName: '',
  businessTypeValue: 'confection',
  businessTypeCustom: '',
  monthlyVolume: 100,
  materials: [{ id: 1, name: '', quantity: 1, unitValue: 'unidad', unitCustom: '', unitPrice: 0 }],
  laborTimeType: 'minutes',
  laborTime: 30,
  hourlyRate: 150,
  hoursPerDay: 8,
  daysPerWeek: 6,
  operativeExpenses: [
    { id: 1, name: 'Alquiler', amount: 0, percentage: 100 },
    { id: 2, name: 'Servicios', amount: 0, percentage: 100 },
  ],
  sellPlatformValue: 'presencial',
  sellPlatformCustom: '',
  platformFee: 0,
  includeIVA: true,
  equipment: [],
  profitOption: 'percentage',
  profitPercentage: 40,
  profitAmount: 0,
  personalExpenses: PERSONAL_EXPENSES.map(e => ({ ...e, amount: 0 })),
}

export default function CalculatorInputPage() {
  const [data, setData] = useState<CalculatorData>(DEFAULT_DATA)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadOrg = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: org } = await supabase
        .from('organizations')
        .select('*')
        .eq('owner_id', user.id)
        .single()

      setOrganization(org)
      setLoading(false)
    }

    loadOrg()
  }, [])

  const handleContinue = () => {
    if (!data.productName.trim()) {
      alert('Por favor, ingresa el nombre del producto')
      return
    }
    sessionStorage.setItem('calculatorData', JSON.stringify(data))
    router.push('/dashboard/calculator/results')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 dark:border-teal-400"></div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen overflow-auto">
      <div className="max-w-4xl mx-auto px-8 py-12">
        
        {/* PROGRESS */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-teal-500 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
                <span className="text-sm font-semibold text-gray-900 dark:text-white">Ingresa los datos</span>
              </div>
            </div>
            <div className="h-1 flex-1 bg-gray-200 dark:bg-slate-700 mx-4"></div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gray-200 dark:bg-slate-700 text-gray-500 dark:text-gray-400 rounded-full flex items-center justify-center text-sm font-bold">2</div>
                <span className="text-sm text-gray-500 dark:text-gray-400">Ver resultados</span>
              </div>
            </div>
          </div>
        </div>

        {/* HEADER */}
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">Crea tu producto</h1>
          <p className="text-gray-600 dark:text-gray-400">Completa esta información y te mostraremos si es rentable</p>
        </div>

        {/* SECCIÓN 1: PRODUCTO BÁSICO */}
        <Section title="📦 Producto Básico">
          <div className="flex items-end gap-3">
            {/* Nombre - Flex 1 */}
            <div className="flex-1">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1 mb-2">
                <span>📝</span>
                Nombre del producto
              </label>
              <Input
                value={data.productName}
                onChange={(e) => setData({ ...data, productName: e.target.value })}
                placeholder="Ej: Pantalón Básico"
                className="w-full text-sm"
              />
            </div>

            {/* Tipo - 40% */}
            <div className="w-40">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1 mb-2">
                <span>🎯</span>
                Tipo
              </label>
              <select
                value={data.businessTypeValue}
                onChange={(e) => setData({ ...data, businessTypeValue: e.target.value })}
                className="w-full px-3 py-2 text-xs rounded border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              >
                {BUSINESS_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                ))}
              </select>
            </div>

            {/* Volumen - 32% */}
            <div className="w-32">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1 mb-2">
                <span>📊</span>
                Volumen/mes
              </label>
              <Input
                type="number"
                value={data.monthlyVolume}
                onChange={(e) => setData({ ...data, monthlyVolume: parseFloat(e.target.value) })}
                placeholder="100"
                min="1"
                className="w-full text-sm"
              />
            </div>
          </div>
        </Section>

        {/* SECCIÓN 2: INSUMOS */}
        <Section title="🛠️ Insumos / Materiales">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">Todo lo que necesitas por unidad</p>
          <div className="space-y-2">
            {data.materials.map((mat, idx) => (
              <div key={mat.id} className="flex items-end gap-2 p-2 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 hover:border-teal-300 dark:hover:border-teal-700 transition">
                
                {/* Material Name - Flex */}
                <div className="flex-1 min-w-48">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">Material</label>
                  <Input
                    value={mat.name}
                    onChange={(e) => {
                      const updated = [...data.materials]
                      updated[idx].name = e.target.value
                      setData({ ...data, materials: updated })
                    }}
                    placeholder="Ej: Tela algodón"
                    className="w-full text-xs"
                  />
                </div>

                {/* Cantidad - 20% */}
                <div className="w-20">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">Cant.</label>
                  <Input
                    type="number"
                    value={mat.quantity}
                    onChange={(e) => {
                      const updated = [...data.materials]
                      updated[idx].quantity = parseFloat(e.target.value)
                      setData({ ...data, materials: updated })
                    }}
                    placeholder="1.5"
                    step="0.01"
                    className="w-full text-xs"
                  />
                </div>

                {/* Unidad - 24% */}
                <div className="w-24">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">Unidad</label>
                  <select
                    value={mat.unitValue}
                    onChange={(e) => {
                      const updated = [...data.materials]
                      updated[idx].unitValue = e.target.value
                      setData({ ...data, materials: updated })
                    }}
                    className="w-full px-2 py-1 text-xs rounded border border-gray-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
                  >
                    {UNITS.map(u => (
                      <option key={u.value} value={u.value}>{u.label}</option>
                    ))}
                  </select>
                </div>

                {/* Precio - 24% */}
                <div className="w-24">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">Precio ($)</label>
                  <Input
                    type="number"
                    value={mat.unitPrice}
                    onChange={(e) => {
                      const updated = [...data.materials]
                      updated[idx].unitPrice = parseFloat(e.target.value)
                      setData({ ...data, materials: updated })
                    }}
                    placeholder="0.00"
                    step="0.01"
                    className="w-full text-xs"
                  />
                </div>

                {/* Eliminar */}
                {data.materials.length > 1 && (
                  <button
                    onClick={() => {
                      setData({
                        ...data,
                        materials: data.materials.filter((_, i) => i !== idx),
                      })
                    }}
                    className="text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900 px-2 py-1 rounded transition text-xs font-bold flex-shrink-0"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}

            <button
              onClick={() => {
                setData({
                  ...data,
                  materials: [
                    ...data.materials,
                    {
                      id: Date.now(),
                      name: '',
                      quantity: 1,
                      unitValue: 'unidad',
                      unitCustom: '',
                      unitPrice: 0,
                    },
                  ],
                })
              }}
              className="w-full px-3 py-2 border-2 border-dashed border-teal-500 dark:border-teal-400 rounded-lg text-teal-600 dark:text-teal-400 font-semibold text-xs hover:bg-teal-50 dark:hover:bg-teal-900 transition"
            >
              + Agregar material
            </button>
          </div>
        </Section>

        {/* SECCIÓN 3: MANO DE OBRA */}
        <Section title="👷 Mano de Obra">
          <div className="flex items-end gap-3">
            {/* Tipo de tiempo */}
            <div className="w-32">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Tiempo por unidad</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setData({ ...data, laborTimeType: 'minutes' })}
                  className={`flex-1 px-2 py-2 rounded text-xs font-semibold transition ${
                    data.laborTimeType === 'minutes'
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Minutos
                </button>
                <button
                  onClick={() => setData({ ...data, laborTimeType: 'hours' })}
                  className={`flex-1 px-2 py-2 rounded text-xs font-semibold transition ${
                    data.laborTimeType === 'hours'
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Horas
                </button>
              </div>
            </div>

            {/* Tiempo */}
            <div className="w-28">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1 mb-2">
                <span>⏱️</span>
                {data.laborTimeType === 'minutes' ? 'Minutos' : 'Horas'}
              </label>
              <Input
                type="number"
                value={data.laborTime}
                onChange={(e) => setData({ ...data, laborTime: parseFloat(e.target.value) })}
                placeholder={data.laborTimeType === 'minutes' ? '30' : '0.5'}
                step="0.01"
                className="w-full text-sm"
              />
            </div>

            {/* Tarifa */}
            <div className="w-32">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1 mb-2">
                <span>💵</span>
                Tarifa/hora ($)
              </label>
              <Input
                type="number"
                value={data.hourlyRate}
                onChange={(e) => setData({ ...data, hourlyRate: parseFloat(e.target.value) })}
                placeholder="150"
                step="0.01"
                className="w-full text-sm"
              />
            </div>

            {/* Horas/día */}
            <div className="w-28">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1 mb-2">
                <span>🕐</span>
                Horas/día
              </label>
              <Input
                type="number"
                value={data.hoursPerDay}
                onChange={(e) => setData({ ...data, hoursPerDay: parseFloat(e.target.value) })}
                placeholder="8"
                className="w-full text-sm"
              />
            </div>

            {/* Días/semana */}
            <div className="w-28">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1 mb-2">
                <span>📅</span>
                Días/semana
              </label>
              <Input
                type="number"
                value={data.daysPerWeek}
                onChange={(e) => setData({ ...data, daysPerWeek: parseFloat(e.target.value) })}
                placeholder="6"
                className="w-full text-sm"
              />
            </div>
          </div>
        </Section>

        {/* SECCIÓN 4: GASTOS OPERATIVOS */}
        <Section title="💼 Gastos Operativos">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">Todos los gastos mensuales</p>
          <div className="space-y-2">
            {data.operativeExpenses.map((exp, idx) => (
              <div key={exp.id} className="flex items-end gap-2 p-2 bg-gray-50 dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700">
                {/* Concepto - Flex */}
                <div className="flex-1 min-w-48">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">Concepto</label>
                  <Input
                    value={exp.name}
                    onChange={(e) => {
                      const updated = [...data.operativeExpenses]
                      updated[idx].name = e.target.value
                      setData({ ...data, operativeExpenses: updated })
                    }}
                    placeholder="Ej: Alquiler"
                    className="w-full text-xs"
                  />
                </div>

                {/* Monto - 32% */}
                <div className="w-32">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">Monto ($)</label>
                  <Input
                    type="number"
                    value={exp.amount}
                    onChange={(e) => {
                      const updated = [...data.operativeExpenses]
                      updated[idx].amount = parseFloat(e.target.value)
                      setData({ ...data, operativeExpenses: updated })
                    }}
                    placeholder="0.00"
                    step="0.01"
                    className="w-full text-xs"
                  />
                </div>

                {/* % Uso - 20% */}
                <div className="w-20">
                  <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block">% Uso</label>
                  <Input
                    type="number"
                    value={exp.percentage}
                    onChange={(e) => {
                      const updated = [...data.operativeExpenses]
                      updated[idx].percentage = parseFloat(e.target.value)
                      setData({ ...data, operativeExpenses: updated })
                    }}
                    placeholder="100"
                    min="0"
                    max="100"
                    step="5"
                    className="w-full text-xs"
                  />
                </div>
              </div>
            ))}

            <button
              onClick={() => {
                setData({
                  ...data,
                  operativeExpenses: [
                    ...data.operativeExpenses,
                    { id: Date.now(), name: '', amount: 0, percentage: 100 },
                  ],
                })
              }}
              className="w-full px-3 py-2 border-2 border-dashed border-teal-500 dark:border-teal-400 rounded-lg text-teal-600 dark:text-teal-400 font-semibold text-xs hover:bg-teal-50 dark:hover:bg-teal-900 transition"
            >
              + Agregar gasto
            </button>
          </div>
        </Section>

        {/* SECCIÓN 5: COMISIONES */}
        <Section title="💳 Comisiones & IVA">
          <div className="flex items-end gap-3">
            {/* Plataforma */}
            <div className="flex-1 min-w-48">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 block">¿Dónde vendes?</label>
              <select
                value={data.sellPlatformValue}
                onChange={(e) => {
                  setData({ ...data, sellPlatformValue: e.target.value })
                  const platform = PLATFORMS.find(p => p.value === e.target.value)
                  if (platform) {
                    setData(prev => ({ ...prev, platformFee: platform.commission }))
                  }
                }}
                className="w-full px-3 py-2 text-xs rounded border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
              >
                {PLATFORMS.map(p => (
                  <option key={p.value} value={p.value}>{p.label}</option>
                ))}
              </select>
            </div>

            {/* Comisión */}
            {data.sellPlatformValue !== 'presencial' && (
              <div className="w-24">
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Comisión (%)</label>
                <Input
                  type="number"
                  value={data.platformFee}
                  onChange={(e) => setData({ ...data, platformFee: parseFloat(e.target.value) })}
                  placeholder="12"
                  step="0.1"
                  className="w-full text-sm"
                />
              </div>
            )}

            {/* IVA */}
            <div className="flex-shrink-0">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 block">IVA 21%</label>
              <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-gray-100 dark:hover:bg-slate-700">
                <input
                  type="checkbox"
                  checked={data.includeIVA}
                  onChange={(e) => setData({ ...data, includeIVA: e.target.checked })}
                  className="w-4 h-4 rounded"
                />
                <span className="text-xs font-semibold text-gray-900 dark:text-white">Sí</span>
              </label>
            </div>
          </div>
        </Section>

        {/* SECCIÓN 6: TU SUELDO */}
        <Section title="💰 Tu Sueldo Personal">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-3">¿Cuánto necesitas ganar mensualmente?</p>
          <div className="grid grid-cols-5 gap-2">
            {data.personalExpenses.map((exp, idx) => (
              <div key={exp.id}>
                <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1 block truncate">{exp.name}</label>
                <Input
                  type="number"
                  value={exp.amount}
                  onChange={(e) => {
                    const updated = [...data.personalExpenses]
                    updated[idx].amount = parseFloat(e.target.value)
                    setData({ ...data, personalExpenses: updated })
                  }}
                  placeholder="0"
                  step="100"
                  className="w-full text-xs"
                />
              </div>
            ))}
          </div>
        </Section>

        {/* SECCIÓN 7: GANANCIA */}
        <Section title="📈 Define tu Ganancia">
          <div className="flex items-end gap-3">
            {/* Tipo */}
            <div className="w-40">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2 block">Opción</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setData({ ...data, profitOption: 'percentage' })}
                  className={`flex-1 px-2 py-2 rounded text-xs font-semibold transition ${
                    data.profitOption === 'percentage'
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  %
                </button>
                <button
                  onClick={() => setData({ ...data, profitOption: 'amount' })}
                  className={`flex-1 px-2 py-2 rounded text-xs font-semibold transition ${
                    data.profitOption === 'amount'
                      ? 'bg-teal-500 text-white'
                      : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  $
                </button>
              </div>
            </div>

            {/* Valor */}
            <div className="w-32">
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1 mb-2">
                <span>📈</span>
                {data.profitOption === 'percentage' ? 'Porcentaje (%)' : 'Cantidad ($)'}
              </label>
              <Input
                type="number"
                value={data.profitOption === 'percentage' ? data.profitPercentage : data.profitAmount}
                onChange={(e) => {
                  if (data.profitOption === 'percentage') {
                    setData({ ...data, profitPercentage: parseFloat(e.target.value) })
                  } else {
                    setData({ ...data, profitAmount: parseFloat(e.target.value) })
                  }
                }}
                placeholder={data.profitOption === 'percentage' ? '40' : '0.00'}
                step="0.1"
                className="w-full text-sm"
              />
            </div>
          </div>
        </Section>

        {/* BOTONES DE NAVEGACIÓN */}
        <div className="flex items-center justify-between mt-12 pt-8 border-t border-gray-200 dark:border-slate-800">
          <button
            onClick={() => router.push('/dashboard')}
            className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm font-semibold"
          >
            ← Volver
          </button>
          <button
            onClick={handleContinue}
            className="px-8 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition disabled:opacity-50"
          >
            Ver Análisis →
          </button>
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-in-out;
        }
      `}</style>
    </div>
  )
}

interface SectionProps {
  title: string
  children: React.ReactNode
}

function Section({ title, children }: SectionProps) {
  return (
    <div className="mb-8">
      <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">{title}</h2>
      <div className="space-y-3">{children}</div>
    </div>
  )
}
```

### 📄 `src/app/dashboard/layout.tsx`

'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Organization } from '@/types/database'
import Link from 'next/link'

/**
 * DashboardLayout maneja:
 * - Autenticación y redirección
 * - Información de la organización
 * - Tema global (light/dark)
 * - Navegación lateral
 * 
 * BUENA PRÁCTICA: Separar layout de páginas específicas
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const router = useRouter()

  // Cargar datos del usuario y organización
  useEffect(() => {
    const loadOrgAndUser = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        router.push('/auth/login')
        return
      }

      setUser(authUser)

      const { data: orgs } = await supabase
        .from('organizations')
        .select('*')
        .eq('owner_id', authUser.id)
        .single()

      if (orgs) {
        setOrganization(orgs)
      }

      setLoading(false)
    }

    loadOrgAndUser()
  }, [router])

  // Cargar tema guardado en localStorage
  useEffect(() => {
    const savedTheme = (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
    setTheme(savedTheme)
  }, [])

  // Aplicar tema al elemento HTML (Tailwind lo detecta automáticamente)
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  /**
   * Cambiar tema
   * BUENA PRÁCTICA: Sincronizar con localStorage para persistencia
   */
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 dark:border-teal-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    )
  }

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Calculadora', href: '/dashboard/calculator', icon: '🧮' },
    { name: 'Productos', href: '/dashboard/products', icon: '📦' },
  ]

  return (
    <div className="flex h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-50 transition-colors duration-300">
      {/* Sidebar - Notion Style */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transition-all duration-300 flex flex-col shadow-sm`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-800">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-between hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg p-2 transition-colors"
          >
            <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center w-full'}`}>
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                PB
              </div>
              {sidebarOpen && <span className="font-bold text-gray-900 dark:text-white">PriceBox</span>}
            </div>
            {sidebarOpen && (
              <span className="text-gray-400 dark:text-gray-600 text-lg">‹</span>
            )}
          </button>
        </div>

        {/* Organization Info */}
        {sidebarOpen && organization && (
          <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-800">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Negocio</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate mt-1">{organization.name}</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-2 py-6 space-y-2">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-all group"
            >
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              {sidebarOpen && (
                <span className="text-sm font-medium group-hover:font-semibold">{item.name}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* Theme Toggle & User Info */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-800 space-y-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors group"
            title={`Cambiar a tema ${theme === 'light' ? 'oscuro' : 'claro'}`}
          >
            <span className="text-2xl group-hover:scale-125 transition-transform">
              {theme === 'light' ? '🌙' : '☀️'}
            </span>
            {sidebarOpen && (
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                {theme === 'light' ? 'Oscuro' : 'Claro'}
              </span>
            )}
          </button>

          {/* User Info & Logout */}
          {sidebarOpen ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-slate-800">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950 px-3 py-2 rounded-lg transition-colors"
              >
                🚪 Salir
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex justify-center text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 p-2 rounded-lg transition-colors"
              title="Salir"
            >
              🚪
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 transition-colors duration-300">
        {children}
      </main>
    </div>
  )
}
```

### 📄 `src/app/dashboard/page.tsx`

'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { Organization } from '@/types/database'
import Link from 'next/link'

interface DashboardData {
  totalProducts: number
  totalStock: number
  totalSales: number
  totalEarnings: number
  fixedCosts: number
  variableCosts: number
  products: any[]
}

export default function DashboardPage() {
  const router = useRouter()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Obtener usuario
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          console.error('Error getting user:', userError)
          router.push('/auth/login')
          return
        }

        // 2. Obtener organización
        const { data: org, error: orgError } = await supabase
          .from('organizations')
          .select('*')
          .eq('owner_id', user.id)
          .single()

        if (orgError) {
          console.error('Error getting organization:', orgError)
          setError('No se pudo cargar la organización')
          setLoading(false)
          return
        }

        if (!org) {
          console.error('Organization not found')
          setError('Organización no encontrada')
          setLoading(false)
          return
        }

        setOrganization(org)

        // 3. Obtener profile
        const { data: profile } = await supabase
          .from('organization_profiles')
          .select('fixed_costs, variable_costs')
          .eq('organization_id', org.id)
          .single()

        // 4. Obtener productos
        const { data: products, error: productsError } = await supabase
          .from('products')
          .select('*')
          .eq('organization_id', org.id)

        if (productsError) {
          console.error('Error getting products:', productsError)
          setError('No se pudieron cargar los productos')
          setLoading(false)
          return
        }

        // Calcular totales
        const totalEarnings = products?.reduce((sum: number, p: any) => {
          return sum + (p.profit_margin || 0)
        }, 0) || 0

        setData({
          totalProducts: products?.length || 0,
          totalStock: 0, // TODO: Obtener de tabla stock
          totalSales: 0, // TODO: Obtener de tabla ventas
          totalEarnings: totalEarnings,
          fixedCosts: profile?.fixed_costs || 0,
          variableCosts: profile?.variable_costs || 0,
          products: products || [],
        })

        setLoading(false)
      } catch (error) {
        console.error('Unexpected error:', error)
        setError('Error inesperado')
        setLoading(false)
      }
    }

    loadData()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 dark:border-teal-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600"
          >
            Reintentar
          </button>
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-600 dark:text-gray-400">No hay datos disponibles</p>
      </div>
    )
  }

  return (
    <div className="w-full h-full overflow-auto">
      <div className="p-8 max-w-7xl mx-auto space-y-8">
        
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {organization?.name || 'Mi negocio'}
            </p>
          </div>
          <Link
            href="/dashboard/calculator"
            className="px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg font-semibold text-sm hover:shadow-lg transition"
          >
            + Nuevo Producto
          </Link>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KPICard 
            label="Productos"
            value={data.totalProducts}
            icon="📦"
            color="blue"
          />
          <KPICard 
            label="Stock Total"
            value={data.totalStock}
            icon="📦"
            color="purple"
          />
          <KPICard 
            label="Ventas Este Mes"
            value={data.totalSales}
            icon="💰"
            color="green"
          />
          <KPICard 
            label="Ganancias"
            value={`$${(data.totalEarnings || 0).toFixed(2)}`}
            icon="📈"
            color="emerald"
          />
        </div>

        {/* GASTOS OPERATIVOS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white dark:bg-slate-900 rounded-lg p-5 border border-gray-200 dark:border-slate-800 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Gastos Fijos</p>
              <span className="text-2xl">💼</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              ${(data.fixedCosts || 0).toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">por mes</p>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-lg p-5 border border-gray-200 dark:border-slate-800 hover:shadow-md transition">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">Gastos Variables</p>
              <span className="text-2xl">📊</span>
            </div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              ${(data.variableCosts || 0).toFixed(2)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">por unidad</p>
          </div>
        </div>

        {/* MIS PRODUCTOS */}
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Mis Productos</h2>
          
          {data.products && data.products.length > 0 ? (
            <div className="space-y-3">
              {data.products.map(product => (
                <ProductRow key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900 rounded-lg p-8 border border-gray-200 dark:border-slate-800 text-center">
              <p className="text-gray-600 dark:text-gray-400">No hay productos creados</p>
              <Link
                href="/dashboard/calculator"
                className="text-teal-600 dark:text-teal-400 hover:underline text-sm mt-2 inline-block"
              >
                Crear el primero →
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

/**
 * COMPONENTES
 */

interface KPICardProps {
  label: string
  value: string | number
  icon: string
  color: 'blue' | 'purple' | 'green' | 'emerald'
}

function KPICard({ label, value, icon, color }: KPICardProps) {
  const colorMap = {
    blue: 'border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-900',
    purple: 'border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900',
    green: 'border-green-200 dark:border-green-800 hover:bg-green-50 dark:hover:bg-green-900',
    emerald: 'border-emerald-200 dark:border-emerald-800 hover:bg-emerald-50 dark:hover:bg-emerald-900',
  }

  return (
    <div className={`bg-white dark:bg-slate-900 rounded-lg p-6 border ${colorMap[color]} hover:shadow-md transition`}>
      <div className="flex items-start justify-between mb-3">
        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">{label}</p>
        <span className="text-2xl">{icon}</span>
      </div>
      <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  )
}

interface ProductRowProps {
  product: any
}

function ProductRow({ product }: ProductRowProps) {
  return (
    <Link href={`/dashboard/products/${product.id}`}>
      <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-gray-200 dark:border-slate-800 hover:shadow-md hover:border-teal-200 dark:hover:border-teal-800 transition cursor-pointer group">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition">
              {product.name}
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Precio: ${product.final_price?.toFixed(2)} | Margen: {product.base_cost ? ((product.profit_margin / product.base_cost) * 100).toFixed(1) : 0}%
            </p>
          </div>
          <div className="text-right space-y-1">
            <div className={`px-3 py-1 rounded text-xs font-semibold ${
              product.profit_margin > 0 
                ? 'bg-green-50 dark:bg-green-900 text-green-700 dark:text-green-300' 
                : 'bg-red-50 dark:bg-red-900 text-red-700 dark:text-red-300'
            }`}>
              {product.profit_margin > 0 ? '✅ Viable' : '❌ No Viable'}
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
```

---

## ✅ RESUMEN DE EXPORTACIÓN

- **Total de líneas:**     2631
- **Archivos exportados:** 12
- **Fecha:** Sat Nov  8 11:56:14 -03 2025
