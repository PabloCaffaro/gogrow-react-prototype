/**
 * Pantallas secundarias del empleado.
 * Reciben estado y callbacks desde `EmployeeDashboard`, de modo que la capa visual
 * pueda migrarse a servicios reales sin reescribir el flujo completo.
 */
import { router } from '@inertiajs/react'
import { useState } from 'react'
import {
  ArrowLeft,
  Bell,
  Check,
  ChevronRight,
  Clock3,
  Home,
  LogOut,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  UserRound,
  UtensilsCrossed,
} from 'lucide-react'

import type { DeliveryAddress, DeliveryLocation, EmployeeOrder } from '@/domain/employee'
import type { Dish } from '@/domain/menu'
import { Button } from '@/components/ui/actions/button'
import { Badge } from '@/components/ui/data-display/badge'
import { Card } from '@/components/ui/data-display/card'
import { Input } from '@/components/ui/forms/input'
import { Label } from '@/components/ui/forms/label'
import { Textarea } from '@/components/ui/forms/textarea'
import { orderHistory, upcomingOrders } from '@/mocks/employee-sections'
import styles from './employee-views.module.css'

type ScreenHeaderProps = {
  eyebrow: string
  title: string
  description?: string
  onBack?: () => void
}

/** Encabezado común con retorno opcional para los pasos lineales del pedido. */
function ScreenHeader({ eyebrow, title, description, onBack }: ScreenHeaderProps) {
  return (
    <header className={styles.screenHeader}>
      {onBack && (
        <Button className={styles.backButton} variant="outline" size="icon" onClick={onBack} aria-label="Volver">
          <ArrowLeft aria-hidden="true" />
        </Button>
      )}
      <div>
        <p>{eyebrow}</p>
        <h1>{title}</h1>
        {description && <span>{description}</span>}
      </div>
    </header>
  )
}

type DetailProps = {
  dish: Dish
  quantity: number
  customization: string
  notes: string
  delivery: DeliveryLocation
  onBack: () => void
  onQuantityChange: (quantity: number) => void
  onCustomizationChange: (customization: string) => void
  onNotesChange: (notes: string) => void
  onDeliveryChange: (delivery: DeliveryLocation) => void
  onAddToCart: () => void
  maxQuantity: number
  addresses: DeliveryAddress[]
  onAddAddress: (name: string, address: string, saved?: boolean) => string
}

/**
 * Permite personalizar una vianda antes de agregarla al carrito.
 * No confirma ni persiste: comunica cada cambio al estado mantenido por el dashboard.
 */
