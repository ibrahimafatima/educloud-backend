const express = require("express");
const { notify } = require("../pusher/notify");
const isAuth = require("../../middleware/isAuth");
const isAdmin = require("../../middleware/isAdmin");
const { StudentDetails } = require("../../model/students/students");
const { Event, ValidateEvent } = require("../../model/admin/events");
const validateObjectId = require("../../middleware/validateObjectId");

const router = express.Router();

router.post("/", [isAuth, isAdmin], async (req, res) => {
  const { error } = ValidateEvent(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const event = new Event({
    posted_by: req.adminToken.username,
    event_date: req.body.event_date,
    event_message: req.body.event_message,
    schoolName: req.adminToken.schoolName,
    schoolSecretKey: req.adminToken.schoolSecretKey,
  });
  const result = await event.save((err, obj) => {
    const school = req.adminToken.schoolName;
    notify(school, "update");
  });
  res.send(result);
});

router.get("/", [isAuth], async (req, res) => {
  const event = await Event.find({
    schoolSecretKey: req.adminToken.schoolSecretKey,
  })
    .limit(6)
    .sort("-post_date");
  if (!event) return res.status(400).send("Error while getting event...");
  res.send(event);
});

router.get("/all-events", async (req, res) => {
  const event = await Event.find().limit(5).sort("-post_date");
  if (!event) return res.status(400).send("Error while getting event...");
  res.send(event);
});

router.get("/get/:id", [isAuth, validateObjectId], async (req, res) => {
  const notice = await Event.findById(req.params.id);
  if (!notice) return res.status(404).send("No notice found");
  res.send(notice);
});

router.put("/update/:id", [isAuth, isAdmin], async (req, res) => {
  const { error } = ValidateEvent(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const result = await Event.findByIdAndUpdate(
    req.params.id,
    {
      event_date: req.body.event_date,
      event_message: req.body.event_message,
    },
    { new: true }
  );
  res.send(result);
});

router.delete("/delete/:id", [isAuth, isAdmin], async (req, res) => {
  const deletedEvent = await Event.findByIdAndRemove(req.params.id);
  res.send(deletedEvent);
});

module.exports = router;
