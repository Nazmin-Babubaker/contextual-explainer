chrome.runtime.onInstalled.addListener(() =>{
    chrome.contextMenus.create({
        id: "simplify-explain",
        title: "Simplify & Explain",
        contexts: ["selection"]
    },() => {
        if (chrome.runtime.lastError) {
                console.error("Context Menu Error:", chrome.runtime.lastError.message);
        }
    });

    chrome.sidePanel.setPanelBehavior({openPanelOnActionClick: true})
    .catch((error) => {
        console.error("Error setting panel behavior:", error);
    });

});





async function callGeminiAPI(text) {
  console.log("Calling Gemini API with text:", text);
  try {
    const response = await fetch("https://gproxyserver.onrender.com/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });

    const data = await response.json();
    return data.explanation || "No explanation received";
  } catch (error) {
    return "Server error";
  }
}

let pendingSelectedText = null;   


async function openPanelWindow(selectedText, tab) {
  pendingSelectedText = selectedText;

  // Open side panel
  await chrome.sidePanel.open({ windowId: tab.windowId });

  // Send loading
  chrome.runtime.sendMessage({
    type: "EXPLANATION_RECEIVED",
    data: "Simplifying"
  });

  // Call API
  const explanation = await callGeminiAPI(selectedText);

  // Send explanation
  chrome.runtime.sendMessage({
    type: "EXPLANATION_RECEIVED",
    data: explanation
  });

  // Clear pending now that explanation is sent
  pendingSelectedText = null;
}


// PANEL_READY handler (fires when panel loads)
chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === "PANEL_READY") {

    if (pendingSelectedText !== null) {
      chrome.runtime.sendMessage({
        type: "EXPLANATION_RECEIVED",
        data: "Simplifying"
      });

      const explanation = await callGeminiAPI(pendingSelectedText);

      chrome.runtime.sendMessage({
        type: "EXPLANATION_RECEIVED",
        data: explanation
      });

      pendingSelectedText = null;
    }

    sendResponse({ status: "OK" });
  }
});



// CONTEXT MENU HANDLER
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "simplify-explain") return;

  const selectedText = info.selectionText;
  if (!selectedText) return;

  chrome.storage.sync.get("mode", async ({ mode = "panel" }) => {

    // PANEL MODE --------------------------------
    if (mode === "panel") {
      return openPanelWindow(selectedText, tab);
    }

    // FLOAT MODE --------------------------------
    if (mode === "floating") {
      console.log("Floating mode selected");
      try {
        await chrome.tabs.sendMessage(tab.id, { type: "SHOW_LOADING" });
      } catch (err) {
        console.log("Injecting content script",err);
        await chrome.scripting.insertCSS({
          target: { tabId: tab.id },
          files: ["content.css"]
        });

        await chrome.scripting.executeScript({
         target: { tabId: tab.id },
         files: ["marked.min.js"]
        });


        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          files: ["content.js"]
        });

        await chrome.tabs.sendMessage(tab.id, { type: "SHOW_LOADING" });
      }

      const explanation = await callGeminiAPI(selectedText);

      chrome.tabs.sendMessage(tab.id, {
        type: "SHOW_EXPLANATION",
        text: explanation
      });
    }
  });
});
