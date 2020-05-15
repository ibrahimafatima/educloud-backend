const express = require("express");
const mongoose = require("mongoose");
const { notify } = require("../pusher/notify");
const isAuth = require("../../middleware/isAuth");
const isAdmin = require("../../middleware/isAdmin");
const isTeacher = require("../../middleware/isTeacher");
const isStudent = require("../../middleware/isStudent");
const { TeachersCourse } = require("../../model/teachers/courses");
const { Exams, ValidateExams } = require("../../model/exams/exams");
const validateObjectId = require("../../middleware/validateObjectId");

const router = express.Router();

router.post("/", [isAuth, isTeacher], async (req, res) => {
  const { error } = ValidateExams(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const classes = await TeachersCourse.findOne({
    name: req.body.subject,
    className: req.body.className,
  });
  if (!classes)
    return res.status(400).send("Error, cannot update exam details");
  if (classes.teacherID !== req.adminToken.teacherID)
    return res
      .status(401)
      .send(
        `You are not authorized to add ${req.body.subject} exam in ${req.body.className}`
      );

  const newExam = new Exams({
    className: req.body.className,
    subject: req.body.subject,
    exam_name: req.body.exam_name,
    schedule_date: req.body.schedule_date,
    schedule_time: req.body.schedule_time,
    duration: req.body.duration,
    teacherID: req.adminToken.teacherID,
    state: "Pending",
    schoolSecretKey: req.adminToken.schoolSecretKey,
  });
  const result = await newExam.save((err, obj) => {
    const school = req.adminToken.schoolName;
    notify(school, "exam");
  });
  //res.send([result, { term: students[0].term }]);
  res.send(result);
});

router.get("/student", [isAuth, isStudent], async (req, res) => {
  const exams = await Exams.find({
    $and: [
      { status: "New" },
      { className: req.adminToken.class_name },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  }).sort("-schedule_date");
  if (!exams) return res.status(404).send("No exam was found");
  res.send(exams);
});

router.get("/teacher", [isAuth, isTeacher], async (req, res) => {
  const exams = await Exams.find({
    $and: [
      { status: "New" },
      { teacherID: req.adminToken.teacherID },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  }).sort("-schedule_date");
  if (!exams) return res.status(404).send("No exam was found");
  res.send(exams);
});

router.get("/admin", [isAuth, isAdmin], async (req, res) => {
  const exams = await Exams.find({
    $and: [
      { Status: "New" },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  }).sort("-schedule_date");
  if (!exams) return res.status(404).send("No exam was found");
  res.send(exams);
});

router.get("/:id", [isAuth, validateObjectId], async (req, res) => {
  const exam = await Exams.findById(req.params.id);
  if (!exam) return res.status(404).send("No exam found with given id");
  res.send(exam);
});

router.put("/status/:id", [isAuth, isTeacher], async (req, res) => {
  const exam = await Exams.findById(req.params.id);
  if (exam.state === "Pending") {
    const updateStatus = await Exams.findByIdAndUpdate(
      req.params.id,
      {
        state: "Completed",
      },
      { new: true }
    );
    res.send(updateStatus);
  }
  if (exam.state === "Completed") {
    const updateStatus = await Exams.findByIdAndUpdate(
      req.params.id,
      {
        state: "Pending",
      },
      { new: true }
    );
    res.send(updateStatus);
  }
});

router.put(
  "/update/:id",
  [isAuth, isTeacher, validateObjectId],
  async (req, res) => {
    const { error } = ValidateExams(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const classes = await TeachersCourse.findOne({
      name: req.body.subject,
      className: req.body.className,
    });
    if (!classes)
      return res.status(400).send("Error, cannot update exam details");
    if (classes.teacherID !== req.adminToken.teacherID)
      return res
        .status(401)
        .send(
          `You are not authorized to add ${req.body.subject} exam in ${req.body.className}`
        );
    const updatedExam = await Exams.findByIdAndUpdate(req.params.id, {
      className: req.body.className,
      exam_name: req.body.exam_name,
      schedule_date: req.body.schedule_date,
      schedule_time: req.body.schedule_time,
      duration: req.body.duration,
      subject: req.body.subject,
    });
    res.send(updatedExam);
  }
);

router.put("/next-year", [isAuth, isAdmin], async (req, res) => {
  const new_year_exams = await Exams.updateMany(
    {
      $and: [{ schoolSecretKey: req.adminToken.schoolSecretKey }],
    },
    { $set: { status: "Old" } }
  );
  res.send(new_year_exams);
});

router.delete("/:id", [isAuth, isTeacher], async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send("Invalid id cannot update");
  const examToRemove = await Exams.findByIdAndRemove(req.params.id);
  res.send(examToRemove);
});

module.exports = router;
