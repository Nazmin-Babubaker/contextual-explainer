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



let pendingText = null;
let pendingExplanation = null;


async function callGeminiAPI(text) {
  console.log("🤖 Calling Groq API with:", text);

  try {
    const response = await fetch("https://gproxyserver.onrender.com/explain", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text })
    });

    const data = await response.json();
    console.log("📦 Groq Response:", data);

    return data.explanation || "⚠️ No explanation received";
  } catch (error) {
    console.error("❌ API Error:", error);
    return "❌ Server error. Check console.";
  }
}



chrome.contextMenus.onClicked.addListener(async(info, tab)=>{
    if(info.menuItemId === "simplify-explain" ){
       
        const selectedText = info.selectionText;

        if(selectedText){
            console.log("Selected text:", selectedText);
            pendingText = selectedText;

            await chrome.sidePanel.open({ windowId: tab.windowId });

            chrome.runtime.sendMessage({
               type: "EXPLANATION_RECEIVED",
               data: "⏳ Simplifying… Please wait..."
            });

            pendingExplanation = "⏳ Simplifying… Please wait...";
            const explanation = await callGeminiAPI(selectedText);
            pendingExplanation = explanation;

            chrome.runtime.sendMessage({
               type: "EXPLANATION_RECEIVED",
               data: explanation
           });
        }else {
            console.error("No text selected.");
        }
    }
});

chrome.runtime.onMessage.addListener(async(message, sender, sendResponse) => {
  if (message.type === "PANEL_READY") {

    

    if (pendingText) {
       chrome.runtime.sendMessage({
        type: "EXPLANATION_RECEIVED",
        data: "⏳ Simplifying… Please wait..."
      });
      console.log("🤖 Calling API after panel ready");
      const explanation = await callGeminiAPI(pendingText);
      

      chrome.runtime.sendMessage({
        type: "EXPLANATION_RECEIVED",
        data: explanation
      });

      pendingText = null;
    }
    sendResponse({ status: "OK" });
  }
});