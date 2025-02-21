# Discord Images/GIFs Downloader

## Instructions

1. Go into the Discord channel you would like to scrape all images/gifs from.

2. Open up the browser console (F12 or right-click -> Inspect) and paste this code:

```javascript
const imageLinks = document.querySelectorAll("a.originalLink_af017a");
console.log("Loading image elements...");

let imageElements = "";
imageLinks.forEach((link) => {
  imageElements += link.outerHTML + "\n";
});

const textarea = document.createElement("textarea");
textarea.value = imageElements;
document.body.appendChild(textarea);
textarea.select();
document.execCommand("copy");
document.body.removeChild(textarea);
console.log(
  `✅ Success: ${imageLinks.length} image elements copied to clipboard!`
);
```

3. Replace the text in `page.html`
