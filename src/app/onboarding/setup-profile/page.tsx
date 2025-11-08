'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'
import { updateProfile, completeSetup } from '@/lib/supabase/profile'
import { Input } from '@/components/ui/input'
import { ARGENTINA_PROVINCES, SOCIOECONOMIC_LEVELS } from '@/types/profile'

export default function SetupProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [organizationId, setOrganizationId] = useState<string | null>(null)

  const [formData, setFormData] = useState({
    ideal_monthly_salary: 50000,
    fixed_costs: 5000,
    variable_costs: 2000,
    province: 'Buenos Aires',
    socioeconomic_level: 'medium',
  })

  useEffect(() => {
    const checkSetup = async () => {
      try {
        console.log('=== SETUP PROFILE INIT ===')
        
        // 1. Esperar a que el usuario se autentique
        let attempts = 0
        let user = null

        while (attempts < 15 && !user) {
          const { data: { user: currentUser } } = await supabase.auth.getUser()
          if (currentUser) {
            user = currentUser
            break
          }
          console.log(`Waiting for user... attempt ${attempts + 1}/15`)
          await new Promise(resolve => setTimeout(resolve, 500))
          attempts++
        }

        if (!user) {
          console.error('❌ No user found after 7.5 seconds')
          setError('Usuario no autenticado. Intenta de nuevo.')
          setLoading(false)
          return
        }

        console.log('✅ User authenticated:', user.id)

        // 2. Obtener organización (puede haber sido creada por trigger O por API Route)
        const { data: orgs, error: orgError } = await supabase
          .from('organizations')
          .select('id')
          .eq('owner_id', user.id)
          .order('created_at', { ascending: false })
          .limit(1)

        if (orgError && orgError.code !== 'PGRST116') {
          console.error('❌ Error getting organization:', orgError)
          setError('Error al cargar organización.')
          setLoading(false)
          return
        }

        if (!orgs || orgs.length === 0) {
          console.error('❌ No organization found for user')
          setError('No se encontró organización. Intenta de nuevo.')
          setLoading(false)
          return
        }

        const org = orgs[0]
        console.log('✅ Organization found:', org.id)
        setOrganizationId(org.id)

        // 3. Obtener profile
        const { data: profile, error: profileError } = await supabase
          .from('organization_profiles')
          .select('*')
          .eq('organization_id', org.id)
          .single()

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('⚠️ Profile error:', profileError)
        }

        if (profile) {
          console.log('✅ Profile found:', profile.id)
          
          // Si ya completó setup, ir al dashboard
          if (profile.is_setup_complete) {
            console.log('✅ Setup already complete, redirecting to dashboard')
            router.push('/dashboard')
            return
          }

          // Cargar datos existentes
          setFormData({
            ideal_monthly_salary: profile.ideal_monthly_salary || 50000,
            fixed_costs: profile.fixed_costs || 5000,
            variable_costs: profile.variable_costs || 2000,
            province: profile.province || 'Buenos Aires',
            socioeconomic_level: profile.socioeconomic_level || 'medium',
          })
        } else {
          console.log('⚠️ No profile found, will create new one')
        }

        console.log('=== SETUP PROFILE READY ===')
        setLoading(false)

      } catch (error: any) {
        console.error('❌ Unexpected error in checkSetup:', error)
        setError('Error inesperado. Intenta de nuevo.')
        setLoading(false)
      }
    }

    checkSetup()
  }, [router])

  const handleSubmit = async () => {
    if (!organizationId) {
      setError('Falta la organización')
      return
    }

    setSaving(true)
    setError(null)

    try {
      console.log('Saving profile for org:', organizationId)

      // Actualizar profile
      await updateProfile(organizationId, formData)
      console.log('✅ Profile updated')

      // Marcar setup como completo
      await completeSetup(organizationId)
      console.log('✅ Setup completed')

      // Redirigir al dashboard
      router.push('/dashboard')

    } catch (error: any) {
      console.error('Error saving profile:', error)
      setError(error.message || 'Error al guardar. Intenta de nuevo.')
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <div className="max-w-2xl mx-auto px-8 py-12">
        
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">Bienvenido a PriceBox</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Primero, déjanos saber sobre tu economía personal
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-slate-800 space-y-8">
          
          {/* ERROR MESSAGE */}
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900 border border-red-200 dark:border-red-700 rounded-lg">
              <p className="text-sm text-red-600 dark:text-red-200">{error}</p>
            </div>
          )}

          {/* SECCIÓN 1: Sueldo Ideal */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">💰 Tu Sueldo Ideal</h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">¿Cuánto necesitas ganar mensualmente para vivir?</p>
            
            <div>
              <label className="text-sm font-semibold text-gray-900 dark:text-white mb-2 block">Ingreso mensual ideal ($ARS)</label>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-400 font-semibold">$</span>
                <Input
                  type="number"
                  value={formData.ideal_monthly_salary}
                  onChange={(e) => setFormData({ ...formData, ideal_monthly_salary: parseFloat(e.target.value) || 0 })}
                  placeholder="50000"
                  step="1000"
                  disabled={saving}
                  className="flex-1 text-base"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                Este es el mínimo que tu negocio debe generar para ser viable
              </p>
            </div>
          </div>

          {/* SECCIÓN 2: Gastos del Negocio */}
          <div className="space-y-4 p-5 bg-blue-50 dark:bg-blue-900 rounded-lg border border-blue-200 dark:border-blue-700">
            <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100">💼 Gastos del Negocio</h2>
            <p className="text-sm text-blue-800 dark:text-blue-200">Gastos operativos mensuales que tendrá tu negocio</p>
            
            <div>
              <label className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2 block">Gastos Fijos Mensuales ($ARS)</label>
              <p className="text-xs text-blue-800 dark:text-blue-200 mb-2">Alquiler, servicios, internet, etc.</p>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-400 font-semibold">$</span>
                <Input
                  type="number"
                  value={formData.fixed_costs}
                  onChange={(e) => setFormData({ ...formData, fixed_costs: parseFloat(e.target.value) || 0 })}
                  placeholder="5000"
                  step="500"
                  disabled={saving}
                  className="flex-1 text-base"
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2 block">Gastos Variables por Unidad ($ARS)</label>
              <p className="text-xs text-blue-800 dark:text-blue-200 mb-2">Packaging, comisiones, transporte por producto</p>
              <div className="flex items-center gap-2">
                <span className="text-gray-600 dark:text-gray-400 font-semibold">$</span>
                <Input
                  type="number"
                  value={formData.variable_costs}
                  onChange={(e) => setFormData({ ...formData, variable_costs: parseFloat(e.target.value) || 0 })}
                  placeholder="2"
                  step="0.1"
                  disabled={saving}
                  className="flex-1 text-base"
                />
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: Ubicación */}
          <div className="space-y-4 p-5 bg-green-50 dark:bg-green-900 rounded-lg border border-green-200 dark:border-green-700">
            <h2 className="text-xl font-bold text-green-900 dark:text-green-100">📍 Tu Ubicación</h2>
            <p className="text-sm text-green-800 dark:text-green-200">Dónde te encuentras en Argentina</p>

            <div>
              <label className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2 block">Provincia</label>
              <select
                value={formData.province}
                onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                disabled={saving}
                className="w-full px-4 py-3 rounded-lg border border-green-300 dark:border-green-700 bg-white dark:bg-green-800 text-gray-900 dark:text-white text-base disabled:opacity-50"
              >
                {ARGENTINA_PROVINCES.map(prov => (
                  <option key={prov} value={prov}>{prov}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold text-green-900 dark:text-green-100 mb-2 block">Nivel Socioeconómico de tu Zona</label>
              <p className="text-xs text-green-800 dark:text-green-200 mb-3">Esto nos ayuda a calibrar recomendaciones</p>
              <div className="space-y-2">
                {SOCIOECONOMIC_LEVELS.map(level => (
                  <label key={level.value} className="flex items-center gap-3 cursor-pointer p-3 rounded hover:bg-green-100 dark:hover:bg-green-800 border-2 transition"
                    style={{
                      borderColor: formData.socioeconomic_level === level.value ? '#16a34a' : '#d1fae5',
                    }}
                  >
                    <input
                      type="radio"
                      name="socioeconomic"
                      value={level.value}
                      checked={formData.socioeconomic_level === level.value}
                      onChange={(e) => setFormData({ ...formData, socioeconomic_level: e.target.value })}
                      disabled={saving}
                      className="w-4 h-4"
                    />
                    <div>
                      <p className="font-semibold text-green-900 dark:text-green-100">{level.label}</p>
                      <p className="text-xs text-green-800 dark:text-green-200">{level.description}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleSubmit}
            disabled={saving}
            className="w-full px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-lg font-bold text-base hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {saving ? '⏳ Guardando...' : '✅ Comenzar'}
          </button>
        </div>

        <p className="text-center text-xs text-gray-600 dark:text-gray-400 mt-8">
          Puedes editar esta información en cualquier momento desde Configuración
        </p>
      </div>
    </div>
  )
}
