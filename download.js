const axios = require("axios");
const fs = require("fs");
const cheerio = require("cheerio");
const path = require("path");
const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Promisify readline question
const question = (query) =>
  new Promise((resolve) => rl.question(query, resolve));

// Read the saved HTML file
const html = fs.readFileSync("./page.html", "utf8");

// Parse HTML with cheerio
const $ = cheerio.load(html);

// Extract image URLs from <a> tags with class 'originalLink_af017a'
const imageLinks = $("a.originalLink_af017a");
const imageUrls = [];
imageLinks.each((i, link) => {
  const src = $(link).attr("href");
  if (src) {
    imageUrls.push(src);
  }
});

if (imageUrls.length === 0) {
  console.log('No images found with class "originalLink_af017a"');
  process.exit(1);
}

console.log(`Found ${imageUrls.length} images to download`);

async function getFolderPath() {
  while (true) {
    const folderName = await question("Enter output folder name: ");
    const outputDir = `./${folderName}`;

    if (fs.existsSync(outputDir)) {
      const response = await question(
        "Folder already exists. Replace? (y/n): "
      );
      if (response.toLowerCase() === "y") {
        return outputDir;
      }
      // If not replacing, loop continues to ask for new folder name
    } else {
      return outputDir;
    }
  }
}

async function downloadGif(url, filename, directory = "downloads") {
  try {
    // Ensure download directory exists
    if (!fs.existsSync(directory)) {
      fs.mkdirSync(directory, { recursive: true });
    }

    // Add .gif extension if not present
    if (!filename.endsWith(".gif")) {
      filename += ".gif";
    }

    const filePath = path.join(directory, filename);
    const response = await axios({
      method: "get",
      url: url,
      responseType: "stream", // Crucial for binary data
    });

    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on("finish", () => resolve(filePath));
      writer.on("error", reject);
    });
  } catch (error) {
    throw new Error(`Download failed: ${error.message}`);
  }
}

async function downloadAllImages() {
  try {
    const outputDir = await getFolderPath();
    console.log(
      `Starting download of ${imageUrls.length} images to ${outputDir}...`
    );

    for (let i = 0; i < imageUrls.length; i++) {
      await downloadGif(imageUrls[i], i.toString(), outputDir);
    }
    console.log("All downloads complete!");
  } finally {
    rl.close();
  }
}

// Run the script
downloadAllImages();

module.exports = downloadGif;
