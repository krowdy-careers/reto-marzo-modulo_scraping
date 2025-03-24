document.getElementById("startScraping").addEventListener("click", async () => {
  console.log("Iniciando scraping...");

  try {
    const response = await fetch("http://localhost:3000/scrape");
    if (!response.ok)
      throw new Error(`Error en la respuesta: ${response.status}`);

    const data = await response.json();
    chrome.storage.local.set({ scrapedData: data }, () => {
      console.log("Datos guardados en el almacenamiento local");
      document.getElementById("status").innerText =
        "Scraping completado con éxito.";
    });
  } catch (error) {
    console.error("Error durante el scraping:", error);
    document.getElementById("status").innerText =
      "Error al realizar el scraping.";
  }
});

document.getElementById("downloadData").addEventListener("click", () => {
  console.log("Preparando descarga de datos...");

  chrome.runtime.sendMessage({ action: "downloadData" }, (response) => {
    if (response && response.data) {
      const blob = new Blob([JSON.stringify(response.data, null, 2)], {
        type: "application/json",
      });
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "tottus_data.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);

      console.log("Descarga completada.");
    } else {
      console.warn("No hay datos para descargar.");
    }
  });
});
