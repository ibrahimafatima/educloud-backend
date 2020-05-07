const express = require("express");
const {
  WorkGroup,
  ValidateWorkGroup
} = require("../../model/students/workGroup");
const isAuth = require("../../middleware/isAuth");
const isStudent = require("../../middleware/isStudent");

const router = express.Router();

router.post("/", [isAuth, isStudent], (req, res) => {});

module.exports = router;
