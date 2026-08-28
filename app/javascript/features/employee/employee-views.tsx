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
  CheckCircle2,
  ChevronRight,
  Clock3,
  CreditCard,
  FileCheck2,
  Home,
  LogOut,
  MapPin,
  Minus,
  Plus,
  ReceiptText,
  ShieldCheck,
  UserRound,
  UtensilsCrossed,
} from 'lucide-react'

import type { DeliveryLocation, EmployeeOrder } from '@/domain/employee'
import type { Dish } from '@/domain/menu'
import { orderHistory, providerPayments, upcomingOrders } from '@/mocks/employee-sections'
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
        <button className={styles.backButton} type="button" onClick={onBack} aria-label="Volver">
          <ArrowLeft aria-hidden="true" />
        </button>
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
  onReview: () => void
}

/**
 * Permite personalizar una vianda antes del checkout.
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
  onReview,
}: DetailProps) {
  // En el prototipo `price` ya representa el precio unitario con beneficio.
  const total = dish.price * quantity

  return (
    <section className={styles.view}>
      <ScreenHeader
        eyebrow={dish.providerName}
        title="Detalle del plato"
        description="Personalizá tu pedido antes de continuar."
        onBack={onBack}
      />

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

          <div className={styles.surface}>
            <h3>Sobre este plato</h3>
            <p className={styles.bodyText}>{dish.details ?? dish.description}</p>
          </div>

          {dish.customizations && (
            <fieldset className={styles.surface}>
              <legend>Elegí una opción</legend>
              <div className={styles.choiceList}>
                {dish.customizations.map((option) => (
                  <button
                    key={option}
                    type="button"
                    data-selected={customization === option}
                    aria-pressed={customization === option}
                    onClick={() => onCustomizationChange(option)}
                  >
                    <span>{option}</span>
                    {customization === option && <Check aria-hidden="true" />}
                  </button>
                ))}
              </div>
            </fieldset>
          )}

          <div className={styles.surface}>
            <label className={styles.fieldLabel} htmlFor="order-notes">Aclaraciones</label>
            <textarea
              id="order-notes"
              value={notes}
              maxLength={180}
              placeholder="Ej. sin cebolla, por favor"
              onChange={(event) => onNotesChange(event.target.value)}
            />
            <span className={styles.characterCount}>{notes.length}/180</span>
          </div>
        </div>

        <aside className={styles.orderPanel}>
          <div className={styles.surface}>
            <h3>Cantidad</h3>
            <div className={styles.quantityControl}>
              <button
                type="button"
                onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
                disabled={quantity === 1}
                aria-label="Disminuir cantidad"
              >
                <Minus aria-hidden="true" />
              </button>
              <strong aria-live="polite">{quantity}</strong>
              <button
                type="button"
                onClick={() => onQuantityChange(Math.min(3, quantity + 1))}
                disabled={quantity === 3}
                aria-label="Aumentar cantidad"
              >
                <Plus aria-hidden="true" />
              </button>
            </div>
          </div>

          <fieldset className={styles.surface}>
            <legend>Entrega</legend>
            <div className={styles.deliveryChoices}>
              <button
                type="button"
                data-selected={delivery === 'office'}
                aria-pressed={delivery === 'office'}
                onClick={() => onDeliveryChange('office')}
              >
                <Home aria-hidden="true" />
                <span><strong>Oficina</strong><small>18 de Julio 1006</small></span>
              </button>
              <button
                type="button"
                data-selected={delivery === 'home'}
                aria-pressed={delivery === 'home'}
                onClick={() => onDeliveryChange('home')}
              >
                <MapPin aria-hidden="true" />
                <span><strong>Domicilio</strong><small>Dirección guardada</small></span>
              </button>
            </div>
          </fieldset>

          <div className={styles.desktopActionCard}>
            <div><span>Total con beneficio</span><strong>${total}</strong></div>
            <button type="button" onClick={onReview}>Revisar pedido</button>
          </div>
        </aside>
      </div>

      <div className={styles.mobileActionBar}>
        <div><span>Total</span><strong>${total}</strong></div>
        <button type="button" onClick={onReview}>Revisar pedido</button>
      </div>
    </section>
  )
}

type CheckoutProps = {
  dish: Dish
  quantity: number
  customization: string
  notes: string
  delivery: DeliveryLocation
  onBack: () => void
  onConfirm: () => void
}

/**
 * Paso de revisión final. Separa precio de lista, subsidio simulado y total a pagar
 * para validar cómo se comunica el beneficio al empleado.
 */
