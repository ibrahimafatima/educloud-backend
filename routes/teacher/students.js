const express = require("express");
const mongoose = require("mongoose");
const isAuth = require("../../middleware/isAuth");
const isTeacher = require("../../middleware/isTeacher");
const { ValidateObjectId } = require("../../validation/validate_objectId");
const {
  StudentDetails,
  ValidateStudentDetails
} = require("../../model/students/students");

const router = express.Router();

//HERE THE TEACHER CAN ONLY ADD THE CLASSES WHERE HE/SHE TEACHES
//AND I AM JUST SIMULATING THE CLASS IN THE BODY HERE IN THE
//REAL APP THE CLASS WILL BE SET AUTOMATICALLY SINCE THE TEACHER
//WILL HAVE TO CLICK ON THE CLASS TO ADD.
router.post("/add", [isAuth, isTeacher], async (req, res) => {
  const { error } = ValidateStudentDetails(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  if (req.adminToken.classInCharge !== req.body.class_name)
    return res
      .status(401)
      .send(
        `You do not have permission to add student in ${req.body.class_name}`
      );

  const student = await StudentDetails.findOne({
    registration_number: req.body.registration_number
  });
  if (student)
    return res
      .status(400)
      .send("The student with this registration number is already added");
  const added_student = new StudentDetails({
    registration_number: req.body.registration_number,
    class_name: req.body.class_name,
    year: req.body.year,
    term: req.body.term,
    isRegistered: false
  });
  const result = await added_student.save();
  res.send(result);
});

router.put("/update/:id", [isAuth, isTeacher], async (req, res) => {
  const isValidId = mongoose.Types.ObjectId.isValid(req.params.id);
  if (!isValidId) return res.send("Invalid id type");
  const { error } = ValidateStudentDetails(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const student = await StudentDetails.findByIdAndUpdate(
    req.params.id,
    {
      registration_number: req.body.registration_number,
      class_name: req.body.class_name,
      year: req.body.year,
      term: req.body.term
    },
    { new: true }
  );
  if (!student) return res.status(400).send("The student does not exist");
  res.send(student);
});

router.delete("/delete/:id", [isAuth, isTeacher], async (req, res) => {
  const { error } = ValidateObjectId(req.params);
  if (error) return res.status(400).send(error.details[0].message);
  const result = await StudentDetails.findByIdAndRemove(req.params.id);
  res.send(result);
});

router.delete("/all", [isAuth, isTeacher], async (req, res) => {
  const students = await StudentDetails.find({
    class_name: req.body.class_name
  }).remove();
  res.send(students);
});

module.exports = router;
