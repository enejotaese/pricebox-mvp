/**
 * UTILIDADES - Funciones comunes
 */

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Combina clases de Tailwind de forma inteligente
 * 
 * BUENA PRÁCTICA: Centralizar utilidades comunes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
