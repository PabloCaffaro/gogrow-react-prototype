export type ProviderSection = 'home' | 'menu' | 'orders' | 'payments' | 'insights' | 'account'
export type ProviderOrderStatus = 'pending' | 'confirmed' | 'delivered' | 'cancelled'
export type PaymentStatus = 'pending' | 'confirmed' | 'due'
export type CompanySettlementStatus = 'pending' | 'review' | 'confirmed'

export type ProviderDish = {
  id: number
  name: string
  description: string
  price: number
  available: boolean
  /** Día del menú al que pertenece este plato en el prototipo. */
  dayId: string
  reused?: boolean
}

export type ProviderOrder = {
  id: string
  employee: string
  employeeInitials: string
  dish: string
  specifications: string
  address: string
  deliveryTime: string
  amount: number
  status: ProviderOrderStatus
  cancellationNotice?: boolean
}

export type EmployeePayment = {
  id: string
  employee: string
  period: string
  amount: number
  date: string
  status: PaymentStatus
  receipt: string
}

/** Liquidación mensual que GoGrow abona al proveedor por los aportes corporativos. */
export type CompanySettlement = {
  id: string
  period: string
  meals: number
  amount: number
  dueDate: string
  status: CompanySettlementStatus
}
