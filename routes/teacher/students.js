const express = require("express");
const mongoose = require("mongoose");
const isAuth = require("../../middleware/isAuth");
const isTeacher = require("../../middleware/isTeacher");
const { ValidateObjectId } = require("../../validation/validate_objectId");
const {
  StudentDetails,
  ValidateStudentDetails,
} = require("../../model/students/students");

const router = express.Router();

//HERE THE TEACHER CAN ONLY ADD THE CLASSES WHERE HE/SHE TEACHES
//AND I AM JUST SIMULATING THE CLASS IN THE BODY HERE IN THE
//REAL APP THE CLASS WILL BE SET AUTOMATICALLY SINCE THE TEACHER
//WILL HAVE TO CLICK ON THE CLASS TO ADD.
router.post("/", [isAuth, isTeacher], async (req, res) => {
  const { error } = ValidateStudentDetails(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  if (req.adminToken.className !== req.body.class_name)
    return res
      .status(401)
      .send(
        `You do not have permission to add student in ${req.body.class_name}`
      );

  const student = await StudentDetails.findOne({
    registration_number: req.body.registration_number,
  });
  if (student)
    return res
      .status(400)
      .send("The student with this registration number is already added");
  const added_student = new StudentDetails({
    name: req.body.name,
    registration_number: req.body.registration_number,
    schoolSecretKey: req.adminToken.schoolSecretKey,
    class_name: req.adminToken.className,
    term: req.body.term,
    schoolName: req.adminToken.schoolName,
    role: "Student",
    isRegistered: false,
  });
  const result = await added_student.save();
  res.send(result);
});

router.put("/update/:id", [isAuth, isTeacher], async (req, res) => {
  const isValidId = mongoose.Types.ObjectId.isValid(req.params.id);
  if (!isValidId) return res.send("Invalid id type");
  const { error } = ValidateStudentDetails(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const studentInfo = await StudentDetails.findById(req.params.id);
  if (!studentInfo) return res.status(400).send("No such student found!");

  if (studentInfo.registration_number !== req.body.registration_number)
    return res
      .status(400)
      .send("You cannot update a registration number. Delete an add back!");

  if (studentInfo.class_name !== req.body.class_name)
    return res.status(400).send("You cannot update student class name");

  const student = await StudentDetails.findByIdAndUpdate(
    req.params.id,
    {
      class_name: req.body.class_name,
      name: req.body.name,
      term: req.body.term,
    },
    { new: true }
  );
  if (!student) return res.status(400).send("The student does not exist");
  res.send(student);
});

router.get("/", [isAuth], async (req, res) => {
  const students = await StudentDetails.find({
    schoolSecretKey: req.adminToken.schoolSecretKey,
  }).sort("name");
  if (!students) return res.status(400).send("Couldnt get students list");
  res.send(students);
});

router.get("/classname/:id", [isAuth], async (req, res) => {
  const students = await StudentDetails.find({
    $and: [
      { class_name: req.params.id },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  }).select(["-__v"]);
  if (!students) return res.status(404).send("No student found");
  res.send(students);
});

router.get("/reg/:id", [isAuth], async (req, res) => {
  const students = await StudentDetails.findOne({
    $and: [
      { registration_number: req.params.id },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  }).select(["-__v"]);
  if (!students) return res.status(404).send("No student found");
  res.send(students);
});

router.get("/ID/:id", [isAuth], async (req, res) => {
  const students = await StudentDetails.findById(req.params.id);
  if (!students) return res.status(404).send("No student found");
  res.send(students);
});

router.delete("/delete/:id", [isAuth, isTeacher], async (req, res) => {
  const { error } = ValidateObjectId(req.params);
  if (error) return res.status(400).send(error.details[0].message);
  const result = await StudentDetails.findByIdAndRemove(req.params.id);
  if (!result)
    return res.status(404).send("No student found with the given id");
  res.send(result);
});

router.delete("/all", [isAuth, isTeacher], async (req, res) => {
  const students = await StudentDetails.find({
    class_name: req.body.class_name,
  }).remove();
  res.send(students);
});

//MOVE CLASS TO NEXT TERM
router.put("/next-term", [isAuth, isTeacher], async (req, res) => {
  if (req.adminToken.className !== req.body.className)
    return res
      .status(401)
      .send(
        `You do not have permission to mofify student details in ${req.body.className}`
      );
  const new_term_student = await StudentDetails.updateMany(
    {
      $and: [
        { schoolSecretKey: req.adminToken.schoolSecretKey },
        { class_name: req.adminToken.className },
      ],
    },
    { $set: { term: req.body.term } }
  );
  res.send(new_term_student);
});

//MOVE CLASS TO NEXT YEAR
router.put("/next-year", [isAuth, isTeacher], async (req, res) => {
  const student = await StudentDetails.findOne({
    $and: [
      { registration_number: req.body.registration_number },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  });

  if (!student) return res.status(404).send("No such student found");

  const new_year_student = await StudentDetails.update(
    {
      $and: [
        { schoolSecretKey: req.adminToken.schoolSecretKey },
        { registration_number: req.body.registration_number },
        { class_name: req.adminToken.className },
      ],
    },
    {
      $set: {
        class_name: req.body.className,
        term: req.body.term,
        fee_paid: 0,
      },
    }
  );
  res.send(new_year_student);
});

module.exports = router;
