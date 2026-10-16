# Changelog

Formato: [Keep a Changelog](https://keepachangelog.com/es-ES/1.1.0/). Versionado: [SemVer](https://semver.org/lang/es/).

## [Sin publicar]

### Agregado

- Dependencia de la librería compartida `@dmcrow00/ng-core` (hasta que se publique, se toma del build local del repo
  hermano `dmc00-ng-core` y el CI la baja con un ref fijo).
- Diálogo de confirmación con el diseño de la app para bajas y cambios de estado de turnos (antes, `confirm()` del
  navegador o un diálogo por pantalla).
- Las pantallas que necesitan sesión (perfil, soporte, agenda, reserva, mis reservas, favoritos, portfolio) llevan al
  login y, después de ingresar, se vuelve a la pantalla pedida.
- Especialidades y tickets: estados de carga con "Reintentar" y de lista vacía.
- ESLint (`npm run lint`), `npm run test:ci`, CI (lint, build y tests), workflow de seguridad (Gitleaks, Semgrep,
  npm audit) y Dependabot.
- Documentación en `docs/` (técnica, funcional, entorno, diagramas y decisiones) y este changelog.

### Cambiado

- Angular 19.2 → 20.3 con `ng update` y las migraciones oficiales: componentes standalone sin NgModules
  (`app.config.ts` y `app.routes.ts`), control flow (`@if`/`@for`), `inject()` y builders de `@angular/build`.
- reCAPTCHA: `ng-recaptcha-2` 16 (el mismo componente, compatible con Angular 20) en lugar de `ng-recaptcha-angular19`.
- Errores: un solo mecanismo. Cada pantalla avisa con un snackbar el mensaje del servidor (o uno propio si no vino) y
  los formularios lo muestran en línea; antes había diálogos de error, snackbars globales y locales a la vez (avisos
  dobles), `alert()` y errores que sólo iban a la consola.
- Sesión: un 401 cierra la sesión y lleva al login con aviso; un 403 ya no la cierra (muestra el motivo). El token se
  manda sólo al backend propio (antes iba también a Nominatim y Photon).
- Especialidades: un solo diálogo de alta, edición y detalle (antes cuatro). Tickets: el detalle sólo responde (la
  respuesta cierra el ticket en el servidor) y el alta usa el formulario común.
- El menú de administración se muestra según el rol del token, sin pedir los roles al servidor uno por uno.
- Tema claro/oscuro con el servicio de ng-core: la primera vez sigue la preferencia del sistema operativo. La elección
  guardada antes de esta versión se pierde una vez (cambió el valor guardado).
- Mi perfil (tatuador): las especialidades se muestran sin edición; las asigna un administrador.

### Arreglado

- Tickets: el estado se mostraba al revés (un ticket abierto figuraba RESUELTO), el filtro por estado no coincidía
  nunca y "Buscar" no aplicaba los filtros.
- Buscar tatuador sin sesión: el mapa usa el listado público del backend (antes fallaba y cerraba la sesión).
- Mi perfil de un tatuador: guardar fallaba entero porque intentaba asignar especialidades (sólo lo permite un
  administrador).
- La confirmación de una reserva volvía a una ruta que no existe.
- Nueva contraseña: pedía 6 caracteres y el servidor exige 8.
- Spec del título de la app y los specs que no compilaban sin módulos.

### Eliminado

- `ApiResponseInterceptor` (cada servicio desenvuelve con `unwrap`), `ErrorDialogComponent`, `ErrorHandlerService`,
  `HttpErrorInterceptor`, los cuatro diálogos de especialidades y los de baja y edición de tickets.
- Código sin uso: calendario, carrusel, confirm y dropdown genéricos, `news.service`, `reserva.service`, captcha
  propio, `auth.guard` y reCAPTCHA v3.
- Dependencias sin uso: axios, crypto-js, @ngx-translate, entities, htmlparser2, bootswatch, tree-dump, ngx-captcha,
  @types/grecaptcha y `@angular-devkit/build-angular`.
- Archivos de la carpeta `.vs/` y volcados de bash que estaban versionados.
