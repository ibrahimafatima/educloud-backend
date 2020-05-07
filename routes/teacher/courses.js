const express = require("express");
const isAuth = require("../../middleware/isAuth");
const isAdmin = require("../../middleware/isAdmin");
const isTeacher = require("../../middleware/isTeacher");
const {
  TeachersCourse,
  ValidateCourseAdded,
} = require("../../model/teachers/courses");
const { Exams } = require("../../model/exams/exams");
const { Timetable } = require("../../model/teachers/timetable");
const { AddClass } = require("../../model/admin/classes");
const { TeacherDetails } = require("../../model/teachers/teachers");
//const { TeachersCourse } = require("../../model/teachers/courses");

const router = express.Router();

router.post("/", [isAuth, isTeacher], async (req, res) => {
  const { error } = ValidateCourseAdded(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const class_name = await AddClass.findOne({ className: req.body.className });
  if (!class_name) return res.status(400).send("Invalid class name");

  const course = await TeachersCourse.findOne({
    $and: [
      { schoolSecretKey: req.adminToken.schoolSecretKey },
      { teacherID: req.adminToken.teacherID },
      { className: req.body.className },
      { name: req.body.name },
    ],
  });

  if (course)
    return res
      .status(400)
      .send(`You already added ${req.body.name} in ${req.body.className}.`);

  const teacher_course = new TeachersCourse({
    name: req.body.name,
    className: req.body.className,
    teacherID: req.adminToken.teacherID,
    schoolSecretKey: req.adminToken.schoolSecretKey,
  });

  //increase teacher number of subject by 1
  let teacher = await TeacherDetails.findOne({
    $and: [
      { teacherID: req.adminToken.teacherID },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  });

  teacher.numberOfSubject++;
  await teacher.save();

  const result = await teacher_course.save();
  res.send(result);
});

//FOR THE GET ENDPOINT HERE SHOULD NOT ONLY GET BASE ON TEACHERID
//BUT ALSO ON SCHOOL SECRTE KEY

router.get("/", [isAuth, isTeacher], async (req, res) => {
  const courses = await TeachersCourse.find({
    $and: [
      { teacherID: req.adminToken.teacherID },
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

router.get("/:id", [isAuth], async (req, res) => {
  const course = await TeachersCourse.find({
    $and: [
      { teacherID: req.params.id },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  }).select(["-__v"]);
  if (!course) return res.status(404).send("No subject found");
  res.send(course);
});

router.put("/:id", [isAuth, isTeacher], async (req, res) => {
  const { error } = ValidateCourseAdded(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const courses = await TeachersCourse.findById(req.params.id);
  if (!courses) return res.status(400).send("The course does not exist");
  const exams = await Exams.findOne({
    $and: [
      { className: courses.className },
      { teacherID: courses.teacherID },
      { subject: courses.name },
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
      { teacherID: courses.teacherID },
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

router.delete("/:id", [isAuth, isTeacher], async (req, res) => {
  const courses = await TeachersCourse.findById(req.params.id);
  if (!courses) return res.status(400).send("The course does not exist");
  const exams = await Exams.findOne({
    $and: [
      { className: courses.className },
      { teacherID: courses.teacherID },
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
      { teacherID: courses.teacherID },
    ],
  });
  if (timetable)
    return res
      .status(400)
      .send(
        "Update or delete the timetable for this subject before deleting it."
      );
  const result = await courses.remove();
  //decrease teacher number of subject by 1
  let teacher = await TeacherDetails.findOne({
    $and: [
      { teacherID: req.adminToken.teacherID },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  });

  teacher.numberOfSubject--;
  await teacher.save();
  res.send(result);
});

module.exports = router;
