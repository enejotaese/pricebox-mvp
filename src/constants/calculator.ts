/**
 * CONSTANTES DE LA CALCULADORA
 * 
 * Centralizamos todos los datos para fácil mantenimiento
 * BUENA PRÁCTICA: Single Source of Truth
 */

export const BUSINESS_TYPES = [
  { value: 'confection', label: 'Confección/Ropa', icon: '👕' },
  { value: 'food', label: 'Alimentos', icon: '🍲' },
  { value: 'services', label: 'Servicios', icon: '💼' },
  { value: 'digital', label: 'Digital/Software', icon: '💻' },
  { value: 'handmade', label: 'Artesanías', icon: '🎨' },
  { value: 'jewelry', label: 'Joyería', icon: '💎' },
  { value: 'cosmetics', label: 'Cosméticos', icon: '💄' },
  { value: 'furniture', label: 'Muebles', icon: '🪑' },
  { value: 'custom', label: 'Otro (especificar)', icon: '➕' },
]

export const UNITS = [
  { value: 'unidad', label: 'Unidad' },
  { value: 'metro', label: 'Metro' },
  { value: 'kg', label: 'Kilogramo' },
  { value: 'gramo', label: 'Gramo' },
  { value: 'litro', label: 'Litro' },
  { value: 'mililitro', label: 'Mililitro' },
  { value: 'docena', label: 'Docena' },
  { value: 'pack', label: 'Pack' },
  { value: 'custom', label: 'Otra (especificar)', icon: '➕' },
]

export const EXPENSE_TEMPLATES = [
  { id: 1, name: 'Alquiler', icon: '🏠' },
  { id: 2, name: 'Servicios (Luz, Gas, Agua)', icon: '⚡' },
  { id: 3, name: 'Internet', icon: '📡' },
  { id: 4, name: 'Packaging', icon: '📦' },
  { id: 5, name: 'Publicidad', icon: '📢' },
  { id: 6, name: 'Teléfono', icon: '☎️' },
  { id: 7, name: 'Seguros', icon: '🛡️' },
  { id: 8, name: 'Mantenimiento', icon: '🔧' },
]

export const PLATFORMS = [
  { value: 'presencial', label: 'Presencial (sin comisión)', commission: 0 },
  { value: 'mercadolibre', label: 'MercadoLibre', commission: 12 },
  { value: 'shopify', label: 'Shopify', commission: 2.9 },
  { value: 'instagram', label: 'Instagram Shop', commission: 5 },
  { value: 'facebook', label: 'Facebook Shop', commission: 5 },
  { value: 'whatsapp', label: 'WhatsApp Business', commission: 0 },
  { value: 'custom', label: 'Otra (especificar)', commission: 0 },
]

export const PERSONAL_EXPENSES = [
  { id: 1, name: 'Alquiler/Hipoteca', icon: '🏠' },
  { id: 2, name: 'Servicios Personales', icon: '⚡' },
  { id: 3, name: 'Comida/Supermercado', icon: '🛒' },
  { id: 4, name: 'Transporte', icon: '🚌' },
  { id: 5, name: 'Teléfono/Internet', icon: '📱' },
]

export const FIELD_HINTS = {
  productName: {
    label: 'Nombre del producto',
    hint: 'Ej: Pantalón Básico, Remera Premium',
    icon: '📝',
  },
  businessType: {
    label: 'Tipo de negocio',
    hint: 'Selecciona la categoría que mejor describe tu producto',
    icon: '🎯',
  },
  monthlyVolume: {
    label: 'Volumen mensual',
    hint: 'Cuántas unidades esperas vender por mes',
    icon: '📊',
  },
  materialName: {
    label: 'Material/Insumo',
    hint: 'Ej: Tela de algodón, Hilo, Botones',
    icon: '🛠️',
  },
  materialQuantity: {
    label: 'Cantidad',
    hint: 'Cuánto de este material necesitas por unidad',
    icon: '🔢',
  },
  materialUnit: {
    label: 'Unidad de medida',
    hint: 'Metro, kg, litro, etc.',
    icon: '📏',
  },
  materialPrice: {
    label: 'Precio unitario',
    hint: 'Cuánto cuesta 1 unidad de este material en $ARS',
    icon: '💵',
  },
  laborMinutes: {
    label: 'Minutos de trabajo',
    hint: 'Cuánto tiempo te lleva hacer 1 unidad',
    icon: '⏱️',
  },
  hourlyRate: {
    label: 'Tarifa por hora',
    hint: 'Cuánto quieres ganar por hora trabajando',
    icon: '💰',
  },
  hoursPerDay: {
    label: 'Horas de trabajo diarias',
    hint: 'Cuántas horas dedicas por día',
    icon: '🕐',
  },
  daysPerWeek: {
    label: 'Días de trabajo semanales',
    hint: 'Cuántos días trabajas por semana',
    icon: '📅',
  },
  expenseName: {
    label: 'Concepto de gasto',
    hint: 'Ej: Alquiler, Servicios, Packaging',
    icon: '💼',
  },
  expenseAmount: {
    label: 'Monto mensual',
    hint: 'Cuánto gastas por mes en $ARS',
    icon: '💵',
  },
  expensePercentage: {
    label: 'Porcentaje de uso',
    hint: 'Si compartes gasto, qué % es tuyo (ej: 100%)',
    icon: '📊',
  },
}
