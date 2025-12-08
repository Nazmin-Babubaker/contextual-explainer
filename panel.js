chrome.runtime.sendMessage({ type: "PANEL_READY" });
const explanationTextElement = document.getElementById('explanation-text');

function displayExplanation(text) {
  explanationTextElement.textContent = text;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'EXPLANATION_RECEIVED') {
    displayExplanation(message.data);
    sendResponse({ status: "Panel updated" });
   
  }else {
    console.warn("⚠️ Unknown message type received:", message.type);
  }
    return true;
});