import { extractData } from './utils/dom';
import { sleep } from './utils/helperFunctions';
import { Producto } from './utils/interfaces';
import { getItems } from './utils/tottus';

console.log('Estoy en contentScript 2.0')

chrome.runtime.onConnect.addListener(function (port) {
  port.onMessage.addListener(async ({ cmd }) => {
    console.log(cmd)

    if (cmd == "getItems") {

      const data = await getItems()
      port.postMessage({ success: true, message: "Items obtenidos", data })


    }
  })
})

//se ejecuta sin timeout, obtiene categorias y subactegorias del dom y las mostrara en el popup (solo si guardaron bien en el storage)
extractData()

// para ver cuando un content script está presente
// util para cuando inyectes un script y no esté funcionando
document.body.insertAdjacentHTML('beforeend', '<div style="position: fixed; top: 0; left: 0; background: transparent; padding: 8px;">🍀</div>');


