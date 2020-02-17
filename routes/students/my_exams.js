const express = require("express");
const isAuth = require("../../middleware/isAuth");
const isStudent = require("../../middleware/isStudent");
const { Exams } = require("../../model/exams/exams");

const router = express.Router();

router.get("/", [isAuth, isStudent], async (req, res) => {
  if (!req.adminToken.isStudent)
    return res.status(401).send("You are not a student yet");
  const exams = await Exams.find({ class_name: req.adminToken.class_name });
  if (!exams) return res.status(400).send("No exams available");
  res.status(200).send(exams);
});

module.exports = router;
