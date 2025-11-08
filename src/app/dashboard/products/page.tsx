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
