# frozen_string_literal: true

class SessionsController < InertiaController
  def new
    return redirect_to dashboard_path(current_user.role) if current_user

    render inertia: "auth/login"
  end

  def create
    credentials = params.permit(:email, :password, :remember)
    user = User.find_by(email: credentials[:email].to_s.strip.downcase)

    if user&.active? && user.authenticate(credentials[:password])
      reset_session
      session[:user_id] = user.id
      cookies.permanent.signed[:remembered_user_id] = user.id if ActiveModel::Type::Boolean.new.cast(credentials[:remember])
      redirect_to dashboard_path(user.role)
    else
      redirect_to login_path, inertia: {
        errors: { email: "El correo o la contraseña no son correctos." }
      }
    end
  end

  def destroy
    reset_session
    cookies.delete(:remembered_user_id)
    redirect_to login_path, notice: "La sesión se cerró correctamente."
  end
end