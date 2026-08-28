export type EmployeeView =
  | 'menu'
  | 'dish-detail'
  | 'checkout'
  | 'order-success'
  | 'orders'
  | 'payments'
  | 'account'

export type PrimaryEmployeeSection = 'menu' | 'orders' | 'payments' | 'account'

export type DeliveryLocation = 'office' | 'home'

export type EmployeeOrder = {
  id: string
  dishName: string
  providerName: string
  deliveryLabel: string
  amount: number
  quantity: number
  status: 'confirmed' | 'pending' | 'delivered'
}

export type ProviderPayment = {
  id: string
  providerName: string
  period: string
  amount: number
  dueLabel: string
  status: 'due' | 'pending-validation' | 'paid'
  accountNumber: string
}
