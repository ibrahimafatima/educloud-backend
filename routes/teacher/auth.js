const express = require("express");
const bcrypt = require("bcrypt");
const {
  TeacherDetails,
  ValidateTeacherAuth,
} = require("../../model/teachers/teachers");

const router = express.Router();

//-------TEACHER RGISTER SEND ALREADY IN USE IF TEAHCER IS REGISTERED
router.post("/register", async (req, res) => {
  const { error } = ValidateTeacherAuth(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  let teacher = await TeacherDetails.findOne({
    teacherID: req.body.teacherID.trim(),
  });
  if (!teacher) return res.status(400).send("Invalid teacher ID or username");
  if (teacher.password)
    return res.status(400).send("Teacher already registered");

  teacher = await TeacherDetails.findOne({
    username: req.body.username.trim(),
  });
  if (!teacher) return res.status(400).send("Invalid teacher ID or username");
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password.trim(), salt);
  teacher.isTeacher = true;
  teacher.password = hashedPassword;
  await teacher.save();
  const token = teacher.generateTeacherAuthToken();
  res.header("x-auth-token", token).send(token);
});

router.post("/login", async (req, res) => {
  const { error } = ValidateTeacherAuth(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const teacher = await TeacherDetails.findOne({
    username: req.body.username.trim(),
  });
  if (!teacher) return res.status(400).send("Invalid credentials");
  if (req.body.teacherID.trim() !== teacher.teacherID)
    return res.status(400).send("Invalid teacher ID");
  if (!teacher.password)
    return res.status(400).send("You need to register first.");
  const password = await bcrypt.compare(
    req.body.password.trim(),
    teacher.password
  );
  if (!password) return res.status(400).send("Invalid credentials");
  const token = teacher.generateTeacherAuthToken();
  res.header("x-auth-token", token).send(token);
});

router.post("/confirm-account", async (req, res) => {
  const teacherUser = await TeacherDetails.findOne({
    username: req.body.username.trim(),
  });
  if (!teacherUser) return res.status(404).send("Invalid username");
  if (teacherUser.teacherID !== req.body.teacherID.trim())
    return res.status(404).send("Invalid teacherID.");
  res.send(teacherUser);
});

router.post("/reset-password", async (req, res) => {
  const user = await TeacherDetails.findOne({
    username: req.body.username.trim(),
  });
  if (!user) return res.status(404).send("invalid username");
  const salt = await bcrypt.genSalt(10);
  const newHashedPassword = await bcrypt.hash(req.body.password.trim(), salt);
  user.password = newHashedPassword;
  await user.save();
  res.send("Ok");
});
module.exports = router;
