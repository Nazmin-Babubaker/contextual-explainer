chrome.runtime.sendMessage({ type: "PANEL_READY" });


const modeToggle = document.getElementById("mode-toggle");
const modeOptions = document.getElementById("mode-options");
const modeOverlay = document.getElementById("mode-overlay");
const explanationTextElement = document.getElementById('explanation-text');
const loader = document.getElementById('loader');
const radios = document.querySelectorAll('input[name="mode"]');
const landingPage = document.getElementById("landing-page");
const container = document.getElementById("explanation-container");
const landingTitle = document.getElementById("landing-title");
const landingText = document.getElementById("landing-text");
const landingHint = document.getElementById("landing-hint");


modeToggle.addEventListener("click", (e) => {
  e.stopPropagation(); 
  const isOpen = modeOptions.classList.toggle("open");

  modeToggle.classList.toggle("active", isOpen);
  modeOverlay.classList.toggle("active", isOpen);
});



function animateLanding() {
  landingTitle.classList.add("animate-title");
  landingText.classList.add("animate-text");
  landingHint.classList.add("animate-hint");
}


function closeDropdown() {
  modeOptions.classList.remove("open");
  modeToggle.classList.remove("active");
  modeOverlay.classList.remove("active");
}

modeOverlay.addEventListener("click", () => {
  closeDropdown();
});

modeOptions.addEventListener("click", (e) => {
  e.stopPropagation();
});


window.addEventListener("DOMContentLoaded", () => {
  animateLanding();
});

chrome.storage.sync.get("mode", ({ mode }) => {
  const savedMode = mode || "panel"; // default
  console.log("Saved mode:", savedMode);
  const radio = document.querySelector(`input[value="${savedMode}"]`);
  if (radio) radio.checked = true;
});


radios.forEach(r => {
  r.addEventListener("change", (e) => {
    console.log("[PANEL] Mode chosen:", r.value);
    

    chrome.storage.sync.set({ mode: r.value });

    if (r.value === "floating") {
      chrome.runtime.sendMessage({
        type: "MODE_CHANGED_TO_FLOATING"
      });
    }
    

    closeDropdown();
  });
  

  r.addEventListener("click", (e) => {
    e.stopPropagation();

    closeDropdown();
  });
});



function showLoader() {

    landingPage.classList.add("hidden");
    container.classList.remove("hidden");
  loader.classList.remove("hidden");
  explanationTextElement.innerHTML = "";  
}

function hideLoader() {
  loader.classList.add("hidden");
}

function displayExplanation(text) {
  hideLoader();

    landingPage.classList.add("hidden");
    container.classList.remove("hidden");

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

