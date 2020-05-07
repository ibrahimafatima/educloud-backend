const express = require("express");
const mongoose = require("mongoose");
mongoose.set("useFindAndModify", false);
const isAuth = require("../../middleware/isAuth");
const isAdmin = require("../../middleware/isAdmin");
const {
  school_classe,
  validateSchoolClasse,
} = require("../../model/admin/school_class");

const router = express.Router();

router.post("/", [isAuth, isAdmin], async (req, res) => {
  const { error } = validateSchoolClasse(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const newClasse = new school_classe({
    classe: req.body.classe,
    schoolName: req.adminToken.schoolName,
    schoolSecretKey: req.adminToken.schoolSecretKey,
  });
  const result = await newClasse.save();
  return res.send(result);
});

router.get("/", isAuth, async (req, res) => {
  const classes = await school_classe
    .find({
      schoolSecretKey: req.adminToken.schoolSecretKey,
    })
    .sort("classe");
  if (!classes) return res.status(400).send("Error, no class found...");
  res.send(classes);
});

module.exports = router;
