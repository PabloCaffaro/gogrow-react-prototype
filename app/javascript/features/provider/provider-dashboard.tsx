/**
 * Orquestador del panel del proveedor.
 * Todas las operaciones de menús, pedidos y cobros son simulaciones en memoria;
 * únicamente cerrar sesión realiza una petición real a Rails mediante Inertia.
 */
import { ReceiptList } from '@/features/payments/monthly-payments'
import { router } from '@inertiajs/react'
import { useMemo, useState } from 'react'
import { usePrototypeNavigation } from '@/lib/use-prototype-navigation'
import { BarChart3, Bell, CalendarDays, Check, ChevronRight, CircleDollarSign, Clock3, Copy, Eye, Home, LogOut, MapPin, PackageCheck, Plus, ReceiptText, Settings2, Store, TicketPercent, UserRound, UtensilsCrossed, X } from 'lucide-react'
import { Button } from '@/components/ui/actions/button'
import { Badge } from '@/components/ui/data-display/badge'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/data-display/card'
import { Input } from '@/components/ui/forms/input'
import { Label } from '@/components/ui/forms/label'
import { Select } from '@/components/ui/forms/select'
import { Textarea } from '@/components/ui/forms/textarea'
import type { CompanySettlementStatus, PaymentStatus, ProviderDish, ProviderOrderStatus, ProviderSection } from '@/domain/provider'
import { initialCompanySettlements, initialDishes, initialOrders, initialPayments, providerDays, providerProfile, reusableDishes } from '@/mocks/provider'
import interactionStyles from './provider-interactions.module.css'
import styles from './provider-dashboard.module.css'

type Props = { email: string }
type Icon = typeof Home

/** Metadatos visuales usados por las navegaciones de escritorio y móvil. */
const nav: Record<ProviderSection, { label: string; icon: Icon }> = {
  home: { label: 'Inicio', icon: Home }, menu: { label: 'Menú', icon: UtensilsCrossed }, orders: { label: 'Pedidos', icon: PackageCheck },
  payments: { label: 'Cobros', icon: CircleDollarSign }, insights: { label: 'Métricas', icon: BarChart3 }, account: { label: 'Cuenta', icon: UserRound },
}
const statusLabel: Record<ProviderOrderStatus, string> = { pending: 'Pendiente', confirmed: 'Confirmado', delivered: 'Entregado', cancelled: 'Cancelado' }

/** Encabezado presentacional compartido por todas las secciones del proveedor. */
function Header({ eyebrow, title, description, children }: { eyebrow: string; title: string; description?: string; children?: React.ReactNode }) {
  return <header className={styles.header}><div><p>{eyebrow}</p><h1>{title}</h1>{description && <span>{description}</span>}</div>{children}</header>
}

/** Tarjeta visual de métrica; recibe valores ya calculados y no modifica estado. */
function Stat({ label, value, note }: { label: string; value: string; note: string }) { return <Card className={styles.stat} size="sm"><CardHeader><CardDescription>{label}</CardDescription></CardHeader><CardContent><strong>{value}</strong><small>{note}</small></CardContent></Card> }

/** Estado vacío reutilizable cuando un filtro no encuentra cobros para mostrar. */
function EmptyPayments({ message }: { message: string }) { return <Card className={styles.emptyPayments} size="sm"><CardContent>{message}</CardContent></Card> }

