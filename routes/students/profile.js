const express = require("express");
const {
  StudentDetails,
  ValidateStudentUpdate
} = require("../../model/students/students");
const isAuth = require("../../middleware/isAuth");
const isStudent = require("../../middleware/isStudent");

const router = express.Router();

router.put("/me", [isAuth, isStudent], async (req, res) => {
  const { error } = ValidateStudentUpdate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const student = await StudentDetails.findById(req.adminToken._id);
  if (!student) res.status(400).send("Cannot proceed, invalid id");
  (student.dob = req.body.dob),
    (student.father_name = req.body.father_name),
    (student.mother_name = req.body.mother_name),
    (student.gender = req.body.gender),
    (student.dbo = req.body.dob),
    (student.email = req.body.email),
    (student.address = req.body.address),
    (student.phone = req.body.phone);
  const result = await student.save();
  res.send(result);
});

router.post("/me", [isAuth, isStudent], async (req, res) => {
  const profile = await StudentDetails.findById(req.adminToken._id);
  if (!profile) return res.status(404).send("Profile not found");
  res.send(profile);
});

module.exports = router;
