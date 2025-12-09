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

async function callGeminiAPI(text) {
  console.log("🤖 Calling Gemini API with:", text);


  try {
   const response = await fetch("https://gproxyserver.onrender.com/explain", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({text: `You are a helpful teaching assistant. Provide a simple, concise, and easy-to-understand explanation for the following text. Format the response clearly with paragraphs and bullet points if necessary. Text to simplify: "${text}"`
 })
});

    const data = await response.json();
    console.log("📦 Gemini Response:", data);

    const output =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      "⚠️ No explanation returned by Gemini";

    return output;
  } catch (error) {
    console.error("❌ Gemini API Error:", error);
    return "❌ Error contacting Gemini API. Check console for details.";
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

            const explanation = await callGeminiAPI(selectedText);

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

     chrome.runtime.sendMessage({
        type: "EXPLANATION_RECEIVED",
        data: "⏳ Simplifying… Please wait..."
      });

    if (pendingText) {
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