export function ProviderDashboard({ email }: Props) {
  // Navegación principal y fecha del menú que el proveedor está editando.
  const navigation = usePrototypeNavigation<ProviderSection>('home')
  const section = navigation.route.section
  const [day, setDay] = useState(providerDays[0].id)

  // Copias editables de los mocks; todos estos cambios se pierden al recargar.
  const [published, setPublished] = useState<string[]>([])
  const [dishes, setDishes] = useState(initialDishes)
  const [orders, setOrders] = useState(initialOrders)
  const [payments, setPayments] = useState(initialPayments)
  const [companySettlements, setCompanySettlements] = useState(initialCompanySettlements)

  // Estado de controles visuales: filtros, selección, paneles y preferencias.
  const [orderFilter, setOrderFilter] = useState<'all' | ProviderOrderStatus>('all')
  const [paymentFilter, setPaymentFilter] = useState<'all' | PaymentStatus>('all')
  const [paymentMonth, setPaymentMonth] = useState('all')
  const [paymentAudience, setPaymentAudience] = useState<'employees' | 'company'>('employees')
  const [companyFilter, setCompanyFilter] = useState<'all' | CompanySettlementStatus>('all')
  const [editingDishId, setEditingDishId] = useState<number | null>(null)
  const [newDishOpen, setNewDishOpen] = useState(false)
  const selectedOrder = navigation.route.detail
  const setSelectedOrder = (id: string | null) => navigation.navigate({ section: 'orders', detail: id ?? undefined })
  const [reuseOpen, setReuseOpen] = useState(false)
  const [notifications, setNotifications] = useState(true)
  const [closingHours, setClosingHours] = useState(1)
  const [toast, setToast] = useState('')

  // Valores derivados: se recalculan desde el estado y no se almacenan por separado.
  const currentDay = providerDays.find(item => item.id === day) ?? providerDays[0]
  const dayDishes = useMemo(() => dishes.filter(dish => dish.dayId === day), [day, dishes])
  const visibleOrders = useMemo(() => orders.filter(order => orderFilter === 'all' || order.status === orderFilter), [orders, orderFilter])
  const visiblePayments = useMemo(() => payments.filter(payment => (paymentFilter === 'all' || payment.status === paymentFilter) && (paymentMonth === 'all' || payment.period === paymentMonth)), [payments, paymentFilter, paymentMonth])
  const visibleCompanySettlements = useMemo(() => companySettlements.filter(settlement => (companyFilter === 'all' || settlement.status === companyFilter) && (paymentMonth === 'all' || settlement.period === paymentMonth)), [companyFilter, companySettlements, paymentMonth])
  const paymentPeriods = useMemo(() => [...new Set([...payments.map(payment => payment.period), ...companySettlements.map(settlement => settlement.period)])], [companySettlements, payments])
  const detail = orders.find(order => order.id === selectedOrder)
  /** Cambia de sección, cierra el detalle actual y vuelve al inicio del documento. */
  const navigate = (next: ProviderSection) => navigation.navigate({ section: next })

  /** Informa el resultado de una acción mock mediante un mensaje temporal. */
  const announce = (message: string) => { setToast(message); window.setTimeout(() => setToast(''), 2500) }

  /** Modifica localmente el estado operativo de un pedido seleccionado. */
  const updateOrder = (id: string, status: ProviderOrderStatus) => { setOrders(current => current.map(order => order.id === id ? { ...order, status, cancellationNotice: false } : order)); announce(status === 'confirmed' ? 'Pedido confirmado' : status === 'delivered' ? 'Pedido entregado' : 'Pedido cancelado') }

  // Inicio: alertas operativas, métricas del día y resúmenes de producción/cobros.
  const home = <>
    <Header eyebrow="Lunes, 26 de mayo" title={`Hola, ${providerProfile.owner.split(' ')[0]} 👋`}><Button variant="outline" size="icon" onClick={() => navigate('account')} aria-label="Configuración"><Settings2 /></Button></Header>
    <section className={styles.stats}><Stat label="Pedidos de hoy" value="7" note="2 por confirmar" /><Stat label="Platos a preparar" value="7" note="Wok es el más pedido" /><Stat label="Cierre de pedidos" value="11:30" note={`${closingHours} h antes`} /><Stat label="Cobros pendientes" value="$1.540" note="2 comprobantes" /></section>
    <div className={styles.columns}><section className={styles.surface}><Title eyebrow="Producción" title="Pedidos por plato" action="Ver todos" onAction={() => navigate('orders')} />{[['Wok de verduras + arroz', 3], ['Sorrentinos artesanales', 2], ['Pollo al curry', 2]].map(([name, count]) => <div className={styles.row} key={name}><span>{name}</span><strong>{count}</strong></div>)}</section><section className={styles.surface}><Title eyebrow="Cuenta del día" title="Resumen de cobros" /><div className={styles.money}><span>Total vendido</span><strong>$2.240</strong></div><div className={styles.row}><span>Pagos de empleados</span><strong>$1.120</strong></div><div className={styles.row}><span>Subsidio GoGrow</span><strong>$1.120</strong></div><button className={styles.primary} onClick={() => navigate('payments')}>Revisar cobros</button></section></div>
  </>

  // Menú: permite elegir día, publicar, reutilizar platos y simular disponibilidad.
  const menu = newDishOpen ? <NewDishForm initialDay={day} onCancel={() => setNewDishOpen(false)} onSave={dish => { setDishes(current => [...current, { ...dish, id: Date.now() }]); setDay(dish.dayId); setNewDishOpen(false); announce(`${dish.name} agregado al menú del ${providerDays.find(item => item.id === dish.dayId)?.day ?? 'día seleccionado'}`) }} /> : <>
    <Header eyebrow="Organización de menús" title="Menú" description="Publicá tu oferta para hoy o prepará los próximos días."><Button size="lg" onClick={() => setNewDishOpen(true)}><Plus /> Nuevo plato</Button></Header>
    <div className={styles.days}>{providerDays.map(item => <Button variant={day === item.id ? 'default' : 'outline'} key={item.id} data-selected={day === item.id} onClick={() => setDay(item.id)}><span>{item.day}</span><strong>{item.date}</strong>{published.includes(item.id) && <small>Publicado</small>}</Button>)}</div>
    <section className={styles.toolbar}><div><CalendarDays /><span><strong>{currentDay.full}</strong><small>{published.includes(day) ? 'Menú publicado' : 'Borrador · todavía no visible'}</small></span></div><div><Button variant="outline" onClick={() => setReuseOpen(value => !value)}><Copy /> Reutilizar</Button><Button onClick={() => announce('Importación de Excel disponible en una próxima etapa')}><Input className={styles.hiddenInput} type="file" accept=".xlsx,.xls,.csv" aria-label="Importar menú desde Excel" /><ReceiptText /> Importar Excel</Button><Button onClick={() => { setPublished(current => current.includes(day) ? current : [...current, day]); announce(`Menú del ${currentDay.day} publicado`) }}><Check /> Publicar menú</Button></div></section>
    {reuseOpen && <section className={styles.reuse}><Title eyebrow="Tu biblioteca" title="Reutilizar un plato anterior" action="Cerrar" onAction={() => setReuseOpen(false)} />{reusableDishes.map(dish => <button key={dish.id} onClick={() => { setDishes(current => current.some(item => item.name === dish.name && item.dayId === day) ? current : [...current, { ...dish, id: Date.now(), dayId: day }]); setReuseOpen(false); announce(`${dish.name} agregado`) }}><span><strong>{dish.name}</strong><small>{dish.description}</small></span><Plus /></button>)}</section>}
    <div className={styles.dishes}>{dayDishes.map(dish => <Card className={styles.dish} size="sm" key={dish.id} data-disabled={!dish.available}><span className={styles.food}><UtensilsCrossed /></span><div>{editingDishId === dish.id ? <DishEditor dish={dish} onSave={changes => { setDishes(current => current.map(item => item.id === dish.id ? { ...item, ...changes } : item)); setEditingDishId(null); announce(`${dish.name} actualizado antes de publicar`) }} onClose={() => setEditingDishId(null)} /> : <><Badge variant={dish.available ? 'secondary' : 'outline'}>{dish.available ? 'Disponible' : 'No disponible'}</Badge><h2>{dish.name}</h2><p>{dish.description}</p><strong>${dish.price}</strong><Button variant="ghost" size="sm" disabled={published.includes(day)} onClick={() => setEditingDishId(dish.id)}>Editar</Button></>}</div><button className={styles.toggleText} data-enabled={dish.available} onClick={() => setDishes(current => current.map(item => item.id === dish.id ? { ...item, available: !item.available } : item))} role="switch" aria-checked={dish.available}><i />{dish.available ? 'Disponible' : 'Agotado'}</button></Card>)}</div>
    <section className={styles.rule}><Clock3 /><div><h2>Regla para recibir pedidos</h2><p>Los empleados deben ordenar al menos <strong>{closingHours} hora{closingHours > 1 ? 's' : ''}</strong> antes.</p></div><Select value={closingHours} onChange={event => setClosingHours(Number(event.target.value))} aria-label="Anticipación mínima"><option value={1}>1 hora antes</option><option value={2}>2 horas antes</option><option value={3}>3 horas antes</option></Select></section>
  </>

  // Pedidos: filtra la colección y muestra un detalle con acciones según su estado.
  const ordersView = <><Header eyebrow="Operación diaria" title="Pedidos" description="Confirmá pedidos y organizá la preparación del día." /><Filters values={['all', 'pending', 'confirmed', 'delivered']} selected={orderFilter} labels={{ all: 'Todos', pending: 'Pendientes', confirmed: 'Confirmados', delivered: 'Entregados' }} onChange={value => setOrderFilter(value as typeof orderFilter)} /><div className={styles.orderLayout}><div className={styles.orderList}>{visibleOrders.map(order => <button className={styles.order} data-selected={selectedOrder === order.id} key={order.id} onClick={() => setSelectedOrder(order.id)}><div><span className={styles.avatar}>{order.employeeInitials}</span><span><strong>{order.employee}</strong><small>{order.id} · {order.deliveryTime}</small></span><Badge variant="outline" data-status={order.status}>{statusLabel[order.status]}</Badge></div><h2>{order.dish}</h2><p>{order.specifications}</p><footer><span><MapPin />{order.address}</span><strong>${order.amount}</strong></footer></button>)}</div>{detail ? <Card className={styles.detail}><Button className={styles.close} variant="ghost" size="sm" onClick={() => setSelectedOrder(null)}><X /> Cerrar</Button><p>Detalle del pedido</p><h2>{detail.id}</h2><div className={styles.person}><span className={styles.avatar}>{detail.employeeInitials}</span><span><small>Empleado</small><strong>{detail.employee}</strong></span></div><Info label="Plato" main={detail.dish} detail={detail.specifications} /><Info label="Entrega" main={detail.deliveryTime} detail={detail.address} />{detail.status === 'pending' && <div className={styles.actions}><Button variant="destructive" onClick={() => updateOrder(detail.id, 'cancelled')}>Cancelar</Button><Button onClick={() => updateOrder(detail.id, 'confirmed')}>Confirmar</Button></div>}{detail.status === 'confirmed' && <Button onClick={() => updateOrder(detail.id, 'delivered')}>Marcar como entregado</Button>}</Card> : <aside className={styles.empty}><Eye /><p>Seleccioná un pedido para ver toda la información.</p></aside>}</div></>

  // Cobros separa quién paga: empleados informan comprobantes y GoGrow liquida su aporte mensual.
  const paymentView = <>
    <Header eyebrow="Organización de pagos" title="Cobros" description="Revisá por separado los pagos de empleados y las liquidaciones de GoGrow." />
    <section className={styles.paymentSummary}><Stat label="Por confirmar" value="$1.540" note="2 comprobantes" /><Stat label="Confirmados en mayo" value="$4.820" note="8 pagos" /><Stat label="Subsidio GoGrow" value="$6.360" note="Liquidación: 5 jun" /></section>
    <div className={styles.paymentTabs} role="tablist" aria-label="Origen del cobro">
      <Button size="sm" variant={paymentAudience === 'employees' ? 'default' : 'outline'} role="tab" aria-selected={paymentAudience === 'employees'} onClick={() => setPaymentAudience('employees')}>Cobros a empleados</Button>
      <Button size="sm" variant={paymentAudience === 'company' ? 'default' : 'outline'} role="tab" aria-selected={paymentAudience === 'company'} onClick={() => setPaymentAudience('company')}>Cobro a GoGrow</Button>
    </div>
    <section className={styles.monthFilter}><CalendarDays /><div><span>Período a consultar</span><strong>{paymentMonth === 'all' ? 'Todos los meses' : paymentMonth}</strong></div><Select value={paymentMonth} onChange={event => setPaymentMonth(event.target.value)} aria-label="Filtrar cobros por mes"><option value="all">Todos los meses</option>{paymentPeriods.map(month => <option key={month}>{month}</option>)}</Select></section>
    {paymentAudience === 'employees' ? <section aria-label="Cobros a empleados">
      <Filters values={['all', 'due', 'pending', 'confirmed']} selected={paymentFilter} labels={{ all: 'Todos', due: 'Pendientes de pago', pending: 'Por confirmar', confirmed: 'Confirmados' }} onChange={value => setPaymentFilter(value as typeof paymentFilter)} />
      <div className={styles.paymentList}>{visiblePayments.length ? visiblePayments.map(payment => <Card className={styles.payment} size="sm" key={payment.id}><span className={styles.receipt}><ReceiptText /></span><div><small>{payment.period} · {payment.date}</small><h2>{payment.employee}</h2>{payment.status !== 'due' && <Button variant="ghost" size="sm" onClick={() => announce(`Vista previa de ${payment.receipt}`)}><Eye /> Ver comprobante</Button>}</div><strong>${payment.amount}</strong><Badge variant="outline" data-status={payment.status}>{payment.status === 'due' ? 'Pendiente de pago' : payment.status === 'pending' ? 'Por confirmar' : 'Confirmado'}</Badge>{payment.status === 'pending' && <Button onClick={() => { setPayments(current => current.map(item => item.id === payment.id ? { ...item, status: 'confirmed' } : item)); announce('Pago confirmado') }}><Check /> Confirmar pago</Button>}</Card>) : <EmptyPayments message="No hay cobros de empleados con estos filtros." />}</div>
      <section className={styles.groupedReceipts}><div><p>Comprobantes de varios meses</p><h2>Pagos agrupados de empleados</h2><span>Un mismo comprobante puede cubrir más de un mes del mismo proveedor.</span></div><ReceiptList provider={providerProfile.name} canReview period={paymentMonth} /></section>
    </section> : <section aria-label="Cobro a GoGrow">
      <Filters values={['all', 'pending', 'review', 'confirmed']} selected={companyFilter} labels={{ all: 'Todas', pending: 'A liquidar', review: 'En revisión', confirmed: 'Confirmadas' }} onChange={value => setCompanyFilter(value as typeof companyFilter)} />
      <div className={styles.paymentList}>{visibleCompanySettlements.length ? visibleCompanySettlements.map(settlement => <Card className={styles.payment} size="sm" key={settlement.id}><span className={styles.receipt}><CircleDollarSign /></span><div><small>{settlement.period} · vence {settlement.dueDate}</small><h2>Aporte GoGrow</h2><p>{settlement.meals} viandas con aporte corporativo</p></div><strong>${settlement.amount}</strong><Badge variant="outline" data-status={settlement.status}>{settlement.status === 'pending' ? 'A liquidar' : settlement.status === 'review' ? 'En revisión' : 'Confirmada'}</Badge>{settlement.status === 'review' && <Button onClick={() => { setCompanySettlements(current => current.map(item => item.id === settlement.id ? { ...item, status: 'confirmed' } : item)); announce('Liquidación de GoGrow confirmada') }}><Check /> Confirmar cobro</Button>}</Card>) : <EmptyPayments message="No hay liquidaciones de GoGrow con estos filtros." />}</div>
    </section>}
  </>

  // Métricas y cuenta son vistas informativas; sólo notificaciones y logout tienen interacción.
  const insights = <><Header eyebrow="Últimos 30 días" title="Métricas" description="Una vista rápida del rendimiento de tu propuesta." /><section className={styles.stats}><Stat label="Pedidos" value="84" note="+12% vs. abril" /><Stat label="Platos vendidos" value="91" note="4,3 por día" /><Stat label="Facturación" value="$28.420" note="Incluye subsidios" /><Stat label="Ticket promedio" value="$338" note="+4% vs. abril" /></section><div className={styles.columns}><section className={styles.surface}><Title eyebrow="Preferencias" title="Platos más pedidos" />{[['Wok de verduras', '32 pedidos'], ['Sorrentinos', '25 pedidos'], ['Pollo al curry', '18 pedidos']].map(([name, count], index) => <div className={styles.rank} key={name}><span>{index + 1}</span><strong>{name}</strong><em>{count}</em></div>)}</section><section className={styles.surface}><Title eyebrow="Tendencia" title="Pedidos por semana" /><div className={styles.chart}>{[42, 65, 54, 86].map((height, index) => <div key={index}><span style={{ height: `${height}%` }} /><small>S{index + 1}</small></div>)}</div></section></div></>

  const account = <><Header eyebrow="Preferencias" title="Mi cuenta" description="Administrá tus datos y notificaciones." /><div className={styles.account}><div><section className={styles.profile}><span className={styles.bigAvatar}>{providerProfile.initials}</span><div><h2>{providerProfile.name}</h2><p>{providerProfile.owner}</p><small>{email}</small></div></section><section className={styles.surface}><div className={styles.setting}><Bell /><span><strong>Notificaciones por WhatsApp</strong><small>Menús, pedidos y cancelaciones.</small></span><button className={styles.switch} role="switch" aria-checked={notifications} data-enabled={notifications} onClick={() => setNotifications(value => !value)}><i /></button></div></section></div><aside><section className={styles.coupon}><TicketPercent /><span><small>Cupones disponibles</small><strong>{providerProfile.coupons}</strong><p>Aplicables a próximas comisiones.</p></span></section><section className={styles.surface}><button className={styles.accountLink}><UserRound /> Datos personales <ChevronRight /></button><button className={styles.accountLink} onClick={() => router.delete('/logout')}><LogOut /> Cerrar sesión <ChevronRight /></button></section></aside></div></>

  // Mapa que relaciona cada opción de navegación con su vista React.
  const views: Record<ProviderSection, React.ReactNode> = { home, menu, orders: ordersView, payments: paymentView, insights, account }
  return <div className={`${styles.page} ${interactionStyles.scope}`}><aside className={styles.sidebar}><button type="button" className={`${styles.brand} ${interactionStyles.brandButton}`} onClick={() => navigate('home')} aria-label="Ir al inicio principal del proveedor"><span><Store /></span><strong>GoGrow</strong><small>Proveedor</small></button><nav>{(Object.entries(nav) as Array<[ProviderSection, { label: string; icon: Icon }]>).map(([key, item]) => <button key={key} data-active={section === key} onClick={() => navigate(key)}><item.icon /><span>{item.label}</span></button>)}</nav><div className={styles.sidebarUser}><span className={styles.avatar}>{providerProfile.initials}</span><div><strong>{providerProfile.name}</strong><small>{email}</small></div></div></aside><main className={styles.workspace}>{views[section]}</main><nav className={`${styles.mobileNav} ${interactionStyles.sixColumnNav}`}>{(['home', 'menu', 'orders', 'payments', 'insights', 'account'] as ProviderSection[]).map(key => { const item = nav[key]; return <button key={key} data-active={section === key} onClick={() => navigate(key)}><item.icon /><span>{item.label}</span></button> })}</nav>{toast && <div className={styles.toast} role="status"><Check />{toast}</div>}</div>
}

