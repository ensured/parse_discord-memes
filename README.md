# Discord Images/GIFs Downloader

## Instructions

1. Go into the Discord channel you would like to scrape all images/gifs from.

2. Open up the browser console (F12 or right-click -> Inspect) and paste this code:

```javascript
const divMessagesWrapper = document.querySelector(
  "#app-mount > div.appAsidePanelWrapper_a3002d > div.notAppAsidePanel_a3002d > div.app_a3002d > div > div.layers__960e4.layers__160d8 > div > div > div > div > div.chat_f75fb0 > div.content_f75fb0 > main > div.messagesWrapper__36d07.group-spacing-16"
).outerHTML;
console.log("Loading messages...");
const textarea = document.createElement("textarea");
textarea.value = divMessagesWrapper;
document.body.appendChild(textarea);
textarea.select();
document.execCommand("copy");
document.body.removeChild(textarea);
console.log("✅ Success: Content copied to clipboard!");
```

3. Replace the text in `page.html` with the text you copied from your clipboard

4. Run the script

5. Done! Your images/GIFs will be downloaded.
