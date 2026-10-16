# Documentación técnica — linked-client

## 1. Arquitectura

SPA de Angular 20 (standalone, sin NgModules) con Angular Material y Bootstrap (grilla y utilidades). Arranca en
`src/main.ts` con `bootstrapApplication(AppComponent, appConfig)`; `src/app/app.config.ts` junta los providers y
`src/app/app.routes.ts` las rutas (la reserva se carga diferida desde `aplicacion/reserva/reserva.routes.ts`).

Habla con un solo backend, `linked-server-main` (Spring Boot), por `environment.urlApi`. Todas sus respuestas vienen
envueltas en `ApiResponse` (`success`, `message`, `codigo`, `data`); los servicios las desenvuelven con `unwrap` de
`@dmcrow00/ng-core/http`:

```ts
getAllEspecialidades(): Observable<Especialidad[]> {
  return this.http.get<ApiResponse<Especialidad[]>>(this.endpoint).pipe(map(unwrap));
}
```

`unwrap` devuelve `data` o lanza un `ApiError` con el mensaje del servidor si `success` es `false`. Las únicas
llamadas que no pasan por el backend son las de geocodificación (`GeocodingService`: Nominatim y Photon).

Ver [diagramas/despliegue.md](diagramas/despliegue.md).

## 2. Módulos

| Carpeta | Qué hay |
|---|---|
| `core/` | `AvisosService` (avisos y errores) y piezas de UI comunes: `dialogo-crud`, `confirmacion`, `campo-material` |
| `services/` | Servicios HTTP por recurso (usuarios, turnos, trabajos, búsqueda…), sesión (`login.service`, `sesion.interceptor`) y el overlay de carga |
| `auth/` | Ingreso, registro, olvido y cambio de contraseña (con reCAPTCHA v2 y la contraseña cifrada con RSA) |
| `pages/` | Inicio (feed), mi perfil, páginas legales |
| `aplicacion/` | Las funciones: agenda, reserva, mis reservas, buscar tatuador, trabajos/portfolio, favoritos, soporte, usuarios, especialidades, solicitudes de tatuador |
| `guards/` | `adminGuard` y `adminModGuard` (por rol del token) |
| `components/`, `shared/` | Encabezado, navegación, pie, menú de administración, tema, overlay de carga |

### 2.1 Lo que se toma de `@dmcrow00/ng-core`

La librería compartida de los frontends del workspace (repo `dmc00-ng-core`). No trae estilos: cada pieza se ve con el
diseño de linked.

| Entrada | Para qué, en linked |
|---|---|
| `/http` | `ApiResponse`, `unwrap` y `apiErrorMessage` (el mensaje para el usuario de cualquier error) |
| `/list` | `ListStore` en especialidades y tickets: carga, error con "Reintentar", lista vacía y baja con aviso |
| `/forms` | `DynamicForm` (campos declarados con `FieldConfig`), `buildForm` y `useSaveForm` (guardando, error y modo alta/edición) en los diálogos de especialidad y de tickets |
| `/ui` | `Notifier` (lo implementa `AvisosService`) y `ConfirmService` (lo muestra `app-confirmacion`) |
| `/auth` | `authGuard` en las rutas con sesión (`LoginService` implementa `AuthState`) y `encryptRsaOaep` para la contraseña |
| `/theme` | `ThemeService`: clases `light-theme`/`dark-theme` en `body`, clave `app-theme` |

`app.config.ts` registra el renderizador de campos de Material (`CampoMaterialComponent`) para `DynamicForm`.

### 2.2 Errores y avisos

Un solo mecanismo ([ADR-0001](decisiones/ADR-0001-errores-y-avisos.md)):

- Una acción que falla avisa con `avisos.fallo(err, 'No se pudo …')`: muestra el mensaje del servidor o, si no vino
  ninguno, el de la pantalla. Un 401 no se avisa dos veces (lo hace el interceptor).
- Un formulario con `useSaveForm` muestra el error en línea (`estado.error()`), sin snackbar.
- La carga de una pantalla puede mostrar su propio estado de error (`ListStore.error()` o un mensaje fijo).
- Nada de `alert()`, diálogos de error ni errores que sólo van a la consola. Los datos de adorno (el nombre en la
  barra, los Me Gusta propios) fallan en silencio.

### 2.3 Sesión

- El token JWT vive en `sessionStorage` (`LoginService`); el rol y el id salen del token.
- `sesionInterceptor` lo agrega sólo a los pedidos al backend propio. Ante un 401 con sesión abierta cierra los
  diálogos, borra la sesión, avisa y lleva a `/login?returnUrl=…`. Un 403 no cierra la sesión: la pantalla muestra el
  motivo. Ver [diagramas/secuencias.md](diagramas/secuencias.md).
- `authGuard` (ng-core) protege las rutas que necesitan sesión; el login vuelve a `returnUrl` si es una ruta interna.
- La contraseña viaja cifrada con la clave pública del backend (`EncryptionService`, RSA-OAEP con SHA-256).

## 3. Cómo agregar un ABM

1. Servicio en `services/` (o junto a la pantalla) con `http.<verbo><ApiResponse<T>>(…).pipe(map(unwrap))`.
2. Pantalla con `ListStore` (`load`, `remove` y `messages`) y tabla de Material.
3. Diálogo de alta/edición/detalle: `FieldConfig[]`, `buildForm`, `useSaveForm` y `app-dialogo-crud` envolviendo
   `dmc-dynamic-form` (ver `especialidad-dialog.component.ts`). Al cerrar con `true`, la pantalla llama a
   `lista.saved()`.
4. Baja: `if (await confirm.ask({ …, danger: true })) await lista.remove(item)`.
5. Ruta en `app.routes.ts` con el guard que corresponda y spec del diálogo y de la pantalla.

## 4. Tests

Karma + Jasmine (`npm run test:ci`; sin Chrome, `CHROME_BIN` apuntando a un Chromium). Cubren el interceptor de
sesión, los avisos, la confirmación, el diálogo de especialidades, la pantalla de tickets (estado, filtros y baja) y
los componentes del marco (app, encabezado, navegación, pie, menú y tema).

## 5. Definición de terminado

Compila (`npm run build`) · `npm run lint` sin errores · pasan los tests (`npm run test:ci`) · el código nuevo tiene
tests · docs, diagramas y `CHANGELOG.md` actualizados en la misma rama · CI en verde.

## 6. Trampas conocidas

- **`npm install` necesita `../dmc00-ng-core/dist/ng-core` compilado** (ver la guía). `.npmrc` tiene
  `install-links=true` para que la librería se copie y no arrastre un segundo Angular.
- **Ticket abierto es `status: true`** en el servidor; responderlo lo cierra.
- **Especialidades de un tatuador**: el servidor sólo deja asignarlas a un administrador. "Mi perfil" las muestra sin
  edición; no hay todavía una pantalla de administración para asignarlas.
- **Cancelar un turno siendo cliente**: el servidor sólo deja cambiar el estado al tatuador asignado, así que "Mis
  reservas" recibe un 403 y muestra el motivo. Falta definir en el backend si el cliente puede cancelar.
- **`provideAnimationsAsync`**: el toggle de tema usa una animación (`@iconFade`); los specs que lo dibujan necesitan
  `provideNoopAnimations()`.
- **reCAPTCHA en local**: la clave del sitio es la de producción; en `localhost` Google la acepta, pero los tests no
  dibujan el login.
