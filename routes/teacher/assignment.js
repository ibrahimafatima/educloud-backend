const express = require("express");
const {
  Assignment,
  ValidateAssignment,
} = require("../../model/teachers/assignment");
const { TeachersCourse } = require("../../model/teachers/courses");
const isAuth = require("../../middleware/isAuth");
const isTeacher = require("../../middleware/isTeacher");
const { notify } = require("../pusher/notify");

const router = express.Router();

router.post("/", [isAuth, isTeacher], async (req, res) => {
  const { error } = ValidateAssignment(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const assignmentSize = await Assignment.find({
    $and: [
      { teacherID: req.adminToken.teacherID },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  });
  if (assignmentSize.length >= 10)
    return res.status(400).send("Assignment book full, kindly empty it.");
  const verifyClass = await TeachersCourse.findOne({
    $and: [
      { className: req.body.className },
      { teacherID: req.adminToken.teacherID },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  });
  if (!verifyClass)
    return res
      .status(400)
      .send(`You cannot post assignment to ${req.body.className}`);
  const newAssignment = new Assignment({
    title: req.body.title,
    aMessage: req.body.aMessage,
    className: req.body.className,
    teacherID: req.adminToken.teacherID,
    postedBy: req.adminToken.username,
    toBeSubmittedOn: req.body.toBeSubmittedOn,
    schoolSecretKey: req.adminToken.schoolSecretKey,
  });
  const result = await newAssignment.save((err, obj) => {
    const school = req.adminToken.schoolName;
    notify(school, "assignment");
  });
  res.send(result + " " + assignmentSize.length);
});

router.get("/", [isAuth], async (req, res) => {
  const assignment = await Assignment.find({
    $and: [
      { status: "New" },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  })
    .limit(3)
    .sort("-postedOn");
  if (!assignment) return res.status(404).send("Assignment not found");
  res.send(assignment);
});

router.get("/student/:id", [isAuth], async (req, res) => {
  const assignment = await Assignment.find({
    $and: [
      { status: "New" },
      { className: req.params.id },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  }).sort("-postedOn");
  if (!assignment) return res.status(404).send("Assignment not found");
  res.send(assignment);
});

router.get("/:id", [isAuth], async (req, res) => {
  const assignment = await Assignment.find({
    $and: [
      { status: "New" },
      { teacherID: req.params.id },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  }).sort("-postedOn");
  if (!assignment) return res.status(404).send("Assignment not found");
  res.send(assignment);
});

router.delete("/:id", [isAuth, isTeacher], async (req, res) => {
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) return res.status(400).send("The assignment does not exist");
  const result = await assignment.remove();
  res.send(result);
});

router.put("/next-year", [isAuth, isTeacher], async (req, res) => {
  const new_year_assignment = await Assignment.updateMany(
    {
      $and: [
        { schoolSecretKey: req.adminToken.schoolSecretKey },
        { teacherID: req.adminToken.teacherID },
      ],
    },
    { $set: { status: "Old" } }
  );
  res.send(new_year_assignment);
});

module.exports = router;
