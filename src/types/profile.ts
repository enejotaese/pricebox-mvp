/**
 * TIPOS - Profile
 * Definiciones de TypeScript para profiles de usuario
 */

export interface OrganizationProfile {
  id: string
  organization_id: string
  ideal_monthly_salary: number
  fixed_costs: number
  variable_costs: number
  province: string
  socioeconomic_level: string
  is_setup_complete: boolean
  created_at: string
  updated_at: string
}

export const ARGENTINA_PROVINCES = [
  'Buenos Aires',
  'CABA',
  'Catamarca',
  'Córdoba',
  'Corrientes',
  'Chaco',
  'Chubut',
  'Entre Ríos',
  'Formosa',
  'Jujuy',
  'La Pampa',
  'La Rioja',
  'Mendoza',
  'Misiones',
  'Neuquén',
  'Río Negro',
  'Salta',
  'San Juan',
  'San Luis',
  'Santa Cruz',
  'Santa Fe',
  'Santiago del Estero',
  'Tierra del Fuego',
  'Tucumán',
]

export const SOCIOECONOMIC_LEVELS = [
  {
    value: 'low',
    label: 'Bajo',
    description: 'Barrios con economía reducida',
  },
  {
    value: 'medium',
    label: 'Medio',
    description: 'Barrios de clase media',
  },
  {
    value: 'high',
    label: 'Alto',
    description: 'Barrios de clase alta',
  },
]
