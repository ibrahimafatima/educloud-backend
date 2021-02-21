// const express = require("express");
// const isAuth = require("../../middleware/isAuth");
// const {} = require("../../model/students/students_managment");
// const transporter = require("../../utilities/mail_transport");

// const router = express.Router();

// router.post("/", isAuth, async (req, res) => {
//   const students = await StudentDetails.find({
//     $and: [
//       { schoolSecretKey: req.adminToken.schoolSecretKey },
//       { className: req.body.className },
//       { email: { $ne: "Not Specified" } },
//     ],
//   });

//   students.map((s) => {
//     var mailOptions = {
//       from: "edukloud@gmail.com",
//       to: s.email,
//       subject: `Edukloud - New Homework from ${req.adminToken.username}`,
//       html: `<h3>Your ${req.body.name.toUpperCase()} teacher has posted a homework.</h3><br/><br/><h4><a href="${
//         req.body.homeworkURL
//       }">Click to view Homework</a></h4><br/><br/><span><b>Good luck!</b></span><br/><br/><span>Edukloud, Africa's education on a single cloud.</span>`,
//     };

//     transporter.sendMail(mailOptions, function (error, info) {
//       if (error) console.log(error);
//       else console.log("Email sent: " + info.response);
//     });
//   });

//   res.send(result);
// });

// module.exports = router;
