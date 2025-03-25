
// Obtiene los items de la página
// Necesita scrollear para obtener la imagen correctamente //PENDIENTE

const getItems = () => {

    //products selectors:
    const PRODUCT_SELECTOR = '#testId-searchResults-products>*'

    const CATEGORIA_SELECTOR = '#breadcrumb li:nth-last-child(2) a' //el anchor del penultimo li de breadcrumbs
    const SUBCATEGORIA_SELECTOR = '#breadcrumb li:last-child' //ultimo item de breadcrumbs (no es un link, solo texto)
    const NOMBRE_SELECTOR = '.pod-subTitle'
    const MARCA_SELECTOR = '.pod-title'
    const IMAGEN_SELECTOR = 'picture img' // src (mide 240x240)


    // Obtenemos categoría y subcategoría duera del mapping de items
    // Si no, se estarian obteniendo multiples veces, cuando no lo necesitan
    const categoria =
        (document.querySelector(CATEGORIA_SELECTOR) as HTMLElement)?.innerText?.trim() || 'Sin categoría';
    const subcategoria =
        (document.querySelector(SUBCATEGORIA_SELECTOR) as HTMLElement)?.innerText?.trim() || 'Sin subcategoría';


    let items = [...document.querySelectorAll(PRODUCT_SELECTOR)].map((el) => {
        const nombre = (el.querySelector(NOMBRE_SELECTOR) as HTMLElement)?.innerText?.trim() || 'Sin nombre';
        const marca = (el.querySelector(MARCA_SELECTOR) as HTMLElement)?.innerText?.trim() || 'Sin marca';
        const imagen = (el.querySelector(IMAGEN_SELECTOR) as HTMLImageElement)?.src || 'Sin imagen src';


        return { nombre, marca, imagen, categoria, subcategoria };
    });

    return items

}


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



// 4. ENTREGA DE DATOS. Descarga en .csv un storage object.
// Necesita el nombre del objeto y el nombre para el futuro archivo

// Podria crearse una funcion que acepte array de uno o más objetos. Y que los fusione en 1 (solo si tienen los mismos props)

async function downloadStorageData(storageKey: string, fileName: string) {
    chrome.storage.local.get([storageKey], (data) => {
        let items = data[storageKey];

        if (!items || !Array.isArray(items) || items.length === 0) {
            console.error(`No hay datos en ${storageKey} para exportar`);
            return;
        }

        let csvContent = '\uFEFF'; // para permitir caracteres especiales (tildes, ñ)
        let DELIMITER = ';'  // ,t es para tab separated     , es para csv

        let headers = Object.keys(items[0]).join(DELIMITER) + '\n';
        csvContent += headers;

        //cada item de items sera una fila, usando el delimitador (;)
        let rows = items.map(item =>
            Object.values(item).map(value =>
                typeof value === 'object' ? `'${JSON.stringify(value)}'` : `'${value}'`
            ).join(DELIMITER)
        ).join('\n');

        //agregar los rows al contenido csv
        csvContent += rows;

        let blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        let url = URL.createObjectURL(blob);

        chrome.downloads.download({
            url: url,
            filename: `${fileName}.csv`
        });

        //ocupa la url por 3s antes de liberarlo
        setTimeout(() => URL.revokeObjectURL(url), 3000);
    });
}


export { getItems, downloadStorageData, scrollToNavBottom } 