# Documentación funcional — linked-client

Qué puede hacer cada usuario en la web de linked. Las reglas que valida el servidor están en
`linked-server-main/docs/documentacion-funcional.md`.

## 1. Actores

| Actor | Qué hace |
|---|---|
| Visitante (sin sesión) | Ve el feed y el mapa de tatuadores, los perfiles públicos y las páginas legales; se registra; manda tickets de soporte con un correo de contacto |
| Cliente | Reserva turnos, ve y sigue sus reservas, guarda trabajos favoritos (Me Gusta), manda tickets |
| Tatuador | Lo del cliente más su agenda (horario habitual y turnos), su portfolio (subir trabajos, sincronizar Instagram) y sus datos profesionales |
| Moderador | Gestiona tickets de soporte y especialidades |
| Administrador | Lo del moderador más usuarios y roles y las solicitudes para ser tatuador |

## 2. Casos de uso

### Reservar un turno
Cliente con sesión: elige un tatuador (listado o mapa), un día con horarios libres, un horario, describe el tatuaje y
sube al menos una imagen de referencia. El turno queda **Pendiente** hasta que el tatuador lo gestione.

### Gestionar la agenda (tatuador)
Define su horario habitual por día y ve sus turnos: los confirma, rechaza (con confirmación), restaura a Pendiente o
edita fecha y hora. Un turno Completado o Cancelado ya no cambia.

### Soporte
Cualquiera manda un ticket (categoría, descripción y captura opcional de hasta 1,5 MB; sin sesión, también un correo).
El moderador o administrador lo ve en "Tickets de soporte", filtra por usuario, fecha y estado, y lo responde: la
respuesta le llega al usuario por correo y el ticket queda **resuelto**. También puede borrarlo (con confirmación).

### Especialidades (moderador o administrador)
Alta, edición, detalle y baja (con confirmación) de los estilos de tatuaje.

### Solicitudes de tatuador (administrador)
Quien se registra como tatuador queda pendiente de aprobación; el administrador aprueba o rechaza la solicitud.

## 3. Reglas de negocio

- Sin sesión, las pantallas que la necesitan llevan al login y después vuelven a la pantalla pedida.
- La sesión vencida se avisa y lleva al login; una acción no permitida muestra el motivo sin cerrar la sesión.
- Las especialidades de un tatuador las asigna un administrador (en "Mi perfil" se ven, no se editan).
- Contraseña al registrarse: 8 o más caracteres con mayúscula, minúscula y número.

## 4. Estados

Ticket: abierto (**PENDIENTE**) → respondido (**RESUELTO**). Turno: Pendiente, Confirmada, Rechazada, Propuesta,
Completada y Cancelada. Ver [diagramas/estados.md](diagramas/estados.md).

## 5. Glosario

| Término | Significado |
|---|---|
| Trabajo | Publicación del portfolio de un tatuador (una o más fotos y una descripción) |
| Me Gusta / favorito | Trabajo que un cliente marcó; aparece en "Mis favoritos" |
| Turno | Pedido de sesión de un cliente a un tatuador |
| Ticket | Consulta o reclamo de soporte |
