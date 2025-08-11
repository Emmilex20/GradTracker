document.getElementById('captureButton').addEventListener('click', () => {
  chrome.runtime.sendMessage({ action: "capture_data" });
});