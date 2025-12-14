let pendingSelectedText = null;  
let pendingExplanation = null;
let lastSelectedText = null;



chrome.runtime.onInstalled.addListener(() =>{
    chrome.contextMenus.create({
        id: "simplify-explain",
        title: "Simplify & Explain",
        contexts: ["selection"]
    },() => {
        if (chrome.runtime.lastError){
                console.error("Context Menu Error:", chrome.runtime.lastError.message);
        }
    });

    chrome.sidePanel.setPanelBehavior({openPanelOnActionClick: true})
    .catch((error) => {
        console.error("Error setting panel behavior:", error);
    });

});





async function callGeminiAPI(text){
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
    return "Server error, maybe the proxy is suspended now";
  }
}



async function shortExplain(text){
  console.log("Calling Gemini API with text:", text);
  try {
    const response = await fetch(" https://gproxyserver.onrender.com/shortexplain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });


    const data = await response.json();
    return data.explanation || "No explanation received";
  } catch (error) {
    return "Server error, maybe the proxy is suspended now";
  }
}




async function openPanelWindow(selectedText, tab){

  pendingSelectedText = selectedText;
  await chrome.sidePanel.open({ windowId: tab.windowId })
  .catch((error) => {
        console.error("Error opening side panel:", error);
      });

  chrome.runtime.sendMessage({
    type: "EXPLANATION_RECEIVED",
    data: "Simplifying"
  })
  .catch((err)=>{
        console.log("Error sending loading message:", err);
  });


  const explanation = await callGeminiAPI(selectedText);

  
   chrome.runtime.sendMessage({
    type: "EXPLANATION_RECEIVED",
    data: explanation
  })
  .catch((err)=>{
    pendingExplanation = explanation;
    console.log("Error sending explanation message:", err);
});

}

async function ensureContentAndExplain(tabId, text) {
  // 1. Ensure content script is ready
  try {
    await chrome.tabs.sendMessage(tabId, { type: "SHOW_LOADING" });
  } catch (err) {
    console.log("Content script not found, injecting…", err);

    //  await chrome.scripting.insertCSS({
    //   target: { tabId },
    //   files: ["content.css"]
    // });

    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["marked.min.js"]
    });

    await chrome.scripting.executeScript({
      target: { tabId },
      files: ["content.js"]
    });

    

    // retry after injection
    await chrome.tabs.sendMessage(tabId, { type: "SHOW_LOADING" });
  }

  // 2. Get explanation
  const explanation = await shortExplain(text);

  // 3. Send explanation
  chrome.tabs.sendMessage(tabId, {
    type: "SHOW_EXPLANATION",
    text: explanation
  });
}


chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.type === "PANEL_READY") {    

    if (pendingSelectedText !== null) {
      

      if (pendingExplanation !== null) {

        chrome.runtime.sendMessage({
          type: "EXPLANATION_RECEIVED",
          data: pendingExplanation
        });
      }else{
        chrome.runtime.sendMessage({
        type: "EXPLANATION_RECEIVED",
        data: "Simplifying"
      });
      }
      pendingSelectedText = null;       
    }   
  }

  if (message.type === "MODE_CHANGED_TO_FLOATING") {
    if (!lastSelectedText) return;

    console.log("[BG] Switching panel → floating");

    const [tab] = await chrome.tabs.query({
      active: true,
      lastFocusedWindow: true
    });

    if (!tab) return;

    chrome.sidePanel.close({ windowId: tab.windowId });

    await ensureContentAndExplain(tab.id, lastSelectedText);
  }
    
  
});



// CONTEXT MENU HANDLER
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  if (info.menuItemId !== "simplify-explain") return;

  const selectedText = info.selectionText;
  if (!selectedText) return;

  lastSelectedText = selectedText;


  chrome.storage.sync.get("mode", async ({ mode = "panel" }) => {

    if (mode === "panel") {
      return openPanelWindow(selectedText, tab);
    }

    // FLOAT MODE --------------------------------
    if (mode === "floating") {
      console.log("Floating mode selected");
      await ensureContentAndExplain(tab.id, selectedText);
    }
  });
});