export function DishDetailView({
  dish,
  quantity,
  customization,
  notes,
  delivery,
  onBack,
  onQuantityChange,
  onCustomizationChange,
  onNotesChange,
  onDeliveryChange,
  onAddToCart,
  maxQuantity,
  addresses,
  onAddAddress,
}: DetailProps) {
  // En el prototipo `price` ya representa el precio unitario con beneficio.
  const total = dish.price * quantity
  const [newAddressName, setNewAddressName] = useState('')
  const [newAddress, setNewAddress] = useState('')
  const useNewAddress = (saved: boolean) => {
    if (!newAddressName.trim() || !newAddress.trim()) return
    onDeliveryChange(onAddAddress(newAddressName.trim(), newAddress.trim(), saved))
    setNewAddressName('')
    setNewAddress('')
  }

  return (
    <section className={styles.view}>
      <ScreenHeader
        eyebrow={dish.providerName}
        title="Detalle del plato"
        description="Personalizá tu pedido antes de continuar."
        onBack={onBack}
      />

      {/* Contenido editable a la izquierda y resumen/acciones a la derecha en escritorio. */}
      <div className={styles.detailGrid}>
        <div className={styles.detailMain}>
          <div className={styles.foodHero}>
            <span><UtensilsCrossed aria-hidden="true" /></span>
            <div>
              <p>{dish.providerName}</p>
              <h2>{dish.name}</h2>
              <strong>${dish.price}</strong>
            </div>
          </div>

          <Card className={styles.surface}>
            <h3>Sobre este plato</h3>
            <p className={styles.bodyText}>{dish.details ?? dish.description}</p>
          </Card>

          {dish.customizations && (
            <fieldset className={styles.surface}>
              <legend>Elegí una opción</legend>
              <div className={styles.choiceList}>
                {dish.customizations.map((option) => (
                  <Button variant="outline"
                    key={option}
                    type="button"
                    data-selected={customization === option}
                    aria-pressed={customization === option}
                    onClick={() => onCustomizationChange(option)}
                  >
                    <span>{option}</span>
                    {customization === option && <Check aria-hidden="true" />}
                  </Button>
                ))}
              </div>
            </fieldset>
          )}

          <Card className={styles.surface}>
            <Label className={styles.fieldLabel} htmlFor="order-notes">Aclaraciones</Label>
            <Textarea
              id="order-notes"
              value={notes}
              maxLength={180}
              placeholder="Ej. sin cebolla, por favor"
              onChange={(event) => onNotesChange(event.target.value)}
            />
            <span className={styles.characterCount}>{notes.length}/180</span>
          </Card>
        </div>

        <aside className={styles.orderPanel}>
          <div className={styles.surface}>
            <h3>Cantidad</h3><p className={styles.bodyText}>Máximo 20 por plato entre todas sus variantes. Podés agregar {maxQuantity} más.</p>
            <div className={styles.quantityControl}>
              <Button variant="outline"
                type="button"
                onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                disabled={quantity === 1}
                aria-label="Disminuir cantidad"
              >
                <Minus aria-hidden="true" />
              </Button>
              <Input type="number" min={1} max={maxQuantity} value={quantity} aria-label="Cantidad del plato" onChange={event => { const value = Number(event.target.value); if (Number.isInteger(value) && value >= 1) onQuantityChange(Math.min(maxQuantity, value)) }} />
              <Button variant="outline"
                type="button"
                onClick={() => onQuantityChange(Math.min(maxQuantity, quantity + 1))}
                disabled={quantity >= maxQuantity}
                aria-label="Aumentar cantidad"
              >
                <Plus aria-hidden="true" />
              </Button>
            </div>
          </div>

          <fieldset className={styles.surface}>
            <legend>Entrega</legend>
            <div className={styles.deliveryChoices}>
              <Button variant="outline"
                type="button"
                data-selected={delivery === 'office'}
                aria-pressed={delivery === 'office'}
                onClick={() => onDeliveryChange('office')}
              >
                <Home aria-hidden="true" />
                <span><strong>Oficina</strong><small>18 de Julio 1006</small></span>
              </Button>
              {addresses.map(address => <Button variant="outline" key={address.id} type="button" data-selected={delivery === address.id} aria-pressed={delivery === address.id} onClick={() => onDeliveryChange(address.id)}><MapPin aria-hidden="true" /><span><strong>{address.name}</strong><small>{address.address}</small></span></Button>)}
            </div>
            <div className={styles.newAddress}>
              <strong>Otro domicilio</strong>
              <Input value={newAddressName} onChange={event => setNewAddressName(event.target.value)} placeholder="Nombre, ej. Trabajo" aria-label="Nombre del nuevo domicilio" />
              <Input value={newAddress} onChange={event => setNewAddress(event.target.value)} placeholder="Dirección completa" aria-label="Dirección del nuevo domicilio" />
              <div><Button type="button" variant="outline" size="sm" onClick={() => useNewAddress(false)}>Usar sólo hoy</Button><Button type="button" size="sm" onClick={() => useNewAddress(true)}>Guardar domicilio</Button></div>
            </div>
          </fieldset>

          <div className={styles.desktopActionCard}>
            <div><span>Total con beneficio</span><strong>${total}</strong></div>
            <Button disabled={maxQuantity <= 0} onClick={onAddToCart}>Agregar al carrito</Button>
          </div>
        </aside>
      </div>

      {/* En teléfono esta barra sustituye la acción lateral del escritorio. */}
      <div className={styles.mobileActionBar}>
        <div><span>Total</span><strong>${total}</strong></div>
        <Button disabled={maxQuantity <= 0} onClick={onAddToCart}>Agregar al carrito</Button>
      </div>
    </section>
  )
}

/** Tarjeta reutilizada por pedidos próximos e históricos. */
function OrderCard({ order, onCancel }: { order: EmployeeOrder; onCancel?: (id: string) => void }) {
  const labels = {
    confirmed: 'Confirmado',
    pending: 'Pendiente',
    delivered: 'Entregado',
    cancelled: 'Cancelado',
  } as const

  return (
    <Card className={styles.orderCard}>
      <div className={styles.orderCardHeader}>
        <Badge variant={order.status === 'confirmed' ? 'secondary' : 'outline'} data-status={order.status}>{labels[order.status]}</Badge>
        <small>{order.id}</small>
      </div>
      <h2>{order.dishName}</h2>
      <p>{order.providerName} · {order.quantity} {order.quantity === 1 ? 'plato' : 'platos'}</p>
      <div className={styles.orderMeta}>
        <span><Clock3 aria-hidden="true" />{order.deliveryLabel}</span>
        <strong>${order.amount}</strong>
      </div>
      {order.status === 'pending' && onCancel && <Button variant="outline" size="sm" onClick={() => onCancel(order.id)}>Cancelar plato</Button>}
    </Card>
  )
}

