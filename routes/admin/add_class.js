const express = require("express");
const mongoose = require("mongoose");
config = require("config");
const validaObjectId = require("../../middleware/validateObjectId");
mongoose.set("useFindAndModify", false);
const isAuth = require("../../middleware/isAuth");
const isAdmin = require("../../middleware/isAdmin");
const { AddClass, ValidateClasses } = require("../../model/admin/classes");
const { Timetable } = require("../../model/teachers/timetable");
const { TeacherDetails } = require("../../model/teachers/teachers");
const { TeachersCourse } = require("../../model/teachers/courses");
const { StudentDetails } = require("../../model/students/students");

const router = express.Router();

router.post("/", [isAuth, isAdmin], async (req, res) => {
  const { error } = ValidateClasses(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const classes = await AddClass.findOne({ className: req.body.className });
  if (classes)
    return res.status(400).send("The Class you entered already exist...");

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

router.get("/", [isAuth], async (req, res) => {
  const classes = await AddClass.find({
    schoolSecretKey: req.adminToken.schoolSecretKey,
  }).sort("level");
  if (!classes) return res.status(400).send("Error, no class found...");
  res.send(classes);
});

router.get("/:id", [isAuth, isAdmin], async (req, res) => {
  const classes = await AddClass.findOne({
    _id: req.params.id,
  });
  if (!classes) return res.status(404).send("No class found with the given ID");
  res.send(classes);
});

router.put("/:id", [isAuth, isAdmin], async (req, res) => {
  //const classes = await AddClass.findOne({ className: req.body.className });
  // if (classes)
  //   return res.status(400).send("The Class you entered already exist...");
  const clas = await AddClass.findById(req.params.id);
  if (!clas) return res.status(404).send("Class not found");
  const classes = await AddClass.findOne({ className: req.body.className });
  if (classes)
    return res.status(400).send("The Class you entered already exist...");
  const timetable = await Timetable.findOne({
    className: clas.className,
  });
  if (timetable)
    return res
      .status(404)
      .send(
        "Delete all timetable where this class is added before updating it."
      );
  const teacher = await TeacherDetails.findOne({
    className: clas.className,
  });
  if (teacher)
    return res
      .status(404)
      .send(
        "Delete or update teachers where this class is added before updating it."
      );
  const course = await TeachersCourse.findOne({
    className: clas.className,
  });
  if (course)
    return res
      .status(404)
      .send(
        "Delete or update courses where this class is added before updating it."
      );
  const student = await StudentDetails.findOne({
    class_name: clas.className,
  });
  if (student)
    return res
      .status(404)
      .send(
        "Delete or update students info where this class is added before updating it."
      );
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

router.delete("/:id", [isAuth, isAdmin, validaObjectId], async (req, res) => {
  const clas = await AddClass.findById(req.params.id);
  if (!clas) return res.status(404).send("Class not found");
  const timetable = await Timetable.findOne({
    className: clas.className,
  });
  if (timetable)
    return res
      .status(404)
      .send(
        "Delete all timetable where this class is added before deleting it."
      );
  const teacher = await TeacherDetails.findOne({
    className: clas.className,
  });
  if (teacher)
    return res
      .status(404)
      .send(
        "Delete or update teachers where this class is added before deleting it."
      );
  const course = await TeachersCourse.findOne({
    className: clas.className,
  });
  if (course)
    return res
      .status(404)
      .send(
        "Delete or update courses where this class is added before deleting it."
      );
  const student = await StudentDetails.findOne({
    class_name: clas.className,
  });
  if (student)
    return res
      .status(404)
      .send(
        "Delete or update students info where this class is added before deleting it."
      );
  const classToRemove = await AddClass.findByIdAndRemove(req.params.id);
  res.send(classToRemove);
});

module.exports = router;
