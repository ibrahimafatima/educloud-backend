const express = require("express");
const mongoose = require("mongoose");
const validaObjectId = require("../../middleware/validateObjectId");
mongoose.set("useFindAndModify", false);
const isAuth = require("../../middleware/isAuth");
const isAdmin = require("../../middleware/isAdmin");
const { AddClass, ValidateClasses } = require("../../model/admin/classes");

const router = express.Router();

router.post("/", [isAuth, isAdmin], async (req, res) => {
  const { error } = ValidateClasses(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const classes = await AddClass.findOne({ name: req.body.name });
  if (classes)
    return res.status(400).send("The Class you entered already exist...");

  const newClass = new AddClass({
    name: req.body.name,
    classe: req.body.classe,
    amount_to_pay: req.body.amount_to_pay,
    level: req.body.level,
    isInCharge: false
  });
  const result = await newClass.save();
  res.send(result);
});

router.get("/", [isAuth, isAdmin], async (req, res) => {
  const classes = await AddClass.find().sort("level");
  if (!classes) return res.status(400).send("Error, no class found...");
  if (classes.length == 0) return res.send("Class list is Empty for now");
  res.send(classes);
});

router.delete("/:id", [isAuth, isAdmin, validaObjectId], async (req, res) => {
  const classToRemove = await AddClass.findByIdAndRemove(req.params.id);
  res.send(classToRemove);
});

router.put("/:id", [isAuth, isAdmin, validaObjectId], async (req, res) => {
  const classes = await AddClass.findOne({ name: req.body.name });
  if (classes)
    return res.status(400).send("The Class you entered already exist...");
  const classToUpdate = await AddClass.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      classe: req.body.classe,
      amount_to_pay: req.body.amount_to_pay,
      level: req.body.level
    },
    { new: true }
  );
  res.send(classToUpdate);
});

module.exports = router;
