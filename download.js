const axios = require("axios");
const fs = require("fs");
const cheerio = require("cheerio");
const path = require("path");
const readline = require("readline");
const pLimit = require("p-limit");
const cliProgress = require("cli-progress");

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

// Extract image URLs directly from href attributes
const imageUrls = $("a.originalLink_af017a")
  .map((i, link) => $(link).attr("href"))
  .get()
  .filter((url) => url); // Remove any undefined/null values

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
      `Starting concurrent download of ${imageUrls.length} images to ${outputDir}...`
    );

    // Create progress bar
    const progressBar = new cliProgress.SingleBar({
      format:
        "Downloading [{bar}] {percentage}% | {value}/{total} images | ETA: {eta}s",
      barCompleteChar: "=",
      barIncompleteChar: "-",
    });
    progressBar.start(imageUrls.length, 0);

    // Set up concurrency limit (6 simultaneous downloads)
    const limit = pLimit(6);
    let completed = 0;

    // Create an array of limited download promises
    const downloadPromises = imageUrls.map((url, i) =>
      limit(() =>
        downloadGif(url, i.toString(), outputDir)
          .then(() => {
            completed++;
            progressBar.update(completed);
          })
          .catch((error) => {
            console.error(`\nFailed to download image ${i}: ${error.message}`);
            completed++;
            progressBar.update(completed);
            return null;
          })
      )
    );

    // Wait for all downloads to complete
    const results = await Promise.allSettled(downloadPromises);

    progressBar.stop();

    const successful = results.filter((r) => r.status === "fulfilled").length;
    const failed = results.filter((r) => r.status === "rejected").length;

    console.log(
      `\nDownloads complete! Successfully downloaded: ${successful}, Failed: ${failed}`
    );
  } finally {
    rl.close();
  }
}

// Run the script
downloadAllImages();

module.exports = downloadGif;
