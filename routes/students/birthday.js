const express = require("express");
const isAuth = require("../../middleware/isAuth");
const moment = require("moment");
const { Birthday, ValidateBirthday } = require("../../model/students/birthday");
const { StudentDetails } = require("../../model/students/students");

const router = express.Router();

router.get("/", [isAuth], async (req, res) => {
  const students = await StudentDetails.find({
    $and: [
      { schoolSecretKey: req.adminToken.schoolSecretKey },
      { dob: moment(new Date(), "YYYY/MM/DD").format("MMMM") },
    ],
  });
  if (!students) return;
  res.send(students + " " + moment(new Date(), "YYYY/MM/DD").format("MMMM"));
});

// router.get("/", [isAuth], async (req, res) => {
//     const students = await StudentDetails.find({
//       $and: [
//         { schoolSecretKey: req.adminToken.schoolSecretKey },
//         {
//           dob: {
//             $gte: moment("2020-04-13T00:00:00.000+00:00").format("YYYY/MM/DD"),
//             $lte: moment("2020-04-13T00:00:00.000+00:00").format("YYYY/MM/DD"),
//           },
//         },
//       ],
//     });
//     if (!students) return;
//     res.send(students);
//   });

module.exports = router;
