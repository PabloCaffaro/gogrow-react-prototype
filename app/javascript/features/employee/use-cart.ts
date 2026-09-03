import { useState } from 'react'
import type { Dish } from '@/domain/menu'
import type { DeliveryLocation } from '@/domain/employee'

/** Una línea conserva la personalización; su precio proviene del catálogo mock. */
export type CartLine = {
  id: string
  dish: Dish
  quantity: number
  customization: string
  notes: string
}

export const MAX_DISH_QUANTITY = 20
export const money = (amount: number) => `$${amount.toLocaleString('es-UY')}`
export const cartCount = (lines: CartLine[]) => lines.reduce((sum, line) => sum + line.quantity, 0)
export const cartTotal = (lines: CartLine[]) => lines.reduce((sum, line) => sum + line.quantity * line.dish.price, 0)
export const deliveryKey = (dish: Dish) => `${dish.providerId}:${dish.dayId}`

/** El límite suma variantes del mismo plato/proveedor, incluso entre fechas. */
export const sameDish = (a: Dish, b: Dish) => a.providerId === b.providerId && a.name === b.name

/** Hook de comportamiento: no renderiza UI ni escribe en backend/localStorage. */
export function useCart() {
  const [lines, setLines] = useState<CartLine[]>([])
  const [deliveries, setDeliveries] = useState<Record<string, DeliveryLocation>>({})
  const available = (dish: Dish) => MAX_DISH_QUANTITY - lines.filter(line => sameDish(line.dish, dish)).reduce((sum, line) => sum + line.quantity, 0)

  // Mismas opciones y fecha se acumulan; variantes distintas conservan su propia línea.
  const add = (dish: Dish, quantity: number, customization: string, notes: string) => {
    const id = crypto.randomUUID()
    setLines(current => {
      const remaining = MAX_DISH_QUANTITY - current.filter(line => sameDish(line.dish, dish)).reduce((sum, line) => sum + line.quantity, 0)
      const amount = Math.min(remaining, Math.max(1, Math.floor(quantity)))
      if (amount <= 0) return current
      const existing = current.find(line => line.dish.id === dish.id && line.customization === customization && line.notes === notes.trim())
      return existing
        ? current.map(line => line.id === existing.id ? { ...line, quantity: line.quantity + amount } : line)
        : [...current, { id, dish, quantity: amount, customization, notes: notes.trim() }]
    })
  }

  const changeQuantity = (id: string, quantity: number) => {
    if (!Number.isInteger(quantity) || quantity < 1) return
    setLines(current => current.map(line => {
      if (line.id !== id) return line
      const others = current.filter(other => other.id !== id && sameDish(other.dish, line.dish)).reduce((sum, other) => sum + other.quantity, 0)
      return { ...line, quantity: Math.min(quantity, MAX_DISH_QUANTITY - others) }
    }))
  }

  return {
    lines, deliveries, available, add, changeQuantity,
    remove: (id: string) => setLines(current => current.filter(line => line.id !== id)),
    setDelivery: (key: string, value: DeliveryLocation) => setDeliveries(current => ({ ...current, [key]: value })),
    clear: () => { setLines([]); setDeliveries({}) },
  }
}
