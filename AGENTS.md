# AGENTS.md

## Propósito de este repositorio

Este repositorio contiene un prototipo frontend mobile-first para la futura aplicación de gestión de viandas de GoGrow.

El producto busca centralizar en una web app los menús, pedidos, subsidios, consumos y pagos que hoy se gestionan mediante proveedores y canales diferentes. Existen tres perfiles principales:

- Empleado: consulta menús, realiza pedidos y revisa consumos y pagos.
- Proveedor: publica menús y consulta pedidos, producción y cobros.
- Administrador / RR. HH.: consulta uso del beneficio, empleados, pagos y métricas.

El objetivo actual no es construir el producto completo. Se busca validar la navegabilidad, las pantallas y el uso de React dentro del stack previsto para el proyecto.

## Alcance técnico actual

El repositorio contiene un entorno completo ya configurado:

- Docker Compose.
- Ruby 3.3.12 y Rails 7.2.
- Inertia.js 3.
- React 19 y TypeScript estricto.
- Vite 8.
- Tailwind CSS 4 y componentes inspirados en shadcn/ui.
- PostgreSQL 16.

Rails, Inertia y PostgreSQL son infraestructura preexistente. Durante la etapa de prototipado, las funcionalidades nuevas del dominio deben implementarse exclusivamente en frontend.

## Regla principal de implementación

Salvo que el usuario lo solicite explícitamente, no modificar:

- `app/controllers/`
- `app/models/`
- `config/routes.rb`
- `db/`
- autenticación, sesiones o autorización
- esquema o contenido de PostgreSQL

Las pantallas y comportamientos nuevos deben vivir en `app/javascript/` y utilizar datos mock de TypeScript.

El backend existente puede entregar el rol y correo del usuario autenticado mediante Inertia. No debe recibir menús, pedidos, pagos u otra lógica nueva del prototipo.

## Persistencia y datos simulados

Los datos del dominio son deliberadamente ficticios. Deben centralizarse, no escribirse directamente dentro de los componentes visuales.

Organización esperada:

```text
app/javascript/
├── domain/       # Tipos e interfaces del dominio
├── mocks/        # Datos ficticios y escenarios de demostración
├── services/     # Adaptadores mock si se simulan operaciones asíncronas
├── features/     # Pantallas y componentes organizados por rol o flujo
├── components/   # Componentes compartidos
├── pages/        # Puntos de entrada de Inertia
└── lib/          # Utilidades genéricas
```

Preferir este flujo de dependencias:

```text
Componente React → servicio o hook frontend → mock TypeScript
```

Evitar:

- Llamadas HTTP ficticias a endpoints que no existen.
- Datos de menús o pedidos dentro de controladores Rails.
- Migraciones para funcionalidades del prototipo.
- Guardar el estado del dominio en PostgreSQL.
- Duplicar arrays mock en varias pantallas.

Por defecto, los cambios realizados por el usuario en la interfaz se mantienen solamente en estado React y se reinician al recargar. Agregar `localStorage` únicamente si el usuario lo pide.

## Estado actual de la interfaz

El flujo más desarrollado es el dashboard del empleado:

- Saludo y fecha.
- Resumen del beneficio semanal.
- Barra de progreso de viandas utilizadas.
- Selector de días.
- Filtro por proveedor.
- Listado de platos.
- Selección y deselección de un plato.
- Resumen del plato seleccionado.
- Navegación inferior en móvil.
- Navegación lateral en escritorio.

Archivos principales:

- `app/javascript/features/employee/employee-dashboard.tsx`
- `app/javascript/features/employee/employee-dashboard.module.css`
- `app/javascript/mocks/employee-home.ts`
- `app/javascript/domain/menu.ts`
- `app/javascript/pages/dashboard/show.tsx`

Los dashboards de proveedor y administrador todavía conservan el contenido genérico del proyecto base.

## Diseño responsive

La interfaz debe ser mobile-first. La referencia visual original utiliza:

- Fondo blanco y superficies gris claro.
- Tipografía negra con jerarquía compacta.
- Tarjetas con bordes suaves y poco relieve.
- Selectores de días rectangulares.
- Control segmentado para proveedores.
- Botones circulares para acciones secundarias.
- Navegación inferior flotante en teléfono.

La versión de escritorio debe conservar el mismo lenguaje visual, pero aprovechar el espacio disponible. No se debe ampliar mecánicamente la pantalla móvil.

Comportamiento actual:

- Menos de `900px`: una columna, navegación inferior fija y contenido optimizado para teléfono.
- Desde `900px`: barra lateral, encabezado de escritorio, grilla de platos y panel lateral de resumen.

Al agregar una pantalla:

1. Diseñarla primero para un ancho cercano a `390px`.
2. Confirmar que funciona desde `320px` sin desborde horizontal.
3. Crear una adaptación deliberada para escritorio.
4. Revisar al menos un viewport de escritorio cercano a `1440 × 900`.
5. Evitar alturas fijas que corten contenido.

