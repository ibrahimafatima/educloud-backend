const express = require("express");
const isAuth = require("../../middleware/isAuth");
const { Exams } = require("../../model/exams/exams");
const isTeacher = require("../../middleware/isTeacher");
const { StudentDetails } = require("../../model/students/students");
const { Mark, ValidateMark } = require("../../model/teachers/mark");

const router = express.Router();

//NAME IN THE BODY WAS SUBJECT CHANGED BECAUSE OF SELECT

router.post("/:id", [isAuth, isTeacher], async (req, res) => {
  const { error } = ValidateMark(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const student = await StudentDetails.findOne({
    $and: [
      { registration_number: req.params.id },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  });

  if (!student) return res.status(404).send("No such student found");

  const exam = await Exams.findOne({
    $and: [
      { subject: req.body.name },
      { exam_name: req.body.exam_name },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  });

  if (!exam)
    return res
      .status(404)
      .send("Make sure you select the right exam name and subject");

  const mark = new Mark({
    registration_number: req.params.id,
    student_name: student.name,
    name: req.body.name,
    mark: req.body.mark,
    grade: req.body.grade,
    remark: req.body.remark,
    exam_name: req.body.exam_name,
    schoolSecretKey: req.adminToken.schoolSecretKey,
  });
  const result = await mark.save();
  res.send(result);
});

//MODIFICATION MADE HERE_ _ _ _ _
router.get("/:id", [isAuth], async (req, res) => {
  const marks = await Mark.find({
    $and: [
      { status: "New" },
      { registration_number: req.params.id },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  });
  if (!marks) return res.status(404).send("No mark was found");
  res.send(marks);
});

router.get("/mark/:id", [isAuth], async (req, res) => {
  const mark = await Mark.findById(req.params.id);
  if (!mark) return res.status(404).send("Not found");
  res
    .send(mark)
    .select([
      "-_id",
      "-registration_number",
      "-schoolSecretKey",
      "-student_name",
    ]);
});

router.put("/update/:id", [isAuth, isTeacher], async (req, res) => {
  const { error } = ValidateMark(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const mark = await Mark.findByIdAndUpdate(
    req.params.id,
    {
      mark: req.body.mark,
      grade: req.body.grade,
      remark: req.body.remark,
    },
    { new: true }
  );
  res.send(mark);
});

router.delete("/:id", [isAuth, isTeacher], async (req, res) => {
  const mark = await Mark.findById(req.params.id);
  if (!mark) return res.status(404).send("The mark does not exist");
  const result = await mark.remove();
  res.send(result);
});

router.put("/next-year", [isAuth, isTeacher], async (req, res) => {
  const new_year_mark = await Mark.updateMany(
    { schoolSecretKey: req.adminToken.schoolSecretKey },
    { $set: { status: "Old" } }
  );
  res.send(new_year_mark);
});

module.exports = router;
