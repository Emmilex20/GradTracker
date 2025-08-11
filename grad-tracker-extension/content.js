// A robust content script that handles messages and their asynchronous responses.
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // This flag tells the browser we will respond asynchronously.
  let responseSent = false; 

  if (request.action === "request_data_from_page") {
    // We're on a university page. Capture data.
    const schoolName = document.title.split(' | ')[0].trim();
    const deadlineElement = document.querySelector('.application-deadline-date'); 
    const deadline = deadlineElement ? deadlineElement.innerText : null;
    const programNameElement = document.querySelector('h1.program-title'); 
    const programName = programNameElement ? programNameElement.innerText : null;

    const data = { schoolName, programName, deadline };
    
    // Send the captured data back to the background script.
    chrome.runtime.sendMessage({
      action: "data_captured",
      payload: data
    });

    // We're done with this request, so let's send a simple response back.
    sendResponse({ status: "data_captured_ok" });
    responseSent = true;
  }

  if (request.action === "send_to_react_app") {
    // We're on the React app's tab. Forward the data.
    window.postMessage({
      type: 'GRAD_TRACKER_DATA',
      payload: request.payload
    }, '*');

    // We're done with this request, so let's send a simple response back.
    sendResponse({ status: "sent_to_react_ok" });
    responseSent = true;
  }
  
  // Return true if we have sent a response asynchronously.
  // This is the key to preventing the "Receiving end does not exist" error.
  return responseSent;
});