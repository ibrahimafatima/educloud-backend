const express = require("express");
const isAuth = require("../../middleware/isAuth");
const isAdmin = require("../../middleware/isAdmin");
const isTeacher = require("../../middleware/isTeacher");
const isStudent = require("../../middleware/isStudent");
const validateID = require("../../middleware/validateObjectId");
const { TeachersCourse } = require("../../model/teachers/courses");
const {
  Timetable,
  ValidateTimetable,
} = require("../../model/teachers/timetable");

const router = express.Router();

router.post("/", [isAuth, isTeacher], async (req, res) => {
  const { error } = ValidateTimetable(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const timetableByClass = await Timetable.findOne({
    $and: [
      { className: req.body.className },
      { name: req.body.name.toUpperCase() },
      { startTime: req.body.startTime },
      { endTime: req.body.endTime },
      { day: req.body.day },
      { registrationID: req.adminToken.registrationID },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  });
  if (timetableByClass)
    return res.status(400).send("This course is already added to timetable");
  const course = await TeachersCourse.findOne({
    $and: [
      { name: req.body.name.toUpperCase() },
      { className: req.body.className },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  });
  if (!course)
    return res
      .status(400)
      .send("Make sure you select the right class and subject");
  if (course.registrationID !== req.adminToken.registrationID)
    res
      .status(400)
      .send(`You dont teach ${req.body.name} in ${req.body.className}`);
  const addTimetable = new Timetable({
    className: req.body.className,
    name: req.body.name.toUpperCase(),
    day: req.body.day,
    startTime: req.body.startTime,
    endTime: req.body.endTime,
    registrationID: req.adminToken.registrationID,
    username: req.adminToken.username,
    schoolSecretKey: req.adminToken.schoolSecretKey,
  });
  const result = await addTimetable.save();
  res.send(result);
});

//for the teacher
router.get("/teacher", [isAuth, isTeacher], async (req, res) => {
  const teacherTimeTable = await Timetable.find({
    $and: [
      { registrationID: req.adminToken.registrationID },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  }).sort("day");
  if (!teacherTimeTable)
    return res.status(404).send("No subject found in timetable");
  res.send(teacherTimeTable);
});

//for the student
router.get("/student", [isAuth, isStudent], async (req, res) => {
  const studentTimeTable = await Timetable.find({
    $and: [
      { className: req.adminToken.className },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  }).sort("day");
  if (!studentTimeTable)
    return res.status(404).send("No subject found in timetable");
  res.send(studentTimeTable);
});

//for admin
router.get("/admin", [isAuth, isAdmin], async (req, res) => {
  const adminTimeTable = await Timetable.find({
    schoolSecretKey: req.adminToken.schoolSecretKey,
  }).sort("day");
  if (!adminTimeTable)
    return res.status(404).send("No subject found in timetable");
  res.send(adminTimeTable);
});

router.get("/timetable/:id", [isAuth, validateID], async (req, res) => {
  const teacherTable = await Timetable.findById(req.params.id);
  if (!teacherTable)
    return res.status(404).send("No subject found in timetable");
  res.send(teacherTable);
});

//for student
// router.get('/student', [isAuth], async (req, res) => {
//   const teacherTable = await Timetable.find({
//     $and: [
//       { registrationID: req.adminToken.registrationID },
//       { schoolSecretKey: req.adminToken.schoolSecretKey }
//     ]
//   });
//   if (!teacherTable)
//     return res.status(404).send("No name found in timetable");
//   res.send(teacherTable);
// })

router.put("/update/:id", [isAuth, isTeacher], async (req, res) => {
  const course = await TeachersCourse.findOne({
    $and: [
      { name: req.body.name },
      { className: req.body.className },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  });
  if (!course)
    return res
      .status(400)
      .send("Make sure you select the right class and subject");
  if (course.registrationID !== req.adminToken.registrationID)
    res
      .status(400)
      .send(`You dont teach ${req.body.name} in ${req.body.className}`);
  const tableUpdate = await Timetable.findByIdAndUpdate(
    req.params.id,
    {
      className: req.body.className,
      name: req.body.name,
      day: req.body.day,
      startTime: req.body.startTime,
      endTime: req.body.endTime,
    },
    { new: true }
  );
  if (!tableUpdate) return res.status(400).send("Update cannot be committed");
  res.send(tableUpdate);
});

router.delete(
  "/delete/:id",
  [isAuth, isTeacher, validateID],
  async (req, res) => {
    const table = await Timetable.findById(req.params.id);
    if (!table) return res.status(400).send("The course does not exist");
    const result = await table.remove();
    res.send(result);
  }
);

module.exports = router;
