/**
 * Panel administrativo del prototipo. La navegación, los cambios de beneficio
 * y los filtros viven en React; recargar restablece todos los mocks.
 */
import { Head, router } from '@inertiajs/react'
import { useMemo, useState } from 'react'
import { usePrototypeNavigation } from '@/lib/use-prototype-navigation'
import {
  ArrowLeft,
  BarChart3,
  Bell,
  Check,
  ChevronRight,
  CircleDollarSign,
  Clock3,
  Home,
  LogOut,
  Plus,
  ReceiptText,
  Search,
  Settings2,
  ShieldCheck,
  Users,
  UserRound,
} from 'lucide-react'

import type { AdminEmployee, AdminSection, TemporaryBenefit } from '@/domain/admin'
import { adminActivity, adminEmployees, adminProfile } from '@/mocks/admin'
import { Button } from '@/components/ui/actions/button'
import { Badge } from '@/components/ui/data-display/badge'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/data-display/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/feedback/alert'
import { Input } from '@/components/ui/forms/input'
import { Label } from '@/components/ui/forms/label'
import { Select } from '@/components/ui/forms/select'
import { MonthlyPayments } from '@/features/payments/monthly-payments'
import styles from './admin-dashboard.module.css'

type Props = { email: string }
type Icon = typeof Home

/** Filtros y pestañas válidos; los tipos impiden navegar a estados inexistentes. */
type EmployeeFilter = 'all' | 'temporary' | 'custom' | 'debt' | 'near-limit' | 'no-orders'
type EmployeeDetailTab = 'summary' | 'orders' | 'balances' | 'benefit'

/** Configuración visual compartida por la barra lateral y la navegación móvil. */
const navigation: Record<AdminSection, { label: string; icon: Icon }> = {
  home: { label: 'Inicio', icon: Home },
  employees: { label: 'Empleados', icon: Users },
  payments: { label: 'Liquidaciones', icon: CircleDollarSign },
  insights: { label: 'Métricas', icon: BarChart3 },
  account: { label: 'Cuenta', icon: UserRound },
}

const employeeFilters: Array<[EmployeeFilter, string]> = [
  ['all', 'Todos'],
  ['temporary', 'Beneficio temporal'],
  ['custom', 'Aporte personalizado'],
  ['debt', 'Con deuda'],
  ['near-limit', 'Cerca del límite'],
  ['no-orders', 'Sin pedidos'],
]

const detailTabs: Array<[EmployeeDetailTab, string]> = [
  ['summary', 'Resumen'],
  ['orders', 'Pedidos'],
  ['balances', 'Saldos'],
  ['benefit', 'Configuración'],
]

/** Componente exclusivamente visual para mantener iguales los encabezados del panel. */
function Header({ eyebrow, title, description, children }: {
  eyebrow: string
  title: string
  description?: string
  children?: React.ReactNode
}) {
  return <header className={styles.header}><div><p>{eyebrow}</p><h1>{title}</h1>{description && <span>{description}</span>}</div>{children}</header>
}

/** Tarjeta visual reutilizable; no calcula datos ni modifica estado. */
function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return <Card className={styles.stat} size="sm"><CardHeader><CardDescription>{label}</CardDescription></CardHeader><CardContent><strong>{value}</strong><small>{note}</small></CardContent></Card>
}

/** Dato derivado: suma los saldos mock sin guardarlos nuevamente en estado. */
function totalDebt(employee: AdminEmployee) {
  return employee.balances.reduce((total, balance) => total + balance.debt, 0)
}

/** La excepción temporal tiene prioridad visual sobre la configuración permanente. */
function effectiveBenefit(employee: AdminEmployee) {
  return employee.temporaryBenefit ?? {
    monthlyAllowance: employee.monthlyAllowance,
    companyContribution: employee.companyContribution,
  }
}

