# ADR-0002: `@dmcrow00/ng-core` como dependencia local hasta publicarla

- Estado: Aceptada
- Fecha: 2026-10-16

## Contexto

La librería compartida de los frontends (`dmc00-ng-core`) todavía no tiene una versión publicada en GitHub Packages
(ver `dmc00-ng-core/docs/decisiones/ADR-0002`).

## Decisión

`package.json` la toma de `file:../dmc00-ng-core/dist/ng-core` con `install-links=true` en `.npmrc` (se copia en
`node_modules` y usa el Angular de esta app). El CI baja `dmc00-ng-core` en una carpeta hermana con un ref fijo
(`DMC00_NG_CORE_REF`) y la compila antes de instalar.

## Consecuencias

- En local hay que compilar ng-core antes del primer `npm install` y después de cada cambio en la librería.
- El CI necesita el secret `CROSS_REPO_PAT` con lectura sobre `Dmcrow00/dmc00-ng-core` mientras sea privado.
- Cuando exista `v0.1.0`, la dependencia pasa a `^0.1.0` desde GitHub Packages y se borra este paso del CI.
