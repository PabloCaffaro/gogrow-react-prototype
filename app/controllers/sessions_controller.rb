# frozen_string_literal: true

class SessionsController < InertiaController
  # Evita que una sesión válida vuelva a mostrar el formulario de acceso.
  def new
    return redirect_to dashboard_path(current_user.role) if current_user

    render inertia: "auth/login"
  end

  # Valida contra las cuentas públicas del prototipo y dirige al rol correcto.
  # No existe persistencia: al modificar DemoAccount se actualiza todo el flujo demo.
  def create
    credentials = params.permit(:email, :password, :remember)
    user = DemoAccount.authenticate(
      email: credentials[:email],
      password: credentials[:password]
    )

    if user
      reset_session
      session[:demo_email] = user.email
      if ActiveModel::Type::Boolean.new.cast(credentials[:remember])
        cookies.permanent.signed[:remembered_demo_email] = user.email
      end
      redirect_to dashboard_path(user.role)
    else
      redirect_to login_path, inertia: {
        errors: { email: "El correo o la contraseña no son correctos." }
      }
    end
  end

  # Elimina tanto la sesión temporal como la cookie opcional de larga duración.
  def destroy
    reset_session
    cookies.delete(:remembered_demo_email)
    redirect_to login_path, notice: "La sesión se cerró correctamente."
  end
end