export function CheckoutView({
  dish,
  quantity,
  customization,
  notes,
  delivery,
  onBack,
  onConfirm,
}: CheckoutProps) {
  // Escenario temporal: el beneficio cubre el 50 % del precio de lista.
  const subtotal = dish.price * quantity * 2
  const benefit = dish.price * quantity
  const total = dish.price * quantity

  return (
    <section className={styles.view}>
      <ScreenHeader
        eyebrow="Último paso"
        title="Revisá tu pedido"
        description="Confirmá que los datos estén correctos."
        onBack={onBack}
      />

      <div className={styles.checkoutGrid}>
        <div className={styles.checkoutContent}>
          <article className={styles.orderSummaryCard}>
            <span className={styles.foodIcon}><UtensilsCrossed aria-hidden="true" /></span>
            <div>
              <p>{dish.providerName}</p>
              <h2>{dish.name}</h2>
              <span>{quantity} unidad{quantity > 1 ? 'es' : ''} · {customization}</span>
            </div>
            <strong>${total}</strong>
          </article>

          <div className={styles.surface}>
            <h3>Entrega</h3>
            <div className={styles.informationRow}>
              {delivery === 'office' ? <Home aria-hidden="true" /> : <MapPin aria-hidden="true" />}
              <div>
                <strong>{delivery === 'office' ? 'Oficina GoGrow' : 'Tu domicilio'}</strong>
                <span>Lunes 10 · 12:30</span>
              </div>
            </div>
          </div>

          {notes && (
            <div className={styles.surface}>
              <h3>Aclaraciones</h3>
              <p className={styles.bodyText}>{notes}</p>
            </div>
          )}
        </div>

        <aside className={styles.priceCard}>
          <h2>Resumen</h2>
          <div><span>Precio de lista</span><span>${subtotal}</span></div>
          <div className={styles.benefitLine}><span>Beneficio GoGrow</span><span>-${benefit}</span></div>
          <div className={styles.totalLine}><strong>Total a pagar</strong><strong>${total}</strong></div>
          <button type="button" onClick={onConfirm}>Confirmar pedido</button>
          <p>El importe se acumulará en tu estado de cuenta mensual.</p>
        </aside>
      </div>

      <div className={styles.mobileActionBar}>
        <div><span>Total a pagar</span><strong>${total}</strong></div>
        <button type="button" onClick={onConfirm}>Confirmar</button>
      </div>
    </section>
  )
}

type SuccessProps = {
  dish: Dish
  quantity: number
  delivery: DeliveryLocation
  onOrders: () => void
  onMenu: () => void
}

/** Confirmación puramente visual que ofrece volver al menú o consultar pedidos. */
export function OrderSuccessView({ dish, quantity, delivery, onOrders, onMenu }: SuccessProps) {
  return (
    <section className={`${styles.view} ${styles.successView}`}>
      <div className={styles.successIcon}><CheckCircle2 aria-hidden="true" /></div>
      <p>Pedido confirmado</p>
      <h1>¡Tu vianda ya está reservada!</h1>
      <span>El proveedor recibió tu pedido y te avisaremos si hay algún cambio.</span>

      <article className={styles.successCard}>
        <div><span>Plato</span><strong>{dish.name}</strong></div>
        <div><span>Proveedor</span><strong>{dish.providerName}</strong></div>
        <div><span>Cantidad</span><strong>{quantity}</strong></div>
        <div>
          <span>Entrega</span>
          <strong>{delivery === 'office' ? 'Oficina GoGrow' : 'Tu domicilio'} · Lunes 10, 12:30</strong>
        </div>
      </article>

      <div className={styles.successActions}>
        <button type="button" onClick={onOrders}>Ver mis pedidos</button>
        <button type="button" onClick={onMenu}>Volver al menú</button>
      </div>
    </section>
  )
}

