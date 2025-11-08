/**
 * SERVICIOS DE PROFILE
 * Funciones para manejar profiles del usuario
 */

import { supabase } from './client'
import type { OrganizationProfile } from '@/types/profile'

export async function getOrCreateProfile(organizationId: string): Promise<OrganizationProfile | null> {
  try {
    const { data, error } = await supabase
      .from('organization_profiles')
      .select('*')
      .eq('organization_id', organizationId)
      .single()

    if (error && error.code !== 'PGRST116') {
      console.error('Error getting profile:', error)
      return null
    }

    if (!data) {
      const { data: newProfile } = await supabase
        .from('organization_profiles')
        .insert({
          organization_id: organizationId,
          ideal_monthly_salary: 0,
          fixed_costs: 0,
          variable_costs: 0,
          province: 'Buenos Aires',
          socioeconomic_level: 'medium',
          is_setup_complete: false,
        })
        .select()
        .single()

      return newProfile
    }

    return data
  } catch (error) {
    console.error('Unexpected error:', error)
    return null
  }
}

export async function updateProfile(
  organizationId: string,
  updates: Partial<OrganizationProfile>
): Promise<OrganizationProfile | null> {
  try {
    const { data, error } = await supabase
      .from('organization_profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq('organization_id', organizationId)
      .select()
      .single()

    if (error) {
      console.error('Error updating profile:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Unexpected error:', error)
    return null
  }
}

export async function completeSetup(organizationId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('organization_profiles')
      .update({
        is_setup_complete: true,
        updated_at: new Date().toISOString(),
      })
      .eq('organization_id', organizationId)

    if (error) {
      console.error('Error completing setup:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Unexpected error:', error)
    return false
  }
}
