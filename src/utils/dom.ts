import { sleep } from './helperFunctions';
import { ANCHOR_IN_BANNER_SELECTOR, BANNER_SELECTOR, CategoryLink, SUBCATEGORY_SELECTOR } from './interfaces';




//

/* 

SE AUTO EJECUTA CADA VEZ QUE CADA PÁGINA CADA, LLAMADO EN CONTENT SCRIPT

Se obtiene del storage 'now_categories', 'now_subcategories'

Se añaden nuevas categorías (obtenidas del banner_selector)
Sin eliminar las anteriores (si la categoría ya existe, no se agregará -> no duplicados, no reemplazos) 

Se obtienen las subcategorías del sidebar (obtenidas con el subcategories_selector).
Se obtiene subcategorias SOLO si no hay categories en el DOM actual (revisa si banner existe o no)
Misma validación para evitar duplicados y reemplazos

*/

async function extractData() {
  console.log('NEW URL, NEW DATA EXTRACTION')

  // Obteniendo del DOM
  const categories = getCategoriesFromBanner();
  let subcategories: CategoryLink[] = []

  const banner = document.querySelector(BANNER_SELECTOR)
  // solo obtener subcategories si el banner no existe = si no hay categories en el DOM actual
  if (!banner) {
    subcategories = getSubcategories();
  }

  // Este es el modo simple:
  // const categories = getCategoriesFromBanner();
  // const subcategories = getSubcategories();


  // Obteniendo del extension storage
  const data = await chrome.storage.local.get(['now_categories', 'now_subcategories'])

  let storedCategories = data.now_categories || [];
  let storedSubcategories = data.now_subcategories || [];

  // Añade nuevas categorías sin sobrescribir las anteriores
  categories.forEach((cat: CategoryLink) => {
    if (!storedCategories.some((c: CategoryLink) => c.text === cat.text)) {
      storedCategories.push(cat);
    }
  });

  // Añade nuevas subcategorías sin sobrescribir las anteriores
  if (subcategories && subcategories.length > 0) {
    subcategories.forEach((sub: CategoryLink) => {
      if (!storedSubcategories.some((s: CategoryLink) => s.text === sub.text)) {
        storedSubcategories.push(sub);
      }
    });
  }

  // Guarda ambos en el extension storage
  // .update no existe, por eso siempre es .set
  chrome.storage.local.set({ now_categories: storedCategories, now_subcategories: storedSubcategories }, () => {
    console.log('datos guardados en storage');
  });



};




function getNumberOfProducts() {
  const PRODUCT_SELECTOR = '#testId-searchResults-products>*'
  const productsQuantity = document.querySelectorAll(PRODUCT_SELECTOR).length;

  return productsQuantity;
};


// Función para obtener subcategorías desde los botones. y pintarlas de 'pink'
function getSubcategories() {
  console.log('buscando subcategorías...');

  const buttonsSubCats = document.querySelectorAll(SUBCATEGORY_SELECTOR);

  if (buttonsSubCats) {
    buttonsSubCats.forEach(btn => {
      (btn as HTMLElement).style.background = 'pink'
    })
  }

  let buttonsArray: CategoryLink[] = [];
  buttonsSubCats.forEach(btn => {
    const text = btn.textContent?.trim() || '';
    const id = btn.id || 'no-id';
    buttonsArray.push({
      text,
      href: '',
      id,
      visited: false
    });

  });

  return buttonsArray;
};



function getCategoriesFromBanner() {
  console.log('buscando categorías en el banner...');

  const categories: CategoryLink[] = [];
  document.querySelectorAll(ANCHOR_IN_BANNER_SELECTOR).forEach((link, index) => {
    (link as HTMLElement).style.color = 'pink'
    categories.push({
      text: link.textContent ? link.textContent.trim() : '',
      href: (link as HTMLAnchorElement).href || '',
      id: link.getAttribute('id') || `cat-${index}`,
      visited: false,

      parent_href: '',
      parent_text: '',
    });
  });

  return categories;
};














export { extractData, getCategoriesFromBanner, getSubcategories, getNumberOfProducts }