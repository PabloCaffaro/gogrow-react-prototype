/**
 * Orquestador principal de la experiencia del empleado.
 * Mantiene navegación y pedido en memoria para demostrar el flujo completo sin
 * endpoints de menús, pedidos o pagos.
 */
import { useMemo, useState } from 'react'
import { usePrototypeNavigation } from '@/lib/use-prototype-navigation'
import {
  ClipboardList,
  DollarSign,
  Plus,
  Settings2,
  UserRound,
  UtensilsCrossed,
} from 'lucide-react'

import type { DeliveryAddress, DeliveryLocation, EmployeeView, PrimaryEmployeeSection } from '@/domain/employee'
import type { ProviderId } from '@/domain/menu'
import { Button } from '@/components/ui/actions/button'
import { Badge } from '@/components/ui/data-display/badge'
import { Card, CardContent } from '@/components/ui/data-display/card'
import { dishes, employeePrototype, menuDays } from '@/mocks/employee-home'
import {
  AccountView,
  DishDetailView,
  OrdersView,
  PaymentsView,
} from './employee-views'
import styles from './employee-dashboard.module.css'
import { CartView } from './cart-view'
import { useCart, cartCount, cartTotal, deliveryKey, money, type CartLine } from './use-cart'
import type { EmployeeOrder } from '@/domain/employee'

type Props = {
  email: string
}

/** `all` representa la vista combinada de los proveedores conocidos. */
type ProviderFilter = 'all' | ProviderId

type DishDraft = { quantity: number; customization: string; notes: string; delivery: DeliveryLocation }

const providerFilters: Array<{ id: ProviderFilter; label: string }> = [
  { id: 'all', label: 'Todos' },
  { id: 'tu-viandita', label: 'Tu Viandita' },
  { id: 'endulzate', label: 'Endulzate' },
]

/** Metadatos compartidos por la barra inferior móvil y la lateral de escritorio. */
const primaryViews: Record<PrimaryEmployeeSection, {
  icon: typeof UtensilsCrossed
  label: string
}> = {
  menu: { icon: UtensilsCrossed, label: 'Menú' },
  orders: { icon: ClipboardList, label: 'Pedidos' },
  payments: { icon: DollarSign, label: 'Pagos' },
  account: { icon: UserRound, label: 'Cuenta' },
}

/** Resumen reutilizado en la portada móvil y en la columna lateral de escritorio. */
function BenefitCard() {
  const { usedThisMonth, monthlyLimit, usedThisWeek } = employeePrototype.benefit
  const progress = `${Math.round((usedThisMonth / monthlyLimit) * 100)}%`

  return (
    <Card className={styles.benefitCard} aria-labelledby="benefit-title">
      <CardContent>
      <div className={styles.benefitHeader}>
        <p id="benefit-title">Tu beneficio</p>
        <Badge variant="secondary">Este mes</Badge>
      </div>
      <p className={styles.benefitValue}>
        {usedThisMonth} de {monthlyLimit} viandas pedidas
      </p>
      <p className={styles.benefitWeek}><strong>{usedThisWeek}</strong> viandas pedidas esta semana</p>
      <div
        className={styles.progressTrack}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={monthlyLimit}
        aria-valuenow={usedThisMonth}
        aria-label={`${usedThisMonth} de ${monthlyLimit} viandas pedidas este mes`}
      >
        <span style={{ width: progress }} />
      </div>
      </CardContent>
    </Card>
  )
}

/** Botón de navegación presentacional; el padre decide qué vista activar. */
function NavigationItem({
  icon: Icon,
  label,
  active = false,
  onClick,
}: {
  icon: typeof UtensilsCrossed
  label: string
  active?: boolean
  onClick: () => void
}) {
  return (
    <button
      className={styles.navigationItem}
      data-active={active}
      type="button"
      onClick={onClick}
      aria-current={active ? 'page' : undefined}
    >
      <Icon aria-hidden="true" />
      <span>{label}</span>
    </button>
  )
}

/**
 * Conecta menú, personalización, checkout y secciones secundarias.
 * Todo el estado se reinicia al recargar porque esta etapa valida UX, no persistencia.
 */
