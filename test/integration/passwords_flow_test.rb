require "test_helper"

class PasswordsFlowTest < ActionDispatch::IntegrationTest
  test "accepts a valid recovery email" do
    post forgot_password_path, params: { email: "persona@demo.com" }

    assert_redirected_to forgot_password_path
    follow_redirect!
    assert_response :success
  end

  test "rejects an invalid recovery email" do
    post forgot_password_path, params: { email: "correo-invalido" }

    assert_redirected_to forgot_password_path
  end
end