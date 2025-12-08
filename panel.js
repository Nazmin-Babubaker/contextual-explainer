console.log("🟦 Panel Loaded & Listening for Messages");
chrome.runtime.sendMessage({ type: "PANEL_READY" });
const explanationTextElement = document.getElementById('explanation-text');

function displayExplanation(text) {
  console.log("📝 Displaying Explanation:", text);
  explanationTextElement.textContent = text;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
   console.log("📥 Message Received in Panel:", message);
  if (message.type === 'EXPLANATION_RECEIVED') {
    displayExplanation(message.data);
    console.log("recieved data:" ,message.data);
    sendResponse({ status: "Panel updated" });
   
  }else {
    console.warn("⚠️ Unknown message type received:", message.type);
  }
    return true;
});