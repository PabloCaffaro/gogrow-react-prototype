/** Vistas visuales del carrito: el dashboard conserva los datos entre pantallas. */
import { ArrowLeft, Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/actions/button'
import { Card, CardContent, CardHeader } from '@/components/ui/data-display/card'
import { Badge } from '@/components/ui/data-display/badge'
import { Alert, AlertDescription } from '@/components/ui/feedback/alert'
import { Input } from '@/components/ui/forms/input'
import { Label } from '@/components/ui/forms/label'
import { Select } from '@/components/ui/forms/select'
import type { DeliveryLocation } from '@/domain/employee'
import { menuDays } from '@/mocks/employee-home'
import { cartCount, cartTotal, deliveryKey, money, sameDish, type CartLine } from './use-cart'
import styles from './cart-view.module.css'

type Props = {
  lines: CartLine[]
  deliveries: Record<string, DeliveryLocation>
  onQuantity: (id: string, quantity: number) => void
  onRemove: (id: string) => void
  onDelivery: (key: string, delivery: DeliveryLocation) => void
  onBack: () => void
  onConfirm: () => void
  confirmed?: boolean
  onOrders?: () => void
}

/** Cada grupo corresponde a una entrega de un proveedor en una fecha. */
export function CartView({ lines, deliveries, onQuantity, onRemove, onDelivery, onBack, onConfirm, confirmed = false, onOrders }: Props) {
  const groups = [...new Set(lines.map(line => deliveryKey(line.dish)))]
  const count = cartCount(lines)
  return <section className={styles.page}>
    <Button variant="ghost" onClick={onBack}><ArrowLeft />{confirmed ? 'Volver al menú' : 'Seguir eligiendo'}</Button>
    <header><h1>{confirmed ? '¡Pedido confirmado!' : 'Tu carrito'}</h1><p>{count} {count === 1 ? 'plato' : 'platos'} · {money(cartTotal(lines))}</p></header>
    {!lines.length ? <Card><CardContent className={styles.empty}><ShoppingBag /><h2>Tu carrito está vacío</h2><p>Agregá platos desde el menú para comenzar.</p><Button onClick={onBack}>Ver menú</Button></CardContent></Card> : <>
      <div className={styles.layout}><div className={styles.groups}>
        {groups.map(key => {
          const group = lines.filter(line => deliveryKey(line.dish) === key)
          const first = group[0].dish
          const day = menuDays.find(item => item.id === first.dayId)
          return <Card key={key}>
            <CardHeader><h2>{first.providerName}</h2><Badge variant="secondary">{day?.shortName} {day?.date} · 12:30</Badge></CardHeader>
            <CardContent>
              {group.map(line => {
                const remaining = 20 - lines.filter(other => other.id !== line.id && sameDish(other.dish, line.dish)).reduce((sum, other) => sum + other.quantity, 0)
                return <article key={line.id} className={styles.line}>
                  <div><h3>{line.dish.name}</h3>{line.customization && <p>{line.customization}</p>}{line.notes && <p>Aclaraciones: {line.notes}</p>}<small>{money(line.dish.price)} por plato</small></div>
                  <strong>{money(line.dish.price * line.quantity)}</strong>
                  {confirmed ? <p>{line.quantity} platos</p> : <div className={styles.quantity}>
                    <Button variant="outline" size="icon" disabled={line.quantity <= 1} aria-label={`Restar ${line.dish.name}`} onClick={() => onQuantity(line.id, line.quantity - 1)}><Minus /></Button>
                    <Input type="number" min={1} max={remaining} value={line.quantity} aria-label={`Cantidad de ${line.dish.name} ${line.customization}`} onChange={event => onQuantity(line.id, Number(event.target.value))} />
                    <Button variant="outline" size="icon" disabled={line.quantity >= remaining} aria-label={`Sumar ${line.dish.name}`} onClick={() => onQuantity(line.id, line.quantity + 1)}><Plus /></Button>
                    <Button variant="ghost" size="icon" aria-label={`Eliminar ${line.dish.name}`} onClick={() => onRemove(line.id)}><Trash2 /></Button>
                  </div>}
                </article>
              })}
              <Label htmlFor={`delivery-${key}`}>Entrega para este proveedor y día</Label>
              {confirmed ? <p>{deliveries[key] === 'home' ? 'Domicilio' : 'Oficina GoGrow'}</p> : <Select id={`delivery-${key}`} value={deliveries[key] ?? 'office'} onChange={event => onDelivery(key, event.target.value as DeliveryLocation)}><option value="office">Oficina GoGrow</option><option value="home">Domicilio guardado</option></Select>}
            </CardContent>
          </Card>
        })}
      </div><Card className={styles.summary}><CardContent>
        <h2>{confirmed ? 'Resumen confirmado' : 'Resumen del pedido'}</h2>
        <p>{count} {count === 1 ? 'plato' : 'platos'} · {money(cartTotal(lines))}</p>
        <p>{groups.length} {groups.length === 1 ? 'entrega' : 'entregas'}</p>
        <Alert><AlertDescription>Importes de demostración con el beneficio del catálogo. El cobro al superar el cupo mensual todavía no está definido.</AlertDescription></Alert>
        <Button className={styles.submit} onClick={confirmed ? onOrders : onConfirm}>{confirmed ? 'Ver mis pedidos' : 'Confirmar pedido'}</Button>
      </CardContent></Card></div>
    </>}
  </section>
}
