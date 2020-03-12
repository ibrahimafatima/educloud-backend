const express = require("express");
const bcrypt = require("bcrypt");
const { AdminAuth, validateAdminAuth } = require("../../model/admin/auth");

const router = express.Router();

//ADMIN LOGIN CODE
router.post("/login", async (req, res) => {
  const { error } = validateAdminAuth(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const adminUser = await AdminAuth.findOne({
    username: req.body.username
  });
  if (!adminUser) res.status(404).send("Invalid username or password");

  const secretKey = await bcrypt.compare(
    req.body.schoolSecretKey,
    adminUser.schoolSecretKey
  );
  if (!secretKey) res.status(404).send("Your secret key might not be valid");
  const password = await bcrypt.compare(req.body.password, adminUser.password);
  if (!password) res.status(404).send("Invalid username or password");

  const token = adminUser.generateAdminAuthToken();
  res.header("x-auth-token", token).send(token);
});

//ADMIN REGISTRATION CODE
router.post("/register", async (req, res) => {
  const { error } = validateAdminAuth(req.body);
  if (error) return res.status(400).send(error.details[0].message);
  const adminUsername = await AdminAuth.findOne({
    username: req.body.username
  });
  if (adminUsername)
    return res.status(400).send("Username already in use, try another.");
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password, salt);
  const hashedSecretKey = await bcrypt.hash(req.body.schoolSecretKey, salt);
  const newAdmin = new AdminAuth({
    schoolSecretKey: hashedSecretKey,
    username: req.body.username,
    password: hashedPassword,
    isAdmin: req.body.isAdmin
  });
  await newAdmin.save();
  const token = newAdmin.generateAdminAuthToken();
  res.header("x-auth-token", token).send(token);
});

module.exports = router;
