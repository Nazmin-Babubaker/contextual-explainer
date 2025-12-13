chrome.runtime.sendMessage({ type: "PANEL_READY" });

const explanationTextElement = document.getElementById('explanation-text');
const loader = document.getElementById('loader');

const modeToggle = document.getElementById("mode-toggle");
const modeOptions = document.getElementById("mode-options");

modeToggle.addEventListener("click", () => {
  console.log("Mode button clicked!");

  // toggle visibility
  modeOptions.classList.toggle("hidden");
    modeToggle.classList.toggle("active");

});

const radios = document.querySelectorAll('input[name="mode"]');
const clearBtn = document.getElementById("clear");




chrome.storage.sync.get("mode", ({ mode }) => {
  const savedMode = mode || "panel"; // default
  console.log("Saved mode:", savedMode);
  const radio = document.querySelector(`input[value="${savedMode}"]`);
  if (radio) radio.checked = true;
});

radios.forEach(r => {
  r.addEventListener("change", () => {
    console.log("[PANEL] Mode chosen:", r.value);

    chrome.storage.sync.set({ mode: r.value });
    modeOptions.classList.add("hidden");
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
