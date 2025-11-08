/**
 * COMPONENTE: Input
 * Campo de texto reutilizable
 */

import React from 'react'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      type={type}
      className={`
        px-4 py-3 rounded-lg border border-gray-300 dark:border-slate-700
        bg-white dark:bg-slate-800
        text-gray-900 dark:text-white
        placeholder-gray-500 dark:placeholder-gray-400
        focus:outline-none focus:ring-2 focus:ring-teal-500
        disabled:opacity-50 disabled:cursor-not-allowed
        transition
        ${className || ''}
      `}
      ref={ref}
      {...props}
    />
  )
)

Input.displayName = 'Input'
