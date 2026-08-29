import type { EmployeeOrder, ProviderPayment } from '@/domain/employee'

/** Entregas futuras utilizadas por la pestaña "Próximos". */
export const upcomingOrders: EmployeeOrder[] = [
  {
    id: 'PED-1042',
    dishName: 'Wok de verduras + arroz',
    providerName: 'Endulzate by Noe',
    deliveryLabel: 'Hoy, 12:30 · Oficina',
    amount: 150,
    quantity: 1,
    status: 'confirmed',
  },
  {
    id: 'PED-1048',
    dishName: 'Tarta de calabaza',
    providerName: 'Tu Viandita',
    deliveryLabel: 'Martes 11, 12:30 · Oficina',
    amount: 160,
    quantity: 1,
    status: 'pending',
  },
]

/** Pedidos cerrados utilizados por la pestaña "Historial". */
export const orderHistory: EmployeeOrder[] = [
  {
    id: 'PED-1029',
    dishName: 'Pollo al curry',
    providerName: 'Endulzate by Noe',
    deliveryLabel: 'Viernes 7 de mayo',
    amount: 180,
    quantity: 1,
    status: 'delivered',
  },
  {
    id: 'PED-1018',
    dishName: 'Milanesa de pollo',
    providerName: 'Tu Viandita',
    deliveryLabel: 'Miércoles 5 de mayo',
    amount: 170,
    quantity: 1,
    status: 'delivered',
  },
]

/**
 * Deudas ficticias por proveedor.
 * La simulación de comprobantes modifica estado React y nunca este arreglo original.
 */
export const providerPayments: ProviderPayment[] = [
  {
    id: 'PAY-END-MAY',
    providerName: 'Endulzate by Noe',
    period: 'Mayo 2026',
    amount: 450,
    dueLabel: 'Vence el 5 de junio',
    status: 'due',
    accountNumber: 'BROU · 001234567-00001',
  },
  {
    id: 'PAY-TUV-MAY',
    providerName: 'Tu Viandita',
    period: 'Mayo 2026',
    amount: 320,
    dueLabel: 'Comprobante enviado',
    status: 'pending-validation',
    accountNumber: 'Santander · 123456789',
  },
]
