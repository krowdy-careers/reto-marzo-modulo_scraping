interface CategoryLink {
  text: string;
  href: string;
  id?: string;
  visited: boolean;

  parent_href?: string; //sin usar
  parent_text?: string; //sin usar
}


interface Producto {
  nombre: string;
  marca: string;
  imagen: string;
  categoria: string;
  subcategoria: string;
}



const BANNER_SELECTOR = '#testId-categoryBanner'
const ANCHOR_IN_BANNER_SELECTOR = '#testId-categoryBanner a'
// const SUBCATEGORY_SELECTOR = 'button[id^="testId-facetWithMiniPods-"]'
const SUBCATEGORY_SELECTOR = '#testId--desktop-container li:nth-child(1) button[id^="testId-facetWithMiniPods-"]' //#testId--desktop-container es la columna de los filtros





// intento 1. no usado -------------------------------
// const WAIT_TIME = 2000;

// const ANCHOR_IN_BREADCRUMB_SELECTOR = '#breadcrumb li a'

// const ANCHOR_GO_BACK_SELECTOR = '#breadcrumb li:nth-last-child(2) a'

// ------------------------------------------------------

export { CategoryLink, Producto, BANNER_SELECTOR, ANCHOR_IN_BANNER_SELECTOR, SUBCATEGORY_SELECTOR };