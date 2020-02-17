const express = require("express");
const isAuth = require("../../middleware/isAuth");
const isTeacher = require("../../middleware/isTeacher");
const { StudentSubjects } = require("../../model/students/subjects");
const { Mark, ValidateMark } = require("../../model/teachers/mark");

const router = express.Router();

router.post("/", [isAuth, isTeacher], async (req, res) => {
  const { error } = ValidateMark(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const mark = new Mark({
    registration_number: req.body.registration_number,
    student_name: req.body.student_name,
    subject: req.body.subject,
    mark: req.body.mark,
    grade: req.body.grade,
    remark: req.body.remark,
    exam_name: req.body.exam_name
  });
  const result = await mark.save();
  res.send(result);
});

router.put("/:id", [isAuth, isTeacher], async (req, res) => {
  const { error } = ValidateMark(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const mark = await Mark.findByIdAndUpdate(
    req.params.id,
    {
      mark: req.body.mark,
      grade: req.body.grade,
      remark: req.body.remark
    },
    { new: true }
  );
  res.send(mark);
});

module.exports = router;
