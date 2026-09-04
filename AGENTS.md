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

Rails e Inertia entregan las páginas React. El prototipo no utiliza Active Record ni una base de datos: las cuentas demo están definidas en código y los datos funcionales se mantienen en mocks TypeScript.

## Regla principal de implementación

Salvo que el usuario lo solicite explícitamente, no modificar:

- `app/controllers/`
- `app/models/`
- `config/routes.rb`
- `db/`
- autenticación, sesiones o autorización

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
- Agregar una base de datos o persistir el estado del dominio.
- Duplicar arrays mock en varias pantallas.

Por defecto, los cambios realizados por el usuario en la interfaz se mantienen solamente en estado React y se reinician al recargar. Agregar `localStorage` únicamente si el usuario lo pide.

El carrito y los nuevos pedidos viven en el dashboard del empleado. Los pagos
agrupados usan un store frontend compartido: permite informar un comprobante como
empleado y validarlo como proveedor en la misma pestaña, sin recargar. Guarda sólo
el nombre del archivo, no lo sube. Recargar restablece los escenarios de ejemplo.

## Estado actual de la interfaz

El flujo más desarrollado es el dashboard del empleado:

- Saludo y fecha.
- Resumen del beneficio mensual: 20 viandas; la semana se muestra sólo como actividad.
- Barra de progreso de viandas utilizadas.
- Selector de días.
- Filtro por proveedor.
- Listado de platos.
- Carrito con varios platos, agrupado por proveedor y fecha de entrega.
- Máximo de 20 unidades por plato (suma de variantes del mismo proveedor).
- Resumen de cantidad total de unidades y precio; edición y eliminación de líneas.
- Detalle y personalización del plato.
- Elección de cantidad y lugar de entrega.
- Revisión, confirmación y estado exitoso del pedido.
- Consulta de próximos pedidos e historial.
- Cancelación local de una vianda cuyo pedido sigue pendiente.
- Domicilios guardados desde Cuenta y domicilios de uso único al pedir.
- Deudas mensuales por proveedor: selección de uno o varios meses completos.
- Un comprobante para los meses seleccionados del mismo proveedor; pasa a
  pendiente de validación. El proveedor puede confirmarlo u observarlo.
- Pagos separados visualmente entre pendientes y pagados; gris para pendientes
  y verde para pagos confirmados. Administración usa la misma pantalla mensual.
- Perfil, beneficio asignado y preferencia de notificaciones.
- Estado vacío demostrable: el viernes 14 no tiene viandas publicadas.
- Estados `hover` para puntero y `focus-visible` para navegación con teclado.
- Navegación inferior en móvil.
- Navegación lateral en escritorio.

El inicio de sesión también fue adaptado al lenguaje visual del producto:

- Mensaje centrado en el beneficio de GoGrow, sin explicaciones didácticas del stack.
- Formulario compacto en móvil.
- Dos paneles del mismo ancho y alto desde `960px`.
- Accesos rápidos visibles para las cuentas demo de empleado, administrador y proveedor.
- El perfil demo seleccionado queda resaltado y completa las credenciales.
- El botón visual de Google usa una marca multicolor y texto neutral respecto al rol, pero no inicia sesión ni ejecuta ninguna acción en esta etapa.
- Los campos muestran borde y sombra al pasar el puntero, cursor de texto y caret oscuro explícitos.
- No mostrar en la interfaz referencias a Rails, PostgreSQL u otros detalles internos.

El dashboard del proveedor ya cuenta con navegación y flujos mock para inicio,
menús, pedidos, cobros, métricas y cuenta. El dashboard del administrador se
encuentra en su primera etapa funcional:

- Navegación entre inicio, empleados, liquidaciones, métricas y cuenta.
- Barra inferior en móvil y lateral en escritorio.
- Resumen de organización, actividad reciente y distribución por proveedor.
- Listado de empleados con filtros por excepción, aporte, deuda y nivel de consumo.
- Detalle de empleado con resumen, pedidos, saldos y configuración individual.
- Beneficio permanente y excepción temporal editable en estado React.
- Liquidaciones por proveedor sin simular programación bancaria.
- Métricas accesibles tanto desde escritorio como desde la navegación móvil.
- Marca GoGrow clickeable que vuelve al inicio principal en los tres roles.
- Contenido administrativo centralizado en mocks TypeScript, sin persistencia.

El proveedor puede editar platos mientras el menú está en borrador. También se
muestra una acción de importación desde Excel, pero no procesa todavía el
archivo. En Cobros hay filtros mock por mes y por estado: pendiente de pago,
comprobante por confirmar o confirmado. Esa sección está separada entre
**Cobros a empleados** (incluye comprobantes agrupados para revisar) y
**Cobro a GoGrow** (liquidaciones mock del aporte corporativo); no mezclar
ambos flujos ni crear persistencia para ellos.

Los pedidos del proveedor se gestionan directamente desde tarjetas con todos
sus datos: confirmar/cancelar pendientes y marcar confirmados como entregados.
No dependen de un panel lateral ni de desplazamiento automático en móvil.
No mostrar cupones ni el formulario de anticipación para recibir pedidos.
Administración no ofrece alta de empleados ni el interruptor de resumen semanal.

En móvil no deben desaparecer secciones presentes en escritorio. El proveedor
expone también Métricas en su barra inferior; el empleado mantiene Menú,
Pedidos, Pagos y Cuenta.

