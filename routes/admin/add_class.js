config = require("config");
const express = require("express");
const mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);
const isAuth = require("../../middleware/isAuth");
const isAdmin = require("../../middleware/isAdmin");
const { Timetable } = require("../../model/teachers/timetable");
const { TeachersCourse } = require("../../model/teachers/courses");
const { StudentDetails } = require("../../model/students/students");
const validaObjectId = require("../../middleware/validateObjectId");
const { TeacherDetails } = require("../../model/teachers/teachers");
const { AddClass, ValidateClasses } = require("../../model/admin/classes");

const router = express.Router();

//POST REQUEST FOR ADMIN TO ADD A CLASS
router.post("/", [isAuth, isAdmin], async (req, res) => {
  const { error } = ValidateClasses(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  //CHECK IF CLASSNAME ALREADY EXIST FOR THAT SCHOOL
  const classes = await AddClass.findOne({ className: req.body.className });
  if (classes)
    return res.status(400).send("The Class you entered already exist...");

  //IF CLASSNAME DOES NOT EXIST SAVE TO THE DB
  const newClass = new AddClass({
    className: req.body.className,
    classe: req.body.classe,
    amount_to_pay: req.body.amount_to_pay,
    level: req.body.level,
    addedBy: req.adminToken.username,
    schoolSecretKey: req.adminToken.schoolSecretKey,
    isInCharge: req.body.isInCharge,
  });

  const result = await newClass.save();
  return res.send(result);
});

//GET ALL CLASSES OF A PARTICULAR SCHOOL
router.get("/", [isAuth], async (req, res) => {
  const classes = await AddClass.find({
    schoolSecretKey: req.adminToken.schoolSecretKey,
  }).sort("level");
  if (!classes) return res.status(400).send("Error, no class found...");
  res.send(classes);
});

//GET A PARTICULAR CLASS USING THE MONGODB _id
router.get("/get/:id", [isAuth, isAdmin], async (req, res) => {
  const classes = await AddClass.findOne({
    _id: req.params.id,
  });
  if (!classes) return res.status(404).send("No class found with the given ID");
  res.send(classes);
});

//UPDATE A CLASS DETAILS
router.put("/update/:id", [isAuth, isAdmin], async (req, res) => {
  const clas = await AddClass.findById(req.params.id);
  if (!clas) return res.status(404).send("Class not found");

  //DONT UPDATE IF CLASSNAME IS MODIFIED DURING UPDATE
  //AND NAME GIVEN  IS ALREADY AVAILABLE

  if (clas.className !== req.body.className)
    return res.status(400).send("You cannot update a class name...");

  const classToUpdate = await AddClass.findByIdAndUpdate(
    req.params.id,
    {
      className: req.body.className,
      classe: req.body.classe,
      amount_to_pay: req.body.amount_to_pay,
      level: req.body.level,
      lastUpdatedBy: req.adminToken.username,
      isInCharge: req.body.isInCharge,
    },
    { new: true }
  );

  res.send(classToUpdate);
});

router.delete(
  "/delete/:id",
  [isAuth, isAdmin, validaObjectId],
  async (req, res) => {
    const clas = await AddClass.findById(req.params.id);
    if (!clas) return res.status(404).send("Class not found");
    const timetable = await Timetable.find({
      $and: [
        { className: clas.className },
        { schoolSecretKey: req.adminToken.schoolSecretKey },
      ],
    });
    if (timetable)
      return res
        .status(404)
        .send(
          "Remove all timetable where this class is added before deleting it."
        );
    const teacher = await TeacherDetails.find({
      $and: [
        { className: clas.className },
        { schoolSecretKey: req.adminToken.schoolSecretKey },
      ],
    });
    if (teacher)
      return res
        .status(404)
        .send(
          "Remove or update teachers info attached to this class before deleting."
        );
    const course = await TeachersCourse.find({
      $and: [
        { className: clas.className },
        { schoolSecretKey: req.adminToken.schoolSecretKey },
      ],
    });
    if (course)
      return res
        .status(404)
        .send(
          "Remove or update courses where this class is added before deleting it."
        );
    const student = await StudentDetails.find({
      $and: [
        { class_name: clas.className },
        { schoolSecretKey: req.adminToken.schoolSecretKey },
      ],
    });
    if (student)
      return res
        .status(404)
        .send(
          "Remove or update students info where this class is added before deleting it."
        );
    const classToRemove = await AddClass.findByIdAndRemove(req.params.id);
    res.send(classToRemove);
  }
);

module.exports = router;
