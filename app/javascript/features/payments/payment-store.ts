import { useSyncExternalStore } from 'react'
import { initialReceipts, monthlyDebts, type MonthlyDebt, type PaymentReceipt } from '@/mocks/monthly-payments'

/** Store frontend compartido entre roles en la misma pestaña. Recargar restaura los mocks. */
let snapshot: { debts: MonthlyDebt[]; receipts: PaymentReceipt[] } = { debts: monthlyDebts, receipts: initialReceipts }
const listeners = new Set<() => void>()
const subscribe = (listener: () => void) => { listeners.add(listener); return () => { listeners.delete(listener) } }
const getSnapshot = () => snapshot
const emit = () => listeners.forEach(listener => listener())

export const usePaymentStore = () => useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

/** Una sola operación asocia el mismo comprobante a meses completos de un proveedor. */
export function submitReceipt(ids: string[], filename: string) {
  const selected = snapshot.debts.filter(debt => ids.includes(debt.id) && debt.status === 'due')
  if (!selected.length || selected.length !== ids.length || new Set(selected.map(debt => debt.provider)).size !== 1 || !filename.trim()) return false
  const receipt: PaymentReceipt = {
    id: `COMP-${crypto.randomUUID().slice(0, 8)}`,
    employee: 'Sofía', provider: selected[0].provider, filename,
    allocations: selected.map(debt => ({ debtId: debt.id, month: debt.month, amount: debt.amount })), status: 'pending',
  }
  snapshot = { debts: snapshot.debts.map(debt => ids.includes(debt.id) ? { ...debt, status: 'pending' } : debt), receipts: [receipt, ...snapshot.receipts] }
  emit()
  return true
}

/** Confirmar paga todos los meses asociados; observar permite volver a informar el pago. */
export function reviewReceipt(id: string, status: 'paid' | 'observed') {
  const receipt = snapshot.receipts.find(item => item.id === id && item.status === 'pending')
  if (!receipt) return
  const ids = receipt.allocations.map(item => item.debtId)
  snapshot = {
    debts: snapshot.debts.map(debt => ids.includes(debt.id) ? { ...debt, status: status === 'paid' ? 'paid' : 'due' } : debt),
    receipts: snapshot.receipts.map(item => item.id === id ? { ...item, status } : item),
  }
  emit()
}
