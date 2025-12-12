chrome.runtime.sendMessage({ type: "PANEL_READY" });

const explanationTextElement = document.getElementById('explanation-text');
const loader = document.getElementById('loader');
const radios = document.querySelectorAll('input[name="mode"]');
const clearBtn = document.getElementById("clear");


chrome.storage.sync.get("mode", ({ mode }) => {
  const savedMode = mode || "panel"; // default
  console.log("Saved mode:", savedMode);
  const radio = document.querySelector(`input[value="${savedMode}"]`);
  if (radio) radio.checked = true;
});

radios.forEach((radio) => {
  radio.addEventListener("change", () => {
    chrome.storage.sync.set({ mode: radio.value }, () => {
      console.log("Mode updated to:", radio.value);
    });
  });
});



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
