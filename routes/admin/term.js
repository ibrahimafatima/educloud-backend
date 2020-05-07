const express = require("express");
const mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);
const isAuth = require("../../middleware/isAuth");
const isAdmin = require("../../middleware/isAdmin");
const { Terms, validateTerm } = require("../../model/admin/term");

const router = express.Router();

router.post("/", [isAuth, isAdmin], async (req, res) => {
  const { error } = validateTerm(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const newTerm = new Terms({
    term: req.body.term,
    schoolName: req.adminToken.schoolName,
    schoolSecretKey: req.adminToken.schoolSecretKey,
  });
  const result = await newTerm.save();
  return res.send(result);
});

router.get("/", isAuth, async (req, res) => {
  const terms = await Terms.find({
    schoolSecretKey: req.adminToken.schoolSecretKey,
  }).sort("term");
  if (!terms) return res.status(400).send("Error, no term found...");
  res.send(terms);
});

module.exports = router;