El antiguo laboratorio de formularios fue eliminado por completo. La ruta
`/ejemplos/formularios`, su controlador y sus componentes ya no forman parte del
prototipo y no deben recrearse salvo solicitud explícita.

Archivos principales:

- `app/javascript/features/employee/employee-dashboard.tsx`
- `app/javascript/features/employee/employee-dashboard.module.css`
- `app/javascript/features/employee/employee-views.tsx`
- `app/javascript/features/employee/employee-views.module.css`
- `app/javascript/mocks/employee-home.ts`
- `app/javascript/mocks/employee-sections.ts`
- `app/javascript/domain/employee.ts`
- `app/javascript/domain/menu.ts`
- `app/javascript/features/provider/provider-dashboard.tsx`
- `app/javascript/features/provider/provider-dashboard.module.css`
- `app/javascript/features/admin/admin-dashboard.tsx`
- `app/javascript/features/admin/admin-dashboard.module.css`
- `app/javascript/mocks/provider.ts`
- `app/javascript/mocks/admin.ts`
- `app/javascript/domain/provider.ts`
- `app/javascript/domain/admin.ts`
- `app/javascript/pages/dashboard/show.tsx`
- `app/javascript/pages/auth/login.tsx`
- `app/javascript/pages/auth/login.module.css`

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

`lib/use-prototype-navigation.ts` registra las pantallas internas mediante
`router.push` de Inertia (visitas sólo cliente, sin HTTP). Los parámetros de URL
identifican secciones y detalles; `prototypeNavigation` guarda sólo la ubicación
visual en las props del historial. El layout persistente en
`pages/dashboard/show.tsx` conserva el dashboard y su carrito al usar
Atrás/Adelante. No interceptar `popstate` ni modificar las rutas del backend.
Recargar reinicia los datos de la demostración.

## Componentes y TypeScript

- TypeScript debe continuar en modo `strict`.
- Evitar `any` y estados representados por strings sin tipo.
- Mantener los tipos del dominio separados de los componentes.
- Preferir componentes pequeños con una responsabilidad clara.
- Reutilizar los componentes existentes antes de incorporar una dependencia nueva.
- No instalar paquetes sin explicar por qué los componentes actuales o React no alcanzan.
- Mantener los textos de la interfaz en español.
- Utilizar HTML semántico, labels, estados `aria-pressed`, `aria-current` y nombres accesibles cuando correspondan.
- Documentar módulos y flujos no evidentes con comentarios breves que expliquen intención, límites del mock y decisiones de arquitectura.
- Evitar comentarios que sólo repitan la sintaxis; priorizar el motivo por el que existe cada estado, cálculo o adaptación responsive.

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

Para detener el servicio:

```powershell
docker compose down
```

Docker ya tiene configurado polling para detectar cambios desde Windows y carpetas sincronizadas con OneDrive.

## Despliegue del prototipo en Vercel

Vercel debe ejecutar este repositorio como contenedor; no debe publicar la
carpeta `public/` como si fuera un sitio estático.

- `Dockerfile` continúa siendo la configuración de Docker Compose local.
- `Dockerfile.vercel` construye la imagen de producción que detecta Vercel.
- `vercel.json` anula cualquier `Output Directory` estático configurado con
  anterioridad para que el tráfico llegue al contenedor.
- Puma obtiene el puerto de ejecución desde `PORT`, variable asignada por la
  plataforma.
- En Vercel, `Root Directory` debe apuntar a la raíz del repositorio y
  `Output Directory` debe permanecer vacío, sin un override a `public/`.
- La única variable sensible propia de la aplicación es `SECRET_KEY_BASE`.
- No agregar `DATABASE_URL`: el prototipo no utiliza una base de datos.

Los cambios en variables de entorno o en la configuración del proyecto sólo se
aplican después de generar un deployment nuevo.

## Cuentas de demostración

Todas utilizan la contraseña `demo1234`.

```text
empleado@demo.com
admin@demo.com
proveedor@demo.com
```

La pantalla de login tiene botones que completan estas credenciales.

Estos accesos deben permanecer visibles mientras el repositorio siga siendo un
prototipo compartido. Pueden presentarse de manera integrada con el diseño final,
pero no deben ocultarse o eliminarse sin una solicitud explícita.

Las cuentas se validan mediante `DemoAccount`, un objeto Ruby en memoria. La sesión firmada conserva el correo seleccionado, pero no existe persistencia de usuarios ni se necesita `DATABASE_URL`.

## Verificación obligatoria

Después de cambios frontend ejecutar:

```powershell
docker compose exec -T web npm run check
```

También ejecutar las pruebas existentes para comprobar que la integración general continúa funcionando:

```powershell
docker compose exec -T -e RAILS_ENV=test web bin/rails test
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

## Reglas de beneficio confirmadas

- El beneficio estándar es de 20 viandas por mes, no 5 por semana.
- La empresa aporta por defecto el 50%, pero cada empleado puede tener una configuración permanente diferente.
- Un beneficio temporal puede reemplazar cantidad y porcentaje entre dos fechas; al vencer vuelve la configuración permanente.
- El consumo semanal puede mostrarse sólo como desglose informativo del total mensual.
- Todos los empleados incluidos en esta etapa cuentan con beneficio; no usar estados activo/pausado para representarlo.

## Decisiones todavía provisionales

No asumir como definitivos:

- Autenticación con email y contraseña: el producto final podría usar Google.
- Comportamiento al superar las 20 viandas o agotar el cupo mensual.
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
