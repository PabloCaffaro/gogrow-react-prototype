/** Componentes visuales del pago agrupado; las operaciones son sólo simulaciones frontend. */
import { useState } from 'react'
import { Button } from '@/components/ui/actions/button'
import { Card, CardHeader, CardContent } from '@/components/ui/data-display/card'
import { Badge } from '@/components/ui/data-display/badge'
import { Checkbox } from '@/components/ui/forms/checkbox'
import { Label } from '@/components/ui/forms/label'
import { Input } from '@/components/ui/forms/input'
import { Select } from '@/components/ui/forms/select'
import { Alert, AlertDescription } from '@/components/ui/feedback/alert'
import { money } from '@/features/employee/use-cart'
import { reviewReceipt, submitReceipt, usePaymentStore } from './payment-store'
import styles from './monthly-payments.module.css'

const labels = { due: 'Pendiente de pago', pending: 'Pendiente de validación', paid: 'Pagado', observed: 'Observado' }

/** Selección por proveedor: nunca combina cuentas bancarias diferentes. */
export function MonthlyPayments({ mode = 'employee', showReceipts = true }: { mode?: 'employee' | 'admin'; showReceipts?: boolean }) {
  const { debts, receipts } = usePaymentStore()
  const providers = [...new Set(debts.map(debt => debt.provider))]
  const [provider, setProvider] = useState(providers[0])
  const [selected, setSelected] = useState<string[]>([])
  const [filename, setFilename] = useState('')
  const [message, setMessage] = useState('')
  const rows = debts.filter(debt => debt.provider === provider)
  const payable = rows.filter(debt => debt.status === 'due')
  const chosen = payable.filter(debt => selected.includes(debt.id))
  const total = chosen.reduce((sum, debt) => sum + debt.amount, 0)
  const allSelected = payable.length > 0 && chosen.length === payable.length

  // El archivo no se carga a ningún servidor: sólo se conserva su nombre para la demo.
  const send = () => {
    if (!submitReceipt(chosen.map(debt => debt.id), filename)) return
    setMessage(`Comprobante informado por ${money(total)} para ${chosen.map(debt => debt.month).join(' y ')}.`)
    setSelected([])
    setFilename('')
  }

  const pendingRows = rows.filter(debt => debt.status !== 'paid')
  const paidRows = rows.filter(debt => debt.status === 'paid')
  return <section className={styles.page}>
    <header><p>{mode === 'admin' ? 'Control de pagos' : 'Estado de cuenta'}</p><h1>{mode === 'admin' ? 'Pagos por mes' : 'Pagos por mes'}</h1><p>{mode === 'admin' ? 'Misma simulación que ve el empleado, organizada por proveedor.' : 'Elegí uno o varios meses del mismo proveedor.'}</p></header>
    <Card className={styles.providerCard}><CardHeader><p>Proveedor y cuenta de cobro</p><h2>{provider}</h2><p>{rows[0]?.account}</p><strong>Saldo pendiente: {money(rows.filter(debt => debt.status !== 'paid').reduce((sum, debt) => sum + debt.amount, 0))}</strong></CardHeader><CardContent><Label htmlFor="payment-provider">Cambiar proveedor</Label><Select id="payment-provider" value={provider} onChange={event => { setProvider(event.target.value); setSelected([]); setFilename(''); setMessage('') }}>{providers.map(name => <option key={name}>{name}</option>)}</Select></CardContent></Card>
    {message && <Alert role="status"><AlertDescription>{message}</AlertDescription></Alert>}
    <div className={styles.layout}><Card className={styles.paymentGroups}><CardHeader><h2>Pagos</h2><p>Elegí meses pendientes para informar un mismo comprobante.</p><Button variant="outline" disabled={!payable.length} onClick={() => setSelected(allSelected ? [] : payable.map(debt => debt.id))}>{allSelected ? 'Quitar selección' : 'Seleccionar meses pendientes'}</Button></CardHeader><CardContent>
      <section className={styles.statusGroup}><h3 className={styles.groupTitle}>Pendientes de pago</h3>
      {pendingRows.filter(debt => debt.status === 'due').length === 0 && <p className={styles.emptyGroup}>No hay pagos pendientes para este proveedor.</p>}
      {pendingRows.filter(debt => debt.status === 'due').map(debt => {
        const receipt = receipts.find(item => item.status !== 'observed' && item.allocations.some(allocation => allocation.debtId === debt.id))
        return <div className={styles.debt} key={debt.id}>
          <Checkbox id={debt.id} disabled={debt.status !== 'due'} checked={selected.includes(debt.id) && debt.status === 'due'} onCheckedChange={checked => setSelected(current => checked ? [...new Set([...current, debt.id])] : current.filter(id => id !== debt.id))} />
          <div><Label htmlFor={debt.id}>{debt.month}</Label><Badge variant="outline" data-payment-status={debt.status}>{labels[debt.status]}</Badge>{receipt && <small>{receipt.id}</small>}</div>
          <strong>{money(debt.amount)}</strong>
        </div>
      })}
      </section><section className={styles.statusGroup}><h3 className={styles.groupTitle}>En revisión</h3>{pendingRows.filter(debt => debt.status === 'pending').length === 0 && <p className={styles.emptyGroup}>No hay comprobantes esperando revisión.</p>}{pendingRows.filter(debt => debt.status === 'pending').map(debt => { const receipt = receipts.find(item => item.status !== 'observed' && item.allocations.some(allocation => allocation.debtId === debt.id)); return <div className={styles.debt} key={debt.id}><Checkbox id={debt.id} disabled checked={false} /><div><Label htmlFor={debt.id}>{debt.month}</Label><Badge variant="outline" data-payment-status="pending">{labels.pending}</Badge>{receipt && <small>{receipt.id}</small>}</div><strong>{money(debt.amount)}</strong></div> })}</section>
      <section className={styles.statusGroup}><h3 className={styles.groupTitle}>Pagados</h3>{paidRows.length === 0 && <p className={styles.emptyGroup}>Todavía no hay pagos confirmados.</p>}{paidRows.map(debt => <div className={styles.debt} key={debt.id}><Checkbox id={debt.id} disabled checked={false} /><div><Label htmlFor={debt.id}>{debt.month}</Label><Badge variant="outline" data-payment-status="paid">{labels.paid}</Badge></div><strong>{money(debt.amount)}</strong></div>)}</section>
    </CardContent></Card><Card className={styles.summary}><CardHeader><h2>Pago seleccionado</h2><p>{chosen.length} meses · {money(total)}</p></CardHeader><CardContent>
      <p>Un único comprobante se aplicará al total de los meses seleccionados. No se marca como pagado hasta que el proveedor lo valide.</p>
      {chosen.length > 0 && <>
        <Label htmlFor="receipt-file">Comprobante (simulación local)</Label>
        <Input key={provider + receipts.length} id="receipt-file" type="file" accept="image/*,.pdf" onChange={event => setFilename(event.target.files?.[0]?.name ?? '')} />
        <Button variant="outline" onClick={() => setFilename('comprobante-demo.pdf')}>Usar comprobante de ejemplo</Button>
        {filename && <p className={styles.filename}>{filename}</p>}
      </>}
      <Button disabled={!chosen.length || !filename} onClick={send}>Informar pago · {money(total)}</Button>
    </CardContent></Card></div>
    {showReceipts && <><h2>Comprobantes informados</h2><ReceiptList provider={provider} /></>}
  </section>
}