/** Alterna entre dos colecciones mock sin pedir información al backend. */
export function OrdersView({ onMenu, additionalOrders = [] }: { onMenu: () => void; additionalOrders?: EmployeeOrder[] }) {
  const [tab, setTab] = useState<'upcoming' | 'history'>('upcoming')
  const [cancelled, setCancelled] = useState<string[]>([])
  const orders = (tab === 'upcoming' ? [...additionalOrders, ...upcomingOrders] : orderHistory).map(order => cancelled.includes(order.id) ? { ...order, status: 'cancelled' as const } : order)

  return (
    <section className={styles.view}>
      <ScreenHeader
        eyebrow="Tus compras"
        title="Mis pedidos"
        description="Consultá próximas entregas y pedidos anteriores."
      />

      <div className={styles.tabList} aria-label="Tipo de pedidos">
        <button type="button" data-selected={tab === 'upcoming'} aria-pressed={tab === 'upcoming'} onClick={() => setTab('upcoming')}>
          Próximos
        </button>
        <button type="button" data-selected={tab === 'history'} aria-pressed={tab === 'history'} onClick={() => setTab('history')}>
          Historial
        </button>
      </div>

      <div className={styles.ordersGrid}>
        {orders.map((order) => <OrderCard key={order.id} order={order} onCancel={id => setCancelled(current => [...current, id])} />)}
      </div>

      {tab === 'upcoming' && (
        <Button className={styles.secondaryCta} variant="outline" onClick={onMenu}>
          <UtensilsCrossed aria-hidden="true" /> Pedir otra vianda
        </Button>
      )}
    </section>
  )
}

// El pago mensual vive separado para mantener este archivo centrado en pedidos y cuenta.
export { MonthlyPayments as PaymentsView } from '@/features/payments/monthly-payments'

/** Preferencias del empleado; sólo cerrar sesión realiza una petición real a Rails. */
export function AccountView({ email, addresses, onAddAddress }: { email: string; addresses: DeliveryAddress[]; onAddAddress: (name: string, address: string, saved?: boolean) => string }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)
  const [addressName, setAddressName] = useState('')
  const [address, setAddress] = useState('')

  // La sesión sí pertenece al backend existente, por eso utiliza el endpoint real.
  const logout = () => router.delete('/logout')

  return (
    <section className={styles.view}>
      <ScreenHeader
        eyebrow="Preferencias"
        title="Mi cuenta"
        description="Administrá tus datos y el beneficio asignado."
      />

      <div className={styles.accountGrid}>
        <div>
          <section className={styles.profileCard}>
            <span className={styles.largeAvatar}>S</span>
            <div><h2>Sofía</h2><p>{email}</p><span>Empleado</span></div>
          </section>

          <section className={styles.surface}>
            <h3>Notificaciones</h3>
            <div className={styles.settingRow}>
              <span className={styles.settingIcon}><Bell aria-hidden="true" /></span>
              <div><strong>Recordatorios por WhatsApp</strong><small>Menús, pedidos y pagos pendientes</small></div>
              <button
                className={styles.switch}
                type="button"
                role="switch"
                aria-checked={notificationsEnabled}
                data-enabled={notificationsEnabled}
                onClick={() => setNotificationsEnabled((value) => !value)}
              >
                <span />
              </button>
            </div>
          </section>
          <section className={styles.surface}>
            <h3>Domicilios guardados</h3>
            {addresses.map(item => <div className={styles.savedAddress} key={item.id}><MapPin aria-hidden="true" /><span><strong>{item.name}</strong><small>{item.address}</small></span></div>)}
            <div className={styles.addressForm}>
              <Label htmlFor="address-name">Nombre<Input id="address-name" value={addressName} onChange={event => setAddressName(event.target.value)} placeholder="Ej. Casa" /></Label>
              <Label htmlFor="address-value">Dirección<Input id="address-value" value={address} onChange={event => setAddress(event.target.value)} placeholder="Calle, número y apartamento" /></Label>
              <Button disabled={!addressName.trim() || !address.trim()} onClick={() => { onAddAddress(addressName.trim(), address.trim()); setAddressName(''); setAddress('') }}>Guardar domicilio</Button>
            </div>
          </section>
        </div>

        <aside>
          <section className={styles.benefitAccountCard}>
            <span><ShieldCheck aria-hidden="true" /></span>
            <p>Beneficio asignado</p>
            <strong>50% de descuento</strong>
            <small>Hasta 20 viandas subsidiadas por mes</small>
          </section>

          <section className={styles.surface}>
            <button className={styles.accountLink} type="button">
              <UserRound aria-hidden="true" /><span>Datos personales</span><ChevronRight aria-hidden="true" />
            </button>
            <button className={styles.accountLink} type="button" onClick={logout}>
              <LogOut aria-hidden="true" /><span>Cerrar sesión</span><ChevronRight aria-hidden="true" />
            </button>
          </section>
        </aside>
      </div>
    </section>
  )
}
