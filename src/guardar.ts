// en lugar de obtener los 40 y tantos de la primera categoria y luego pasar a la 2da categoria, a la 3ra categoria... (sin navegar a pag 2, pag 3, . ... de cada categoria)

// quiero agregar la logica de AVANZAR DE PAGINA(primero ir page 1, luego a page 2 y AbortSignal, hasta page 5 como maximo) en cada categoria antes de pasar a la siguiente categoria

// el url agrega al final ? page = n 
// ejemplo:
// https://tottus.falabella.com.pe/tottus-pe/category/CATG14185/Azucar-y-Endulzante?page=2 


// algunos tienen 10 o mas paginas por eso quiero limitarlo a 5 en esos casos

// se puede obtener el textcontent del ultimo boton de navegacion, por ejemplo 6 e ir avanzando, primero ir al 2, al 3, hasta el 6 y luego seguir con siguiente categoria

// Ademas quiero hacer scrolltonavbottom justo antes de usar getItems() que está en mi utils scripts

function scrollToNavBottom() {
  //obtenemos el navigation que esta abajo de los productos
  const NAVIGATION_SELECTOR = '#testId-searchResults-actionBar-bottom'
  const navigationBottomElement = document.getElementById(NAVIGATION_SELECTOR)

  if (!navigationBottomElement) {
    console.log('nav element no se encontró');
    return;
  }

  console.log('Scrolling...');
  navigationBottomElement.scrollIntoView({ behavior: 'smooth', block: 'end' });

}

function getNumberOfPagesInDOM() {
  const NAVIGATION_SELECTOR = 'testId-searchResults-actionBar-bottom';
  const navigationBottomElement = document.getElementById(NAVIGATION_SELECTOR);
  if (!navigationBottomElement) return 1;

  let lastPage = navigationBottomElement.querySelector('li:last-child')?.textContent;
  return lastPage ? parseInt(lastPage) || 1 : 1;
}

