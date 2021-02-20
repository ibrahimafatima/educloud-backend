const express = require("express");
const isAuth = require("../../middleware/isAuth");
const isAdmin = require("../../middleware/isAdmin");
const validateID = require("../../middleware/validateObjectId");
const { Library, ValidateLibrary } = require("../../model/admin/library");

const router = express.Router();

router.post("/", [isAuth, isAdmin], async (req, res) => {
  const { error } = ValidateLibrary(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const book = await Library.findOne({
    $and: [
      { bookTitle: req.body.bookTitle.toUpperCase() },
      { author: req.body.author.toUpperCase() },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  });

  if (book) return res.status(400).send("This book is already added");
  const addBook = new Library({
    bookTitle: req.body.bookTitle.toUpperCase(),
    author: req.body.author.toUpperCase(),
    totalQty: req.body.totalQty,
    addedBy: req.adminToken.username,
    schoolSecretKey: req.adminToken.schoolSecretKey,
  });
  const result = await addBook.save();
  res.send(result);
});

router.get("/", [isAuth], async (req, res) => {
  const allBook = await Library.find({
    schoolSecretKey: req.adminToken.schoolSecretKey,
  }).sort("bookTitle");
  if (!allBook) return res.status(404).send("No book was found");
  res.send(allBook);
});

// router.get("/get/:id", [isAuth], async (req, res) => {
//   const oneBook = await Library.findById(req.params.id);
//   if (!oneBook) return res.status(404).send("Book not found");
//   res.send(oneBook);
// });

router.put("/update/:id", [isAuth, isAdmin], async (req, res) => {
  const { error } = ValidateLibrary(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const book = await Library.findById(req.params.id);

  if (!book) return res.status(400).send("This book cannot be updated");
  const updateBook = await Library.findByIdAndUpdate(
    req.params.id,
    {
      bookTitle: req.body.bookTitle.toUpperCase(),
      author: req.body.author.toUpperCase(),
      totalQty: req.body.totalQty,
    },
    { new: true }
  );
  if (!updateBook) return res.status(400).send("Update cannot be committed");
  res.send(updateBook);
});

router.delete(
  "/delete/:id",
  [isAuth, isAdmin, validateID],
  async (req, res) => {
    const deleteBook = await Library.findById(req.params.id);
    if (!deleteBook) return res.status(400).send("The book does not exist");
    const result = await deleteBook.remove();
    res.send(result);
  }
);

module.exports = router;
