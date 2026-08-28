class User < ApplicationRecord
  has_secure_password

  ROLES = %w[empleado administrador proveedor].freeze

  normalizes :email, with: ->(email) { email.strip.downcase }

  validates :email, presence: true, uniqueness: { case_sensitive: false },
                    format: { with: URI::MailTo::EMAIL_REGEXP }
  validates :role, inclusion: { in: ROLES }
end