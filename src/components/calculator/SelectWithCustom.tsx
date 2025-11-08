'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'

/**
 * COMPONENTE: Select con opción de agregar custom
 * 
 * Si selecciona "Otro", aparece campo de texto
 * BUENA PRÁCTICA: Reutilizable, flexible
 */

interface Option {
  value: string
  label: string
  icon?: string
  commission?: number
}

interface SelectWithCustomProps {
  options: Option[]
  value: string
  onChange: (value: string, customLabel?: string) => void
  customValue?: string
  onCustomChange?: (value: string) => void
  placeholder?: string
}

export function SelectWithCustom({
  options,
  value,
  onChange,
  customValue,
  onCustomChange,
  placeholder,
}: SelectWithCustomProps) {
  const [showCustom, setShowCustom] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newValue = e.target.value
    onChange(newValue)

    if (newValue === 'custom') {
      setShowCustom(true)
    } else {
      setShowCustom(false)
    }
  }

  return (
    <div className="space-y-3">
      <select
        value={value}
        onChange={handleChange}
        className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-gray-900 dark:text-white text-sm"
      >
        <option value="" disabled>
          {placeholder || 'Selecciona una opción'}
        </option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>
            {opt.icon ? `${opt.icon} ${opt.label}` : opt.label}
          </option>
        ))}
      </select>

      {showCustom && (
        <Input
          type="text"
          value={customValue || ''}
          onChange={(e) => onCustomChange?.(e.target.value)}
          placeholder="Describe tu opción"
          className="w-full text-sm animate-fade-in"
        />
      )}
    </div>
  )
}
