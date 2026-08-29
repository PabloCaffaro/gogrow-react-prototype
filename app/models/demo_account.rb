# frozen_string_literal: true

# Representa una identidad ficticia del prototipo sin Active Record ni una base.
# Las contraseñas son públicas y sólo sirven para navegar los tres roles demo.
class DemoAccount
  ACCOUNT_DATA = {
    "empleado@demo.com" => { id: 1, password: "demo1234", role: "empleado" },
    "admin@demo.com" => { id: 2, password: "demo1234", role: "administrador" },
    "proveedor@demo.com" => { id: 3, password: "demo1234", role: "proveedor" }
  }.freeze

  attr_reader :id, :email, :role

  def self.find(email)
    normalized_email = email.to_s.strip.downcase
    attributes = ACCOUNT_DATA[normalized_email]
    new(email: normalized_email, **attributes.except(:password)) if attributes
  end

  def self.authenticate(email:, password:)
    normalized_email = email.to_s.strip.downcase
    attributes = ACCOUNT_DATA[normalized_email]
    return unless attributes
    return unless ActiveSupport::SecurityUtils.secure_compare(attributes[:password], password.to_s)

    new(email: normalized_email, **attributes.except(:password))
  end

  def initialize(id:, email:, role:)
    @id = id
    @email = email
    @role = role
  end

  # Inertia sólo recibe identidad y rol; la contraseña nunca sale del servidor.
  def as_json(*)
    { id: id, email: email, role: role }
  end
end
