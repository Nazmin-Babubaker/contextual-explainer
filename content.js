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
    ? `<span class="loader" aria-hidden="true"></span>`
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

  

    makeDraggable(popup);


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


function makeDraggable(el) {
  let isDragging = false;
  let startX, startY, origX, origY;

  el.style.position = "absolute"; // ensure it's absolutely positioned

  el.addEventListener("mousedown", (e) => {
    isDragging = true;
    startX = e.clientX;
    startY = e.clientY;
    origX = parseInt(el.style.left, 10);
    origY = parseInt(el.style.top, 10);

    // Bring to front while dragging
    el.style.zIndex = 9999;

    e.preventDefault();
  });

  document.addEventListener("mousemove", (e) => {
    if (!isDragging) return;

    const dx = e.clientX - startX;
    const dy = e.clientY - startY;

    el.style.left = origX + dx + "px";
    el.style.top = origY + dy + "px";
  });

  document.addEventListener("mouseup", () => {
    if (isDragging) {
      isDragging = false;
      el.style.zIndex = 1000; // reset z-index
    }
  });
}


