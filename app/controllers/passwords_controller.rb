# frozen_string_literal: true

class PasswordsController < InertiaController
  def new
    render inertia: "auth/forgot_password", props: {
      sent_to: session.delete(:recovery_email)
    }
  end

  def create
    email = params[:email].to_s.strip.downcase

    unless email.match?(URI::MailTo::EMAIL_REGEXP)
      return redirect_to forgot_password_path, inertia: {
        errors: { email: "Ingresá un correo electrónico válido." }
      }
    end

    session[:recovery_email] = email
    redirect_to forgot_password_path
  end
end