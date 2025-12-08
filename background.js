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



chrome.contextMenus.onClicked.addListener(async(info, tab)=>{


    if(info.menuItemId === "simplify-explain" ){
       
        const selectedText = info.selectionText;

        if(selectedText){
            console.log("Selected text:", selectedText);
            pendingText = selectedText;

            
            await chrome.sidePanel.open({ windowId: tab.windowId });



        }else {
      console.error("No text selected.");
    }
    }
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "PANEL_READY") {

    if (pendingText) {
      chrome.runtime.sendMessage({
        type: "EXPLANATION_RECEIVED",
        data: pendingText
      });
      pendingText = null;
    }
    sendResponse({ status: "OK" });
  }
});