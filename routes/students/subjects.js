const mongoose = require("mongoose");
const { TeachersCourse } = require("../../model/teachers/courses");
const { StudentSubjects } = require("../../model/students/subjects");
const express = require("express");
const isAuth = require("../../middleware/isAuth");
const isStudent = require("../../middleware/isStudent");

const router = express.Router();

router.post("/", [isAuth, isStudent], async (req, res) => {
  //Get all subjects in the logged in student class.
  const subjects = await TeachersCourse.find({
    className: req.adminToken.class_name //className = req.adminToken.class_name
  }).select(["-__v", "-_id", "-className"]); //registrationNumber = req.adminToken.registration_number

  // Insert the logged in student registration number and
  // class name in the student subject collection.
  //SSA(student subject available)
  const SSA = await StudentSubjects.findOne({
    registration_number: req.adminToken.registration_number
  });
  if (!SSA) {
    const student_subjects = new StudentSubjects({
      registration_number: req.adminToken.registration_number,
      class_name: req.adminToken.class_name
    });
    let sub = await student_subjects.save();
  }

  // For each subject of the logged in student insert the
  // subject name and for each subject insert the details
  // of the teacher giving that subject.
  subjects.forEach(async value => {
    const subjectToUpdate = await StudentSubjects.update(
      { registration_number: req.adminToken.registration_number },
      {
        $addToSet: {
          subjects: {
            [value.courseName]: {
              teacherID: value.teacher
            }
          }
        }
      }
    );
  });
  res.send(subjects);
});

module.exports = router;
