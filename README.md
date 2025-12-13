# Contextual Explainer — Chrome Extension

Contextual Explainer is a Chrome Extension that provides contextual explanations for text, code, or data right in your browser. Highlight any content on a web page and get instant, easy-to-understand explanations, summaries, or clarifications.

It supports two display modes: Side Panel and Floating Popup, giving you flexibility to view explanations without interrupting your workflow.

---

## 🛠️ Installation

### Download or Clone the Repository
```bash
git clone https://github.com/Nazmin-Babubaker/contextual-explainer.git
cd contextual-explainer
```

### Load the Extension in Chrome
1. Open Chrome and go to chrome://extensions
2. Enable the **Developer mode** toggle (top right)
3. Click **Load unpacked**
4. Select the cloned `contextual-explainer` folder

---

## 🚀 How to Use

1. Load and Pin the Extension (Optional)
   - Open chrome://extensions
   - Enable Developer Mode
   - Click **Load unpacked** and select the project folder
   - You may pin the extension icon if desired (optional)

2. Select Any Text on a Webpage  
   Highlight any text you want explained — a word, sentence, paragraph, or technical term.

3. Right-Click → Choose “Simplify & Explain”  
   A custom context menu item added by the extension will appear. Click **Simplify & Explain**.

4. Choose Display Mode  
   You can switch between:
   - **Side Panel** — Chrome’s side panel opens on the right.
   - **Floating Popup** — A movable, draggable window appears over the page.  
   The mode can be changed anytime using the settings icon in the side panel.

5. Side Panel Features
   - Automatic updates — selecting new text updates the panel automatically.

6. Floating Popup Features
   - Drag & Drop — move the popup anywhere on the page.
   - Hover Close Button — a small ✖ appears when hovering the popup to close it quickly.
     
7. Switching Modes Mid-Use
   - If you change the display mode while an explanation is showing:
     - The side panel closes automatically if switching to floating.
     - The floating popup opens with the explanation for the same text.
     - The API call ensures proper formatting for the chosen mode.

8. Repeat
   - Highlight more text → right-click → **Simplify & Explain** → explanation updates in the current mode.

---

## ⚙️ Permissions Used
- contextMenus — to add the “Simplify & Explain” option
- sidePanel API — to display explanations in Chrome’s panel
- scripting API — to inject floating popup scripts and CSS on page
