require "test_helper"

class UserTest < ActiveSupport::TestCase
  test "normalizes email and authenticates a valid password" do
    user = User.create!(
      email: "  EMPLEADO@DEMO.COM ",
      password: "demo1234",
      password_confirmation: "demo1234",
      role: "empleado"
    )

    assert_equal "empleado@demo.com", user.email
    assert user.authenticate("demo1234")
    assert_not user.authenticate("incorrecta")
  end

  test "rejects unsupported roles" do
    user = User.new(email: "otro@demo.com", password: "demo1234", role: "invitado")

    assert_not user.valid?
    assert user.errors[:role].present?
  end
end