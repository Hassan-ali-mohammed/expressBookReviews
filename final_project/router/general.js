const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required" });
  }

  // Check if username already exists
  const userExists = users.some((user) => user.username === username);

  if (userExists) {
    return res.status(409).json({ message: "Username already exists" });
  }

  // Register new user
  users.push({ username, password });
  return res
    .status(201)
    .json({ message: "User successfully registered. Now you can login" });
});

// Get the book list available in the shop
public_users.get("/", async function (req, res) {
  try {
    // Simulating an asynchronous operation using a Promise
    const getBooks = () => new Promise((resolve) => resolve(books));
    const allBooks = await getBooks();
    return res.status(200).send(JSON.stringify(allBooks, null, 4));
  } catch (error) {
    return res.status(500).json({ message: "Error retrieving books" });
  }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;

  new Promise((resolve, reject) => {
    if (books[isbn]) {
      resolve(books[isbn]);
    } else {
      reject("Book not found");
    }
  })
    .then((book) => res.status(200).json(book))
    .catch((err) => res.status(404).json({ message: err }));
});

// Get book details based on author
public_users.get("/author/:author", async function (req, res) {
  const author = req.params.author.toLowerCase();
  try {
    const getBooksByAuthor = () =>
      new Promise((resolve) => {
        let filteredBooks = [];
        Object.keys(books).forEach((key) => {
          if (books[key].author.toLowerCase() === author) {
            filteredBooks.push({ isbn: key, ...books[key] });
          }
        });
        resolve(filteredBooks);
      });

    const matches = await getBooksByAuthor();
    if (matches.length > 0) {
      return res.status(200).json(matches);
    } else {
      return res.status(404).json({ message: "No books found by this author" });
    }
  } catch (err) {
    return res.status(500).json({ message: "Internal server error" });
  }
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title.toLowerCase();

  new Promise((resolve, reject) => {
    let filteredBooks = [];
    Object.keys(books).forEach((key) => {
      if (books[key].title.toLowerCase() === title) {
        filteredBooks.push({ isbn: key, ...books[key] });
      }
    });
    if (filteredBooks.length > 0) resolve(filteredBooks);
    else reject("No books found with this title");
  })
    .then((bookList) => res.status(200).json(bookList))
    .catch((err) => res.status(404).json({ message: err }));
});

// Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  if (books[isbn]) {
    return res.status(200).json(books[isbn].reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