export function AdminDashboard({ email }: Props) {
  // Estado de navegación: sección principal, empleado abierto y pestaña de su ficha.
  const navigationState = usePrototypeNavigation<AdminSection>('home')
  const section = navigationState.route.section
  const [employees, setEmployees] = useState(adminEmployees)
  const [employeeFilter, setEmployeeFilter] = useState<EmployeeFilter>('all')
  const [employeeSearch, setEmployeeSearch] = useState('')
  const selectedEmployeeId = navigationState.route.detail
  const detailTab = navigationState.route.tab ?? 'summary'
  const setDetailTab = (tab: EmployeeDetailTab) => navigationState.navigate({ section: 'employees', detail: selectedEmployeeId, tab })

  // Preferencias y mensajes puramente locales del prototipo.
  const [notifications, setNotifications] = useState(true)
  const [toast, setToast] = useState<string | null>(null)

  // Borrador de los dos formularios de beneficio del empleado seleccionado.
  const [baseAllowance, setBaseAllowance] = useState('20')
  const [baseContribution, setBaseContribution] = useState('50')
  const [temporaryAllowance, setTemporaryAllowance] = useState('20')
  const [temporaryContribution, setTemporaryContribution] = useState('75')
  const [temporaryStart, setTemporaryStart] = useState('2026-05-29')
  const [temporaryEnd, setTemporaryEnd] = useState('2026-06-29')
  const [temporaryReason, setTemporaryReason] = useState('')

  // El objeto seleccionado se deriva del id para conservar una sola fuente de verdad.
  const selectedEmployee = employees.find((employee) => employee.id === selectedEmployeeId)

  /** Aplica búsqueda y filtros sobre los empleados en memoria; no consulta al servidor. */
  const visibleEmployees = useMemo(() => {
    const query = employeeSearch.trim().toLocaleLowerCase('es')
    return employees.filter((employee) => {
      const matchesSearch = !query || `${employee.name} ${employee.email}`.toLocaleLowerCase('es').includes(query)
      if (!matchesSearch) return false
      if (employeeFilter === 'temporary') return Boolean(employee.temporaryBenefit)
      if (employeeFilter === 'custom') return employee.monthlyAllowance !== 20 || employee.companyContribution !== 50
      if (employeeFilter === 'debt') return totalDebt(employee) > 0
      if (employeeFilter === 'near-limit') return employee.ordersThisMonth >= effectiveBenefit(employee).monthlyAllowance * 0.8
      if (employeeFilter === 'no-orders') return employee.ordersThisMonth === 0
      return true
    })
  }, [employeeFilter, employeeSearch, employees])

  /** Cambia de sección principal y cierra cualquier ficha de empleado abierta. */
  const navigate = (nextSection: AdminSection) => {
    navigationState.navigate({ section: nextSection })
  }

  /** Muestra una confirmación temporal para las acciones simuladas. */
  const announce = (message: string) => {
    setToast(message)
    window.setTimeout(() => setToast(null), 2200)
  }

  /** Al entrar al buscador conserva el texto y deja un único caret listo para escribir. */
  const focusEmployeeSearch = (event: React.FocusEvent<HTMLInputElement>) => {
    const caretPosition = event.currentTarget.value.length
    event.currentTarget.setSelectionRange(caretPosition, caretPosition)
  }

  /** Abre la ficha y copia la configuración vigente a los campos editables. */
  const openEmployee = (employee: AdminEmployee) => {
    navigationState.navigate({ section: 'employees', detail: employee.id, tab: 'summary' })
    setBaseAllowance(String(employee.monthlyAllowance))
    setBaseContribution(String(employee.companyContribution))
    setTemporaryAllowance(String(employee.temporaryBenefit?.monthlyAllowance ?? employee.monthlyAllowance))
    setTemporaryContribution(String(employee.temporaryBenefit?.companyContribution ?? 75))
    setTemporaryStart(employee.temporaryBenefit?.startsOn ?? '2026-05-29')
    setTemporaryEnd(employee.temporaryBenefit?.endsOn ?? '2026-06-29')
    setTemporaryReason(employee.temporaryBenefit?.reason ?? '')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  /** Actualiza sólo el estado React; al recargar se restauran los mocks originales. */
  const savePermanentBenefit = () => {
    if (!selectedEmployee) return
    setEmployees((current) => current.map((employee) => employee.id === selectedEmployee.id
      ? { ...employee, monthlyAllowance: Number(baseAllowance), companyContribution: Number(baseContribution) }
      : employee))
    announce('Beneficio permanente actualizado')
  }

  /** Crea o reemplaza la excepción temporal del empleado seleccionado. */
  const saveTemporaryBenefit = () => {
    if (!selectedEmployee) return
    const temporaryBenefit: TemporaryBenefit = {
      monthlyAllowance: Number(temporaryAllowance),
      companyContribution: Number(temporaryContribution),
      startsOn: temporaryStart,
      endsOn: temporaryEnd,
      reason: temporaryReason || 'Excepción temporal',
    }
    setEmployees((current) => current.map((employee) => employee.id === selectedEmployee.id
      ? { ...employee, temporaryBenefit }
      : employee))
    announce('Beneficio temporal guardado')
  }

  /** Elimina la excepción para volver a mostrar el beneficio permanente. */
  const removeTemporaryBenefit = () => {
    if (!selectedEmployee) return
    setEmployees((current) => current.map((employee) => {
      if (employee.id !== selectedEmployee.id) return employee
      const { temporaryBenefit: _removed, ...withoutTemporaryBenefit } = employee
      return withoutTemporaryBenefit
    }))
    announce('Beneficio temporal finalizado')
  }

  // Vista visual de inicio: indicadores generales y accesos a otras secciones.
  const home = (
    <>
      <Header eyebrow="Lunes, 26 de mayo" title={`Hola, ${adminProfile.name} 👋`}><Button variant="outline" size="icon" onClick={() => navigate('account')} aria-label="Configuración"><Settings2 /></Button></Header>
      <section className={styles.stats} aria-label="Resumen de la organización"><Stat label="Empleados con beneficio" value="128" note="20 viandas mensuales" /><Stat label="Pedidos de hoy" value="34" note="72% del consumo diario" /><Stat label="Aporte en mayo" value="$148.200" note="Incluye 3 proveedores" /><Stat label="Uso mensual" value="81%" note="+6% frente a abril" /></section>
      <div className={styles.columns}>
        <section className={styles.surface}><div className={styles.sectionTitle}><div><p>Últimos movimientos</p><h2>Actividad reciente</h2></div><button type="button" onClick={() => navigate('employees')}>Ver empleados</button></div>{adminActivity.map((activity) => <div className={styles.activity} key={activity.title}><span><Check /></span><div><strong>{activity.title}</strong><small>{activity.detail}</small></div><time>{activity.time}</time></div>)}</section>
        <section className={styles.surface}><div className={styles.sectionTitle}><div><p>Distribución mensual</p><h2>Pedidos por proveedor</h2></div></div><div className={styles.providerUsage}><div><span>Tu Viandita</span><strong>48%</strong></div><i><b style={{ width: '48%' }} /></i></div><div className={styles.providerUsage}><div><span>Endulzate by Noe</span><strong>39%</strong></div><i><b style={{ width: '39%' }} /></i></div><div className={styles.providerUsage}><div><span>Sabores del Sur</span><strong>13%</strong></div><i><b style={{ width: '13%' }} /></i></div><button className={styles.primary} type="button" onClick={() => navigate('insights')}>Ver métricas completas</button></section>
      </div>
    </>
  )

  // Vista de listado: buscador, filtros y acceso al detalle de cada empleado.
  const employeeList = (
    <>
      <Header eyebrow="Gestión de personas" title="Empleados" description="Cada persona tiene 20 viandas mensuales y puede contar con una configuración individual."><Button size="lg" onClick={() => announce('Formulario de alta listo para la próxima etapa')}><Plus /> Agregar</Button></Header>
      <div className={styles.search}><Search aria-hidden="true" /><Input type="search" value={employeeSearch} onFocus={focusEmployeeSearch} onChange={(event) => setEmployeeSearch(event.target.value)} placeholder="Buscar por nombre o correo" aria-label="Buscar empleados" /></div>
      <div className={styles.filters} aria-label="Filtrar empleados">{employeeFilters.map(([value, label]) => <Button type="button" size="sm" variant={employeeFilter === value ? 'default' : 'outline'} key={value} data-selected={employeeFilter === value} onClick={() => setEmployeeFilter(value)}>{label}</Button>)}</div>
      <section className={styles.employeeList} aria-label="Listado de empleados">{visibleEmployees.map((employee) => {
        const benefit = effectiveBenefit(employee)
        const debt = totalDebt(employee)
        return <Card className={styles.employeeCard} size="sm" key={employee.id}><button type="button" className={styles.employee} onClick={() => openEmployee(employee)}><span className={styles.avatar}>{employee.initials}</span><div><h2>{employee.name}</h2><p>{employee.team} · {employee.email}</p></div><div className={styles.employeeUsage}><span>Consumo mensual</span><strong>{employee.ordersThisMonth} de {benefit.monthlyAllowance}</strong></div><div className={styles.employeeBenefit}><span>Aporte de empresa</span><Badge variant={employee.temporaryBenefit ? 'secondary' : 'outline'}>{benefit.companyContribution}%{employee.temporaryBenefit ? ' temporal' : ''}</Badge></div><div className={styles.employeeDebt}><span>Deuda</span><strong>${debt}</strong></div><ChevronRight /></button></Card>
      })}{visibleEmployees.length === 0 && <div className={styles.empty}><Users /><p>No hay empleados que coincidan con este filtro.</p></div>}</section>
    </>
  )

  // Vista de detalle: calcula métricas del empleado y renderiza la pestaña activa.
  const employeeDetail = selectedEmployee && (() => {
    const benefit = effectiveBenefit(selectedEmployee)
    const debt = totalDebt(selectedEmployee)
    const remaining = Math.max(benefit.monthlyAllowance - selectedEmployee.ordersThisMonth, 0)
    return <>
      <Button className={styles.backButton} variant="ghost" size="sm" onClick={() => navigate('employees')}><ArrowLeft /> Volver a empleados</Button>
      <Header eyebrow={selectedEmployee.team} title={selectedEmployee.name} description={selectedEmployee.email} />
      {selectedEmployee.temporaryBenefit && <Alert className={styles.temporaryBanner}><Clock3 /><div><AlertTitle>Beneficio temporal activo</AlertTitle><AlertDescription>{selectedEmployee.temporaryBenefit.companyContribution}% de aporte hasta el {selectedEmployee.temporaryBenefit.endsOn}</AlertDescription></div></Alert>}
      <div className={styles.detailTabs} role="tablist" aria-label="Detalle del empleado">{detailTabs.map(([value, label]) => <Button type="button" size="sm" variant={detailTab === value ? 'secondary' : 'ghost'} role="tab" aria-selected={detailTab === value} data-selected={detailTab === value} key={value} onClick={() => setDetailTab(value)}>{label}</Button>)}</div>
      {detailTab === 'summary' && <><section className={styles.stats}><Stat label="Consumidas este mes" value={`${selectedEmployee.ordersThisMonth} / ${benefit.monthlyAllowance}`} note="El beneficio se reinicia mensualmente" /><Stat label="Disponibles" value={String(remaining)} note="No es un límite semanal" /><Stat label="Aporte de empresa" value={`${benefit.companyContribution}%`} note={selectedEmployee.temporaryBenefit ? 'Configuración temporal activa' : 'Configuración permanente'} /><Stat label="Deuda total" value={`$${debt}`} note={`${selectedEmployee.balances.filter((balance) => balance.debt > 0).length} proveedores con saldo`} /></section><div className={styles.columns}><section className={styles.surface}><div className={styles.sectionTitle}><div><p>Beneficio vigente</p><h2>Cómo se calcula</h2></div><button type="button" onClick={() => setDetailTab('benefit')}>Modificar</button></div><div className={styles.infoRow}><span>Asignación mensual</span><strong>{benefit.monthlyAllowance} viandas</strong></div><div className={styles.infoRow}><span>Aporte de la empresa</span><strong>{benefit.companyContribution}%</strong></div><div className={styles.infoRow}><span>Origen</span><strong>{selectedEmployee.temporaryBenefit ? 'Excepción temporal' : selectedEmployee.companyContribution === 50 && selectedEmployee.monthlyAllowance === 20 ? 'Estándar de la empresa' : 'Personalizado'}</strong></div></section><section className={styles.surface}><div className={styles.sectionTitle}><div><p>Actividad</p><h2>Consumo reciente</h2></div><button type="button" onClick={() => setDetailTab('orders')}>Ver pedidos</button></div><div className={styles.infoRow}><span>Esta semana</span><strong>{Math.min(selectedEmployee.orders.length, 3)} pedidos</strong></div><div className={styles.infoRow}><span>Este mes</span><strong>{selectedEmployee.ordersThisMonth} pedidos</strong></div><div className={styles.infoRow}><span>Último proveedor</span><strong>{selectedEmployee.orders[0]?.provider ?? 'Sin pedidos'}</strong></div></section></div></>}
      {detailTab === 'orders' && <section className={styles.orderList}>{selectedEmployee.orders.length > 0 ? selectedEmployee.orders.map((order) => <article className={styles.order} key={order.id}><span className={styles.orderIcon}><ReceiptText /></span><div><small>{order.id} · {order.date}</small><h2>{order.dish}</h2><p>{order.provider}</p></div><strong>${order.amount}</strong><footer><span>Empresa: ${order.companyShare}</span><span>Empleado: ${order.employeeShare}</span></footer></article>) : <div className={styles.empty}><ReceiptText /><p>Este empleado todavía no realizó pedidos en el período.</p></div>}</section>}
      {detailTab === 'balances' && <section className={styles.balanceGrid}>{selectedEmployee.balances.map((balance) => <article className={styles.balance} key={balance.provider}><span><CircleDollarSign /></span><div><small>Proveedor</small><h2>{balance.provider}</h2></div><div><small>Generado</small><strong>${balance.generated}</strong></div><div><small>Pagado</small><strong>${balance.paid}</strong></div><div><small>Deuda pendiente</small><strong data-debt={balance.debt > 0}>${balance.debt}</strong></div></article>)}</section>}
      {detailTab === 'benefit' && <div className={styles.benefitForms}>
        <Card className={styles.formCard}>
          <CardHeader><CardDescription>Configuración permanente</CardDescription><h2>Beneficio general</h2></CardHeader>
          <CardContent>
            <p className={styles.formHelp}>Se aplica cuando no existe una excepción temporal vigente.</p>
            <div className={styles.formGrid}>
              <Label htmlFor="base-allowance">Viandas por mes<Select id="base-allowance" value={baseAllowance} onChange={(event) => setBaseAllowance(event.target.value)}><option value="15">15 viandas</option><option value="20">20 viandas</option><option value="25">25 viandas</option></Select></Label>
              <Label htmlFor="base-contribution">Aporte de la empresa<Select id="base-contribution" value={baseContribution} onChange={(event) => setBaseContribution(event.target.value)}><option value="25">25%</option><option value="50">50%</option><option value="60">60%</option><option value="75">75%</option><option value="100">100%</option></Select></Label>
            </div>
            <Button className={styles.formSubmit} onClick={savePermanentBenefit}>Guardar configuración</Button>
          </CardContent>
        </Card>
        <Card className={styles.formCard}>
          <CardHeader><CardDescription>Excepción con vencimiento</CardDescription><h2>Beneficio temporal</h2></CardHeader>
          <CardContent>
            <p className={styles.formHelp}>Mientras esté vigente, reemplaza la configuración permanente y luego vuelve automáticamente a ella.</p>
            <div className={styles.formGrid}>
              <Label htmlFor="temporary-allowance">Viandas por mes<Select id="temporary-allowance" value={temporaryAllowance} onChange={(event) => setTemporaryAllowance(event.target.value)}><option value="20">20 viandas</option><option value="25">25 viandas</option><option value="30">30 viandas</option></Select></Label>
              <Label htmlFor="temporary-contribution">Aporte temporal<Select id="temporary-contribution" value={temporaryContribution} onChange={(event) => setTemporaryContribution(event.target.value)}><option value="50">50%</option><option value="60">60%</option><option value="75">75%</option><option value="100">100%</option></Select></Label>
              <Label htmlFor="temporary-start">Desde<Input id="temporary-start" type="date" value={temporaryStart} onChange={(event) => setTemporaryStart(event.target.value)} /></Label>
              <Label htmlFor="temporary-end">Hasta<Input id="temporary-end" type="date" value={temporaryEnd} onChange={(event) => setTemporaryEnd(event.target.value)} /></Label>
              <Label className={styles.fullField} htmlFor="temporary-reason">Motivo<Input id="temporary-reason" value={temporaryReason} onChange={(event) => setTemporaryReason(event.target.value)} placeholder="Motivo de la excepción" /></Label>
            </div>
            <div className={styles.formActions}>{selectedEmployee.temporaryBenefit && <Button variant="outline" onClick={removeTemporaryBenefit}>Finalizar temporal</Button>}<Button onClick={saveTemporaryBenefit}>Guardar temporal</Button></div>
          </CardContent>
        </Card>
      </div>}
    </>
  })()

  // La sección Empleados alterna entre listado y ficha sin crear una ruta nueva.
  const employeesView = selectedEmployee ? employeeDetail : employeeList

  // Las siguientes constantes son vistas presentacionales de cada sección principal.
  // Administración controla los meses adeudados, sin repetir el listado de comprobantes.
  const payments = <MonthlyPayments mode="admin" showReceipts={false} />

  const insights = <><Header eyebrow="Últimos 30 días" title="Métricas" description="Una lectura del uso del beneficio mensual en la organización." /><section className={styles.stats}><Stat label="Pedidos" value="1.248" note="+9% frente a abril" /><Stat label="Usuarios frecuentes" value="92" note="72% de los empleados" /><Stat label="Ticket promedio" value="$318" note="Empresa aporta $159" /><Stat label="Uso del beneficio" value="81%" note="Promedio mensual" /></section><section className={styles.surface}><div className={styles.sectionTitle}><div><p>Tendencia mensual</p><h2>Pedidos por semana</h2></div></div><p className={styles.chartHelp}>La división semanal permite observar el ritmo de consumo, pero el beneficio se contabiliza sobre el total mensual.</p><div className={styles.chart}>{[58, 72, 66, 88].map((height, index) => <div key={height}><span style={{ height: `${height}%` }} /><small>Semana {index + 1}</small></div>)}</div></section></>

  const account = <><Header eyebrow="Preferencias" title="Mi cuenta" description="Administrá tus datos y las notificaciones del panel." /><div className={styles.accountGrid}><section className={styles.profile}><span className={styles.bigAvatar}>{adminProfile.initials}</span><div><h2>{adminProfile.fullName}</h2><p>Administradora · {adminProfile.company}</p><small>{email}</small></div></section><section className={styles.surface}><div className={styles.setting}><Bell /><span><strong>Resumen semanal</strong><small>Actividad, consumos y liquidaciones.</small></span><button type="button" className={styles.switch} role="switch" aria-checked={notifications} data-enabled={notifications} onClick={() => setNotifications((value) => !value)}><i /></button></div><button type="button" className={styles.accountLink} onClick={() => router.delete('/logout')}><LogOut /> Cerrar sesión <ChevronRight /></button></section></div></>

  // Mapa de navegación: evita condicionales repetidos al elegir la vista principal.
  const views: Record<AdminSection, React.ReactNode> = { home, employees: employeesView, payments, insights, account }

  return <><Head title="Panel de Administrador" /><div className={styles.page}><aside className={styles.sidebar}><button className={styles.brand} type="button" onClick={() => navigate('home')} aria-label="Ir al inicio principal del administrador"><span><ShieldCheck /></span><strong>GoGrow</strong><small>Administrador</small></button><nav aria-label="Navegación principal del administrador">{(Object.entries(navigation) as Array<[AdminSection, { label: string; icon: Icon }]>).map(([key, item]) => <button type="button" key={key} data-active={section === key} onClick={() => navigate(key)}><item.icon /><span>{item.label}</span></button>)}</nav><div className={styles.sidebarUser}><span className={styles.avatar}>{adminProfile.initials}</span><div><strong>{adminProfile.fullName}</strong><small>{email}</small></div></div></aside><main className={styles.workspace}>{views[section]}</main><nav className={styles.mobileNav} aria-label="Navegación móvil del administrador">{(Object.entries(navigation) as Array<[AdminSection, { label: string; icon: Icon }]>).map(([key, item]) => <button type="button" key={key} data-active={section === key} onClick={() => navigate(key)}><item.icon /><span>{item.label}</span></button>)}</nav>{toast && <div className={styles.toast} role="status"><Check />{toast}</div>}</div></>
}
