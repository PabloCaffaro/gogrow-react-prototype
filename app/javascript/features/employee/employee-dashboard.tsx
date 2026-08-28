import { useMemo, useState } from 'react'
import {
  Check,
  ClipboardList,
  DollarSign,
  Plus,
  Settings2,
  UserRound,
  UtensilsCrossed,
} from 'lucide-react'

import type { DeliveryLocation, EmployeeView, PrimaryEmployeeSection } from '@/domain/employee'
import type { ProviderId } from '@/domain/menu'
import { dishes, employeePrototype, menuDays } from '@/mocks/employee-home'
import {
  AccountView,
  CheckoutView,
  DishDetailView,
  OrdersView,
  OrderSuccessView,
  PaymentsView,
} from './employee-views'
import styles from './employee-dashboard.module.css'

type Props = {
  email: string
}

type ProviderFilter = 'all' | ProviderId

const providerFilters: Array<{ id: ProviderFilter; label: string }> = [
  { id: 'all', label: 'Todos' },
  { id: 'tu-viandita', label: 'Tu Viandita' },
  { id: 'endulzate', label: 'Endulzate' },
]

const primaryViews: Record<PrimaryEmployeeSection, {
  icon: typeof UtensilsCrossed
  label: string
}> = {
  menu: { icon: UtensilsCrossed, label: 'Menú' },
  orders: { icon: ClipboardList, label: 'Pedidos' },
  payments: { icon: DollarSign, label: 'Pagos' },
  account: { icon: UserRound, label: 'Cuenta' },
}

function BenefitCard() {
  const { used, weeklyLimit } = employeePrototype.benefit
  const progress = `${Math.round((used / weeklyLimit) * 100)}%`

  return (
    <section className={styles.benefitCard} aria-labelledby="benefit-title">
      <div className={styles.benefitHeader}>
        <p id="benefit-title">Tu beneficio</p>
        <span>Esta semana</span>
      </div>
      <p className={styles.benefitValue}>
        {used} de {weeklyLimit} viandas pedidas
      </p>
      <div
        className={styles.progressTrack}
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={weeklyLimit}
        aria-valuenow={used}
        aria-label={`${used} de ${weeklyLimit} viandas pedidas`}
      >
        <span style={{ width: progress }} />
      </div>
    </section>
  )
}

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

