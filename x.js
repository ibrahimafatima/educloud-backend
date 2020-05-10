//ADD_CLASS-----------------------------------

// const timetable = await Timetable.find({
//     $and: [
//       { className: req.body.className },
//       { schoolSecretKey: req.adminToken.schoolSecretKey },
//     ],
//   });
//   if (timetable)
//     return res
//       .status(404)
//       .send(
//         "Delete all timetable where this class is added before updating it."
//       );

//   const teacher = await TeacherDetails.findOne({
//     className: clas.className,
//   });
//   if (teacher)
//     return res
//       .status(404)
//       .send(
//         "Delete or update teachers where this class is added before updating it."
//       );

//   const course = await TeachersCourse.findOne({
//     className: clas.className,
//   });
//   if (course)
//     return res
//       .status(404)
//       .send(
//         "Delete or update courses where this class is added before updating it."
//       );

//   const student = await StudentDetails.findOne({
//     class_name: clas.className,
//   });
//   if (student)
//     return res
//       .status(404)
//       .send(
//         "Delete or update students info where this class is added before updating it."
//       );

// const classes = await AddClass.find({
//     $and: [
//       { className: req.body.className },
//       { schoolSecretKey: req.adminToken.schoolSecretKey },
//     ],
//   });
//   if (classes)
//     return res.status(400).send("The Class you entered already exist...");
