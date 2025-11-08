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
