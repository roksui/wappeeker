import { detectedTechs, scan } from "./app.js";

const args = process.argv.slice(2);

const targetUrl = args[0];

if (!targetUrl) {
  console.log("Please provide the target URL.");
  process.exit(1);
}

console.log(`Scanning ${targetUrl}...`);

try {
  await scan(targetUrl);
} catch (error) {
  console.error("Failed to scan the target.", error);
  process.exit(2);
}

if (detectedTechs.size === 0) {
  console.log("Couldn't detect any technolgies for the website :(");
} else {
  console.log(`The website is likely to be using ${Array.from(detectedTechs)}.`);
}