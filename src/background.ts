import { getPortActiveTab, saveObjectInLocalStorage } from './utils/helperFunctions';

console.log('Estoy en background 2.0')


chrome.runtime.onConnect.addListener(async (port) => {


  port.onMessage.addListener(async ({ cmd, data, url, link_text, sendResponse }) => {

    /* 
    pedimos a content script que obtenga la info de los items del DOM (de la pestaña activa)
    si devuelven un mensaje con data, mensaje y con success: true, lo guardamos en el extemsion storage.
    si no hay success, consola el mensaje
     */
    if (cmd === 'getItems') {
      const portTab = await getPortActiveTab()
      portTab?.postMessage({ cmd: 'getItems' });
      portTab?.onMessage.addListener(async ({ success, message, data }) => {
        if (!success) console.log(message)
        await saveObjectInLocalStorage({ items: data })
      });
    }

    /* 
    obtiene los items del storage, para enviarselos al popup
    los envia junto con un mensaje y un success true
    */
    // if (cmd === 'getPopupItems') {
    //   const data = await getObjectInLocalStorage('items')
    //   port.postMessage({ success: true, message: 'Items obtenidos', data })
    // }


  });
});





//[deepseek] en context menu -------------------------------------------------------
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "ask-deepseek",
    title: "Enviar a deepseek chat: %s",
    contexts: ["selection"]
  });

  chrome.contextMenus.create({
    id: "convert-image",
    title: "Convierte imagen a Base64 y envia a chat",
    contexts: ["image"]
  });
});


/* 

Es una función a la que se le llama cuando se hace clic en el elemento de menú. Esto no está disponible dentro de un service worker. En su lugar, debes registrar un objeto de escucha para contextMenus.onClicked.

https://developer.chrome.com/docs/extensions/reference/api/contextMenus?hl=es-419#event-onClicked

*/
// en click a opcion del menu, verifica qué clickeó y si info tiene .selectiontext   o  .srcUrl 
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId === "ask-deepseek" && info.selectionText) {
    // const query = encodeURIComponent(info.selectionText);
    // chrome.tabs.create({ url: `https://chat.deepseek.com/?q=${query}` }); //anterior

    //envia el texto seleccionado sin encodificarlo
    const query = info.selectionText;
    openDeepSeekChat(query);

  } else if (info.menuItemId === "convert-image" && info.srcUrl) {

    //envia una instruccion + imagen encodificada
    convertImageToBase64(info.srcUrl);

  }
});



// Abre deepseek e inyecta deepseek.js
function openDeepSeekChat(query: string) {
  chrome.tabs.create({ url: "https://chat.deepseek.com" }, (newTab) => {

    if (!newTab.id) {
      console.error("fallo en crear new tab");
      return;
    }

    setTimeout(() => {
      chrome.scripting.executeScript({
        target: { tabId: newTab.id! }, //Type 'number | undefined' is not assignable to type 'number'.
        files: ["deepseek.js"]
      });
    }, 2000); // Delay to ensure page loads
    chrome.storage.local.set({ deepseekQuery: '¿El empaque de este producto es flexible?: ' + query });
  });
}



// Function to convert an image to Base64
function convertImageToBase64(imageUrl: string) {

  fetch(imageUrl)
    .then(res => res.blob())
    .then(blob => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        const prompt = "Esta es la imagen en base64, ¿puedes describir que representa? : " + base64String;
        openDeepSeekChat(prompt);
      };
      reader.readAsDataURL(blob);
    })
    .catch(err => console.error("Error converting image:", err));
}


