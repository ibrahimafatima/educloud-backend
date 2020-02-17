const express = require("express");
const bcrypt = require("bcrypt");
const {
  TeacherDetails,
  ValidateTeacherAuth
} = require("../../model/teachers/teachers");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { error } = ValidateTeacherAuth(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  let teacher = await TeacherDetails.findOne({
    teacherID: req.body.teacherID
  });
  if (!teacher) return res.status(400).send("Invalid teacher ID or username");
  teacher = await TeacherDetails.findOne({
    username: req.body.username
  });
  if (!teacher) return res.status(400).send("Invalid teacher ID or username");
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
  const hashedTeacherID = await bcrypt.hash(req.body.teacherID, salt);
  teacher.isTeacher = true;
  teacher.teacherID = hashedTeacherID;
  teacher.password = hashedPassword;
  await teacher.save();
  const token = teacher.generateTeacherAuthToken();
  res.header("x-auth-token", token).send(token);
});

router.post("/login", async (req, res) => {
  const { error } = ValidateTeacherAuth(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const teacher = await TeacherDetails.findOne({
    username: req.body.username
  });
  if (!teacher) return res.status(400).send("Invalid credentials");
  const teacherId = await bcrypt.compare(req.body.teacherID, teacher.teacherID);
  if (!teacherId) res.status(400).send("Invalid credentials");
  const password = await bcrypt.compare(req.body.password, teacher.password);
  if (!password) res.status(400).send("Invalid credentials");
  const token = teacher.generateTeacherAuthToken();
  res.header("x-auth-token", token).send(token);
});

module.exports = router;
