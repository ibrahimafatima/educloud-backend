const express = require("express");
const bcrypt = require("bcrypt");
const {
  StudentDetails,
  ValidateStudentAuth,
} = require("../../model/students/students");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { error } = ValidateStudentAuth(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  let student = await StudentDetails.findOne({
    registration_number: req.body.registration_number.trim(),
  });
  if (!student) return res.status(400).send("Invalid registration number");
  if (student.isRegistered)
    return res.status(400).send("This credential is already registered");
  if (student.name !== req.body.name.trim())
    return res.status(400).send("Invalid name provided");
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password.trim(), salt);
  student.isRegistered = true;
  student.password = hashedPassword;
  student.isStudent = true;
  await student.save();
  const token = student.generateStudentToken();
  res.header("x-auth-token", token).send(token);
});

router.post("/login", async (req, res) => {
  const { error } = ValidateStudentAuth(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const student = await StudentDetails.findOne({
    registration_number: req.body.registration_number.trim(),
  });
  if (!student) return res.status(400).send("Invalid registration number");
  if (!student.password)
    return res.status(400).send("You need to register first.");
  const isValidPass = await bcrypt.compare(
    req.body.password.trim(),
    student.password
  );
  if (!isValidPass) return res.status(400).send("Invalid credentials");
  const token = student.generateStudentToken();
  res.header("x-auth-token", token).send(token);
});

router.post("/confirm-account", async (req, res) => {
  const studentUser = await StudentDetails.findOne({
    $and: [
      { name: req.body.name.trim() },
      { registration_number: req.body.registration_number.trim() },
    ],
  });
  if (!studentUser) return res.status(404).send("Invalid username or reg. num");
  res.send(studentUser);
});

router.post("/reset-password", async (req, res) => {
  const user = await StudentDetails.findOne({
    registration_number: req.body.registration_number.trim(),
  });
  if (!user) return res.status(404).send("invalid reg. number");
  const salt = await bcrypt.genSalt(10);
  const newHashedPassword = await bcrypt.hash(req.body.password.trim(), salt);
  user.password = newHashedPassword;
  await user.save();
  res.send("Ok");
});

module.exports = router;
