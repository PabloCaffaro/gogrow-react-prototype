require "test_helper"

class DemoAccountTest < ActiveSupport::TestCase
  test "normalizes email and authenticates a demo account" do
    account = DemoAccount.authenticate(
      email: "  EMPLEADO@DEMO.COM ",
      password: "demo1234"
    )

    assert_equal "empleado@demo.com", account.email
    assert_equal "empleado", account.role
  end

  test "rejects an incorrect password or unknown account" do
    assert_nil DemoAccount.authenticate(email: "empleado@demo.com", password: "incorrecta")
    assert_nil DemoAccount.authenticate(email: "otro@demo.com", password: "demo1234")
  end

  test "exposes one account for every prototype role" do
    expected_roles = %w[administrador empleado proveedor]
    actual_roles = DemoAccount::ACCOUNT_DATA.values.pluck(:role).sort

    assert_equal expected_roles, actual_roles
  end
end