export function EmployeeDashboard({ email }: Props) {
  // Navegación interna: estas vistas no crean entradas nuevas en `config/routes.rb`.
  const navigation = usePrototypeNavigation<EmployeeView>('menu')
  const view = navigation.route.section

  // Estado del menú semanal y del plato actualmente seleccionado.
  const [selectedDay, setSelectedDay] = useState(menuDays[0].id)
  const [providerFilter, setProviderFilter] = useState<ProviderFilter>('all')
  const selectedDishId = navigation.route.detail

  // Un borrador por plato evita mezclar opciones al volver con Atrás/Adelante.
  const [drafts, setDrafts] = useState<Record<number, DishDraft>>({})
  const draft = typeof selectedDishId === 'number' ? drafts[selectedDishId] : undefined
  const { quantity = 1, customization = '', notes = '', delivery = 'office' } = draft ?? {}
  const updateDraft = (patch: Partial<DishDraft>) => {
    if (typeof selectedDishId !== 'number' || !draft) return
    setDrafts(current => ({ ...current, [selectedDishId]: { ...current[selectedDishId], ...patch } }))
  }
  // El carrito sobrevive a cambios de sección, pero no a una recarga.
  const cart = useCart()
  const [confirmed, setConfirmed] = useState<CartLine[]>([])
  const [confirmedDeliveries, setConfirmedDeliveries] = useState<Record<string, DeliveryLocation>>({})
  const [newOrders, setNewOrders] = useState<EmployeeOrder[]>([])
  // Direcciones de la demo: sólo las guardadas vuelven a aparecer desde Cuenta.
  const [addresses, setAddresses] = useState<DeliveryAddress[]>([
    { id: 'home', name: 'Casa', address: 'Av. Brasil 2145, apto. 402', saved: true },
  ])
  const addAddress = (name: string, address: string, saved = true) => {
    const id = `address-${crypto.randomUUID().slice(0, 8)}`
    setAddresses(current => [...current, { id, name, address, saved }])
    return id
  }
  const count = cartCount(cart.lines)
  const total = cartTotal(cart.lines)

  // La lista visible siempre se deriva de los mocks; no se duplica en estado React.
  const visibleDishes = useMemo(
    () => dishes.filter((dish) => (
      dish.dayId === selectedDay &&
      (providerFilter === 'all' || dish.providerId === providerFilter)
    )),
    [providerFilter, selectedDay],
  )

  // Resolver el objeto completo evita buscarlo nuevamente en cada subpantalla.
  const selectedDish = dishes.find((dish) => dish.id === selectedDishId)

  // Las subpantallas de pedido siguen marcando "Menú" como sección principal activa.
  const activeSection: PrimaryEmployeeSection = view === 'orders' || view === 'payments' || view === 'account'
    ? view
    : 'menu'
  // El flujo de checkout usa su propia acción fija y por eso oculta la navegación móvil.
  const showPrimaryNavigation = !['dish-detail', 'checkout', 'order-success'].includes(view)

  /** Cambia de subpantalla y devuelve el documento al inicio. */
  const navigate = (nextView: EmployeeView) => {
    navigation.navigate({ section: nextView })
  }

  /** Cambiar de día invalida cualquier selección perteneciente al día anterior. */
  const chooseDay = (dayId: string) => {
    setSelectedDay(dayId)
  }

  /** Abre la personalización sin descartar platos ya agregados. */
  const toggleDish = (dishId: number) => {
    const dish = dishes.find(item => item.id === dishId)
    if (!dish || cart.available(dish) <= 0) return
    setDrafts(current => ({ ...current, [dishId]: {
      quantity: 1, customization: dish.customizations?.[0] ?? '', notes: '',
      delivery: cart.deliveries[deliveryKey(dish)] ?? 'office',
    } }))
    navigation.navigate({ section: 'dish-detail', detail: dishId })
  }

  /** El destino se comparte entre todas las líneas del mismo proveedor y fecha. */
  const addToCart = () => {
    if (!selectedDish) return
    cart.add(selectedDish, quantity, customization, notes)
    cart.setDelivery(deliveryKey(selectedDish), delivery)
    navigate('menu')
  }

  /** Confirmación local: conserva el resumen y agrega las líneas a Mis pedidos. */
  const confirmCart = () => {
    if (!cart.lines.length) return
    const reference = crypto.randomUUID().slice(0, 8)
    setConfirmed(cart.lines)
    setConfirmedDeliveries(cart.deliveries)
    setNewOrders(current => [...cart.lines.map((line, index): EmployeeOrder => {
      const day = menuDays.find(item => item.id === line.dish.dayId)
      return {
        id: `PED-${reference}-${index + 1}`,
        dishName: line.dish.name,
        providerName: line.dish.providerName,
        quantity: line.quantity,
        amount: line.quantity * line.dish.price,
        deliveryLabel: `${day?.shortName} ${day?.date} · 12:30 · ${cart.deliveries[deliveryKey(line.dish)] === 'office' ? 'Oficina' : addresses.find(address => address.id === cart.deliveries[deliveryKey(line.dish)])?.name ?? 'Domicilio'}`,
        // El proveedor debe revisarlo antes de que el empleado lo vea confirmado.
        status: 'pending',
      }
    }), ...current])
    cart.clear()
    navigate('order-success')
  }

  /** Portada semanal; se extrae para mantener legible el selector de vistas final. */
  const renderMenu = () => (
    <>
      {/* El encabezado amplio se reemplaza por una introducción compacta en móvil. */}
      <header className={styles.desktopHeader}>
        <div>
          <p className={styles.eyebrow}>{employeePrototype.dateLabel}</p>
          <h1>Hola, {employeePrototype.name} <span aria-hidden="true">👋</span></h1>
        </div>
        <Button
          className={styles.settingsButton}
          variant="outline"
          size="icon"
          aria-label="Configuración"
          onClick={() => navigate('account')}
        >
          <Settings2 aria-hidden="true" />
        </Button>
      </header>

      <div className={styles.mobileIntro}>
        <h1>Hola, {employeePrototype.name} <span aria-hidden="true">👋</span></h1>
        <p>{employeePrototype.dateLabel}</p>
      </div>

      <div className={styles.mobileBenefit}>
        <BenefitCard />
      </div>

      {/* En móvil se apila; en escritorio agrega una columna lateral de resumen. */}
      <div className={styles.contentGrid}>
        <section className={styles.menuSection} aria-labelledby="weekly-menu-title">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>Elegí tu almuerzo</p>
              <h2 id="weekly-menu-title">Menú semanal</h2>
            </div>
            <span className={styles.desktopOnly}>Semana del 10 al 14</span>
          </div>

          {/* Cambiar de día recalcula los platos visibles y limpia la selección anterior. */}
          <div className={styles.daySelector} aria-label="Elegir día">
            {menuDays.map((day) => (
              <Button
                key={day.id}
                variant={selectedDay === day.id ? 'default' : 'outline'}
                data-selected={selectedDay === day.id}
                onClick={() => chooseDay(day.id)}
                aria-pressed={selectedDay === day.id}
              >
                <span>{day.shortName}</span>
                <strong>{day.date}</strong>
              </Button>
            ))}
          </div>

          <div className={styles.providerSelector} aria-label="Filtrar por proveedor">
            {providerFilters.map((provider) => (
              <Button
                key={provider.id}
                size="sm"
                variant={providerFilter === provider.id ? 'default' : 'ghost'}
                data-selected={providerFilter === provider.id}
                onClick={() => setProviderFilter(provider.id)}
                aria-pressed={providerFilter === provider.id}
              >
                {provider.label}
              </Button>
            ))}
          </div>

          {/* El listado contiene tarjetas visuales o un estado vacío según los mocks. */}
          <div className={styles.menuList} aria-live="polite">
            {visibleDishes.length > 0 ? visibleDishes.map((dish) => {
              const isSelected = cart.lines.some(line => line.dish.id === dish.id)

              return (
                <Card className={styles.dishCard} size="sm" key={dish.id} data-selected={isSelected}>
                  <div>
                    <p className={styles.providerName}>{dish.providerName}</p>
                    <h3>{dish.name} <span aria-hidden="true">|</span> ${dish.price}</h3>
                    <p className={styles.dishDescription}>{dish.description}</p>
                  </div>
                  <Button
                    className={styles.addButton}
                    variant={isSelected ? 'default' : 'outline'}
                    size="icon"
                    data-selected={isSelected}
                    onClick={() => toggleDish(dish.id)}
                    disabled={cart.available(dish) <= 0}
                    aria-label={`Agregar ${dish.name}`}
                  >
                    <Plus aria-hidden="true" />
                  </Button>
                </Card>
              )
              }) : (
                <div className={styles.emptyState}>
                  <UtensilsCrossed aria-hidden="true" />
                  <h3>
                    {providerFilter === 'all'
                      ? 'Todavía no hay viandas publicadas'
                      : 'No hay viandas de este proveedor'}
                  </h3>
                  <p>
                    {providerFilter === 'all'
                      ? 'Elegí otro día para consultar el menú disponible.'
                      : 'Probá seleccionando otro proveedor o día.'}
                  </p>
                </div>
              )}
          </div>
        </section>

        <aside className={styles.desktopSummary} aria-label="Resumen de la semana">
          <BenefitCard />

          <Card className={styles.selectionCard}>
            <p className={styles.selectionLabel}>Tu carrito</p>
            <h2>{count} {count === 1 ? 'plato' : 'platos'} · {money(total)}</h2>
            <p>Agregá platos de distintos días y proveedores.</p>
            <Button className={styles.continueButton} onClick={() => navigate('checkout')}>Ver carrito</Button>
          </Card>
        </aside>
      </div>

      {/* Acción fija exclusiva de móvil cuando ya existe una vianda seleccionada. */}
      {count > 0 && (
        <div className={styles.mobileSelection} role="status">
          <div>
            <span>Tu carrito</span>
            <strong>{count} {count === 1 ? 'plato' : 'platos'} · {money(total)}</strong>
          </div>
          <Button onClick={() => navigate('checkout')}>Ver carrito</Button>
        </div>
      )}
    </>
  )

  // Shell general: barra lateral en escritorio, contenido y navegación inferior móvil.
  return (
    <div className={styles.page}>
      <aside className={styles.desktopSidebar}>
        <button
          type="button"
          className={styles.brand}
          onClick={() => navigate('menu')}
          aria-label="Ir al menú principal del empleado"
        >
          <span className={styles.brandMark}><UtensilsCrossed aria-hidden="true" /></span>
          <span>GoGrow Meals</span>
        </button>

        <nav className={styles.desktopNavigation} aria-label="Navegación principal">
          {(Object.entries(primaryViews) as Array<[
            PrimaryEmployeeSection,
            typeof primaryViews[PrimaryEmployeeSection],
          ]>).map(([section, item]) => (
            <NavigationItem
              key={section}
              icon={item.icon}
              label={item.label}
              active={activeSection === section}
              onClick={() => navigate(section)}
            />
          ))}
        </nav>

        <div className={styles.sidebarAccount}>
          <span className={styles.avatar}>S</span>
          <div>
            <strong>{employeePrototype.name}</strong>
            <span>{email}</span>
          </div>
        </div>
      </aside>

      <main className={styles.workspace} data-menu={view === 'menu'}>
        {/* Cada condición representa una pantalla del prototipo controlada por `view`. */}
        {view === 'menu' && renderMenu()}
        {view === 'dish-detail' && selectedDish && (
          <DishDetailView
            dish={selectedDish}
            quantity={Math.min(quantity, Math.max(1, cart.available(selectedDish)))}
            customization={customization}
            notes={notes}
            delivery={delivery}
            onBack={() => navigate('menu')}
            onQuantityChange={quantity => updateDraft({ quantity })}
            onCustomizationChange={customization => updateDraft({ customization })}
            onNotesChange={notes => updateDraft({ notes })}
            onDeliveryChange={delivery => updateDraft({ delivery })}
            addresses={addresses.filter(address => address.saved)}
            onAddAddress={addAddress}
            onAddToCart={addToCart}
            maxQuantity={cart.available(selectedDish)}
          />
        )}
        {view === 'checkout' && <CartView lines={cart.lines} deliveries={cart.deliveries} onQuantity={cart.changeQuantity} onRemove={cart.remove} onDelivery={cart.setDelivery} addresses={addresses} onAddAddress={addAddress} onBack={() => navigate('menu')} onConfirm={confirmCart} />}
        {view === 'order-success' && <CartView confirmed lines={confirmed} deliveries={confirmedDeliveries} onQuantity={cart.changeQuantity} onRemove={cart.remove} onDelivery={cart.setDelivery} addresses={addresses} onAddAddress={addAddress} onBack={() => navigate('menu')} onConfirm={confirmCart} onOrders={() => navigate('orders')} />}
        {view === 'orders' && <OrdersView additionalOrders={newOrders} onMenu={() => navigate('menu')} />}
        {view === 'payments' && <PaymentsView />}
        {view === 'account' && <AccountView email={email} addresses={addresses.filter(address => address.saved)} onAddAddress={addAddress} />}
      </main>

      {showPrimaryNavigation && (
        <nav className={styles.mobileNavigation} aria-label="Navegación principal">
          {(Object.entries(primaryViews) as Array<[
            PrimaryEmployeeSection,
            typeof primaryViews[PrimaryEmployeeSection],
          ]>).map(([section, item]) => (
            <NavigationItem
              key={section}
              icon={item.icon}
              label={item.label}
              active={activeSection === section}
              onClick={() => navigate(section)}
            />
          ))}
        </nav>
      )}
    </div>
  )
}
