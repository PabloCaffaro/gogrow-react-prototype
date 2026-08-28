import { Head, router } from '@inertiajs/react'
import { Building2, ClipboardCheck, LogOut, PackageCheck, ShieldCheck, Users } from 'lucide-react'

import { Button } from '@/components/ui/actions/button'
import { Badge } from '@/components/ui/data-display/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/data-display/card'
import { EmployeeDashboard } from '@/features/employee/employee-dashboard'
import { ProviderDashboard } from '@/features/provider/provider-dashboard'
import styles from './show.module.css'

/** Limitar el rol a estos valores evita estados imposibles en TypeScript. */
type Role = 'empleado' | 'administrador' | 'proveedor'

/** Props preparadas por `DashboardsController` y entregadas mediante Inertia. */
type Props = {
  role: Role
  role_info: {
    name: string
    description: string
  }
  email: string
}

/**
 * El contenido variable se modela como datos en lugar de duplicar tres páginas.
 * Los colores no viven aquí: CSS los selecciona mediante el atributo `data-role`.
 */
const roleData = {
  empleado: {
    icon: ClipboardCheck,
    metrics: [['Tareas pendientes', '6'], ['Completadas hoy', '4'], ['Próximo turno', '09:30']],
    actions: ['Registrar actividad', 'Consultar calendario', 'Ver comunicaciones'],
  },
  administrador: {
    icon: Users,
    metrics: [['Usuarios activos', '128'], ['Solicitudes', '9'], ['Alertas', '2']],
    actions: ['Gestionar usuarios', 'Revisar permisos', 'Consultar reportes'],
  },
  proveedor: {
    icon: PackageCheck,
    metrics: [['Pedidos abiertos', '12'], ['Entregas próximas', '3'], ['Documentos', '5']],
    actions: ['Ver pedidos', 'Informar una entrega', 'Actualizar documentación'],
  },
} satisfies Record<Role, {
  icon: typeof ShieldCheck
  metrics: string[][]
  actions: string[]
}>

/** Dashboard reutilizable que adapta su contenido y color al rol autenticado. */
export default function Dashboard({ role, role_info: roleInfo, email }: Props) {
  // El empleado utiliza el prototipo desarrollado; los otros roles conservan el panel base.
  if (role === 'empleado') {
    return <EmployeeDashboard email={email} />
  }

  if (role === 'proveedor') {
    return <ProviderDashboard email={email} />
  }

  const data = roleData[role]

  // Guardar el componente en una variable permite renderizar un ícono diferente por rol.
  const RoleIcon = data.icon

  /** Inertia envía DELETE a Rails y procesa la redirección sin recarga completa. */
  const logout = () => {
    router.delete('/logout')
  }

  return (
    <>
      <Head title={`Panel de ${roleInfo.name}`} />
      <main className={styles.page}>
        <header className={styles.header}>
          <div className={styles.headerContent}>
            <div className={styles.identity}>
              <div className={styles.brandIcon} data-role={role}>
                <Building2 className={styles.smallIcon} aria-hidden="true" />
              </div>
              <div>
                <p className={styles.portalName}>Portal operativo</p>
                <p className={styles.email}>{email}</p>
              </div>
            </div>

            <Button variant="outline" onClick={logout}>
              <LogOut className={styles.smallIcon} aria-hidden="true" />
              Cerrar sesión
            </Button>
          </div>
        </header>

        <div className={styles.content}>
          <div className={styles.introduction}>
            <div>
              <Badge variant="secondary" className={styles.demoBadge}>
                Sesión de demostración
              </Badge>
              <h1 className={styles.title}>Panel de {roleInfo.name}</h1>
              <p className={styles.description}>{roleInfo.description}</p>
            </div>

            <div className={styles.roleIcon} data-role={role}>
              <RoleIcon className={styles.largeIcon} aria-hidden="true" />
            </div>
          </div>

          {/* `key` permite que React identifique cada métrica entre renderizados. */}
          <section className={styles.metricsGrid} aria-label="Resumen del panel">
            {data.metrics.map(([label, value]) => (
              <Card key={label}>
                <CardHeader className={styles.metricHeader}>
                  <CardDescription>{label}</CardDescription>
                  <CardTitle className={styles.metricValue}>{value}</CardTitle>
                </CardHeader>
              </Card>
            ))}
          </section>

          <Card className={styles.actionsCard}>
            <CardHeader>
              <CardTitle>Acciones disponibles</CardTitle>
              <CardDescription>
                Estas opciones cambian según los permisos del perfil.
              </CardDescription>
            </CardHeader>
            <CardContent className={styles.actionGrid}>
              {data.actions.map((action) => (
                <Button
                  key={action}
                  variant="outline"
                  className={styles.actionButton}
                >
                  {action}
                </Button>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </>
  )
}
