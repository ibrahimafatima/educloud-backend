const express = require("express");
const isAuth = require("../../middleware/isAuth");
const validateObjectId = require("../../middleware/validateObjectId");
const isTeacher = require("../../middleware/isTeacher");
const { Exams, ValidateExams } = require("../../model/exams/exams");
const { TeachersCourse } = require("../../model/teachers/courses");
const { StudentDetails } = require("../../model/students/students");
const mongoose = require("mongoose");

const router = express.Router();

router.post("/post", [isAuth, isTeacher], async (req, res) => {
  const { error } = ValidateExams(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  //check if the teacher posting the exam is teaching the subject
  //for that particular class.
  const students = await StudentDetails.find({
    class_name: req.body.class_name
  });
  const classes = await TeachersCourse.findOne({
    courseName: req.body.subject,
    className: req.body.class_name
  });
  if (!classes)
    return res.status(400).send("Error, cannot update exam details");
  if (JSON.stringify(classes.teacher) !== JSON.stringify(req.adminToken._id))
    return res
      .status(401)
      .send(
        `You are not authorized to add ${req.body.subject} exam in ${req.body.class_name}`
      );
  /*const isExam = await Exams.find([{
    class_name:  req.body.class_name,
    subject: req.body.subject,
    exam_name: req.body.exam_name
  }]);
  if (isExam)
    return res
      .status(400)
      .send(`You already have ${req.body.exam_name}. Try another`);*/

  const newExam = new Exams({
    class_name: req.body.class_name,
    subject: req.body.subject,
    exam_name: req.body.exam_name,
    schedule_date: req.body.schedule_date,
    teacher: req.adminToken._id
  });
  const result = await newExam.save();
  res.send([result, { term: students[0].term }]);
});

router.put(
  "/update/:id",
  [isAuth, isTeacher, validateObjectId],
  async (req, res) => {
    const { error } = ValidateExams(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const classes = await TeachersCourse.findOne({
      courseName: req.body.subject,
      className: req.body.class_name
    });
    if (!classes)
      return res.status(400).send("Error, cannot update exam details");
    if (JSON.stringify(classes.teacher) !== JSON.stringify(req.adminToken._id))
      return res
        .status(401)
        .send(
          `You are not authorized to add ${req.body.subject} exam in ${req.body.class_name}`
        );
    const updatedExam = await Exams.findByIdAndUpdate(req.params.id, {
      class_name: req.body.class_name,
      exam_name: req.body.exam_name,
      schedule_date: req.body.schedule_date,
      subject: req.body.subject
    });
    res.send(updatedExam);
  }
);

router.delete("/delete/:id", [isAuth, isTeacher], async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send("Invalid id cannot update");

  const classes = await TeachersCourse.findOne({
    courseName: req.body.subject,
    className: req.body.class_name
  });
  if (!classes)
    return res.status(400).send("Error, cannot update exam details");
  if (JSON.stringify(classes.teacher) !== JSON.stringify(req.adminToken._id))
    return res
      .status(401)
      .send(
        `You are not authorized to add ${req.body.subject} exam in ${req.body.class_name}`
      );
  const examToRemove = await Exams.findByIdAndRemove(req.params.id);
  res.send(examToRemove);
});

module.exports = router;
