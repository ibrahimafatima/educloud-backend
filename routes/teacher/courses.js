const express = require("express");
//const Fawn = require("fawn");
const isAuth = require("../../middleware/isAuth");
const isAdmin = require("../../middleware/isAdmin");
const { Exams } = require("../../model/exams/exams");
const isTeacher = require("../../middleware/isTeacher");
const { ClassesDetails } = require("../../model/admin/classes_managment");
const { Timetable } = require("../../model/teachers/timetable");
const { TeacherDetails } = require("../../model/teachers/teachers_managment");
const {
  TeachersCourse,
  ValidateCourseAdded,
} = require("../../model/teachers/courses");

//Fawn.init(mongoose);

const router = express.Router();

router.post("/", [isAuth, isTeacher], async (req, res) => {
  const { error } = ValidateCourseAdded(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const classByName = await ClassesDetails.findOne({
    $and: [
      { className: req.body.className },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  });
  if (!classByName) return res.status(400).send("Invalid class name");

  const course = await TeachersCourse.findOne({
    $and: [
      { schoolSecretKey: req.adminToken.schoolSecretKey },
      { className: req.body.className },
      { name: req.body.name },
    ],
  });

  if (course)
    return res.status(400).send(`${req.body.name} in ${req.body.className}.`);

  const newCourse = new TeachersCourse({
    name: req.body.name.toUpperCase(),
    className: req.body.className,
    registrationID: req.adminToken.registrationID,
    schoolSecretKey: req.adminToken.schoolSecretKey,
  });

  //increase teacher number of subject by 1
  let teacher = await TeacherDetails.findOne({
    $and: [
      { registrationID: req.adminToken.registrationID },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  });

  //var task = Fawn.task();
  //USE FAWN HERE FOR TRANSACTION
  teacher.numberOfSubject++;
  await teacher.save();

  const result = await newCourse.save();
  res.send(result);
});

//FOR THE GET ENDPOINT HERE SHOULD NOT ONLY GET BASE ON registrationID
//BUT ALSO ON SCHOOL SECRTE KEY

router.get("/", [isAuth, isTeacher], async (req, res) => {
  const courses = await TeachersCourse.find({
    $and: [
      { registrationID: req.adminToken.registrationID },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  }).select(["-__v"]);
  if (!courses) return res.status(404).send("No subject found");
  res.send(courses);
});

router.get("/admin", [isAuth, isAdmin], async (req, res) => {
  const courses = await TeachersCourse.find({
    schoolSecretKey: req.adminToken.schoolSecretKey,
  }).sort("className");
  if (!courses) return res.status(404).send("No subject found");
  res.send(courses);
});

router.get("/byID/:id", [isAuth], async (req, res) => {
  const course = await TeachersCourse.findById(req.params.id);
  if (!course) return res.status(404).send("No subject found");
  res.send(course);
});

router.get("/registrationID/:id", [isAuth], async (req, res) => {
  const course = await TeachersCourse.find({
    $and: [
      { registrationID: req.params.id },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  }).select(["-__v"]);
  if (!course) return res.status(404).send("No subject found");
  res.send(course);
});

router.put("/update/:id", [isAuth, isTeacher], async (req, res) => {
  const { error } = ValidateCourseAdded(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const courses = await TeachersCourse.findById(req.params.id);
  if (!courses) return res.status(400).send("The course does not exist");
  const exams = await Exams.findOne({
    $and: [
      { className: courses.className },
      { registrationID: courses.registrationID },
      { subject: courses.name.toUpperCase() },
    ],
  });
  if (exams)
    return res
      .status(400)
      .send(
        "Delete or update exams you scheduled for this subject before updating it."
      );

  const timetable = await Timetable.findOne({
    $and: [
      { name: courses.name },
      { className: courses.className },
      { registrationID: courses.registrationID },
    ],
  });
  if (timetable)
    return res
      .status(400)
      .send(
        "Update or delete the timetable for this subject before updating it."
      );

  const course = await TeachersCourse.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      className: req.body.className,
    },
    { new: true }
  );
  if (!course) return res.status(400).send("Update cannot be committed");
  res.send(course);
});

router.delete("/delete/:id", [isAuth, isTeacher], async (req, res) => {
  const courses = await TeachersCourse.findById(req.params.id);
  if (!courses) return res.status(400).send("The course does not exist");

  const exams = await Exams.findOne({
    $and: [
      { className: courses.className },
      { registrationID: courses.registrationID },
      { subject: courses.name },
    ],
  });
  if (exams)
    return res
      .status(400)
      .send(
        "Delete or update exams you schedule for this subject before deleting it."
      );

  const timetable = await Timetable.findOne({
    $and: [
      { name: courses.name },
      { className: courses.className },
      { registrationID: courses.registrationID },
    ],
  });
  if (timetable)
    return res
      .status(400)
      .send(
        "Update or delete the timetable for this subject before deleting it."
      );

  let teacher = await TeacherDetails.findOne({
    $and: [
      { registrationID: req.adminToken.registrationID },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  });

  //USE FAWN HERE FOR TRANSACTION
  const result = await courses.remove();
  teacher.numberOfSubject--;
  await teacher.save();
  res.send(result);
});

module.exports = router;
