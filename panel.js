chrome.runtime.sendMessage({ type: "PANEL_READY" });

const explanationTextElement = document.getElementById('explanation-text');
const loader = document.getElementById('loader');

function showLoader() {
  loader.classList.remove("hidden");
  explanationTextElement.innerHTML = "";  
}

function hideLoader() {
  loader.classList.add("hidden");
}

function displayExplanation(text) {
  hideLoader();
  const html = marked.parse(text);
  explanationTextElement.innerHTML = html;
}

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'EXPLANATION_RECEIVED') {

    if (message.data === "Simplifying") {
      showLoader();
    } else {
      displayExplanation(message.data);
    }

    sendResponse({ status: "Panel updated" });
  }

  return true;
});
