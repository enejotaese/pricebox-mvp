'use client'

import { Product } from '@/hooks/useCalculator'
import { Input } from '@/components/ui/input'

interface ProductEditorProps {
  product: Product
  onUpdate: (updates: Partial<Product>) => void
  isLoading?: boolean
}

/**
 * EDITOR INLINE - Sin pasos, todo en un solo lugar
 * Se actualiza en tiempo real
 */
export function ProductEditor({ product, onUpdate, isLoading }: ProductEditorProps) {
  return (
    <div className="space-y-4">
      {/* SECCIÓN 1: PRODUCTO BÁSICO */}
      <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">📦 PRODUCTO</h3>
        
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Nombre</label>
            <Input
              value={product.name}
              onChange={(e) => onUpdate({ name: e.target.value })}
              placeholder="Ej: Pantalón Básico"
              className="mt-1 text-sm"
              disabled={isLoading}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Tipo</label>
              <select
                value={product.businessType}
                onChange={(e) => onUpdate({ businessType: e.target.value })}
                className="mt-1 w-full px-2 py-2 text-sm rounded border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
                disabled={isLoading}
              >
                <option value="confection">Confección</option>
                <option value="food">Alimentos</option>
                <option value="services">Servicios</option>
                <option value="digital">Digital</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Volumen/Mes</label>
              <Input
                type="number"
                value={product.monthlyVolume}
                onChange={(e) => onUpdate({ monthlyVolume: parseFloat(e.target.value) })}
                placeholder="100"
                className="mt-1 text-sm"
                disabled={isLoading}
                min="1"
              />
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: INSUMOS */}
      <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">🛠️ INSUMOS</h3>
          <button
            onClick={() => {
              const newMaterial = { id: Date.now(), name: '', quantity: 1, unit: 'unidad', unitPrice: 0 }
              onUpdate({ materials: [...product.materials, newMaterial] })
            }}
            className="text-xs bg-teal-500 text-white px-2 py-1 rounded hover:bg-teal-600"
            disabled={isLoading}
          >
            + Agregar
          </button>
        </div>

        <div className="space-y-2">
          {product.materials.map((material, idx) => (
            <div key={material.id} className="flex gap-2 items-center bg-gray-50 dark:bg-slate-800 p-2 rounded">
              <Input
                value={material.name}
                onChange={(e) => {
                  const updated = [...product.materials]
                  updated[idx].name = e.target.value
                  onUpdate({ materials: updated })
                }}
                placeholder="Material"
                className="flex-1 text-xs"
                disabled={isLoading}
              />
              <Input
                type="number"
                value={material.quantity}
                onChange={(e) => {
                  const updated = [...product.materials]
                  updated[idx].quantity = parseFloat(e.target.value)
                  onUpdate({ materials: updated })
                }}
                placeholder="Cant"
                className="w-16 text-xs"
                disabled={isLoading}
              />
              <Input
                type="number"
                value={material.unitPrice}
                onChange={(e) => {
                  const updated = [...product.materials]
                  updated[idx].unitPrice = parseFloat(e.target.value)
                  onUpdate({ materials: updated })
                }}
                placeholder="$"
                className="w-20 text-xs"
                disabled={isLoading}
              />
              {product.materials.length > 1 && (
                <button
                  onClick={() => {
                    const updated = product.materials.filter((_, i) => i !== idx)
                    onUpdate({ materials: updated })
                  }}
                  className="text-red-600 hover:bg-red-100 p-1 rounded text-xs"
                  disabled={isLoading}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* SECCIÓN 3: MANO DE OBRA */}
      <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">👷 MANO DE OBRA</h3>
        
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Minutos/unidad</label>
            <Input
              type="number"
              value={product.laborMinutes}
              onChange={(e) => onUpdate({ laborMinutes: parseFloat(e.target.value) })}
              placeholder="30"
              className="mt-1 text-sm"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Tarifa/hora ($)</label>
            <Input
              type="number"
              value={product.hourlyRate}
              onChange={(e) => onUpdate({ hourlyRate: parseFloat(e.target.value) })}
              placeholder="15"
              className="mt-1 text-sm"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Horas/día</label>
            <Input
              type="number"
              value={product.hoursPerDay}
              onChange={(e) => onUpdate({ hoursPerDay: parseFloat(e.target.value) })}
              placeholder="8"
              className="mt-1 text-sm"
              disabled={isLoading}
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-700 dark:text-gray-300">Días/semana</label>
            <Input
              type="number"
              value={product.daysPerWeek}
              onChange={(e) => onUpdate({ daysPerWeek: parseFloat(e.target.value) })}
              placeholder="6"
              className="mt-1 text-sm"
              disabled={isLoading}
            />
          </div>
        </div>
      </div>

      {/* SECCIÓN 4: GASTOS OPERATIVOS */}
      <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-bold text-gray-900 dark:text-white">💼 GASTOS</h3>
          <button
            onClick={() => {
              const newExpense = { id: Date.now(), name: '', amount: 0, percentage: 100 }
              onUpdate({ operativeExpenses: [...product.operativeExpenses, newExpense] })
            }}
            className="text-xs bg-teal-500 text-white px-2 py-1 rounded hover:bg-teal-600"
            disabled={isLoading}
          >
            + Agregar
          </button>
        </div>

        <div className="space-y-2">
          {product.operativeExpenses.map((expense, idx) => (
            <div key={expense.id} className="flex gap-2 items-center bg-gray-50 dark:bg-slate-800 p-2 rounded">
              <Input
                value={expense.name}
                onChange={(e) => {
                  const updated = [...product.operativeExpenses]
                  updated[idx].name = e.target.value
                  onUpdate({ operativeExpenses: updated })
                }}
                placeholder="Concepto"
                className="flex-1 text-xs"
                disabled={isLoading}
              />
              <Input
                type="number"
                value={expense.amount}
                onChange={(e) => {
                  const updated = [...product.operativeExpenses]
                  updated[idx].amount = parseFloat(e.target.value)
                  onUpdate({ operativeExpenses: updated })
                }}
                placeholder="Monto"
                className="w-20 text-xs"
                disabled={isLoading}
              />
              <Input
                type="number"
                value={expense.percentage}
                onChange={(e) => {
                  const updated = [...product.operativeExpenses]
                  updated[idx].percentage = parseFloat(e.target.value)
                  onUpdate({ operativeExpenses: updated })
                }}
                placeholder="%"
                className="w-12 text-xs"
                disabled={isLoading}
              />
              {product.operativeExpenses.length > 1 && (
                <button
                  onClick={() => {
                    const updated = product.operativeExpenses.filter((_, i) => i !== idx)
                    onUpdate({ operativeExpenses: updated })
                  }}
                  className="text-red-600 hover:bg-red-100 p-1 rounded text-xs"
                  disabled={isLoading}
                >
                  ✕
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* SECCIÓN 5: COMISIONES & IVA */}
      <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">💳 COMISIONES</h3>
        
        <div className="space-y-2">
          <select
            value={product.sellPlatform}
            onChange={(e) => onUpdate({ sellPlatform: e.target.value })}
            className="w-full px-2 py-2 text-sm rounded border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white"
            disabled={isLoading}
          >
            <option value="presencial">Presencial (sin comisión)</option>
            <option value="mercadolibre">MercadoLibre (12%)</option>
            <option value="shopify">Shopify (2.9%)</option>
            <option value="instagram">Instagram (5%)</option>
          </select>

          {product.sellPlatform !== 'presencial' && (
            <Input
              type="number"
              value={product.platformFee}
              onChange={(e) => onUpdate({ platformFee: parseFloat(e.target.value) })}
              placeholder="Comisión %"
              className="text-sm"
              disabled={isLoading}
            />
          )}

          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={product.includeIVA}
              onChange={(e) => onUpdate({ includeIVA: e.target.checked })}
              disabled={isLoading}
              className="w-4 h-4 rounded"
            />
            <span className="text-xs text-gray-700 dark:text-gray-300">Incluir IVA 21%</span>
          </label>
        </div>
      </div>

      {/* SECCIÓN 6: GANANCIA */}
      <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
        <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">💰 GANANCIA</h3>
        
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => onUpdate({ profitOption: 'percentage' })}
            className={`flex-1 px-2 py-2 rounded text-sm font-semibold transition ${
              product.profitOption === 'percentage'
                ? 'bg-teal-500 text-white'
                : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
            }`}
            disabled={isLoading}
          >
            Por %
          </button>
          <button
            onClick={() => onUpdate({ profitOption: 'amount' })}
            className={`flex-1 px-2 py-2 rounded text-sm font-semibold transition ${
              product.profitOption === 'amount'
                ? 'bg-teal-500 text-white'
                : 'bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300'
            }`}
            disabled={isLoading}
          >
            Por $
          </button>
        </div>

        {product.profitOption === 'percentage' ? (
          <Input
            type="number"
            value={product.profitPercentage}
            onChange={(e) => onUpdate({ profitPercentage: parseFloat(e.target.value) })}
            placeholder="Porcentaje"
            className="text-sm"
            disabled={isLoading}
          />
        ) : (
          <Input
            type="number"
            value={product.profitAmount}
            onChange={(e) => onUpdate({ profitAmount: parseFloat(e.target.value) })}
            placeholder="Cantidad"
            className="text-sm"
            disabled={isLoading}
          />
        )}
      </div>
    </div>
  )
}
