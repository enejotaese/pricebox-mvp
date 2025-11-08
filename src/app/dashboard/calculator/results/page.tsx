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
