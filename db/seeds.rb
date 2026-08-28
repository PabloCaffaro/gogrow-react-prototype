users = [
  { email: "empleado@demo.com", role: "empleado" },
  { email: "admin@demo.com", role: "administrador" },
  { email: "proveedor@demo.com", role: "proveedor" }
]

users.each do |attributes|
  user = User.find_or_initialize_by(email: attributes[:email])
  user.assign_attributes(attributes.merge(password: "demo1234", password_confirmation: "demo1234", active: true))
  user.save!
end

puts "Cuentas de demostración creadas: #{User.where(email: users.pluck(:email)).count}"