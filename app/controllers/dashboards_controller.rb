# frozen_string_literal: true

class DashboardsController < InertiaController
  before_action :require_authentication

  ROLE_INFO = {
    "empleado" => { name: "Empleado", description: "Gestioná tus tareas y actividad diaria." },
    "administrador" => { name: "Administrador", description: "Supervisá usuarios, permisos y operación." },
    "proveedor" => { name: "Proveedor", description: "Consultá solicitudes y entregas pendientes." }
  }.freeze

  def show
    return unless current_user
    return redirect_to dashboard_path(current_user.role) if params[:role] != current_user.role

    render inertia: "dashboard/show", props: {
      role: current_user.role,
      role_info: ROLE_INFO.fetch(current_user.role),
      email: current_user.email
    }
  end
end