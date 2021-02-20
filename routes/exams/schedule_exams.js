const express = require("express");
const mongoose = require("mongoose");
const { notify } = require("../pusher/notify");
const isAuth = require("../../middleware/isAuth");
const isAdmin = require("../../middleware/isAdmin");
const isTeacher = require("../../middleware/isTeacher");
const isStudent = require("../../middleware/isStudent");
const { TeachersCourse } = require("../../model/teachers/courses");
const { StudentDetails } = require("../../model/students/students_managment");
const { Exams, ValidateExams } = require("../../model/exams/exams");
const validateObjectId = require("../../middleware/validateObjectId");
const transporter = require('../../utilities/mail_transport');

const router = express.Router();

router.post("/", [isAuth, isTeacher], async (req, res) => {
  const { error } = ValidateExams(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const classes = await TeachersCourse.findOne({
    name: req.body.subject.toUpperCase(),
    className: req.body.className,
    registrationID: req.adminToken.registrationID,
  });
  if (!classes)
    return res
      .status(401)
      .send(
        `You are not authorized to add ${req.body.subject} exam in ${req.body.className}`
      );

  const newExam = new Exams({
    className: req.body.className,
    subject: req.body.subject.toUpperCase(),
    examName: req.body.examName,
    scheduledDate: req.body.scheduledDate,
    scheduledTime: req.body.scheduledTime,
    duration: req.body.duration,
    teacherRegID: req.adminToken.registrationID,
    state: "Pending",
    schoolName: req.adminToken.schoolName,
    schoolSecretKey: req.adminToken.schoolSecretKey,
  });
  // const result = await newExam.save((err, obj) => {
  //   const school = req.adminToken.schoolName;
  //   notify(school, "exam");
  // });
  const result = await newExam.save();

  const students = await StudentDetails.find({
    $and : [
      {schoolSecretKey: req.adminToken.schoolSecretKey},
      {className: req.body.className},
      {email: {$ne: "Not Specified"}}
    ]
  })

  students.map((s) => {
    var mailOptions = {
      from: 'edukloud@gmail.com',
      to: s.email,
      subject: `Edukloud - Upcoming Exam from ${req.adminToken.username}`,
      html: `<h3>Your ${req.body.subject.toUpperCase()} teacher has posted an upcoming Exam.</h3><br/><br/><h4>For more details go to <a href="www.google.com">Edukloud</a></h4><br/><br/><span><b>Good luck!</b></span><br/><br/><span>Edukloud, Africa's education on a single cloud.</span>`
  
    };
    
    transporter.sendMail(mailOptions, function(error, info){
      if (error) 
        console.log(error);
      else 
        console.log('Email sent: ' + info.response);
    });
  })

  res.send(result);
});

router.get("/students", [isAuth, isStudent], async (req, res) => {
  const exams = await Exams.find({
    $and: [
      { status: "New" },
      { className: req.adminToken.className },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  }).sort("-scheduledDate");
  if (!exams) return res.status(404).send("No exam was found");
  res.send(exams);
});

router.get("/teachers", [isAuth, isTeacher], async (req, res) => {
  const exams = await Exams.find({
    $and: [
      { status: "New" },
      { teacherRegID: req.adminToken.registrationID },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  }).sort("-scheduledDate");
  if (!exams) return res.status(404).send("No exam was found");
  res.send(exams);
});

router.get("/admin", [isAuth, isAdmin], async (req, res) => {
  const exams = await Exams.find({
    $and: [
      { status: "New" },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  }).sort("-scheduledDate");
  if (!exams) return res.status(404).send("No exam was found");
  res.send(exams);
});

// router.get("/all-exams", async (req, res) => {
//   const allExams = await Exams.find().limit(5).sort("-post_date");
//   if (!allExams) return res.status(404).send("No exams found");
//   res.send(allExams);
// });

router.get("/get/:id", [isAuth, validateObjectId], async (req, res) => {
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
      name: req.body.subject.toUpperCase(),
      className: req.body.className,
    });
    if (!classes)
      return res.status(400).send("Error, cannot update exam details");
    if (classes.teacherRegID !== req.adminToken.teacherRegID)
      return res
        .status(401)
        .send(
          `You are not authorized to add ${req.body.subject} exam in ${req.body.className}`
        );
    const updatedExam = await Exams.findByIdAndUpdate(req.params.id, {
      className: req.body.className,
      examName: req.body.examName,
      scheduledDate: req.body.scheduledDate,
      scheduledTime: req.body.scheduledTime,
      duration: req.body.duration,
      subject: req.body.subject.toUpperCase(),
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

router.delete("/delete/:id", [isAuth, isTeacher], async (req, res) => {
  if (!mongoose.Types.ObjectId.isValid(req.params.id))
    return res.status(400).send("Invalid id cannot update");
  const examToRemove = await Exams.findByIdAndRemove(req.params.id);
  res.send(examToRemove);
});

module.exports = router;
