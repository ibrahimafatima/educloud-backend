const express = require("express");
const isAuth = require("../../middleware/isAuth");
const isAdmin = require("../../middleware/isAdmin");
const { Event, ValidateEvent } = require("../../model/admin/events");

const router = express.Router();

router.post("/", [isAuth, isAdmin], async (req, res) => {
  const { error } = ValidateEvent(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const event = new Event({
    event_title: req.body.event_title,
    event_date: req.body.event_date,
    event_message: req.body.event_message
  });
  const result = await event.save();
  res.send(result);
});

router.get("/", async (req, res) => {
  const event = await Event.find();
  if (event.length === 0) return res.send("No event posted yet");
  res.send(event);
});

router.put("/:id", [isAuth, isAdmin], async (req, res) => {
  const { error } = ValidateEvent(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const result = await Event.findByIdAndUpdate(
    req.params.id,
    {
      event_title: req.body.event_title,
      event_date: req.body.event_date,
      event_message: req.body.event_message
    },
    { new: true }
  );
  res.send(result);
});

router.delete("/:id", [isAuth, isAdmin], async (req, res) => {
  const deletedEvent = await Event.findByIdAndRemove(req.params.id);
  res.send(deletedEvent);
});

module.exports = router;
