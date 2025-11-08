'use client'

import { AnalysisResult, Recommendation } from '@/hooks/useCalculator'

interface LivePreviewProps {
  analysis: AnalysisResult | null
  isSustainable: boolean
  recommendations: Recommendation[]
  productName: string
}

export function LivePreview({ analysis, isSustainable, recommendations, productName }: LivePreviewProps) {
  if (!analysis) {
    return (
      <div className="h-full flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 rounded-2xl">
        <div className="text-center">
          <p className="text-gray-500 dark:text-gray-400 mb-2">Completa los datos para ver resultados</p>
          <p className="text-sm text-gray-400">Los cálculos se actualizan en tiempo real →</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4 h-full overflow-y-auto">
      {/* VIABILIDAD - PRIMERO Y DESTACADO */}
      <div className={`p-6 rounded-2xl text-white shadow-lg animate-fade-in ${isSustainable ? 'bg-gradient-to-br from-green-500 to-emerald-600' : 'bg-gradient-to-br from-red-500 to-pink-600'}`}>
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-lg font-bold">
              {isSustainable ? '✅ NEGOCIO VIABLE' : '❌ NO VIABLE AÚN'}
            </p>
            <p className="text-sm opacity-90 mt-1">
              {productName || 'Tu producto'} 
            </p>
          </div>
          <div className="text-4xl">
            {isSustainable ? '🎉' : '⚠️'}
          </div>
        </div>
        <p className="text-sm opacity-90">
          Ganancia mensual: <strong>${analysis.monthlyProfitBest.toFixed(2)}</strong>
        </p>
      </div>

      {/* PRECIO DESTACADO */}
      <div className="bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-600 dark:from-teal-600 dark:via-emerald-600 dark:to-cyan-700 text-white p-6 rounded-2xl shadow-lg">
        <p className="text-sm opacity-90 mb-1">PRECIO RECOMENDADO</p>
        <p className="text-5xl font-bold">${analysis.finalPrice.toFixed(2)}</p>
        <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-white border-opacity-30">
          <div>
            <p className="text-xs opacity-90">Ganancia por venta</p>
            <p className="text-xl font-bold">${analysis.profitPerUnit.toFixed(2)}</p>
          </div>
          <div>
            <p className="text-xs opacity-90">Margen</p>
            <p className="text-xl font-bold">{analysis.netMarginPercentage.toFixed(1)}%</p>
          </div>
        </div>
      </div>

      {/* RECOMENDACIONES */}
      {!isSustainable && recommendations.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900 border-2 border-blue-200 dark:border-blue-700 rounded-2xl p-4">
          <p className="text-sm font-bold text-blue-900 dark:text-blue-100 mb-3">💡 RECOMENDACIONES</p>
          <div className="space-y-2">
            {recommendations.map((rec, idx) => (
              <button
                key={idx}
                className="w-full text-left bg-white dark:bg-blue-800 p-3 rounded-lg hover:shadow-md transition text-sm"
              >
                <p className="font-semibold text-gray-900 dark:text-white">{rec.title}</p>
                <p className="text-xs text-gray-600 dark:text-gray-300 mt-1">{rec.description}</p>
                <p className="text-xs text-blue-600 dark:text-blue-300 mt-2">
                  Impacto: +${rec.impact.toFixed(2)}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* METRICS GRID */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-lg border-l-4 border-blue-500">
          <p className="text-xs text-gray-600 dark:text-gray-300 uppercase font-semibold mb-1">Punto Equilibrio</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{analysis.breakevenUnits}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">unidades/mes</p>
        </div>

        <div className="bg-purple-50 dark:bg-purple-900 p-4 rounded-lg border-l-4 border-purple-500">
          <p className="text-xs text-gray-600 dark:text-gray-300 uppercase font-semibold mb-1">Horas/Mes</p>
          <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{analysis.hoursPerMonth.toFixed(0)}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">horas dedicadas</p>
        </div>

        <div className="bg-green-50 dark:bg-green-900 p-4 rounded-lg border-l-4 border-green-500">
          <p className="text-xs text-gray-600 dark:text-gray-300 uppercase font-semibold mb-1">Tarifa Real</p>
          <p className="text-2xl font-bold text-green-600 dark:text-green-400">${analysis.hourlyRateActual.toFixed(2)}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">por hora</p>
        </div>

        <div className="bg-orange-50 dark:bg-orange-900 p-4 rounded-lg border-l-4 border-orange-500">
          <p className="text-xs text-gray-600 dark:text-gray-300 uppercase font-semibold mb-1">Costo Total</p>
          <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">${analysis.finalCost.toFixed(2)}</p>
          <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">por unidad</p>
        </div>
      </div>

      {/* DESGLOSE DE COSTOS */}
      <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-4 border border-gray-200 dark:border-slate-700">
        <p className="text-sm font-bold text-gray-900 dark:text-white mb-3">Desglose de Costos</p>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Materiales</span>
            <span className="font-semibold text-gray-900 dark:text-white">${analysis.directCostPerUnit.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Gastos operativos</span>
            <span className="font-semibold text-gray-900 dark:text-white">${analysis.operativePerUnit.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Equipos</span>
            <span className="font-semibold text-gray-900 dark:text-white">${analysis.equipmentPerUnit.toFixed(2)}</span>
          </div>
          {analysis.platformCommissionAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Comisiones</span>
              <span className="font-semibold text-gray-900 dark:text-white">${analysis.platformCommissionAmount.toFixed(2)}</span>
            </div>
          )}
          {analysis.ivaAmount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">IVA 21%</span>
              <span className="font-semibold text-gray-900 dark:text-white">${analysis.ivaAmount.toFixed(2)}</span>
            </div>
          )}
          <div className="pt-2 border-t border-gray-300 dark:border-slate-600 flex justify-between">
            <span className="font-semibold text-gray-900 dark:text-white">Total Costo</span>
            <span className="font-bold text-lg text-gray-900 dark:text-white">${analysis.finalCost.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
