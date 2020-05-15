const express = require("express");
const {
  TeacherDetails,
  ValidateTeacherUpdate,
} = require("../../model/teachers/teachers");
const isAuth = require("../../middleware/isAuth");
const isTeacher = require("../../middleware/isTeacher");

const router = express.Router();

router.put("/me", [isAuth, isTeacher], async (req, res) => {
  const { error } = ValidateTeacherUpdate(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const teacher = await TeacherDetails.findById(req.adminToken._id);
  if (!teacher) res.status(400).send("Cannot proceed, invalid id");
  (teacher.firstName = req.body.firstName.trim()),
    (teacher.lastName = req.body.lastName.trim()),
    (teacher.gender = req.body.gender.trim()),
    (teacher.dob = new Date(req.body.dob)),
    (teacher.email = req.body.email.trim()),
    (teacher.phone = req.body.phone.trim()),
    (teacher.address = req.body.address.trim());
  const result = await teacher.save();
  res.send(result);
});

// router.get("/me", isAuth, async (req, res) => {
//   const profile = await TeacherDetails.findById(req.adminToken._id);
//   if (!profile) return res.status(404).send("Profile not found");
//   res.send(profile);
// });

module.exports = router;
