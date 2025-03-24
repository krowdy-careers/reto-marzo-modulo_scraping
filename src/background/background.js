chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "startScraping") {
    fetch("http://localhost:3000/scrape")
      .then((response) => response.json())
      .then((data) => {
        chrome.storage.local.set({ scrapedData: data });
        sendResponse({ message: "Scraping completado." });
      });
    return true;
  }

  if (message.action === "downloadData") {
    chrome.storage.local.get("scrapedData", (data) => {
      if (data.scrapedData) {
        sendResponse({ data: data.scrapedData });
      } else {
        sendResponse({ error: "No hay datos para descargar." });
      }
    });
    return true;
  }
});
