require "test_helper"

class SessionsFlowTest < ActionDispatch::IntegrationTest
  setup do
    @user = User.create!(
      email: "empleado@demo.com",
      password: "demo1234",
      password_confirmation: "demo1234",
      role: "empleado"
    )
  end

  test "redirects unauthenticated users to login" do
    get dashboard_path("empleado")

    assert_redirected_to login_path
  end

  test "authenticates and restricts the dashboard to the user role" do
    post login_path, params: { email: @user.email, password: "demo1234", remember: false }

    assert_redirected_to dashboard_path("empleado")

    get dashboard_path("administrador")
    assert_redirected_to dashboard_path("empleado")
  end

  test "rejects invalid credentials" do
    post login_path, params: { email: @user.email, password: "incorrecta" }

    assert_redirected_to login_path
  end

  test "closes the session" do
    post login_path, params: { email: @user.email, password: "demo1234" }
    delete logout_path

    assert_redirected_to login_path
    get dashboard_path("empleado")
    assert_redirected_to login_path
  end
end