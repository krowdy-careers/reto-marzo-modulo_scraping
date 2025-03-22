que probemos la ia con unas 3 paginas


prompt para deepseek: "¿Puedes devolverme este mismo archivo, agregando la columna de 'Empaque Flexible' (cuyos valores pueden ser 'SI' o 'NO' dependiendo del producto y características?"



sesion 4 min 14:16  https://huggingface.co/deepseek-ai/deepseek-vl-7b-chat , pesa demasiados GBS







en lugar de obtener los 40 y tantos de la primera categoria y luego pasar a la 2da categoria, a la 3ra categoria... (sin navegar a pag 2, pag 3, . ... de cada categoria)

visitar por paginas

el url agrega al final ? page = n 
ejemplo:
https://tottus.falabella.com.pe/tottus-pe/category/CATG14185/Azucar-y-Endulzante?page=2 





algunos tienen 10 o mas paginas por eso quiero limitarlo a 5 en esos casos

se puede obtener el textcontent del ultimo boton de navegacion, por ejemplo 6 e ir avanzando, primero ir al 2, al 3, hasta el 6 y luego seguir con siguiente categoria





scroll a elemento

  const NAVIGATION_SELECTOR = '#testId-searchResults-actionBar-bottom'
  const navigationBottomElement = document.getElementById(NAVIGATION_SELECTOR)

  if (!navigationBottomElement) {
    console.log('nav element no se encontró');
    return;
  }

  console.log('Scrolling...');
  navigationBottomElement.scrollIntoView({ behavior: 'smooth', block: 'end' });

