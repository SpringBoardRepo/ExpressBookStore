const express = require("express");
const Book = require("../models/book");
const jsonSchema = require('jsonschema');
const bookSchema = require('../schema/bookStore.json');
const ExpressError = require("../expressError");

const router = new express.Router();


/** GET / => {books: [book, ...]}  */

router.get("/", async function (req, res, next) {
  try {
    const books = await Book.findAll(req.query);
    return res.json({ books });
  } catch (err) {
    return next(err);
  }
});

/** GET /[id]  => {book: book} */

router.get("/:id", async function (req, res, next) {
  try {
    const book = await Book.findOne(req.params.id);
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});

/** POST /   bookData => {book: newBook}  */

router.post("/", async function (req, res, next) {
  try {
    const data = jsonSchema.validate(req.body, bookSchema);
    if (!data.valid) {
      let listOfErrors = data.errors.map(e => e.stack);
      let error = new ExpressError(listOfErrors, 404);
      return next(error);
    }
    else {
      const book = await Book.create(req.body.books);
      return res.status(201).json({ book });
    }
  } catch (error) {
    return next(error);
  }
});

/** PUT /[isbn]   bookData => {book: updatedBook}  */

router.put("/:isbn", async function (req, res, next) {
  try {
    const validData = jsonSchema.validate(req.body, bookSchema);
    if (!validData.valid) {
      let listOfErrors = data.errors.map(e => e.stack);
      let error = new ExpressError(listOfErrors, 404);
      return next(error);
    }
    const book = await Book.update(req.params.isbn, req.body.books);
    return res.json({ book });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[isbn]   => {message: "Book deleted"} */

router.delete("/:isbn", async function (req, res, next) {
  try {
    await Book.remove(req.params.isbn);
    return res.json({ message: "Book deleted" });
  } catch (err) {
    return next(err);
  }
});

module.exports = router;
