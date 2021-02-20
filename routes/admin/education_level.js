const express = require("express");
const mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);
const isAuth = require("../../middleware/isAuth");
const isAdmin = require("../../middleware/isAdmin");
const { Level, validateLevel } = require("../../model/admin/education_level");

const router = express.Router();

router.post("/", [isAuth, isAdmin], async (req, res) => {
  const { error } = validateLevel(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const newLevel = new Level({
    level: req.body.level,
    schoolName: req.adminToken.schoolName,
    schoolSecretKey: req.adminToken.schoolSecretKey,
  });
  const result = await newLevel.save();
  return res.send(result);
});

router.get("/", isAuth, async (req, res) => {
  const levels = await Level.find({
    schoolSecretKey: req.adminToken.schoolSecretKey,
  }).sort("level");
  if (!levels) return res.status(400).send("Error, no level found...");
  res.send(levels);
});

module.exports = router;
