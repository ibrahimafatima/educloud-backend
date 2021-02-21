const express = require("express");
//const { notify } = require("../pusher/notify");
const isAuth = require("../../middleware/isAuth");
const isAdmin = require("../../middleware/isAdmin");
const transporter = require("../../utilities/mail_transport");
const { Event, ValidateEvent } = require("../../model/admin/events");
const { StudentDetails } = require("../../model/students/students_managment");

const router = express.Router();

router.post("/", [isAuth, isAdmin], async (req, res) => {
  const { error } = ValidateEvent(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const event = new Event({
    postedBy: req.adminToken.username,
    eventDate: req.body.eventDate,
    eventMessage: req.body.eventMessage,
    schoolName: req.adminToken.schoolName,
    schoolSecretKey: req.adminToken.schoolSecretKey,
  });
  const result = await event.save();
  // const result = await event.save((err, obj) => {
  //   const school = req.adminToken.schoolName;
  //   notify(school, "update");
  // });
  res.send(result);
});

router.get("/", [isAuth], async (req, res) => {
  const event = await Event.find({
    schoolSecretKey: req.adminToken.schoolSecretKey,
  })
    .limit(6)
    .sort("-postDate");
  if (!event) return res.status(400).send("Error while getting event...");
  res.send(event);
});

router.get("/all-events", [isAuth], async (req, res) => {
  const event = await Event.find({
    schoolSecretKey: req.adminToken.schoolSecretKey,
  }).sort("-postDate");
  if (!event) return res.status(400).send("Error while getting event...");
  res.send(event);
});

// router.get("/all-events", async (req, res) => {
//   const event = await Event.find().limit(5).sort("-postDate");
//   if (!event) return res.status(400).send("Error while getting event...");
//   res.send(event);
// });

// router.get("/get/:id", [isAuth, validateObjectId], async (req, res) => {
//   const notice = await Event.findById(req.params.id);
//   if (!notice) return res.status(404).send("No notice found");
//   res.send(notice);
// });

router.put("/update/:id", [isAuth, isAdmin], async (req, res) => {
  const { error } = ValidateEvent(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const result = await Event.findByIdAndUpdate(
    req.params.id,
    {
      eventDate: req.body.eventDate,
      eventMessage: req.body.eventMessage,
    },
    { new: true }
  );
  res.send(result);
});

router.delete("/delete/:id", [isAuth, isAdmin], async (req, res) => {
  const deletedEvent = await Event.findByIdAndRemove(req.params.id);
  res.send(deletedEvent);
});

router.post("/mail", isAuth, async (req, res) => {
  const students = await StudentDetails.find({
    $and: [
      { schoolSecretKey: req.adminToken.schoolSecretKey },
      { email: { $ne: "Not Specified" } },
    ],
  });

  students.map((s) => {
    var mailOptions = {
      from: "edukloud@gmail.com",
      to: s.email,
      subject: `Edukloud - ${req.adminToken.schoolName}`,
      html: `<h3>Upcoming Event For ${req.adminToken.schoolName}</h3><br/><hr/><span>${req.body.eventMessage}</span><br/><br/><hr/><span>Event date: <b>${req.body.eventDate}</b></span>`,
    };

    transporter.sendMail(mailOptions, function (error, info) {
      if (error) console.log(error);
      else console.log("Email sent: " + info.response);
    });
  });
  res.send("Send");
});

module.exports = router;
