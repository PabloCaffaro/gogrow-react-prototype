# Prototipo frontend GoGrow

Proyecto independiente para desarrollar el prototipo frontend de GoGrow. Rails e Inertia.js entregan las páginas React, pero tanto las cuentas demo como los datos del dominio viven en memoria y no requieren una base de datos.

## Tecnologías

- Ruby 3.3.12 y Rails 7.2
- React 19 + TypeScript
- Inertia.js 3
- Vite 8
- Tailwind CSS 4 + shadcn/ui
- Docker Compose

AWS forma parte del stack objetivo de despliegue, pero no es necesario para ejecutar el prototipo local.

## Iniciar el proyecto

Requiere Docker Desktop activo.

```powershell
cd C:\Users\pablo\OneDrive\Documents\ChatGPT\PIS\gogrow-react-prototype
docker compose up --build
```

Abrir <http://localhost:3000>.

Para detener el servicio:

```powershell
docker compose down
```

## Cuentas de prueba

Todas utilizan la contraseña `demo1234`.

| Rol | Correo |
|---|---|
| Empleado | `empleado@demo.com` |
| Administrador | `admin@demo.com` |
| Proveedor | `proveedor@demo.com` |

Los botones de la pantalla de login completan automáticamente estas credenciales.

## Caso de uso implementado

1. La persona abre el login.
2. Ingresa correo y contraseña.
3. React envía el formulario a Rails mediante Inertia.
4. Rails valida el acceso contra las cuentas demo definidas en código.
5. Rails crea una sesión firmada y redirige al panel correspondiente.
6. Un usuario no puede acceder al panel de otro rol.
7. Al cerrar sesión, Rails elimina la sesión y regresa al login.
8. El flujo de recuperación valida el correo y muestra una confirmación simulada. El envío real de email queda pendiente de configurar un proveedor de correo.

## Alcance del prototipo frontend

- Las pantallas nuevas vivirán en `app/javascript`.
- Los menús, pedidos, proveedores, subsidios y pagos se representarán con datos mock de TypeScript.
- No se agregarán modelos persistidos, migraciones ni lógica de base de datos durante este prototipo.
- La autenticación demo también funciona en memoria y no requiere PostgreSQL.
- La navegación y las interacciones de las pantallas nuevas se resolverán del lado de React.

## Archivos principales

- `app/javascript/pages/auth/login.tsx`: pantalla y formulario de login.
- `app/javascript/pages/auth/forgot_password.tsx`: recuperación de contraseña.
- `app/javascript/pages/dashboard/show.tsx`: panel adaptado al rol.
- `app/controllers/sessions_controller.rb`: creación y cierre de sesiones.
- `app/controllers/dashboards_controller.rb`: autorización según rol.
- `app/models/demo_account.rb`: cuentas ficticias y roles disponibles.
- `docker-compose.yml`: Rails y Vite para desarrollo.

## Comandos útiles

Comprobar TypeScript:

```powershell
docker compose exec web npm run check
```

Ejecutar pruebas Rails:

```powershell
docker compose exec -e RAILS_ENV=test web bin/rails test
```

Ver logs:

```powershell
docker compose logs -f web
```

## Próximos pasos hacia producción

1. Configurar recuperación por email con tokens de un solo uso.
2. Definir permisos detallados dentro de cada rol.
3. Guardar secretos fuera del repositorio.
4. Ejecutar pruebas de seguridad y accesibilidad.
5. Crear la infraestructura AWS y el proceso de despliegue.

No se debe desplegar usando las cuentas o contraseñas de demostración.
