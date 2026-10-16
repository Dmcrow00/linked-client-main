# Estados

## Ticket de soporte

En el servidor, `status: true` es abierto.

```mermaid
stateDiagram-v2
  [*] --> Pendiente: alta (status true)
  Pendiente --> Resuelto: respuesta del moderador (status false, correo al usuario)
  Resuelto --> [*]
```

## Turno

Regla del servidor: un turno Completado o Cancelado ya no cambia; entre los demás, el tatuador puede ir y volver.

```mermaid
stateDiagram-v2
  [*] --> Pendiente: el cliente reserva
  Pendiente --> Confirmada: tatuador
  Pendiente --> Rechazada: tatuador (con confirmación)
  Pendiente --> Propuesta: tatuador propone otro horario
  Rechazada --> Pendiente: tatuador restaura
  Propuesta --> Confirmada
  Confirmada --> Completada
  Pendiente --> Cancelada
  Confirmada --> Cancelada
  Completada --> [*]
  Cancelada --> [*]
```
