/**
 * SUPABASE ADMIN CLIENT
 * 
 * ⚠️ CRÍTICO: NUNCA expongas esto en el cliente
 * ⚠️ Solo usar en API Routes del servidor
 * ⚠️ Usa Service Role Key para bypassear RLS
 * 
 * BUENA PRÁCTICA: 
 * - Importa SOLO en archivos del servidor
 * - Nunca en componentes cliente
 * - Nunca en .env.local del cliente
 */

import { createClient } from '@supabase/supabase-js'

// Obtener credenciales del entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// Validar que las credenciales existan
if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL no está configurada en .env.local')
}

if (!supabaseServiceRoleKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY no está configurada en .env.local')
}

/**
 * Cliente admin con Service Role Key
 * 
 * Bypassea todas las políticas RLS
 * Úsalo SOLO para operaciones del sistema que requieren permisos especiales
 */
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
