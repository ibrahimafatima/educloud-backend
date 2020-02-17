const express = require("express");
const isAuth = require("../../middleware/isAuth");
const isTeacher = require("../../middleware/isTeacher");
const { Exams } = require("../../model/exams/exams");

const router = express.Router();

router.get("/", [isAuth, isTeacher], async (req, res) => {
  const exams = await Exams.find({ teacher: req.adminToken._id });
  if (!exams) return res.status(400).send("No exams found...");
  res.send(exams);
});

module.exports = router;