/** Tarjeta reutilizada por pedidos próximos e históricos. */
function OrderCard({ order }: { order: EmployeeOrder }) {
  const labels = {
    confirmed: 'Confirmado',
    pending: 'Pendiente',
    delivered: 'Entregado',
  } as const

  return (
    <article className={styles.orderCard}>
      <div className={styles.orderCardHeader}>
        <span data-status={order.status}>{labels[order.status]}</span>
        <small>{order.id}</small>
      </div>
      <h2>{order.dishName}</h2>
      <p>{order.providerName}</p>
      <div className={styles.orderMeta}>
        <span><Clock3 aria-hidden="true" />{order.deliveryLabel}</span>
        <strong>${order.amount}</strong>
      </div>
    </article>
  )
}

/** Alterna entre dos colecciones mock sin pedir información al backend. */
export function OrdersView({ onMenu }: { onMenu: () => void }) {
  const [tab, setTab] = useState<'upcoming' | 'history'>('upcoming')
  const orders = tab === 'upcoming' ? upcomingOrders : orderHistory

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
        {orders.map((order) => <OrderCard key={order.id} order={order} />)}
      </div>

      {tab === 'upcoming' && (
        <button className={styles.secondaryCta} type="button" onClick={onMenu}>
          <UtensilsCrossed aria-hidden="true" /> Pedir otra vianda
        </button>
      )}
    </section>
  )
}

/**
 * Estado de cuenta ficticio por proveedor.
 * `sentPayments` permite demostrar el cambio de estado del comprobante durante la sesión.
 */
export function PaymentsView() {
  const [sentPayments, setSentPayments] = useState<string[]>([])
  // La deuda se deriva de los pagos no cerrados para evitar mantener un total duplicado.
  const totalDebt = providerPayments
    .filter((payment) => payment.status !== 'paid')
    .reduce((total, payment) => total + payment.amount, 0)

  /** Marca localmente un comprobante como enviado; se reinicia al recargar. */
  const sendReceipt = (paymentId: string) => {
    setSentPayments((current) => current.includes(paymentId) ? current : [...current, paymentId])
  }

  return (
    <section className={styles.view}>
      <ScreenHeader
        eyebrow="Estado de cuenta"
        title="Pagos"
        description="Revisá tu deuda y los comprobantes enviados."
      />

      <section className={styles.debtCard} aria-labelledby="total-debt-title">
        <div>
          <p id="total-debt-title">Deuda total de mayo</p>
          <strong>${totalDebt}</strong>
        </div>
        <span><ReceiptText aria-hidden="true" /></span>
      </section>

      <div className={styles.paymentGrid}>
        {providerPayments.map((payment) => {
          const receiptSent = sentPayments.includes(payment.id) || payment.status === 'pending-validation'

          return (
            <article className={styles.paymentCard} key={payment.id}>
              <div className={styles.paymentTopline}>
                <div>
                  <p>{payment.period}</p>
                  <h2>{payment.providerName}</h2>
                </div>
                <strong>${payment.amount}</strong>
              </div>
              <div className={styles.accountNumber}>
                <CreditCard aria-hidden="true" />
                <span><small>Cuenta para transferir</small><strong>{payment.accountNumber}</strong></span>
              </div>
              <div className={styles.paymentFooter}>
                <span data-sent={receiptSent}>{receiptSent ? 'Pendiente de validación' : payment.dueLabel}</span>
                <button type="button" disabled={receiptSent} onClick={() => sendReceipt(payment.id)}>
                  {receiptSent ? <><FileCheck2 aria-hidden="true" /> Enviado</> : 'Simular comprobante'}
                </button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}

/** Preferencias del empleado; sólo cerrar sesión realiza una petición real a Rails. */
export function AccountView({ email }: { email: string }) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(true)

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
