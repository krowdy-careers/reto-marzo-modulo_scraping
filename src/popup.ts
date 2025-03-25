import { getPortActiveTab, sleep } from './utils/helperFunctions'
import { CategoryLink, Producto } from './utils/interfaces'
import { getProductCode } from './utils/openai'
import { downloadStorageData, getItems } from './utils/tottus'


(() => {



    // Click en btn (popup) limpia el storage y luego recarga (el anidado ayuda a que primero limpie y luego actualize el url)
    // Separado en dos botones por un mejor UX

    const clearStorageBtn = document.getElementById('clear-storage-btn')

    if (clearStorageBtn) {
        clearStorageBtn.addEventListener('click', async () => {

            chrome.storage.local.clear(() => {
                console.log('Storage borrado');

                /*  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                     if (tabs[0]?.id) {
                         // chrome.tabs.reload(tabs[0].id);
                         //ir directo a despensa, en lugar de reload:
                         chrome.tabs.update(tabs[0].id, { url: 'https://tottus.falabella.com.pe/tottus-pe/category/cat13380487/Despensa' });
                     }
                 }); */

            });
        });
    }


    const goToDespensaBtn = document.getElementById('go-to-despensa-btn')

    if (goToDespensaBtn) {
        // goToDespensaBtn.addEventListener('click', async () => {

        //     chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        //         if (tabs[0]?.id) {
        //             chrome.tabs.update(tabs[0].id, { url: 'https://tottus.falabella.com.pe/tottus-pe/category/cat13380487/Despensa' });
        //         }
        //     });

        // });
        goToDespensaBtn.addEventListener('click', async () => {
            chrome.tabs.create({
                url: 'https://tottus.falabella.com.pe/tottus-pe/category/cat13380487/Despensa'
            });
        });
    }


    function retornarADespensa() {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0]?.id) {
                chrome.tabs.update(tabs[0].id, { url: 'https://tottus.falabella.com.pe/tottus-pe/category/cat13380487/Despensa' });
            }
        });
    }


    // Tabla de popup----------------------------------------------------------------------

    const tableBody = document.getElementById('tableBody')
    const nItemsElement = document.getElementById('nItems')

    //inicia buscando si hay items para actualizar la tabla
    chrome.storage.local.get(['items'], (data) => {

        let items = data.items;

        if (!items || !Array.isArray(items) || items.length === 0) {
            console.error('no hay items en extension storage');
            return;
        } else {
            updateTable(items)
        }
    })

    //actualizara la tabla (en popup) cada vez que items cambie
    chrome.storage.onChanged.addListener((changes, namespace) => {
        if (namespace === 'local' && changes.items) {
            ;
            updateTable(changes.items.newValue || []);
        }
    });

    //actualiza tabla con los rows extraidos
    function updateTable(items: Producto[]) {
        if (!tableBody) return;
        // alert('actualizando tabla')
        tableBody.innerHTML = '';

        items.forEach((item: Producto) => {
            addRow(item);
        });
        if (nItemsElement) {
            nItemsElement.textContent = items.length.toString()
        }

    };



    function addRow(product: Producto) {
        console.log(product)
        const tableBody = document.getElementById('tableBody')
        const newRow = document.createElement('tr')

        // creando las celdas para cada prop del producto:
        const nombreCell = document.createElement('td')
        nombreCell.textContent = product.nombre

        const marcaCell = document.createElement('td')
        marcaCell.textContent = product.marca

        const imagenCell = document.createElement('td')
        const imgElement = document.createElement('img')
        imgElement.src = product.imagen
        imgElement.alt = product.nombre
        imgElement.style.width = '50px'
        imagenCell.appendChild(imgElement)

        const categoriaCell = document.createElement('td')
        categoriaCell.textContent = product.categoria

        const subcategoriaCell = document.createElement('td')
        subcategoriaCell.textContent = product.subcategoria

        // agregar todas las celdas a la fila:
        newRow.appendChild(nombreCell)
        newRow.appendChild(marcaCell)
        newRow.appendChild(imagenCell)
        newRow.appendChild(categoriaCell)
        newRow.appendChild(subcategoriaCell)

        // agrega la fila al cuerpo de la tabla:
        tableBody?.appendChild(newRow)
    }



    // Scraping de productos en una sola página, 2 pasos, descarga de .csv disponible---------------------------------------------------------------

    //paso 1
    let btnScrapingTab = document.getElementById('btn-scraping-tab')

    if (btnScrapingTab) {
        btnScrapingTab.addEventListener('click',
            async () => {
                const portTab = await getPortActiveTab()
                portTab?.onMessage.addListener(async ({ success, message, data }: { success: boolean; message: string; data: any }) => {
                    if (!success) return
                    alert('Items obtenidos')
                });

                portTab?.postMessage({ cmd: 'getItems' });
            })
    }

    //paso 2
    let btnScrapingBg = document.getElementById('btn-scraping-background')
    if (btnScrapingBg) {
        btnScrapingBg.addEventListener('click',
            async () => {
                const portBackground = chrome.runtime.connect({ name: 'background' });
                portBackground.postMessage({ cmd: 'getItems' });
            })
    }



    // en click a btn descarga items en .csv (pero separado por ;)-----------------------------
    document.getElementById('btn-download')?.addEventListener('click', () => {
        downloadStorageData('items', 'items-en-csv');
    });












    // 1. EXTRACCIÓN DE DATOS----------------------------------------------------------

    const altBtnNavigate = document.getElementById('alt-btn-navigate');

    altBtnNavigate?.addEventListener('click', async () => {

        const storedData = await chrome.storage.local.get(['now_categories', 'now_products']);
        let categories: CategoryLink[] = storedData.now_categories || [];
        let allProducts: Producto[] = storedData.now_products || [];

        if (!categories.length) {
            alert('no hay categorias en storage');
            return;
        }

        // Filter only unvisited categories
        let unvisitedCategories = categories.filter(cat => !cat.visited);

        if (!unvisitedCategories.length) {
            alert('todas las cats tienen visited:true');
            return;
        }

        // Get active tab. sesion 3. min 01:22:00
        const [tab] = await chrome.tabs.query({ active: true });
        if (!tab.id) {
            alert('no hay pestaña activa')
            return
        }

        // Visita cada categoria de visited:false
        // for (let i = 0; i < unvisitedCategories.length; i++) {
        for (let category of unvisitedCategories) {
            // let category = unvisitedCategories[i];

            console.log(`visitando: ${category.href}`);
            await chrome.tabs.update(tab.id, { url: category.href });

            // la categoria se marcara como visited true despuesde recorrer sus paginas 1,2,3... 

            //Espera a que cargue por 3s
            await sleep(3)

            // Obtener el número de páginas en la categoría
            let totalPages = await getNumberOfPages(tab.id);
            let numberOfPagesToUse = Math.min(totalPages, 5); // elige el numero menos, total pages o 5

            console.log(`categoría tiene ${totalPages} páginas. usar ${numberOfPagesToUse}.`);

            // Recorrer hasta la página máxima permitida
            for (let page = 1; page <= numberOfPagesToUse; page++) {
                let pageUrl = `${category.href}?page=${page}`;
                console.log(`hacia: ${pageUrl}`);


                await chrome.tabs.update(tab.id, { url: pageUrl });

                // Esperar a que cargue la nueva página antes de hacer scroll
                await sleep(2);

                await executeScroll(tab.id);
                await sleep(4); //PENDIENTE, con 2s aparecieron muchos 'sin img src', con 4 segundos igual


                // Obtener productos de la página actual
                const productsOnPage: Producto[] = await altGetProductsFromPage(tab.id);

                if (productsOnPage.length) {
                    allProducts.push(...productsOnPage);
                    await chrome.storage.local.set({ now_products: allProducts });
                    console.log(`guardados ${productsOnPage.length} productos de page ${page} de cat ${category.text}`);
                }

                // Pequeña espera antes de cambiar de página
                await sleep(1);
            }

            // Marcar categoría como visitada
            category.visited = true;
            await chrome.storage.local.set({ now_categories: categories });

            console.log(`cat completada: ${category.text}`);
        }

        console.log('cats completadas');
        retornarADespensa()
    });



    async function executeScroll(tabId: number) {
        return new Promise((resolve) => {
            chrome.scripting.executeScript({
                target: { tabId },
                func: () => {
                    const NAVIGATION_SELECTOR = '#testId-searchResults-actionBar-bottom';
                    const navElement = document.querySelector(NAVIGATION_SELECTOR);
                    if (navElement) {
                        console.log('Scrolling a navigation el');
                        navElement.scrollIntoView({ behavior: 'smooth', block: 'end' });
                    } else {
                        console.log('no navigation el.');
                    }
                },
            }, resolve);
        });
    }
    async function getNumberOfPages(tabId: number): Promise<number> {
        return new Promise((resolve) => {
            chrome.scripting.executeScript({
                target: { tabId },
                func: () => {
                    const NAVIGATION_SELECTOR = 'testId-searchResults-actionBar-bottom';
                    const navigationBottomElement = document.getElementById(NAVIGATION_SELECTOR);
                    if (!navigationBottomElement) return 1;

                    let lastPage = navigationBottomElement.querySelector('li:last-child')?.textContent;
                    return lastPage ? parseInt(lastPage) || 1 : 1;
                },
            }, (results) => {
                if (chrome.runtime.lastError) {
                    console.error('Error obteniendo número de páginas:', chrome.runtime.lastError);
                    resolve(1);
                    return;
                }
                resolve(results?.[0]?.result || 1);
            });
        });
    }


    //Es una promesa que devuelve array de productos
    //en si es agregar la funcion e injectarla a el tab activo, ya que tenemos su tabid. es el mismo getItems() de utils folder
    async function altGetProductsFromPage(tabId: number): Promise<Producto[]> {
        return new Promise((resolve, reject) => {
            chrome.scripting.executeScript({
                target: { tabId },
                func: () => {
                    return getItems();
                },
            }, (results) => {
                if (chrome.runtime.lastError) {
                    console.error('error inyectando script:', chrome.runtime.lastError);
                    resolve([]);
                    return;
                }
                resolve(results?.[0]?.result || []);
            });
        });
    }

    // click a btn descarga en .csv de los productos tras haber navegado
    document.getElementById('alt-btn-download')?.addEventListener('click', () => {
        downloadStorageData('now_products', 'productos');
    });












    // Mostrar lista de categorias y subcategorias encontradas en el DOM (en popup)---------------------------------------------
    const logDiv = document.getElementById('log');

    updateLog();
    // Escuchar cambios en el storage y actualizar
    chrome.storage.onChanged.addListener(updateLog);

    function updateLog() {
        if (logDiv === null) return;

        chrome.storage.local.get(['now_categories', 'now_subcategories'], (data) => {
            let categoriesCount = data.now_categories ? data.now_categories.length : 0;
            let subcategoriesCount = data.now_subcategories ? data.now_subcategories.length : 0;


            let firstRow = document.createElement('div') // contenedor para la lista de categories
            let secondRow = document.createElement('div') // contenedor para la lista de subcategories

            logDiv.innerHTML = ''

            if (categoriesCount > 0) {
                firstRow.innerHTML = `<p>📂 Categorías encontradas: ${categoriesCount}</p>`;

                data.now_categories.forEach((cat: CategoryLink) => {
                    firstRow.innerHTML += `<a href='${cat.href}' class='${cat.visited ? 'visited' : 'yet-to-visit'}'>${cat.text}</a>`;
                });
            }

            if (subcategoriesCount > 0) {
                secondRow.innerHTML = `<p>📂 Subcategorías encontradas: ${subcategoriesCount}</p>`;

                data.now_subcategories.forEach((sub: CategoryLink) => {
                    secondRow.innerHTML += `<a href='${sub.href}' class='${sub.visited ? 'visited' : 'yet-to-visit'}'>${sub.text}</a>`;
                });
            }

            if (categoriesCount === 0 && subcategoriesCount === 0) {
                firstRow.innerHTML = `<p>0 categorías encontradas y 0 subcategorías encontradas.</p>`;
            } else {
                logDiv.appendChild(firstRow)
                logDiv.appendChild(secondRow)
            }
        });
    };











    // FUNCION: open ai e images ---------------------------------------------------------

    document?.getElementById('openFileUpload')?.addEventListener('click', function () {
        chrome.windows.create({
            url: chrome.runtime.getURL('file_upload.html'),
            type: 'popup',
            width: 400,
            height: 500
        });
    });


    document?.getElementById('imageForm')?.addEventListener('submit', function (event) {
        event.preventDefault();

        const btnUpload = document.getElementById('buttonUpload') as HTMLButtonElement;
        btnUpload.disabled = true;

        try {
            const fileInput = document.getElementById('imageInput') as HTMLInputElement;;
            if (!fileInput?.files) return
            const file = fileInput?.files[0];

            if (!file) {
                alert('Por favor, selecciona una imagen.');
                btnUpload.disabled = false;
                return;
            }
            const reader = new FileReader();
            reader.onload = async () => {
                try {
                    if (!(typeof reader.result === 'string')) return
                    const apiKey = (document.getElementById('txtAPI') as HTMLInputElement)?.value
                    const base64Image = reader.result?.split(',')[1];

                    const result = await getProductCode(apiKey, base64Image)

                    const elementResponse = document.getElementById('response')

                    if (!elementResponse) return



                    elementResponse.innerText = JSON.stringify(result)

                    const btnUpload = document.getElementById('buttonUpload') as HTMLButtonElement;
                    btnUpload.disabled = false;

                }
                catch (e: any) {
                    alert(e.message)
                    const btnUpload = document.getElementById('buttonUpload') as HTMLButtonElement;
                    btnUpload.disabled = false;
                }

            }

            reader.readAsDataURL(file);
        }
        catch (e) {
            const btnUpload = document.getElementById('buttonUpload') as HTMLButtonElement;
            btnUpload.disabled = false;
        }





    });




}
)()