/** El proveedor revisa un solo comprobante con el desglose de todos sus meses. */
export function ReceiptList({ provider, canReview = false, period = 'all' }: { provider: string; canReview?: boolean; period?: string }) {
  const { receipts } = usePaymentStore()
  // El filtro mensual conserva un comprobante si cubre al menos una deuda de ese período.
  const rows = receipts.filter(receipt => receipt.provider === provider && (period === 'all' || receipt.allocations.some(allocation => allocation.month === period)))
  return <div className={styles.receipts}>{!rows.length && <p>Todavía no hay comprobantes agrupados para este proveedor.</p>}{rows.map(receipt => <Card key={receipt.id}><CardHeader>
    <h3>{receipt.employee} · {money(receipt.allocations.reduce((sum, item) => sum + item.amount, 0))}</h3><Badge variant="outline">{labels[receipt.status]}</Badge>
  </CardHeader><CardContent>
    <p>{receipt.id}</p><p className={styles.filename}>{receipt.filename} · Archivo simulado, sin carga al servidor</p>
    {receipt.allocations.map(item => <p key={item.debtId}>{item.month}: {money(item.amount)}</p>)}
    {canReview && receipt.status === 'pending' && <div className={styles.actions}><Button variant="outline" onClick={() => reviewReceipt(receipt.id, 'observed')}>Observar</Button><Button onClick={() => reviewReceipt(receipt.id, 'paid')}>Confirmar pago agrupado</Button></div>}
  </CardContent></Card>)}</div>
}
