const express = require("express");
const { AddClass } = require("../../model/admin/classes");
const isAuth = require("../../middleware/isAuth");
const isTeacher = require("../../middleware/isTeacher");
const { StudentDetails } = require("../../model/students/students");

const router = express.Router();

//GET ALL STUDENT OF A PARTICULAR SUNBJECT
router.get("/", [isAuth, isTeacher], async (req, res) => {
  const classes = await AddClass.findOne({ name: req.body.name });
  if (!classes) return res.status(400).send("The class does not exist");
  const courses = await StudentDetails.find({
    class_name: req.body.name
  }).select(["-_id", "-isRegistered", "-__v", "-isStudent", "-password"]);
  res.send(courses);
});

module.exports = router;
