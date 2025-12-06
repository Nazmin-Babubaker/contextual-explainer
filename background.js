chrome.runtime.onInstalled.addListener(() =>{

    chrome.contextMenus.create({
        id: "simplify-explain",
        title: "Simplify & Explain",
        contexts: ["selection"]
    },() => {
    // Error check
    if (chrome.runtime.lastError) {
      console.error("Context Menu Error:", chrome.runtime.lastError.message);
    }
  });

    chrome.sidePanel.setPanelBehavior({openPanelOnActionClick: true})
    .catch((error) => {
        console.error("Error setting panel behavior:", error);
    });

});

chrome.contextMenus.onClicked.addListener(async(info, tab)=>{
    if(info.menuItemId === "simplify-explain" ){
        const selectedText = info.selectionText;

        if(selectedText){
            console.log("Selected text:", selectedText);
        
        chrome.tabs.sendMessage(tab.id,{
            type: "Explanation-received",
            data: "Sending slection"
        });


        

        }else {
      console.error("No text selected.");
    }
    }
});