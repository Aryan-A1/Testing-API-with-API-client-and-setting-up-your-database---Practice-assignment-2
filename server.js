const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const app = express();

// Middleware to parse JSON bodies
app.use(express.json());

// Path to our books data file
const booksFilePath = path.join(__dirname, "data", "books.json");

// Ensure the data directory exists
async function ensureDataDirectory() {
  const dataDir = path.join(__dirname, "data");
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir);
  }
}

// Initialize books data file if it doesn't exist
async function initializeBooksFile() {
  try {
    await fs.access(booksFilePath);
  } catch {
    await fs.writeFile(booksFilePath, JSON.stringify([]));
  }
}

// Read all books
async function readBooks() {
  const data = await fs.readFile(booksFilePath, "utf8");
  return JSON.parse(data);
}

// Write books to file
async function writeBooks(books) {
  await fs.writeFile(booksFilePath, JSON.stringify(books, null, 2));
}

// Initialize the server
async function initializeServer() {
  await ensureDataDirectory();
  await initializeBooksFile();

  // Import routes
  const routes = require("./routes");
  app.use("/", routes);

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

initializeServer().catch(console.error);

module.exports = { readBooks, writeBooks };
