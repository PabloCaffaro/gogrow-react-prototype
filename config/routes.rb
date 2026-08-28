Rails.application.routes.draw do
  get "up" => "rails/health#show", as: :rails_health_check
  get "service-worker" => "rails/pwa#service_worker", as: :pwa_service_worker
  get "manifest" => "rails/pwa#manifest", as: :pwa_manifest

  root "sessions#new"
  get "login", to: "sessions#new", as: :login
  post "login", to: "sessions#create"
  delete "logout", to: "sessions#destroy", as: :logout
  get "recuperar-contrasena", to: "passwords#new", as: :forgot_password
  post "recuperar-contrasena", to: "passwords#create"
  get "ejemplos/formularios", to: "examples#forms", as: :examples_forms
  get "panel/:role", to: "dashboards#show", as: :dashboard,
      constraints: { role: /empleado|administrador|proveedor/ }
end
