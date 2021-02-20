const express = require("express");
const { hash, unhash } = require("../../utilities/hashed");
const {
  AdminAuth,
  validateLoginAuth,
  validateAdminRegistration,
} = require("../../model/admin/auth");

const router = express.Router();

//REGISTRATION ENDPOINT
router.post("/register", async (req, res) => {
  const { error } = validateAdminRegistration(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const adminUsername = await AdminAuth.findOne({
    username: req.body.username.trim(),
  });
  if (adminUsername)
    return res.status(400).send("Username already in use, try another.");

  const hashedPassword = await hash(req.body.password.trim());
  const hashedSecretKey = await hash(req.body.schoolSecretKey.trim());

  const newAdmin = new AdminAuth({
    schoolSecretKey: hashedSecretKey,
    schoolName: req.body.schoolName.trim(),
    username: req.body.username.trim(),
    password: hashedPassword,
    role: "Admin",
    gender: req.body.gender,
    currency: req.body.currency,
    country: req.body.country,
    pack: req.body.pack,
    isAdmin: req.body.isAdmin,
  });
  await newAdmin.save();
  const token = newAdmin.generateAuthToken();
  res.header("x-auth-token", token).send(token);
});

//LOGIN ENDPOINT
router.post("/login", async (req, res) => {
  const { error } = validateLoginAuth(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const adminUser = await AdminAuth.findOne({
    username: req.body.username.trim(),
  });
  if (!adminUser) return res.status(404).send("Invalid username or password");

  const password = await unhash(req.body.password.trim(), adminUser.password);
  if (!password) return res.status(404).send("Invalid username or password");

  const token = adminUser.generateAuthToken();
  res.header("x-auth-token", token).send(token);
});

//ACCOUNT CONFIRMATION ENDPOINT
router.post("/confirm-account", async (req, res) => {
  const adminUser = await AdminAuth.findOne({
    username: req.body.username.trim(),
  });
  if (!adminUser) return res.status(404).send("Invalid username");
  // const key = await unhash(
  //   req.body.schoolSecretKey.trim(),
  //   adminUser.schoolSecretKey
  // );
  // if (!key) return res.status(404).send("Invalid secret key");
  res.send(adminUser);
});

//PASSWORD RESET ENDPOINT
router.post("/reset-password", async (req, res) => {
  const user = await AdminAuth.findOne({
    username: req.body.username.trim(),
  });
  if (!user) return res.status(404).send("invalid username");
  const newHashedPassword = await hash(req.body.password.trim());
  user.password = newHashedPassword;
  await user.save();
  res.send("Password reset successfully");
});

module.exports = router;
