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
