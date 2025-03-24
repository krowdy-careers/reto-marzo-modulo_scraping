/**
 * Hace scroll en la página para asegurar que todas las imágenes se carguen
 * @param {Object} page Instancia de página de Puppeteer
 */
async function autoScroll(page) {
  console.log('📜 Haciendo scroll para cargar todas las imágenes...');
  
  // Primero hacemos scroll para cargar todo el contenido
  await page.evaluate(async () => {
    await new Promise((resolve) => {
      let totalHeight = 0;
      const distance = 100;
      const timer = setInterval(() => {
        const scrollHeight = document.body.scrollHeight;
        window.scrollBy(0, distance);
        totalHeight += distance;
        
        if (totalHeight >= scrollHeight) {
          clearInterval(timer);
          resolve();
        }
      }, 150); // Velocidad de scroll más lenta para asegurar carga
    });
  });
  
  // Esperar más tiempo para asegurar que las imágenes con lazy loading se carguen
  console.log('⏱️ Esperando que todas las imágenes se carguen...');
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Forzar la carga de imágenes con atributos data-src (común en lazy loading)
  await page.evaluate(() => {
    const lazyImages = document.querySelectorAll('img[data-src]');
    lazyImages.forEach(img => {
      if (img.dataset.src) {
        img.src = img.dataset.src;
      }
    });
    
    // También intentar con otras variantes comunes de lazy loading
    document.querySelectorAll('img[data-lazy-src]').forEach(img => {
      if (img.dataset.lazySrc) img.src = img.dataset.lazySrc;
    });
    
    document.querySelectorAll('img[data-original]').forEach(img => {
      if (img.dataset.original) img.src = img.dataset.original;
    });
  });
  
  // Esperar un poco más para que las imágenes forzadas se carguen
  await new Promise(resolve => setTimeout(resolve, 1000));
}

/**
 * Extrae productos de una página
 * @param {Object} page Instancia de página de Puppeteer
 * @returns {Promise<Array>} Array de productos extraídos
 */
async function extractProductsFromPage(page) {
  console.log('🔍 Extrayendo productos de la página actual...');
  
  // Primero asegurarnos que todas las imágenes estén cargadas
  await page.evaluate(() => {
    // Forzar la carga de todas las imágenes
    window.scrollTo(0, 0); // Volver al principio
    const imgElements = document.querySelectorAll('img');
    imgElements.forEach(img => {
      // Crear un evento de intersección para forzar lazy loading
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            observer.unobserve(entry.target);
          }
        });
      });
      observer.observe(img);
    });
  });
  
  // Mejorar la extracción para obtener URLs de imágenes de varias formas
  return await page.evaluate(() => {
    return Array.from(document.querySelectorAll('.pod.pod-2_GRID.pod-link')).map(el => {
      // Buscar la imagen de diferentes maneras
      let imageUrl = 'Sin imagen';
      
      // Intentar con diferentes selectores para encontrar la URL
      const imgElement = el.querySelector('picture img') || 
                         el.querySelector('img') || 
                         el.querySelector('[data-src]') ||
                         el.querySelector('[data-lazy-src]');
      
      if (imgElement) {
        // Priorizar src, pero si no existe, buscar en atributos de lazy loading
        imageUrl = imgElement.getAttribute('src') || 
                   imgElement.getAttribute('data-src') || 
                   imgElement.getAttribute('data-lazy-src') || 
                   imageUrl;
        
        // Verificar si la URL es relativa y convertir a absoluta si es necesario
        if (imageUrl && !imageUrl.startsWith('http') && imageUrl !== 'Sin imagen') {
          // Convertir URL relativa a absoluta
          const base = window.location.origin;
          imageUrl = new URL(imageUrl, base).href;
        }
      }
      
      return {
        category: 'Despensa', // Asumimos que todos son de Despensa
        subcategory: 'Sin subcategoría', // Valor por defecto, se actualizará después
        name: el.querySelector('.pod-subTitle')?.innerText.trim() || 'Sin nombre',
        brand: el.querySelector('.pod-title')?.innerText.trim() || 'Sin marca',
        price: el.querySelector('.prices-0 span')?.innerText.trim() || 'Sin precio',
        imageUrl: imageUrl,
        link: el.getAttribute('href') || 'Sin enlace'
      };
    });
  });
}

/**
 * Determina el número total de páginas disponibles
 * @param {Object} browser Instancia de navegador de Puppeteer
 * @param {string} baseUrl URL base para la búsqueda
 * @returns {Promise<number>} Número total de páginas
 */
async function getTotalPages(browser, baseUrl) {
  console.log('🔍 Detectando número total de páginas...');
  
  const page = await browser.newPage();
  
  try {
    // Comenzamos con un umbral alto pero razonable
    const maxPagesToCheck = 100;
    let lastValidPage = 1;
    
    // Primero verificamos la página 1
    await page.goto(baseUrl, { waitUntil: 'networkidle2' });
    
    // Aceptar cookies si es necesario
    try {
      await page.waitForSelector('button[id*="cookie-notification-accept"]', { timeout: 5000 });
      await page.click('button[id*="cookie-notification-accept"]');
    } catch (e) {}
    
    // Verificamos una por una hasta encontrar una página que redirija a noResult
    for (let i = 2; i <= maxPagesToCheck; i++) {
      console.log(`📄 Verificando existencia de página ${i}...`);
      
      // Navegar a la siguiente página
      await page.goto(`${baseUrl}?page=${i}`, { waitUntil: 'networkidle2' });
      
      // Obtener la URL actual después de la navegación
      const currentUrl = page.url();
      
      // Si la URL contiene "noResult", hemos llegado más allá del límite
      if (currentUrl.includes('noResult')) {
        console.log(`🔍 Detectada redirección a "noResult" en página ${i}`);
        break;
      }
      
      // Verificamos si hay productos en esta página
      const hasProducts = await page.evaluate(() => {
        const products = document.querySelectorAll('.pod.pod-2_GRID.pod-link');
        return products.length > 0;
      });
      
      if (!hasProducts) {
        console.log(`📄 Página ${i} no tiene productos, considerando página anterior como última`);
        break;
      }
      
      // Actualizar la última página válida
      lastValidPage = i;
    }
    
    console.log(`📊 Total de páginas detectadas: ${lastValidPage}`);
    return lastValidPage;
  } catch (error) {
    console.error('❌ Error al obtener el total de páginas:', error);
    return 10; // Valor por defecto en caso de error
  } finally {
    await page.close();
  }
}

module.exports = {
  autoScroll,
  extractProductsFromPage,
  getTotalPages
};
