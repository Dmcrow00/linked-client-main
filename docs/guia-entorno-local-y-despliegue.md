# Guía de entorno local y despliegue — linked-client

## 1. Entorno local

Requisitos: Node 22 y npm. El repo `dmc00-ng-core` tiene que estar al lado de este (como en `D:\Desarrollo`), porque
`package.json` toma la librería compartida de `file:../dmc00-ng-core/dist/ng-core` mientras no esté publicada:

```bash
cd ../dmc00-ng-core && npm ci && npm run build      # una vez, y de nuevo cada vez que cambie la librería
cd ../linked-client-main
npm install
npm start                                           # http://localhost:4200
```

Después de recompilar ng-core hay que volver a correr `npm install` acá (`.npmrc` tiene `install-links=true`, que copia
la librería en `node_modules`).

El backend (`linked-server-main`) corre en `http://localhost:8080` con su perfil de desarrollo; ver su guía.

Calidad:

```bash
npm run lint
npm run test:ci          # Karma headless; sin Chrome, CHROME_BIN apuntando a un Chromium (el de Playwright anda)
npm run build            # producción, en dist/dmcoffers-client/browser
```

## 2. Variables de entorno

No hay `.env`: las URLs están en `src/environments/environment.ts` (desarrollo) y `environment.prod.ts` (producción).

| Clave | Para qué |
|---|---|
| `urlApi`, `urlHost` | Base de la API (`…/api/`) |
| `urlImg` | Base para imágenes con ruta relativa (las nuevas llegan con URL completa) |

La clave pública de reCAPTCHA v2 está en los templates de ingreso, registro y olvido de contraseña.

## 3. Publicar una versión

1. Pasar lo de "Sin publicar" del `CHANGELOG.md` a la versión nueva y subir `version` en `package.json`.
2. PR de `develop` a `main`; al mergear, tag `vX.Y.Z` (lo hace el dueño).
3. Cuando `@dmcrow00/ng-core` tenga su primera versión publicada, cambiar la dependencia `file:` por la versión y
   `DMC00_NG_CORE_REF` del CI por ese tag.

## 4. Despliegue

Sitio estático: el build de producción (`dist/dmcoffers-client/browser`) se sirve con un hosting que respete
`_redirects` (Netlify: todas las rutas van a `index.html`). Ver [diagramas/despliegue.md](diagramas/despliegue.md).
El hosting tiene que poder compilar ng-core antes (o usar la versión publicada cuando exista).

## 5. Rollback

Volver a desplegar el build del tag anterior (o el deploy anterior del hosting). El cliente no guarda datos propios:
sólo la sesión en `sessionStorage` y el tema en `localStorage`.
