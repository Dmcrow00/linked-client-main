# ADR-0001: Un solo mecanismo de errores y avisos

- Estado: Aceptada
- Fecha: 2026-10-16

## Contexto

Convivían cuatro formas de mostrar un error: un interceptor que abría un snackbar con un texto fijo por código HTTP,
otro que ante un 401 o 403 cerraba la sesión, diálogos de error abiertos por cada pantalla y `alert()`, además de
errores que sólo iban a la consola. Un mismo error se avisaba dos veces y el mensaje del servidor se perdía.

## Decisión

- `AvisosService` (implementa `Notifier` de ng-core con el snackbar de Material) es el único que muestra avisos.
- Cada pantalla decide qué decir cuando falla su acción: `avisos.fallo(err, 'No se pudo …')` usa el mensaje del
  servidor (`apiErrorMessage`) o el de la pantalla.
- Los formularios muestran el error en línea con `useSaveForm`.
- `sesionInterceptor` sólo se ocupa de la sesión: un 401 la cierra y lleva al login; un 403 no.

## Consecuencias

- Un pedido nuevo sin `error:` no avisa nada: hay que agregarlo (el lint no lo detecta; se revisa en el PR).
- El mensaje que ve el usuario es el del servidor cuando lo hay, así que el backend tiene que mandarlo en español y
  presentable.
