# Contextual Explainer Chrome Extension

**Contextual Explainer** is a Chrome Extension that provides contextual explanations for text, code, or data right in your browser. Highlight any content on a web page and get instant, easy-to-understand explanations, summaries, or clarifications.

---


## 🛠️ Installation

1. **Download or Clone the Repository**

   ```bash
   git clone https://github.com/Nazmin-Babubaker/contextual-explainer.git
   cd contextual-explainer
   ```

2. **Load the Extension in Chrome:**
   1. Open Chrome and go to `chrome://extensions`.
   2. Enable the **Developer mode** toggle in the top right.
   3. Click **Load unpacked**.
   4. Select the cloned `contextual-explainer` folder.

---

## 🚀 How to Use

### 1. Load and Pin the Extension (Optional)
- Open **chrome://extensions**
- Enable **Developer Mode**
- Click **Load unpacked**
- Select the project folder  
You may pin the extension icon if you want, but it is **not required** to use the explainer.

### 2️. Select Any Text on a Webpage
Highlight any text you want explained — a word, sentence, paragraph, or technical term.

### 3️. Right-Click → Choose **“Simplify & Explain”**
You will see a custom context-menu item added by the extension.  
Click **Simplify & Explain**.

### 4️. Side Panel Opens Automatically
Chrome’s **Side Panel** will open on the right side of the browser.

### 5️. View the Explanation
Inside the panel, you'll first see:

> ⏳ *"Simplifying… Please wait…"*

The extension sends your selected text to your backend (Gemini API), and the final explanation appears in neatly formatted Markdown-style output.

### 6️. Select Another Text Anytime
Highlight new text → right-click → **Simplify & Explain** again.  
The panel updates automatically with the new explanation.


