
let popup = null;
let host = null;
let shadow = null;
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

function createShadowHost() {
  if (host) return;

  host = document.createElement("div");
  host.id = "explain-shadow-host";
  document.body.appendChild(host);

  shadow = host.attachShadow({ mode: "open" });

  // Inject CSS inside shadow root
  const style = document.createElement("style");
  style.textContent = `
    .explain-popup {
      position: absolute;
      max-width: 300px;
      background: #12182b;
      color: rgba(247, 241, 241, 0.79);
      font-family: Arial, sans-serif;
      font-size: 14px;
      padding: 20px;
      border-radius: 8px;
      border: 1px solid #ccc;
      box-shadow: 0 4px 10px rgba(0,0,0,0.15);
      z-index: 999999;
      cursor: grab;
    }

    .explain-popup:active {
      cursor: grabbing;
    }

    .loader {
      border: 3px solid #eee;
      border-top: 3px solid #555;
      border-radius: 50%;
      width: 14px;
      height: 14px;
      display: inline-block;
      animation: spin 0.8s linear infinite;
      margin-right: 8px;
    }

    @keyframes spin {
      100% { transform: rotate(360deg); }
    }

    .popup-close-btn {
      position: absolute;
      top: 8px;
      right: 8px;
      width: 14px;
      height: 14px;
      border: none;
      background: transparent;
      color: #f7f4f4a7;
      font-size: 14px;
      font-weight: bold;
      cursor: pointer;
      z-index: 1001;
    }
  `;

  shadow.appendChild(style);
}

function showPopup(message, isLoading) {
  removePopup();
  createShadowHost();

  popup = document.createElement("div");
  popup.className = "explain-popup";
  popup.setAttribute("role", "dialog");
  popup.setAttribute("aria-live", "polite");

  popup.addEventListener("click", (e) => e.stopPropagation());

  popup.innerHTML = isLoading
    ? `<span class="loader"></span>`
    : marked.parse(message);

  if (!isLoading) {
    const closeBtn = document.createElement("button");
    closeBtn.textContent = "×";
    closeBtn.className = "popup-close-btn";
    closeBtn.title = "Close";
    closeBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      removePopup();
    });
    popup.appendChild(closeBtn);
  }

  positionPopup(popup);
  makeDraggable(popup);

  shadow.appendChild(popup);
  enableCloseOnClick();
}

function positionPopup(popup) {
  const sel = window.getSelection();

  if (!sel || !sel.rangeCount) {
    popup.style.top = window.scrollY + 20 + "px";
    popup.style.left = window.scrollX + 20 + "px";
    return;
  }

  try {
    const rect = sel.getRangeAt(0).getBoundingClientRect();
    popup.style.top = window.scrollY + Math.max(rect.top - 60, 8) + "px";
    popup.style.left = window.scrollX + Math.max(rect.left, 8) + "px";
  } catch {
    popup.style.top = window.scrollY + 20 + "px";
    popup.style.left = window.scrollX + 20 + "px";
  }
}

function enableCloseOnClick() {
  if (closeListenerAdded) return;
  closeListenerAdded = true;
  document.addEventListener("click", handleClickOutside, false);
}

function handleClickOutside(e) {
  if (!popup) return;
  if (!host.contains(e.target)) {
    removePopup();
  }
}

function removePopup() {
  if (popup) {
    popup.remove();
    popup = null;
  }

  if (host) {
    host.remove();
    host = null;
    shadow = null;
  }

  if (closeListenerAdded) {
    document.removeEventListener("click", handleClickOutside, false);
    closeListenerAdded = false;
  }
}

function makeDraggable(el) {
  let isDragging = false;
  let startX, startY, origX, origY;

  el.style.position = "absolute";

  el.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    origX = parseInt(el.style.left, 10);
    origY = parseInt(el.style.top, 10);
    el.style.zIndex = 9999;
    e.preventDefault();
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;
    el.style.left = origX + (e.clientX - startX) + "px";
    el.style.top = origY + (e.clientY - startY) + "px";
  });

  document.addEventListener("mouseup", () => {
    isDragging = false;
    el.style.zIndex = 1000;
  });
}
