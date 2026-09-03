import { AdminDashboard } from '@/features/admin/admin-dashboard'
import { EmployeeDashboard } from '@/features/employee/employee-dashboard'
import { ProviderDashboard } from '@/features/provider/provider-dashboard'

type Role = 'empleado' | 'administrador' | 'proveedor'

type Props = {
  role: Role
  email: string
}

/** El contenedor persistente elige el rol y conserva su estado al usar Atrás. */
function DashboardLayout({ role, email }: Props) {
  if (role === 'empleado') return <EmployeeDashboard email={email} />
  if (role === 'proveedor') return <ProviderDashboard email={email} />
  return <AdminDashboard email={email} />
}

/**
 * Punto de entrada de Inertia. La interfaz vive en su layout persistente:
 * Inertia puede recrear esta página al retroceder sin vaciar el carrito.
 * Al cerrar sesión se desmonta el layout; recargar reinicia la demo.
 */
export default function Dashboard() {
  return null
}

// En Inertia 3 el callback recibe props y devuelve [componente, props del layout].
Dashboard.layout = (props: Props) => [DashboardLayout, { role: props.role, email: props.email }]
