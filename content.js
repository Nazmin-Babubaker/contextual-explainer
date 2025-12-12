// content.js — improved click-to-close + debug
let popup = null;
let closeListenerAdded = false;

chrome.runtime.onMessage.addListener((msg) => {
  if (msg.type === "SHOW_LOADING") {
    showPopup("⏳ Simplifying...", true);
  } else if (msg.type === "SHOW_EXPLANATION") {
    showPopup(msg.text, false);
  } else if (msg.type === "REMOVE_POPUP") {
    removePopup();
  }
});

function showPopup(message, isLoading) {
  // Remove old popup if any
  removePopup();

  // Create popup
  popup = document.createElement("div");
  popup.className = "explain-popup";
  popup.setAttribute("role", "dialog");
  popup.setAttribute("aria-live", "polite");

  popup.addEventListener("click", (e) => {
    e.stopPropagation();
  });

  popup.innerHTML = isLoading
    ? `<span class="loader" aria-hidden="true"></span> Processing...`
    : marked.parse(message);

  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) {
    console.warn("[content] no selection to position popup");
    popup.style.top = window.scrollY + 20 + "px";
    popup.style.left = window.scrollX + 20 + "px";
  } else {
    try {
      const rect = sel.getRangeAt(0).getBoundingClientRect();
      popup.style.top = window.scrollY + Math.max(rect.top - 60, 8) + "px";
      popup.style.left = window.scrollX + Math.max(rect.left, 8) + "px";
    } catch (err) {
      console.warn("[content] error getting range rect", err);
      popup.style.top = window.scrollY + 20 + "px";
      popup.style.left = window.scrollX + 20 + "px";
    }
  }

  document.body.appendChild(popup);

  popup.style.pointerEvents = "auto";

  enableCloseOnClick();
}

function enableCloseOnClick() {
  if (closeListenerAdded) return;
  closeListenerAdded = true;

  document.addEventListener("click", handleClickOutside, false);
}

function handleClickOutside(event) {
  if (!popup) return;

  if (!popup.contains(event.target)) {
    removePopup();
  }
}

function removePopup() {
  if (popup) {
    popup.remove();
    popup = null;
  }

  if (closeListenerAdded) {
    document.removeEventListener("click", handleClickOutside, false);
    closeListenerAdded = false;
  }
}

