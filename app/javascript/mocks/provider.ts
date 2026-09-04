import type { CompanySettlement, EmployeePayment, ProviderDish, ProviderOrder } from '@/domain/provider'

export const providerProfile = {
  name: 'Endulzate by Noe',
  owner: 'Noelia Pereira',
  initials: 'NP',
  coupons: 3,
}

export const providerDays = [
  { id: 'lun-26', day: 'Lun', date: 26, full: 'Lunes 26 de mayo' },
  { id: 'mar-27', day: 'Mar', date: 27, full: 'Martes 27 de mayo' },
  { id: 'mie-28', day: 'Mié', date: 28, full: 'Miércoles 28 de mayo' },
  { id: 'jue-29', day: 'Jue', date: 29, full: 'Jueves 29 de mayo' },
  { id: 'vie-30', day: 'Vie', date: 30, full: 'Viernes 30 de mayo' },
]

export const initialDishes: ProviderDish[] = [
  { id: 1, name: 'Wok de verduras + arroz', description: 'Vegetales frescos salteados, arroz blanco y salsa suave.', price: 300, available: true, dayId: 'lun-26' },
  { id: 2, name: 'Sorrentinos artesanales', description: 'Jamón y queso o caprese, con salsa a elección.', price: 320, available: true, dayId: 'lun-26' },
  { id: 3, name: 'Pollo al curry', description: 'Curry suave, arroz basmati y vegetales de estación.', price: 360, available: false, dayId: 'lun-26' },
]

export const reusableDishes: ProviderDish[] = [
  { id: 20, name: 'Lasagna de verduras', description: 'Vegetales, salsa de tomate y queso gratinado.', price: 340, available: true, dayId: '', reused: true },
  { id: 21, name: 'Tarta de calabaza', description: 'Calabaza, queso y cebolla caramelizada con ensalada.', price: 310, available: true, dayId: '', reused: true },
]

export const initialOrders: ProviderOrder[] = [
  { id: 'PED-1058', employee: 'Martina Silva', employeeInitials: 'MS', dish: 'Wok de verduras + arroz', specifications: 'Sin picante · Sin cebolla', address: 'Oficina GoGrow · 18 de Julio 1006', deliveryTime: '12:30', amount: 300, status: 'pending' },
  { id: 'PED-1057', employee: 'Lucas Pereira', employeeInitials: 'LP', dish: 'Sorrentinos artesanales', specifications: 'Caprese · Salsa de tomate', address: 'Oficina GoGrow · 18 de Julio 1006', deliveryTime: '12:30', amount: 320, status: 'pending' },
  { id: 'PED-1053', employee: 'Camila Díaz', employeeInitials: 'CD', dish: 'Wok de verduras + arroz', specifications: 'Picante suave', address: 'Av. Brasil 2145, apto. 402', deliveryTime: '13:00', amount: 300, status: 'confirmed' },
  { id: 'PED-1049', employee: 'Federico Costa', employeeInitials: 'FC', dish: 'Pollo al curry', specifications: 'Sin modificaciones', address: 'Oficina GoGrow · 18 de Julio 1006', deliveryTime: '12:30', amount: 360, status: 'delivered' },
  { id: 'PED-1046', employee: 'Ana Rodríguez', employeeInitials: 'AR', dish: 'Sorrentinos artesanales', specifications: 'Jamón y queso', address: 'Oficina GoGrow · 18 de Julio 1006', deliveryTime: '12:30', amount: 320, status: 'cancelled', cancellationNotice: true },
]

export const initialPayments: EmployeePayment[] = [
  { id: 'PAG-220', employee: 'Martina Silva', period: 'Mayo 2026', amount: 900, date: '26 may', status: 'pending', receipt: 'comprobante-martina.pdf' },
  { id: 'PAG-219', employee: 'Lucas Pereira', period: 'Mayo 2026', amount: 640, date: '25 may', status: 'pending', receipt: 'transferencia-lucas.jpg' },
  { id: 'PAG-216', employee: 'Sofía', period: 'Mayo 2026', amount: 450, date: '24 may', status: 'due', receipt: 'Sin comprobante informado' },
  { id: 'PAG-214', employee: 'Camila Díaz', period: 'Abril 2026', amount: 1200, date: '5 may', status: 'confirmed', receipt: 'comprobante-camila.pdf' },
]

/** Datos de ejemplo del aporte de la empresa; no se vinculan a una cuenta real. */
export const initialCompanySettlements: CompanySettlement[] = [
  { id: 'LIQ-0526', period: 'Mayo 2026', meals: 84, amount: 12600, dueDate: '5 jun', status: 'review' },
  { id: 'LIQ-0426', period: 'Abril 2026', meals: 76, amount: 11400, dueDate: '5 may', status: 'confirmed' },
  { id: 'LIQ-0326', period: 'Marzo 2026', meals: 69, amount: 10350, dueDate: '5 abr', status: 'pending' },
]
