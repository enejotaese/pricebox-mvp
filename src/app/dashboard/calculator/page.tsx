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
