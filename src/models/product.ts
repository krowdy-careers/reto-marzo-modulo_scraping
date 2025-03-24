  // Product  Model
 export interface Product {
    categoria: string;
    subcategoria: string;
    name: string;
    marca: string;
    imagenUrl: string;
    empaqueFlexible?: boolean | string;
  }