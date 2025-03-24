async function scrapeData() {
    // Usamos el selector de pod que mencionaste para identificar cada producto individual
    let items = document.querySelectorAll('.pod-4_GRID, .pod');
    let products = [];
    
    items.forEach((item, index) => {
        try {
            // La categoría es fija porque la URL corresponde a "Despensa"
            let category = "Despensa";
            
            // Nombre: se busca el elemento con clase pod-subTitle
            let nombreEl = item.querySelector('.pod-subTitle');
            let name = nombreEl ? nombreEl.innerText.trim() : "Desconocido";
            
            // Marca: se busca el elemento con clase pod-title
            let brandEl = item.querySelector('.pod-title');
            let brand = brandEl ? brandEl.innerText.trim() : "Desconocido";
            
            // Imagen: buscar cualquier img dentro del contenedor del producto
            let imgEl = item.querySelector("img");
            let image_url = imgEl ? imgEl.getAttribute("src") : "";
            
            // Validación adicional: asegurarnos de que tenemos datos 
            // significativos antes de agregar el producto
            if (image_url && name !== "Desconocido") {
                products.push({ 
                    category: category, 
                    name: name, 
                    brand: brand, 
                    image_url: image_url 
                });
                console.log(`Producto ${index}: ${name} - URL: ${image_url.substring(0, 50)}...`);
            }
        } catch(e) {
            console.error(`Error procesando producto en posición ${index}:`, e);
        }
    });
    
    console.log(`Total productos extraídos: ${products.length}`);
    await sendData(products);
}

async function sendData(products) {
    try {
        let response = await fetch("http://127.0.0.1:5000/process_images", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ products: products })
        });
        let data = await response.json();
        console.log("Respuesta del servidor:", data);
    } catch (error) {
        console.error("Error al enviar la data:", error);
    }
}

scrapeData();