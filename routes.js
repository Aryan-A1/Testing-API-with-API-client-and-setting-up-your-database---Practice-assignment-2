const express = require("express");
const router = express.Router();
const { readBooks, writeBooks } = require("./server");

// Helper function to validate book data
function validateBookData(book) {
  if (
    !book.book_id ||
    !book.title ||
    !book.author ||
    !book.genre ||
    !book.year ||
    !book.copies
  ) {
    return false;
  }
  if (typeof book.year !== "number" || typeof book.copies !== "number") {
    return false;
  }
  return true;
}

// Create a new book (POST /books)
router.post("/books", async (req, res) => {
  try {
    const newBook = req.body;

    if (!validateBookData(newBook)) {
      return res.status(400).json({ error: "Invalid book data" });
    }

    const books = await readBooks();

    // Check if book_id already exists
    if (books.some((book) => book.book_id === newBook.book_id)) {
      return res.status(400).json({ error: "Book ID already exists" });
    }

    books.push(newBook);
    await writeBooks(books);

    res.status(201).json(newBook);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get all books (GET /books)
router.get("/books", async (req, res) => {
  try {
    const books = await readBooks();
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get a specific book by ID (GET /books/:id)
router.get("/books/:id", async (req, res) => {
  try {
    const books = await readBooks();
    const book = books.find((b) => b.book_id === req.params.id);

    if (!book) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.json(book);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update a book (PUT /books/:id)
router.put("/books/:id", async (req, res) => {
  try {
    const books = await readBooks();
    const bookIndex = books.findIndex((b) => b.book_id === req.params.id);

    if (bookIndex === -1) {
      return res.status(404).json({ error: "Book not found" });
    }

    const updatedBook = { ...books[bookIndex], ...req.body };

    if (!validateBookData(updatedBook)) {
      return res.status(400).json({ error: "Invalid book data" });
    }

    books[bookIndex] = updatedBook;
    await writeBooks(books);

    res.json(updatedBook);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Delete a book (DELETE /books/:id)
router.delete("/books/:id", async (req, res) => {
  try {
    const books = await readBooks();
    const bookIndex = books.findIndex((b) => b.book_id === req.params.id);

    if (bookIndex === -1) {
      return res.status(404).json({ error: "Book not found" });
    }

    books.splice(bookIndex, 1);
    await writeBooks(books);

    res.json({ message: "Book deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
