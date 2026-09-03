/** Escenarios de meses pendientes, pagados y ya informados; no representan cuentas reales. */
export type MonthlyDebt = {
  id: string
  provider: string
  month: string
  amount: number
  account: string
  status: 'due' | 'pending' | 'paid'
}

export type PaymentReceipt = {
  id: string
  employee: string
  provider: string
  allocations: { debtId: string; month: string; amount: number }[]
  filename: string
  status: 'pending' | 'paid' | 'observed'
}

export const monthlyDebts: MonthlyDebt[] = [
  { id: 'end-apr', provider: 'Endulzate by Noe', month: 'Abril 2026', amount: 600, account: 'BROU · 001234567-00001', status: 'due' },
  { id: 'end-may', provider: 'Endulzate by Noe', month: 'Mayo 2026', amount: 450, account: 'BROU · 001234567-00001', status: 'due' },
  { id: 'end-mar', provider: 'Endulzate by Noe', month: 'Marzo 2026', amount: 750, account: 'BROU · 001234567-00001', status: 'paid' },
  { id: 'tuv-apr', provider: 'Tu Viandita', month: 'Abril 2026', amount: 320, account: 'Santander · 123456789', status: 'pending' },
  { id: 'tuv-may', provider: 'Tu Viandita', month: 'Mayo 2026', amount: 900, account: 'Santander · 123456789', status: 'due' },
  { id: 'tuv-jun', provider: 'Tu Viandita', month: 'Junio 2026', amount: 450, account: 'Santander · 123456789', status: 'due' },
]

export const initialReceipts: PaymentReceipt[] = [
  { id: 'COMP-DEMO-01', employee: 'Sofía', provider: 'Tu Viandita', allocations: [{ debtId: 'tuv-apr', month: 'Abril 2026', amount: 320 }], filename: 'comprobante-abril-demo.pdf', status: 'pending' },
]
