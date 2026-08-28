export type ProviderSection = 'home' | 'menu' | 'orders' | 'payments' | 'insights' | 'account'
export type ProviderOrderStatus = 'pending' | 'confirmed' | 'delivered' | 'cancelled'
export type PaymentStatus = 'pending' | 'confirmed'

export type ProviderDish = {
  id: number
  name: string
  description: string
  price: number
  available: boolean
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
