import { AdminDashboard } from '@/features/admin/admin-dashboard'
import { EmployeeDashboard } from '@/features/employee/employee-dashboard'
import { ProviderDashboard } from '@/features/provider/provider-dashboard'

type Role = 'empleado' | 'administrador' | 'proveedor'

type Props = {
  role: Role
  email: string
}

/** Inertia conserva un único punto de entrada y React deriva el panel según el rol autenticado. */
export default function Dashboard({ role, email }: Props) {
  if (role === 'empleado') return <EmployeeDashboard email={email} />
  if (role === 'proveedor') return <ProviderDashboard email={email} />
  return <AdminDashboard email={email} />
}
