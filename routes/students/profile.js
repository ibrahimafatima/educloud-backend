const express = require("express");
const isAuth = require("../../middleware/isAuth");
const isStudent = require("../../middleware/isStudent");
const {
  StudentDetails,
  ValidateStudentUpdate,
} = require("../../model/students/students");

const router = express.Router();

router.put("/me", [isAuth, isStudent], async (req, res) => {
  const { error } = ValidateStudentUpdate(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const student = await StudentDetails.findById(req.adminToken._id);
  if (!student) res.status(400).send("Cannot proceed, invalid id");
  (student.dob = req.body.dob),
    (student.father_name = req.body.father_name.trim()),
    (student.mother_name = req.body.mother_name.trim()),
    (student.gender = req.body.gender.trim()),
    (student.dbo = req.body.dob.trim()),
    (student.email = req.body.email.trim()),
    (student.address = req.body.address.trim()),
    (student.phone = req.body.phone.trim());
  const result = await student.save();
  res.send(result);
});

router.post("/me", [isAuth, isStudent], async (req, res) => {
  const profile = await StudentDetails.findById(req.adminToken._id);
  if (!profile) return res.status(404).send("Profile not found");
  res.send(profile);
});

module.exports = router;
