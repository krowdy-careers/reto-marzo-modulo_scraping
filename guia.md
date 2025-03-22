## Instalación

Instalar módulos

```
yarn install

```

Crear dist folder

```
yarn build

```

Opcional (para realizar build en cada cambio)

```
yarn start

```

## Cómo funciona

Se obtienen las categorías y subcategorías del DOM usando content script.

Se guardan en extension storage con propiedades como text, id, href, visited = false

Hay 1 btn para empezar a navegar
- En click visitará cada category page y cambiará su visited de false a true.
- Para pasar de página inicial a page 2, page 3, ... actualizará el url usando `?page=n`.
- Cuando termine de visitar todas las páginas de la categoria. Pasará a la siguiente categoria que tenga visited:false

- Cuando no haya más, se detendrá

Notas:
La categoría de Harinas tiene muchas páginas, por lo que se limitó a 5. Ver en popup.ts 





