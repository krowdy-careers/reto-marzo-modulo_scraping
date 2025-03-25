// src/utils/helperFunctions.ts

/**
 * Capitaliza la primera letra de una cadena.
 * @param texto - La cadena a modificar.
 * @returns La cadena con la primera letra en mayúscula.
 */


const sleep = (seconds:number)=>{
    const secondsToMiliseconds = 1000;

    return new Promise((resolve:any)=>{
        setTimeout(
            ()=>{
                resolve();
            },
            seconds*secondsToMiliseconds)
    })
}

const getPortActiveTab = async ()=>{
    const [tab] = await chrome.tabs.query({ active: true })
    if(!tab.id) return
    const portTab = chrome.tabs.connect(tab.id, { name: "content-script-port" })
    return portTab
}

const saveObjectInLocalStorage = async function (obj:any) {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.set(obj, function () {
          resolve(obj);
        });
      } catch (ex) {
        reject(ex);
      }
    });
  };
  
  const getObjectInLocalStorage = async function (key:any) {
    return new Promise((resolve, reject) => {
      try {
        chrome.storage.local.get([key], function (value) {
          resolve(value);
        });
      } catch (ex) {
        reject(ex);
      }
    });
  };


  const fetchOpenAIResponse = async (prompt:string) =>{
    const apiKey = 'TU_API_KEY_DE_OPENAI';
    const url = 'https://api.openai.com/v1/completions';
  
    const data = {
      model: 'text-davinci-003',
      prompt: prompt,
      max_tokens: 50,
      n: 1,
      stop: null,
      temperature: 0.5,
    };
  
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(data),
    });
  
    const result = await response.json();
    return result.choices[0].text.trim();
  }

  const analyzeImage =async (imageBase64:any) =>{
    const apiKey = 'TU_API_KEY_DE_OPENAI';
    const url = 'https://api.openai.com/v1/images/analysis';

    const data = {
      image: imageBase64,
      tasks: ['description', 'objects'],
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    return result;
  }
  
export {sleep,getPortActiveTab,saveObjectInLocalStorage,getObjectInLocalStorage}