/** Encabezado visual pequeño para las tarjetas internas; la acción es opcional. */
function Title({ eyebrow, title, action, onAction }: { eyebrow: string; title: string; action?: string; onAction?: () => void }) { return <div className={styles.title}><div><p>{eyebrow}</p><h2>{title}</h2></div>{action && <Button variant="ghost" size="sm" onClick={onAction}>{action}</Button>}</div> }

/** Control visual reutilizable que delega el cambio de filtro al componente padre. */
function Filters({ values, selected, labels, onChange }: { values: string[]; selected: string; labels: Record<string, string>; onChange: (value: string) => void }) { return <div className={styles.filters}>{values.map(value => <Button size="sm" variant={selected === value ? 'default' : 'outline'} key={value} data-selected={selected === value} onClick={() => onChange(value)}>{labels[value]}</Button>)}</div> }

/** Fila visual de información usada dentro del detalle de un pedido. */
function Info({ label, main, detail }: { label: string; main: string; detail: string }) { return <div className={styles.info}><small>{label}</small><strong>{main}</strong><span>{detail}</span></div> }

/** Editor local que mantiene el plato como borrador hasta publicar el menú. */
function DishEditor({ dish, onSave, onClose }: { dish: { name: string; description: string; price: number }; onSave: (changes: { name: string; description: string; price: number }) => void; onClose: () => void }) {
  const [name, setName] = useState(dish.name)
  const [description, setDescription] = useState(dish.description)
  const [price, setPrice] = useState(String(dish.price))
  return <div className={styles.dishEditor}><Input value={name} onChange={event => setName(event.target.value)} aria-label="Nombre del plato" /><Input value={description} onChange={event => setDescription(event.target.value)} aria-label="Descripción del plato" /><Input type="number" min={0} value={price} onChange={event => setPrice(event.target.value)} aria-label="Precio del plato" /><div><Button size="sm" variant="outline" onClick={onClose}>Cancelar</Button><Button size="sm" disabled={!name.trim() || !description.trim() || Number(price) < 0} onClick={() => onSave({ name: name.trim(), description: description.trim(), price: Number(price) })}>Guardar cambios</Button></div></div>
}

