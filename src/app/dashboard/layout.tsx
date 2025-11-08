'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Organization } from '@/types/database'
import Link from 'next/link'

/**
 * DashboardLayout maneja:
 * - Autenticación y redirección
 * - Información de la organización
 * - Tema global (light/dark)
 * - Navegación lateral
 * 
 * BUENA PRÁCTICA: Separar layout de páginas específicas
 */
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')
  const router = useRouter()

  // Cargar datos del usuario y organización
  useEffect(() => {
    const loadOrgAndUser = async () => {
      const {
        data: { user: authUser },
      } = await supabase.auth.getUser()

      if (!authUser) {
        router.push('/auth/login')
        return
      }

      setUser(authUser)

      const { data: orgs } = await supabase
        .from('organizations')
        .select('*')
        .eq('owner_id', authUser.id)
        .single()

      if (orgs) {
        setOrganization(orgs)
      }

      setLoading(false)
    }

    loadOrgAndUser()
  }, [router])

  // Cargar tema guardado en localStorage
  useEffect(() => {
    const savedTheme = (localStorage.getItem('theme') as 'light' | 'dark') || 'light'
    setTheme(savedTheme)
  }, [])

  // Aplicar tema al elemento HTML (Tailwind lo detecta automáticamente)
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
  }, [theme])

  /**
   * Cambiar tema
   * BUENA PRÁCTICA: Sincronizar con localStorage para persistencia
   */
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-slate-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 dark:border-teal-400 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    )
  }

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: '📊' },
    { name: 'Calculadora', href: '/dashboard/calculator', icon: '🧮' },
    { name: 'Productos', href: '/dashboard/products', icon: '📦' },
  ]

  return (
    <div className="flex h-screen bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-50 transition-colors duration-300">
      {/* Sidebar - Notion Style */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 transition-all duration-300 flex flex-col shadow-sm`}
      >
        {/* Logo */}
        <div className="p-4 border-b border-gray-200 dark:border-slate-800">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="w-full flex items-center justify-between hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg p-2 transition-colors"
          >
            <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center w-full'}`}>
              <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                PB
              </div>
              {sidebarOpen && <span className="font-bold text-gray-900 dark:text-white">PriceBox</span>}
            </div>
            {sidebarOpen && (
              <span className="text-gray-400 dark:text-gray-600 text-lg">‹</span>
            )}
          </button>
        </div>

        {/* Organization Info */}
        {sidebarOpen && organization && (
          <div className="px-4 py-3 border-b border-gray-200 dark:border-slate-800">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">Negocio</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate mt-1">{organization.name}</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-2 py-6 space-y-2">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300 hover:text-teal-600 dark:hover:text-teal-400 transition-all group"
            >
              <span className="text-xl flex-shrink-0">{item.icon}</span>
              {sidebarOpen && (
                <span className="text-sm font-medium group-hover:font-semibold">{item.name}</span>
              )}
            </Link>
          ))}
        </nav>

        {/* Theme Toggle & User Info */}
        <div className="p-4 border-t border-gray-200 dark:border-slate-800 space-y-3">
          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors group"
            title={`Cambiar a tema ${theme === 'light' ? 'oscuro' : 'claro'}`}
          >
            <span className="text-2xl group-hover:scale-125 transition-transform">
              {theme === 'light' ? '🌙' : '☀️'}
            </span>
            {sidebarOpen && (
              <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
                {theme === 'light' ? 'Oscuro' : 'Claro'}
              </span>
            )}
          </button>

          {/* User Info & Logout */}
          {sidebarOpen ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-gray-50 dark:bg-slate-800">
                <div className="w-8 h-8 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                  {user?.email?.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-900 dark:text-white truncate">{user?.email}</p>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="w-full text-left text-xs font-semibold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-950 px-3 py-2 rounded-lg transition-colors"
              >
                🚪 Salir
              </button>
            </div>
          ) : (
            <button
              onClick={handleLogout}
              className="w-full flex justify-center text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950 p-2 rounded-lg transition-colors"
              title="Salir"
            >
              🚪
            </button>
          )}
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 transition-colors duration-300">
        {children}
      </main>
    </div>
  )
}
