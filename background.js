chrome.runtime.onInstalled.addListener(() => {
    console.log("Extensión instalada");
  });
  
  chrome.action.onClicked.addListener((tab) => {
    chrome.scripting.executeScript({
      target: { tabId: tab.id },
      files: ["content.js"]
    });
  });
  