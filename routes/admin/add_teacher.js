config = require("config");
const Fawn = require("fawn");
const express = require("express");
const mongoose = require("mongoose");
const isAuth = require("../../middleware/isAuth");
const isAdmin = require("../../middleware/isAdmin");
const { Exams } = require("../../model/exams/exams");
const { AddClass } = require("../../model/admin/classes");
const { Timetable } = require("../../model/teachers/timetable");
const { Assignment } = require("../../model/teachers/assignment");
const { TeachersCourse } = require("../../model/teachers/courses");
const validateObjectId = require("../../middleware/validateObjectId");
const {
  TeacherDetails,
  validateTeacherDetails,
} = require("../../model/teachers/teachers");
const router = express.Router();

Fawn.init(mongoose);

//ADDING A TEACHER TO THE SCHOOL
router.post("/", [isAuth, isAdmin], async (req, res) => {
  const { error } = validateTeacherDetails(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let teacher1 = await TeacherDetails.findOne({
    teacherID: req.body.teacherID,
  });
  if (teacher1)
    return res
      .status(400)
      .send("The teacher with the given ID is already added!");

  let teacher2 = await TeacherDetails.findOne({
    username: req.body.username,
  });
  if (teacher2) return res.status(400).send("The username is already in use!");

  const classToUpdate = await AddClass.findOne({
    className: req.body.className,
  });

  if (classToUpdate.className !== "None" && classToUpdate.isInCharge) {
    return res
      .status(400)
      .send(`The class is already in charge by another teacher`);
  }

  const newTeacher = new TeacherDetails({
    role: "Teacher",
    teacherID: req.body.teacherID,
    username: req.body.username,
    schoolName: req.adminToken.schoolName,
    schoolSecretKey: req.adminToken.schoolSecretKey,
    className: req.body.className,
    addedBy: req.adminToken.username,
    numberOfSubject: 0,
  });

  classToUpdate.isInCharge = true;

  //USE FAWN HERE LATER TO HANDLE THE TRANSACTION
  await classToUpdate.save();
  const result = await newTeacher.save();
  res.send(result);
});

//GET ALL TEACHERS OF A SCHOOL
router.get("/", [isAuth], async (req, res) => {
  const teachers = await TeacherDetails.find({
    schoolSecretKey: req.adminToken.schoolSecretKey,
  }).sort("username");
  if (!teachers) return res.status(400).send("Couldnt get teachers list");
  res.send(teachers);
});

//GET A TEACHER BY IT'S TEACHERID
router.get("/:id", [isAuth], async (req, res) => {
  const teacher = await TeacherDetails.findOne({
    $and: [
      { teacherID: req.params.id },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  });
  if (!teacher)
    return res.status(404).send("No teacher found with the given ID");
  res.send(teacher);
});

//GET A TEACHER BY MONGODB _id
router.get("/teacher/:id", [isAuth], async (req, res) => {
  const teacher = await TeacherDetails.findOne({
    $and: [
      { _id: req.params.id },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  });
  if (!teacher)
    return res.status(404).send("No teacher found with the given ID");
  res.send(teacher);
});

//UPDATE A TEACHER DETAILS
router.put("/:id", [isAuth, isAdmin, validateObjectId], async (req, res) => {
  const { error } = validateTeacherDetails(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //DISALLOW USER TO UPDATE THE TEACHERID
  const t = await TeacherDetails.findById(req.params.id);
  if (t.teacherID !== req.body.teacherID)
    return res.status(400).send("You cannot update teacherID...");

  const teacher = await TeacherDetails.findByIdAndUpdate(
    req.params.id,
    {
      teacherID: req.body.teacherID,
      username: req.body.username,
      className: req.body.className,
      lastUpdatedBy: req.adminToken.username,
    },
    { new: true }
  );
  res.send(teacher);
});

router.delete("/:id", [isAuth, isAdmin, validateObjectId], async (req, res) => {
  const teacherToDelete = await TeacherDetails.findById(req.params.id);
  if (!teacherToDelete) return res.status(404).send("Teacher not found!");
  const course = await TeachersCourse.findOne({
    teacherID: teacherToDelete.teacherID,
  });
  if (course)
    return res
      .status(404)
      .send(
        "Admin or Teacher should clear all his courses before you can delete"
      );
  const timetable = await Timetable.findOne({
    teacherID: teacherToDelete.teacherID,
  });
  if (timetable)
    return res
      .status(404)
      .send(
        "Admin or Teacher should clear all his activities in timetable before you can delete"
      );
  const exams = await Exams.findOne({
    teacherID: teacherToDelete.teacherID,
  });
  if (exams)
    return res
      .status(404)
      .send(
        "Admin or Teacher should clear all exams scheduled before you can delete"
      );
  const assignment = await Assignment.findOne({
    teacherID: teacherToDelete.teacherID,
  });
  if (assignment)
    return res
      .status(404)
      .send(
        "Admin or Teacher should clear all assignment posted before you can delete"
      );

  //Exam, Assignment, Timetable
  const teacher = await TeacherDetails.findByIdAndRemove(req.params.id);
  res.send(teacher);
});

module.exports = router;
