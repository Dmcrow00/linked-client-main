# linked-client

Cliente web de linked: la red de tatuadores y clientes (feed de trabajos, búsqueda en el mapa, reservas de turnos,
agenda del tatuador, portfolio y soporte) y la consola de administración. Angular 20 standalone con Angular Material;
el backend es `linked-server-main`.

## Cómo correrlo

```bash
cd ../dmc00-ng-core && npm ci && npm run build && cd ../linked-client-main   # librería compartida, una vez
npm install
npm start                # http://localhost:4200, contra el backend de environment.ts (localhost:8080)
npm run lint && npm run test:ci
```

Requisitos: Node 22 y el repo `dmc00-ng-core` al lado de este (ver
[docs/guia-entorno-local-y-despliegue.md](docs/guia-entorno-local-y-despliegue.md)).

## Documentación

[docs/README.md](docs/README.md) · [CHANGELOG.md](CHANGELOG.md)
