const express = require("express");
const Fawn = require("fawn");
const isAuth = require("../../middleware/isAuth");
const isAdmin = require("../../middleware/isAdmin");
const mongoose = require("mongoose");
const { AddClass } = require("../../model/admin/classes");
const validateObjectId = require("../../middleware/validateObjectId");
const {
  TeacherDetails,
  validateTeacherDetails
} = require("../../model/teachers/teachers");
const router = express.Router();

Fawn.init(mongoose);

router.post("/", [isAuth, isAdmin], async (req, res) => {
  const { error } = validateTeacherDetails(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  let teacherId = await TeacherDetails.findOne({
    teacherID: req.body.teacherID
  });
  if (teacherId)
    return res
      .status(400)
      .send("The teacher with the given ID is already added!");
  let username = await TeacherDetails.findOne({
    username: req.body.username
  });
  if (username) return res.status(400).send("The username is already in use!");

  const newTeacher = new TeacherDetails({
    teacherID: req.body.teacherID,
    username: req.body.username,
    classInCharge: req.body.classInCharge
  });
  //USE FAWN HERE LATER TO HANDLE THE TRANSACTION
  const classToUpdate = await AddClass.findOne({
    name: req.body.classInCharge
  });
  if (!classToUpdate) {
    const result = await newTeacher.save();
    return res.send(result);
  }

  if (classToUpdate.isInCharge)
    return res.status(400).send(`The class is already in charge by a teacher`);
  classToUpdate.isInCharge = true;
  classToUpdate.save();
  const result = await newTeacher.save();
  res.send(result);
});

router.get("/", [isAuth, isAdmin], async (req, res) => {
  const teachers = await TeacherDetails.find().sort("username");
  if (!teachers) return res.status(400).send("Couldnt get teachers list");
  if (teachers.length == 0)
    return res.status(400).send("Teacher list is empty for now.");
  res.send(teachers);
});

router.get("/:teacherID", [isAuth, isAdmin], async (req, res) => {
  const teacher = await TeacherDetails.findOne({
    teacherID: req.params.teacherID
  });
  if (!teacher)
    return res.status(404).send("No teacher found with the given ID");
  res.send(teacher);
});

router.delete("/:id", [isAuth, isAdmin, validateObjectId], async (req, res) => {
  const teacher = await TeacherDetails.findByIdAndRemove(req.params.id);
  res.send(teacher);
});

router.put("/:id", [isAuth, isAdmin, validateObjectId], async (req, res) => {
  const { error } = validateTeacherDetails(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const teacher = await TeacherDetails.findByIdAndUpdate(
    req.params.id,
    {
      teacherID: req.body.teacherID,
      username: req.body.username,
      classInCharge: req.body.classInCharge
    },
    { new: true }
  );
  res.send(teacher);
});

module.exports = router;
