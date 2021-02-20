const express = require("express");
const isAuth = require("../../middleware/isAuth");
const { Exams } = require("../../model/exams/exams");
const transporter = require("../../utilities/mail_transport");
const isTeacher = require("../../middleware/isTeacher");
const { StudentDetails } = require("../../model/students/students_managment");
const { Mark, ValidateMark } = require("../../model/teachers/mark");

const router = express.Router();

router.post("/:id", [isAuth, isTeacher], async (req, res) => {
  const { error } = ValidateMark(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const student = await StudentDetails.findOne({
    $and: [
      { registrationID: req.params.id },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  });

  if (!student) return res.status(404).send("No such student found");

  const exam = await Exams.findOne({
    $and: [
      { subject: req.body.name.toUpperCase() },
      { examName: req.body.examName },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  });

  if (!exam)
    return res
      .status(404)
      .send("Make sure you select the right exam name and subject");

  const mark = new Mark({
    registrationID: req.params.id,
    studentName: student.username,
    name: req.body.name.toUpperCase(),
    mark: req.body.mark,
    grade: req.body.grade,
    remark: req.body.remark,
    examName: req.body.examName,
    schoolSecretKey: req.adminToken.schoolSecretKey,
  });
  const result = await mark.save();
console.log(student.email)
    if(student.email !== "Not Specified") {
      var mailOptions = {
        from: 'edukloud@gmail.com',
        to: student.email,
        subject: `Edukloud - Your ${req.body.name.toUpperCase()} mark is in.`,
        html: `<h3>Your ${req.body.name.toUpperCase()} teacher has posted your exam Mark.</h3><br/><br/><h4>Head Over to <a href="www.google.com">Edukloud</a> to view your mark.</h4><br/><br/><span><b>Good luck!</b></span><br/><br/><span>Edukloud, Africa's education on a single cloud.</span>`
    
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) 
          console.log(error);
        else 
          console.log('Email sent: ' + info.response);
      });
    }

  res.send(result);
});

router.get("/get/:id", [isAuth], async (req, res) => {
  const marks = await Mark.find({
    $and: [
      { status: "New" },
      { registrationID: req.params.id },
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
    .select(["-_id", "-registrationID", "-schoolSecretKey", "-student_name"]);
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

router.delete("/delete/:id", [isAuth, isTeacher], async (req, res) => {
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
