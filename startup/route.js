const express = require("express");
const cors = require("cors");
const error = require("../middleware/error");
const admin_add_teacher = require("../routes/admin/add_teacher");
const admin_auth = require("../routes/admin/auth");
const teacher_auth = require("../routes/teacher/auth");
const teachers_course = require("../routes/teacher/courses");
const teacher_information = require("../routes/teacher/profile");
const teacher_add_student = require("../routes/teacher/students");
const student_auth = require("../routes/students/auth");
const student_profile = require("../routes/students/profile");
const schedule_exam = require("../routes/exams/schedule_exams");
const post_mark = require("../routes/teacher/post_mark");
const event = require("../routes/admin/events");
const add_class = require("../routes/admin/add_class");
const payment_details = require("../routes/admin/paymentDetails");
const studentTimetable = require("../routes/teacher/timetable");
const library = require("../routes/admin/library");
const assignment = require("../routes/teacher/assignment");
const chat = require("../routes/students/chat");
const discussion = require("../routes/students/discussion");
const term = require("../routes/admin/term");
const classe = require("../routes/admin/school_class");
const level = require("../routes/admin/level");

module.exports = function (app) {
  app.use(express.json());
  app.use(cors());
  app.use("/api/admin/teacher", admin_add_teacher);
  app.use("/api/admin/auth", admin_auth);
  app.use("/api/add/class", add_class);
  app.use("/api/teacher/update", teacher_information);
  app.use("/api/teacher/auth", teacher_auth);
  app.use("/api/teacher/course", teachers_course);
  app.use("/api/teacher/student", teacher_add_student);
  app.use("/api/student/auth", student_auth);
  app.use("/api/student/profile", student_profile);
  app.use("/api/schedule/exams", schedule_exam);
  app.use("/api/teacher/post-mark", post_mark);
  app.use("/api/admin/event", event);
  app.use("/api/admin/payment", payment_details);
  app.use("/api/student/timetable", studentTimetable);
  app.use("/api/books", library);
  app.use("/api/teacher/assignment", assignment);
  app.use("/api/student/message", chat);
  app.use("/api/discussion", discussion);
  app.use("/api/term", term);
  app.use("/api/classe", classe);
  app.use("/api/level", level);

  app.use(error);
};
