const express = require("express");
const isAuth = require("../../middleware/isAuth");
const isStudent = require("../../middleware/isStudent");
const { Mark } = require("../../model/teachers/mark");

const router = express.Router();

router.get("/", [isAuth, isStudent], async (req, res) => {
  if (!req.adminToken.isStudent) return res.send("You are not a student yet");
  const results = await Mark.find({
    registration_number: req.adminToken.registration_number
  });
  if (!results) return res.send("No result available");
  res.status(200).send(results);
});

module.exports = router;
