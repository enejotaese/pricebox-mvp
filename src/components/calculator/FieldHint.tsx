'use client'

/**
 * COMPONENTE: Field Hint
 * 
 * Muestra ayuda contextual para cada campo
 * Mejora UX significativamente
 */

interface FieldHintProps {
  icon: string
  label: string
  hint: string
  required?: boolean
}

export function FieldHint({ icon, label, hint, required }: FieldHintProps) {
  return (
    <div className="flex items-start gap-3">
      <div className="text-2xl flex-shrink-0 pt-1">{icon}</div>
      <div className="flex-1">
        <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-1">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <p className="text-xs text-gray-600 dark:text-gray-400">{hint}</p>
      </div>
    </div>
  )
}
