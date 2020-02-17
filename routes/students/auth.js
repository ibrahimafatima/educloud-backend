const express = require("express");
const bcrypt = require("bcrypt");
const {
  StudentDetails,
  ValidateStudentAuth
} = require("../../model/students/students");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { error } = ValidateStudentAuth(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  let student = await StudentDetails.findOne({
    registration_number: req.body.registration_number
  });
  if (!student) return res.status(400).send("Invalid registration number");
  if (student.isRegistered)
    return res.status(400).send("This credential is already registered");
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
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
    registration_number: req.body.registration_number
  });
  if (!student) return res.status(400).send("Invalid registration number");
  if (!student.password)
    return res.status(400).send("You need to register first.");
  const isValidPass = await bcrypt.compare(req.body.password, student.password);
  if (!isValidPass) return res.status(400).send("Invalid credentials");
  const token = student.generateStudentToken();
  res.header("x-auth-token", token).send(token);
});

module.exports = router;
