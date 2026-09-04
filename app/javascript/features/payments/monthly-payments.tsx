/** Componentes visuales del pago agrupado; las operaciones son sólo simulaciones frontend. */
import { useState } from 'react'
import { Check, Clock3, ReceiptText, Store, Wallet } from 'lucide-react'
import { Button } from '@/components/ui/actions/button'
import { Card, CardHeader, CardContent } from '@/components/ui/data-display/card'
import { Badge } from '@/components/ui/data-display/badge'
import { Checkbox } from '@/components/ui/forms/checkbox'
import { Label } from '@/components/ui/forms/label'
import { Select } from '@/components/ui/forms/select'
import { Alert, AlertDescription } from '@/components/ui/feedback/alert'
import { money } from '@/features/employee/use-cart'
import { reviewReceipt, submitReceipt, usePaymentStore } from './payment-store'
import styles from './monthly-payments.module.css'

const labels = { due: 'Pendiente de pago', pending: 'Pendiente de validación', paid: 'Pagado', observed: 'Observado' }

/** Selección por proveedor: conserva el flujo de meses completos y un único comprobante. */
export function MonthlyPayments({ mode = 'employee' }: { mode?: 'employee' | 'admin' }) {
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
  const outstanding = rows.filter(debt => debt.status !== 'paid').reduce((sum, debt) => sum + debt.amount, 0)
  // Resúmenes y listados comparten la misma colección: se actualizan al informar el pago.
  const groups = [
    { status: 'due', title: 'Pendientes de pago', empty: 'No hay pagos pendientes.', icon: Wallet },
    { status: 'pending', title: 'En revisión', empty: 'No hay comprobantes en revisión.', icon: Clock3 },
    { status: 'paid', title: 'Pagados', empty: 'No hay pagos confirmados.', icon: Check },
  ] as const

  const changeProvider = (name: string) => {
    setProvider(name)
    setSelected([])
    setFilename('')
    setMessage('')
  }

  // Sólo guarda el nombre del archivo en el store frontend; no realiza una carga real.
  const send = () => {
    if (!submitReceipt(chosen.map(debt => debt.id), filename)) return
    setMessage(`Comprobante informado por ${money(total)} para ${chosen.map(debt => debt.month).join(' y ')}.`)
    setSelected([])
    setFilename('')
  }

  return <section className={styles.page}>
    <header className={styles.heading}><p>{mode === 'admin' ? 'Control de aportes' : 'Estado de cuenta'}</p><h1>{mode === 'admin' ? 'Liquidaciones' : 'Pagos'}</h1></header>
    <Card className={styles.providerCard}><CardContent className={styles.providerContent}>
      <div className={styles.providerIdentity}><span className={styles.providerIcon}><Store aria-hidden="true" /></span><div><p>Proveedor seleccionado</p><h2>{provider}</h2></div></div>
      <div className={styles.providerPicker}><Label htmlFor="payment-provider">Proveedor</Label><Select id="payment-provider" value={provider} onChange={event => changeProvider(event.target.value)}>{providers.map(name => <option key={name}>{name}</option>)}</Select></div>
      <div className={styles.accountInfo}><span>Cuenta de cobro</span><strong>{rows[0]?.account ?? 'Sin cuenta registrada'}</strong></div>
      <div className={styles.balance}><span>Saldo pendiente</span><strong>{money(outstanding)}</strong></div>
    </CardContent></Card>
    <section className={styles.overview} aria-label="Resumen del proveedor">
      {groups.map(group => {
        const items = rows.filter(debt => debt.status === group.status)
        return <Card className={styles.metric} key={group.status}><CardContent><span><group.icon aria-hidden="true" />{group.title}</span><strong>{money(items.reduce((sum, debt) => sum + debt.amount, 0))}</strong><small>{items.length} {items.length === 1 ? 'mes' : 'meses'}</small></CardContent></Card>
      })}
    </section>
    {message && <Alert role="status"><AlertDescription>{message}</AlertDescription></Alert>}
    <div className={styles.layout}><div className={styles.paymentGroups}>
      {groups.map(group => {
        const items = rows.filter(debt => debt.status === group.status)
        return <section className={styles.statusGroup} data-status={group.status} key={group.status} aria-label={group.title}>
          <header className={styles.groupHeader}><h2><group.icon aria-hidden="true" />{group.title}<span>{items.length}</span></h2>{group.status === 'due' && payable.length > 0 && <Button variant="outline" size="sm" onClick={() => setSelected(allSelected ? [] : payable.map(debt => debt.id))}>{allSelected ? 'Quitar selección' : 'Seleccionar todos'}</Button>}</header>
          <div className={styles.debtList}>{items.length === 0 ? <div className={styles.emptyGroup}>{group.empty}</div> : items.map(debt => {
            const receipt = receipts.find(item => item.status !== 'observed' && item.allocations.some(allocation => allocation.debtId === debt.id))
            return <Card size="sm" className={styles.debt} data-selected={group.status === 'due' && selected.includes(debt.id)} key={debt.id}>
              <div className={styles.debtControl}>{group.status === 'due' ? <Checkbox id={debt.id} checked={selected.includes(debt.id)} aria-label={`Seleccionar ${debt.month}`} onCheckedChange={checked => setSelected(current => checked ? [...new Set([...current, debt.id])] : current.filter(id => id !== debt.id))} /> : <ReceiptText aria-hidden="true" />}</div>
              <div className={styles.debtInfo}>{group.status === 'due' ? <Label htmlFor={debt.id}>{debt.month}</Label> : <h3>{debt.month}</h3>}<Badge variant="outline" data-payment-status={debt.status}>{group.status === 'pending' ? 'En revisión' : labels[debt.status]}</Badge>{receipt && <small>{receipt.filename}</small>}</div>
              <strong className={styles.debtAmount}>{money(debt.amount)}</strong>
            </Card>
          })}</div>
        </section>
      })}
    </div><Card className={styles.summary}><CardHeader><span className={styles.summaryEyebrow}>Pago seleccionado</span><h2>{money(total)}</h2><p>{chosen.length} {chosen.length === 1 ? 'mes seleccionado' : 'meses seleccionados'}</p></CardHeader><CardContent>
      {chosen.length > 0 ? <>
        <div className={styles.selectedMonths}>{chosen.map(debt => <div key={debt.id}><span>{debt.month}</span><strong>{money(debt.amount)}</strong></div>)}</div>
        {/* La carga queda visual; el comprobante de prueba permite recorrer el flujo local. */}
        <div className={styles.receiptField} role="group" aria-label="Comprobante">
          <span>Comprobante</span>
          <Button type="button" variant="outline" disabled>Agregar archivo</Button>
          <Button type="button" variant={filename ? 'secondary' : 'outline'} aria-pressed={Boolean(filename)} onClick={() => setFilename('comprobante-demo.pdf')}><ReceiptText aria-hidden="true" />Usar comprobante de prueba</Button>
          {filename && <p className={styles.filename} role="status">{filename}</p>}
        </div>
      </> : <p className={styles.selectionEmpty}>Seleccioná los meses que querés pagar.</p>}
      <Button disabled={!chosen.length || !filename} onClick={send}>Informar pago</Button>
    </CardContent></Card></div>
  </section>
}