/** Pantalla de alta local: al guardar, el plato queda asociado al día elegido. */
function NewDishForm({ initialDay, onCancel, onSave }: { initialDay: string; onCancel: () => void; onSave: (dish: Omit<ProviderDish, 'id'>) => void }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [price, setPrice] = useState('')
  const [dayId, setDayId] = useState(initialDay)
  const [available, setAvailable] = useState(true)
  const validPrice = Number(price) > 0

  return <section className={styles.newDishPage}>
    <Header eyebrow="Menú del proveedor" title="Nuevo plato" description="Completá los datos y elegí en qué día querés publicarlo."><Button variant="outline" onClick={onCancel}>Cancelar</Button></Header>
    <Card className={styles.newDishCard}><CardHeader><h2>Información del plato</h2><p>Este alta sólo actualiza el menú en memoria del prototipo.</p></CardHeader><CardContent>
      <div className={styles.formField}><Label htmlFor="new-dish-name">Nombre del plato</Label><Input id="new-dish-name" value={name} onChange={event => setName(event.target.value)} placeholder="Ej.: Ensalada tibia de quinoa" autoFocus /></div>
      <div className={styles.formField}><Label htmlFor="new-dish-description">Descripción</Label><Textarea id="new-dish-description" value={description} onChange={event => setDescription(event.target.value)} placeholder="Ingredientes, guarnición y detalles importantes." /></div>
      <div className={styles.formGrid}><div className={styles.formField}><Label htmlFor="new-dish-price">Precio</Label><Input id="new-dish-price" type="number" min="1" value={price} onChange={event => setPrice(event.target.value)} placeholder="0" /></div><div className={styles.formField}><Label htmlFor="new-dish-day">Día del menú</Label><Select id="new-dish-day" value={dayId} onChange={event => setDayId(event.target.value)}>{providerDays.map(item => <option key={item.id} value={item.id}>{item.full}</option>)}</Select></div></div>
      <button className={styles.availabilityChoice} type="button" data-enabled={available} onClick={() => setAvailable(value => !value)} role="switch" aria-checked={available}><i />{available ? 'Disponible para pedir' : 'Crear como agotado'}</button>
      <div className={styles.newDishActions}><Button variant="outline" onClick={onCancel}>Volver al menú</Button><Button disabled={!name.trim() || !description.trim() || !validPrice} onClick={() => onSave({ name: name.trim(), description: description.trim(), price: Number(price), available, dayId })}><Check /> Agregar al menú</Button></div>
    </CardContent></Card>
  </section>
}
