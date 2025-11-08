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
