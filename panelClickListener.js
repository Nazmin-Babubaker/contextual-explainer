document.addEventListener("click", () => {
  chrome.runtime.sendMessage({
    type: "OUTSIDE_CLICK"
  });
});