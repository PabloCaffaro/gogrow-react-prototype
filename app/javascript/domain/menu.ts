/** Identificadores estables usados para filtrar platos sin comparar etiquetas. */
export type ProviderId = 'endulzate' | 'tu-viandita'

/** Opción visible en el selector de días del menú semanal. */
export type MenuDay = {
  id: string
  shortName: string
  date: number
}

/**
 * Plato publicado por un proveedor.
 * `details` y `customizations` son opcionales porque no todos los platos mock
 * tienen todavía una pantalla de personalización profunda.
 */
export type Dish = {
  id: number
  dayId: MenuDay['id']
  providerId: ProviderId
  providerName: string
  name: string
  description: string
  details?: string
  customizations?: string[]
  price: number
}