/** El proveedor revisa un solo comprobante con el desglose de todos sus meses. */
export function ReceiptList({ provider, canReview = false, period = 'all' }: { provider: string; canReview?: boolean; period?: string }) {
  const { receipts } = usePaymentStore()
  // El filtro mensual conserva un comprobante si cubre al menos una deuda de ese período.
  const rows = receipts.filter(receipt => receipt.provider === provider && (period === 'all' || receipt.allocations.some(allocation => allocation.month === period)))
  return <div className={styles.receipts}>{!rows.length && <p>No hay comprobantes para este período.</p>}{rows.map(receipt => <Card key={receipt.id}><CardHeader>
    <h3>{receipt.employee} · {money(receipt.allocations.reduce((sum, item) => sum + item.amount, 0))}</h3><Badge variant="outline">{labels[receipt.status]}</Badge>
  </CardHeader><CardContent>
    <p>{receipt.id}</p><p className={styles.filename}>{receipt.filename}</p>
    {receipt.allocations.map(item => <p key={item.debtId}>{item.month}: {money(item.amount)}</p>)}
    {canReview && receipt.status === 'pending' && <div className={styles.actions}><Button variant="outline" onClick={() => reviewReceipt(receipt.id, 'observed')}>Observar</Button><Button onClick={() => reviewReceipt(receipt.id, 'paid')}>Confirmar pago</Button></div>}
  </CardContent></Card>)}</div>
}
