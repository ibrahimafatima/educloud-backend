const express = require("express");
const { hash, unhash } = require("../../utilities/hashed");
const {
  StudentDetails,
  validateStudentLogin,
} = require("../../model/students/students_managment");

const router = express.Router();

router.post("/register", async (req, res) => {
  const { error } = validateStudentLogin(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  let student = await StudentDetails.findOne({
    $and: [
      { username: req.body.username.trim() },
      { registrationID: req.body.registrationID.trim() },
    ],
  });
  if (!student) return res.status(400).send("Invalid registration number");
  if (student.isRegistered)
    return res.status(400).send("This credential is already registered");
  if (student.username !== req.body.username.trim())
    return res.status(400).send("Invalid username");
  const hashedPassword = await hash(req.body.password.trim());
  student.isRegistered = true;
  student.password = hashedPassword;
  student.isStudent = true;
  await student.save();
  const token = student.generateStudentToken();
  res.header("x-auth-token", token).send(token);
});

router.post("/login", async (req, res) => {
  const { error } = validateStudentLogin(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const student = await StudentDetails.findOne({
    username: req.body.username.trim(),
  });
  if (!student) return res.status(400).send("Invalid username or password");
  if (!student.password)
    return res.status(400).send("You need to register first.");
  const isValidPass = await unhash(req.body.password.trim(), student.password);
  if (!isValidPass) return res.status(400).send("Invalid username or password");
  const token = student.generateStudentToken();
  res.header("x-auth-token", token).send(token);
});

router.post("/confirm-account", async (req, res) => {
  const studentUser = await StudentDetails.findOne({
    $and: [
      { username: req.body.username.trim() },
      { registrationID: req.body.registrationID.trim() },
    ],
  });
  if (!studentUser)
    return res.status(404).send("Invalid username or registrationID");
  res.send(studentUser);
});

router.post("/reset-password", async (req, res) => {
  const user = await StudentDetails.findOne({
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