## Navegación

La autenticación y las rutas de nivel superior ya existen. No agregar rutas Rails para las pantallas internas del prototipo sin autorización explícita.

Para subpantallas y flujos de demostración, utilizar estado React tipado. Por ejemplo:

```ts
type EmployeeView = 'menu' | 'dish-detail' | 'checkout' | 'orders'
```

Mantener cada flujo dentro del frontend del rol correspondiente. La migración futura a navegación Inertia real debe poder hacerse sin reescribir los componentes visuales.

## Componentes y TypeScript

- TypeScript debe continuar en modo `strict`.
- Evitar `any` y estados representados por strings sin tipo.
- Mantener los tipos del dominio separados de los componentes.
- Preferir componentes pequeños con una responsabilidad clara.
- Reutilizar los componentes existentes antes de incorporar una dependencia nueva.
- No instalar paquetes sin explicar por qué los componentes actuales o React no alcanzan.
- Mantener los textos de la interfaz en español.
- Utilizar HTML semántico, labels, estados `aria-pressed`, `aria-current` y nombres accesibles cuando correspondan.

## Ejecución local

Requisito: Docker Desktop activo.

Desde la raíz del repositorio:

```powershell
docker compose up --build
```

Abrir:

```text
http://localhost:3000
```

Para detener sin borrar la base local:

```powershell
docker compose down
```

No ejecutar `docker compose down -v` salvo que el usuario pida explícitamente borrar los volúmenes y los datos locales.

Docker ya tiene configurado polling para detectar cambios desde Windows y carpetas sincronizadas con OneDrive.

## Cuentas de demostración

Todas utilizan la contraseña `demo1234`.

```text
empleado@demo.com
admin@demo.com
proveedor@demo.com
```

La pantalla de login tiene botones que completan estas credenciales.

PostgreSQL se utiliza actualmente para estas cuentas, la autenticación y las pruebas relacionadas. Los datos de viandas siguen siendo mocks frontend.

## Verificación obligatoria

Después de cambios frontend ejecutar:

```powershell
docker compose exec -T web npm run check
```

También ejecutar las pruebas existentes para comprobar que la integración general continúa funcionando:

```powershell
docker compose exec -T -e RAILS_ENV=test -e DATABASE_URL=postgresql://postgres:postgres@db/gogrow_react_prototype_test web bin/rails test
```

Para cambios visuales:

- Revisar móvil y escritorio en un navegador real.
- Verificar que no exista desborde horizontal.
- Probar filtros, selección, estados vacíos y navegación afectada.
- Revisar la consola del navegador.
- No considerar terminada una pantalla solamente porque TypeScript compile.

## Criterio de finalización de una etapa

Una etapa se considera completa cuando:

- Tiene un flujo demostrable de principio a fin.
- Usa mocks centralizados y tipos explícitos.
- Funciona en móvil y escritorio.
- No modifica backend fuera del alcance autorizado.
- TypeScript compila.
- Las pruebas existentes pasan.
- El working tree no contiene cambios ajenos o archivos generados accidentalmente.
- El commit describe una unidad funcional concreta.

## Git y secretos

- Rama principal: `main`.
- Remoto: `https://github.com/PabloCaffaro/gogrow-react-prototype.git`.
- No reescribir historial ni hacer force push salvo instrucción explícita.
- No borrar cambios locales que pertenezcan al usuario.
- `config/master.key` debe permanecer ignorado.
- No versionar contraseñas reales, tokens, `.env` locales ni credenciales externas.
- Las cuentas `@demo.com` y su contraseña existen solamente para el prototipo local.

## Decisiones todavía provisionales

No asumir como definitivos:

- Autenticación con email y contraseña: el producto final podría usar Google.
- Reglas exactas del subsidio semanal y mensual.
- Stock real por proveedor.
- Importación de menús desde Excel.
- Validación de comprobantes.
- Notificaciones por WhatsApp.
- Reseñas y funcionalidades de IA.

Representar estas funciones con placeholders o mocks únicamente cuando formen parte de la etapa solicitada. No inventar reglas de negocio permanentes.

## Prioridad para futuros agentes

Ante una nueva solicitud:

1. Confirmar qué rol y flujo se está desarrollando.
2. Revisar los componentes y mocks existentes antes de crear otros.
3. Mantener la implementación dentro de `app/javascript/`.
4. Construir primero la experiencia móvil.
5. Adaptarla luego a escritorio.
6. Verificar comportamiento, accesibilidad y responsive.
7. Informar con claridad qué es funcional, qué es mock y qué quedó fuera.

Las instrucciones directas del usuario tienen prioridad sobre este archivo. Si una solicitud requiere modificar backend, persistencia o infraestructura, señalar el cambio de alcance antes de implementarlo.
