export type AdminSection = 'home' | 'employees' | 'payments' | 'insights' | 'account'
export type AdminPaymentStatus = 'pending' | 'validated' | 'observed' | 'paid'

export type TemporaryBenefit = {
  monthlyAllowance: number
  companyContribution: number
  startsOn: string
  endsOn: string
  reason: string
}

export type EmployeeOrder = {
  id: string
  date: string
  provider: string
  dish: string
  amount: number
  companyShare: number
  employeeShare: number
}

export type ProviderBalance = {
  provider: string
  generated: number
  paid: number
  debt: number
}

export type AdminEmployee = {
  id: number
  name: string
  initials: string
  email: string
  team: string
  monthlyAllowance: number
  companyContribution: number
  ordersThisMonth: number
  temporaryBenefit?: TemporaryBenefit
  orders: EmployeeOrder[]
  balances: ProviderBalance[]
}

export type AdminPayment = {
  id: string
  provider: string
  period: string
  orders: number
  grossAmount: number
  employeeShare: number
  amount: number
  status: AdminPaymentStatus
  adjustment?: number
}
