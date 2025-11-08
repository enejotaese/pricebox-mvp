/**
 * Hook personalizado para lógica de calculadora
 * Separa la lógica de negocio de la UI
 * 
 * VENTAJAS:
 * - Código reutilizable
 * - Fácil de testear
 * - Mantención simplificada
 */

import { useState, useCallback, useEffect } from 'react'

export interface Material {
  id: number
  name: string
  quantity: number
  unit: string
  unitPrice: number
}

export interface OperativeExpense {
  id: number
  name: string
  amount: number
  percentage: number
}

export interface PersonalExpense {
  id: number
  name: string
  amount: number
}

export interface Equipment {
  id: number
  name: string
  cost: number
  lifeYears: number
}

export interface Product {
  id: string
  name: string
  businessType: string
  monthlyVolume: number
  materials: Material[]
  laborMinutes: number
  hourlyRate: number
  hoursPerDay: number
  daysPerWeek: number
  operativeExpenses: OperativeExpense[]
  sellPlatform: string
  platformFee: number
  includeIVA: boolean
  equipment: Equipment[]
  profitOption: 'percentage' | 'amount'
  profitPercentage: number
  profitAmount: number
}

export interface AnalysisResult {
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

export interface Recommendation {
  type: 'add_product' | 'increase_volume' | 'increase_price' | 'reduce_expenses' | 'add_equipment'
  title: string
  description: string
  impact: number // dinero que ganaría
  action: string
  difficulty: 'easy' | 'medium' | 'hard'
}

const DEFAULT_PRODUCT: Product = {
  id: `product_${Date.now()}`,
  name: '',
  businessType: 'confection',
  monthlyVolume: 100,
  materials: [{ id: 1, name: '', quantity: 1, unit: 'unidad', unitPrice: 0 }],
  laborMinutes: 30,
  hourlyRate: 15,
  hoursPerDay: 8,
  daysPerWeek: 6,
  operativeExpenses: [
    { id: 1, name: 'Alquiler', amount: 0, percentage: 100 },
    { id: 2, name: 'Servicios', amount: 0, percentage: 100 },
  ],
  sellPlatform: 'presencial',
  platformFee: 0,
  includeIVA: true,
  equipment: [],
  profitOption: 'percentage',
  profitPercentage: 40,
  profitAmount: 0,
}

export function useCalculator() {
  const [products, setProducts] = useState<Product[]>([DEFAULT_PRODUCT])
  const [currentProductId, setCurrentProductId] = useState(DEFAULT_PRODUCT.id)
  const [analysisCache, setAnalysisCache] = useState<Map<string, AnalysisResult>>(new Map())

  const currentProduct = products.find(p => p.id === currentProductId) || products[0]

  /**
   * Calcular análisis completo de UN producto
   */
  const calculateProductAnalysis = useCallback((product: Product): AnalysisResult => {
    // Costos directos
    const totalMaterials = product.materials.reduce((sum, m) => sum + (m.quantity * m.unitPrice), 0)
    const laborCost = (product.laborMinutes / 60) * product.hourlyRate
    const directCostPerUnit = totalMaterials + laborCost

    // Gastos operativos
    const totalOperativeExpenses = product.operativeExpenses.reduce((sum, exp) => {
      return sum + (exp.amount * (exp.percentage / 100))
    }, 0)
    const operativePerUnit = totalOperativeExpenses / product.monthlyVolume

    // Amortización equipos
    const monthlyEquipmentCost = product.equipment.reduce((sum, eq) => {
      return sum + (eq.cost / (eq.lifeYears * 12))
    }, 0)
    const equipmentPerUnit = monthlyEquipmentCost / product.monthlyVolume

    // Costo indirecto total
    const indirectCostPerUnit = operativePerUnit + equipmentPerUnit
    const subtotalCostPerUnit = directCostPerUnit + indirectCostPerUnit

    // Comisiones
    let platformCommissionAmount = 0
    let finalCostBeforeIVA = subtotalCostPerUnit
    if (product.sellPlatform !== 'presencial') {
      platformCommissionAmount = subtotalCostPerUnit * (product.platformFee / 100)
      finalCostBeforeIVA = subtotalCostPerUnit + platformCommissionAmount
    }

    // IVA
    let ivaAmount = 0
    let finalCost = finalCostBeforeIVA
    if (product.includeIVA) {
      ivaAmount = finalCostBeforeIVA * 0.21
      finalCost = finalCostBeforeIVA + ivaAmount
    }

    // Precio final
    let finalPrice = 0
    if (product.profitOption === 'percentage') {
      finalPrice = finalCost * (1 + product.profitPercentage / 100)
    } else {
      finalPrice = finalCost + product.profitAmount
    }

    // Análisis
    const marginContribution = finalPrice - (directCostPerUnit + operativePerUnit + platformCommissionAmount)
    const breakevenUnits = marginContribution > 0 ? Math.ceil(0 / marginContribution) : 0 // TODO: considerar sueldo personal
    
    const hoursPerMonth = product.hoursPerDay * product.daysPerWeek * 4.33
    const hourlyRateActual = (finalPrice - finalCost) / (product.laborMinutes / 60)

    const profitPerUnit = finalPrice - finalCost
    const netMarginPercentage = (profitPerUnit / finalPrice) * 100

    const monthlyProfitBest = product.monthlyVolume * profitPerUnit
    const totalPersonalExpenses = 0 // TODO: considerar gastos personales

    const result: AnalysisResult = {
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
      isSustainable: monthlyProfitBest > 0, // TODO: Mejorar lógica
    }

    // Cachear resultado
    setAnalysisCache(prev => new Map(prev).set(product.id, result))
    return result
  }, [])

  /**
   * Generar recomendaciones dinámicas
   */
  const generateRecommendations = useCallback((analysis: AnalysisResult, product: Product): Recommendation[] => {
    const recommendations: Recommendation[] = []

    if (!analysis.isSustainable) {
      // Opción 1: Agregar otro producto
      recommendations.push({
        type: 'add_product',
        title: '📦 Agregar otro producto',
        description: 'Con un segundo producto puedes diversificar ingresos',
        impact: analysis.monthlyProfitBest * 0.5, // Estimado
        action: 'Crear producto 2',
        difficulty: 'medium',
      })

      // Opción 2: Aumentar volumen
      const volumeNeeded = Math.ceil(Math.abs(analysis.monthlyProfitBest) / analysis.profitPerUnit)
      recommendations.push({
        type: 'increase_volume',
        title: '📈 Aumentar volumen a ' + volumeNeeded,
        description: `Necesitas vender ${volumeNeeded} unidades para ser viable`,
        impact: analysis.profitPerUnit * volumeNeeded,
        action: 'Actualizar volumen',
        difficulty: 'hard',
      })

      // Opción 3: Aumentar precio
      const priceIncrease = Math.abs(analysis.monthlyProfitBest) / product.monthlyVolume * 1.2
      recommendations.push({
        type: 'increase_price',
        title: '💰 Aumentar precio',
        description: `Subir precio podría hacerlo viable sin cambiar volumen`,
        impact: priceIncrease * product.monthlyVolume,
        action: 'Ajustar precio',
        difficulty: 'easy',
      })

      // Opción 4: Reducir gastos
      recommendations.push({
        type: 'reduce_expenses',
        title: '💼 Reducir gastos operativos',
        description: 'Negocia servicios, busca alternativas más baratas',
        impact: Math.abs(analysis.monthlyProfitBest),
        action: 'Revisar gastos',
        difficulty: 'medium',
      })
    }

    return recommendations.sort((a, b) => b.impact - a.impact).slice(0, 4)
  }, [])

  // Funciones de actualización
  const updateProduct = useCallback((updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => 
      p.id === currentProductId ? { ...p, ...updates } : p
    ))
  }, [currentProductId])

  const addProduct = useCallback(() => {
    const newProduct: Product = { ...DEFAULT_PRODUCT, id: `product_${Date.now()}` }
    setProducts(prev => [...prev, newProduct])
    setCurrentProductId(newProduct.id)
  }, [])

  const deleteProduct = useCallback((productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId))
    if (currentProductId === productId && products.length > 1) {
      setCurrentProductId(products[0].id)
    }
  }, [currentProductId, products])

  return {
    products,
    currentProduct,
    currentProductId,
    setCurrentProductId,
    updateProduct,
    addProduct,
    deleteProduct,
    calculateProductAnalysis,
    generateRecommendations,
  }
}
