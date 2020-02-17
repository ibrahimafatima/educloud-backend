const express = require("express");
const isAuth = require("../../middleware/isAuth");
const isTeacher = require("../../middleware/isTeacher");
const {
  TeachersCourse,
  ValidateCourseAdded,
  ValidateId
} = require("../../model/teachers/courses");
const mongoose = require("mongoose");
const { AddClass } = require("../../model/admin/classes");

const router = express.Router();

router.post("/", [isAuth, isTeacher], async (req, res) => {
  const { error } = ValidateCourseAdded(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const class_name = await AddClass.findOne({ name: req.body.className });
  if (!class_name) return res.status(400).send("Invalid class name");

  //ADD COURSE ONLY ONCE FOR A CLASS
  const teacher_course = new TeachersCourse({
    courseName: req.body.courseName,
    className: req.body.className,
    teacher: req.adminToken._id
  });
  const result = await teacher_course.save();
  res.send(result);
});

router.get("/courses", [isAuth, isTeacher], async (req, res) => {
  const courses = await TeachersCourse.find({
    teacher: req.adminToken._id
  }).select(["-_id", "-teacher", "-__v"]);
  res.send(courses);
});

router.put("/:id", [isAuth, isTeacher], async (req, res) => {
  const { error } = ValidateId(req.params);
  if (error) return res.status(400).send(error.details[0].message);
  const courses = await TeachersCourse.findByIdAndUpdate(
    req.params.id,
    {
      courseName: req.body.courseName,
      className: req.body.className
    },
    { new: true }
  );
  res.send(courses);
});

router.delete("/:id", [isAuth, isTeacher], async (req, res) => {
  const { error } = ValidateId(req.params);
  if (error) return res.status(400).send(error.details[0].message);
  const courses = await TeachersCourse.findById(req.params.id);
  if (!courses) return res.status(400).send("The course does not exist");
  const result = await courses.remove();
  res.send(result);
});

module.exports = router;
