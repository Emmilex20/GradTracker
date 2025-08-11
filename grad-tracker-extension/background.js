// This is the background script acting as a router.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "capture_data") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, { action: "request_data_from_page" });
      }
    });
    // Returning true signals that sendResponse will be called asynchronously.
    return true; 
  }
  
  if (request.action === "data_captured") {
    const reactAppUrl = "http://localhost:3000";

    chrome.tabs.query({ url: `${reactAppUrl}/*` }, (tabs) => {
      if (tabs.length > 0) {
        chrome.tabs.sendMessage(tabs[0].id, {
          action: "send_to_react_app",
          payload: request.payload
        });
      }
    });
    // Returning true signals that sendResponse will be called asynchronously.
    return true;
  }
});