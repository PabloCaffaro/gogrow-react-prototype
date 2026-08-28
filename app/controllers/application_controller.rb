class ApplicationController < ActionController::Base
  allow_browser versions: :modern

  inertia_share current_user: -> {
    current_user&.as_json(only: %i[id email role])
  }

  private

  def current_user
    @current_user ||= User.find_by(id: session[:user_id] || cookies.signed[:remembered_user_id])
  end

  def require_authentication
    redirect_to login_path, alert: "Iniciá sesión para continuar." unless current_user
  end
end