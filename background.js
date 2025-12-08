chrome.runtime.onInstalled.addListener(() =>{
    //////
console.log("🔧 Extension Installed & Context Menu Created");
/////
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
    .then(() => console.log("📂 Side Panel Behavior Registered"))
    .catch((error) => {
        console.error("Error setting panel behavior:", error);
    });

});
let pendingText = null;



chrome.contextMenus.onClicked.addListener(async(info, tab)=>{

    console.log("🖱️ Context menu clicked");
    console.log("📍 tab.id:", tab?.id);

    if(info.menuItemId === "simplify-explain" ){
        console.log("✔️ 'Simplify & Explain' menu triggered");
        const selectedText = info.selectionText;

        if(selectedText){
            console.log("Selected text:", selectedText);
            pendingText = selectedText;

            console.log("📂 Opening side panel...");
            await chrome.sidePanel.open({ windowId: tab.windowId });

            console.log("📆 Waiting for panel ready event...");


        }else {
      console.error("No text selected.");
    }
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "PANEL_READY") {
    console.log("📬 Panel is ready");

    if (pendingText) {
      console.log("🚀 Sending stored text to panel:", pendingText);
      chrome.runtime.sendMessage({
        type: "EXPLANATION_RECEIVED",
        data: pendingText
      });
      pendingText = null;
    }
    sendResponse({ status: "OK" });
  }
});