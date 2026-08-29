class ApplicationController < ActionController::Base
  allow_browser versions: :modern

  inertia_share current_user: -> {
    current_user&.as_json(only: %i[id email role])
  }

  private

  def current_user
    # La sesión sólo conserva el correo de una cuenta demo. La identidad se
    # reconstruye desde código y nunca se consulta una base de datos.
    email = session[:demo_email] || cookies.signed[:remembered_demo_email]
    @current_user ||= DemoAccount.find(email)
  end

  def require_authentication
    redirect_to login_path, alert: "Iniciá sesión para continuar." unless current_user
  end
end