export function EmployeeDashboard({ email }: Props) {
  const [view, setView] = useState<EmployeeView>('menu')
  const [selectedDay, setSelectedDay] = useState(menuDays[0].id)
  const [providerFilter, setProviderFilter] = useState<ProviderFilter>('all')
  const [selectedDishId, setSelectedDishId] = useState<number | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [customization, setCustomization] = useState('')
  const [notes, setNotes] = useState('')
  const [delivery, setDelivery] = useState<DeliveryLocation>('office')

  const visibleDishes = useMemo(
    () => dishes.filter((dish) => (
      dish.dayId === selectedDay &&
      (providerFilter === 'all' || dish.providerId === providerFilter)
    )),
    [providerFilter, selectedDay],
  )

  const selectedDish = dishes.find((dish) => dish.id === selectedDishId)
  const activeSection: PrimaryEmployeeSection = view === 'orders' || view === 'payments' || view === 'account'
    ? view
    : 'menu'
  const showPrimaryNavigation = !['dish-detail', 'checkout', 'order-success'].includes(view)

  const navigate = (nextView: EmployeeView) => {
    setView(nextView)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const chooseDay = (dayId: string) => {
    setSelectedDay(dayId)
    setSelectedDishId(null)
  }

  const toggleDish = (dishId: number) => {
    setSelectedDishId((current) => current === dishId ? null : dishId)
  }

  const startOrder = () => {
    if (!selectedDish) return

    setQuantity(1)
    setCustomization(selectedDish.customizations?.[0] ?? '')
    setNotes('')
    setDelivery('office')
    navigate('dish-detail')
  }

  const renderMenu = () => (
    <>
      <header className={styles.desktopHeader}>
        <div>
          <p className={styles.eyebrow}>{employeePrototype.dateLabel}</p>
          <h1>Hola, {employeePrototype.name} <span aria-hidden="true">👋</span></h1>
        </div>
        <button
          className={styles.settingsButton}
          type="button"
          aria-label="Configuración"
          onClick={() => navigate('account')}
        >
          <Settings2 aria-hidden="true" />
        </button>
      </header>

      <div className={styles.mobileIntro}>
        <h1>Hola, {employeePrototype.name} <span aria-hidden="true">👋</span></h1>
        <p>{employeePrototype.dateLabel}</p>
      </div>

      <div className={styles.mobileBenefit}>
        <BenefitCard />
      </div>

      <div className={styles.contentGrid}>
        <section className={styles.menuSection} aria-labelledby="weekly-menu-title">
          <div className={styles.sectionHeading}>
            <div>
              <p className={styles.eyebrow}>Elegí tu almuerzo</p>
              <h2 id="weekly-menu-title">Menú semanal</h2>
            </div>
            <span className={styles.desktopOnly}>Semana del 10 al 14</span>
          </div>

          <div className={styles.daySelector} aria-label="Elegir día">
            {menuDays.map((day) => (
              <button
                key={day.id}
                type="button"
                data-selected={selectedDay === day.id}
                onClick={() => chooseDay(day.id)}
                aria-pressed={selectedDay === day.id}
              >
                <span>{day.shortName}</span>
                <strong>{day.date}</strong>
              </button>
            ))}
          </div>

          <div className={styles.providerSelector} aria-label="Filtrar por proveedor">
            {providerFilters.map((provider) => (
              <button
                key={provider.id}
                type="button"
                data-selected={providerFilter === provider.id}
                onClick={() => setProviderFilter(provider.id)}
                aria-pressed={providerFilter === provider.id}
              >
                {provider.label}
              </button>
            ))}
          </div>

          <div className={styles.menuList} aria-live="polite">
            {visibleDishes.length > 0 ? visibleDishes.map((dish) => {
              const isSelected = selectedDishId === dish.id

              return (
                <article className={styles.dishCard} key={dish.id} data-selected={isSelected}>
                  <div>
                    <p className={styles.providerName}>{dish.providerName}</p>
                    <h3>{dish.name} <span aria-hidden="true">|</span> ${dish.price}</h3>
                    <p className={styles.dishDescription}>{dish.description}</p>
                  </div>
                  <button
                    type="button"
                    className={styles.addButton}
                    data-selected={isSelected}
                    onClick={() => toggleDish(dish.id)}
                    aria-label={isSelected ? `Quitar ${dish.name}` : `Agregar ${dish.name}`}
                  >
                    {isSelected ? <Check aria-hidden="true" /> : <Plus aria-hidden="true" />}
                  </button>
                </article>
              )
            }) : (
              <div className={styles.emptyState}>
                <UtensilsCrossed aria-hidden="true" />
                <h3>No hay platos para este filtro</h3>
                <p>Probá seleccionando otro proveedor o día.</p>
              </div>
            )}
          </div>
        </section>

        <aside className={styles.desktopSummary} aria-label="Resumen de la semana">
          <BenefitCard />

          <section className={styles.selectionCard}>
            <p className={styles.selectionLabel}>Tu selección</p>
            {selectedDish ? (
              <>
                <h2>{selectedDish.name}</h2>
                <p>{selectedDish.providerName}</p>
                <div className={styles.selectionPrice}>
                  <span>Precio con beneficio</span>
                  <strong>${selectedDish.price}</strong>
                </div>
                <button className={styles.continueButton} type="button" onClick={startOrder}>
                  Continuar pedido
                </button>
              </>
            ) : (
              <div className={styles.noSelection}>
                <span><Plus aria-hidden="true" /></span>
                <p>Elegí un plato para comenzar tu pedido.</p>
              </div>
            )}
          </section>
        </aside>
      </div>

      {selectedDish && (
        <div className={styles.mobileSelection} role="status">
          <div>
            <span>Seleccionaste</span>
            <strong>{selectedDish.name}</strong>
          </div>
          <button type="button" onClick={startOrder}>Continuar</button>
        </div>
      )}
    </>
  )

  return (
    <div className={styles.page}>
      <aside className={styles.desktopSidebar}>
        <div className={styles.brand}>
          <span className={styles.brandMark}><UtensilsCrossed aria-hidden="true" /></span>
          <span>GoGrow Meals</span>
        </div>

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
        {view === 'menu' && renderMenu()}
        {view === 'dish-detail' && selectedDish && (
          <DishDetailView
            dish={selectedDish}
            quantity={quantity}
            customization={customization}
            notes={notes}
            delivery={delivery}
            onBack={() => navigate('menu')}
            onQuantityChange={setQuantity}
            onCustomizationChange={setCustomization}
            onNotesChange={setNotes}
            onDeliveryChange={setDelivery}
            onReview={() => navigate('checkout')}
          />
        )}
        {view === 'checkout' && selectedDish && (
          <CheckoutView
            dish={selectedDish}
            quantity={quantity}
            customization={customization}
            notes={notes}
            delivery={delivery}
            onBack={() => navigate('dish-detail')}
            onConfirm={() => navigate('order-success')}
          />
        )}
        {view === 'order-success' && selectedDish && (
          <OrderSuccessView
            dish={selectedDish}
            quantity={quantity}
            delivery={delivery}
            onOrders={() => navigate('orders')}
            onMenu={() => navigate('menu')}
          />
        )}
        {view === 'orders' && <OrdersView onMenu={() => navigate('menu')} />}
        {view === 'payments' && <PaymentsView />}
        {view === 'account' && <AccountView email={email} />}
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
