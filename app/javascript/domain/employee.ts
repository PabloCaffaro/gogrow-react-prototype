/**
 * Contratos del flujo de empleado.
 * Este archivo no contiene datos ni comportamiento: define los estados que las
 * pantallas React y los mocks pueden compartir sin depender entre sí.
 */

/** Pantallas internas controladas por React; no representan rutas Rails. */
export type EmployeeView =
  | 'menu'
  | 'dish-detail'
  | 'checkout'
  | 'order-success'
  | 'orders'
  | 'payments'
  | 'account'

/** Secciones persistentes que aparecen en la navegación principal. */
export type PrimaryEmployeeSection = 'menu' | 'orders' | 'payments' | 'account'

/** Destinos de entrega simulados durante la personalización del pedido. */
export type DeliveryLocation = 'office' | 'home'

/** Resumen suficiente para mostrar un pedido en próximos o historial. */
export type EmployeeOrder = {
  id: string
  dishName: string
  providerName: string
  deliveryLabel: string
  amount: number
  quantity: number
  status: 'confirmed' | 'pending' | 'delivered'
}

/** Estado de cuenta agrupado por proveedor y período. */
export type ProviderPayment = {
  id: string
  providerName: string
  period: string
  amount: number
  dueLabel: string
  status: 'due' | 'pending-validation' | 'paid'
  accountNumber: string
}
