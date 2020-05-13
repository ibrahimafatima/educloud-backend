const bcrypt = require("bcrypt");
const express = require("express");
const isAuth = require("../../middleware/isAuth");
const {
  AdminAuth,
  ValidateAdminAuth,
  ValidateAdminRegistration,
} = require("../../model/admin/auth");

const router = express.Router();

//ADMIN LOGIN CODE
router.post("/login", async (req, res) => {
  const { error } = ValidateAdminAuth(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const adminUser = await AdminAuth.findOne({
    username: req.body.username.trim(),
  });
  if (!adminUser) return res.status(404).send("Invalid username or password");

  const secretKey = await bcrypt.compare(
    req.body.schoolSecretKey.trim(),
    adminUser.schoolSecretKey
  );
  if (!secretKey) return res.status(404).send("Your secret key is invalid");
  const password = await bcrypt.compare(
    req.body.password.trim(),
    adminUser.password
  );
  if (!password) return res.status(404).send("Invalid username or password");

  const token = adminUser.generateAdminAuthToken();
  res
    .header("x-auth-token", token)
    .header("access-control-expose-headers", "x-auth-token")
    .send(token);
});

//ADMIN REGISTRATION CODE
router.post("/register", async (req, res) => {
  const { error } = ValidateAdminRegistration(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const adminUsername = await AdminAuth.findOne({
    username: req.body.username.trim(),
  });
  if (adminUsername)
    return res.status(400).send("Username already in use, try another.");
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(req.body.password.trim(), salt);
  const hashedSecretKey = await bcrypt.hash(
    req.body.schoolSecretKey.trim(),
    salt
  );
  const newAdmin = new AdminAuth({
    schoolSecretKey: hashedSecretKey,
    schoolName: req.body.schoolName.trim(),
    username: req.body.username.trim(),
    password: hashedPassword,
    role: "Admin",
    gender: req.body.gender,
    currency: req.body.currency,
    isAdmin: req.body.isAdmin,
  });
  await newAdmin.save();
  const token = newAdmin.generateAdminAuthToken();
  res.header("x-auth-token", token).send(token);
});

router.get("/:id", [isAuth], async (req, res) => {
  const admin = await AdminAuth.findOne({
    $and: [
      { _id: req.params.id },
      { schoolSecretKey: req.adminToken.schoolSecretKey },
    ],
  });
  if (!admin) return res.status(404).send("Admin not found");
  res.send(admin);
});

router.post("/confirm-account", async (req, res) => {
  const adminUser = await AdminAuth.findOne({
    username: req.body.username.trim(),
  });
  if (!adminUser) return res.status(404).send("Invalid username");
  const key = await bcrypt.compare(
    req.body.schoolSecretKey.trim(),
    adminUser.schoolSecretKey
  );
  if (!key) return res.status(404).send("Invalid secret key");
  res.send(adminUser);
});

router.post("/reset-password", async (req, res) => {
  const user = await AdminAuth.findOne({
    username: req.body.username.trim(),
  });
  if (!user) return res.status(404).send("invalid username");
  const salt = await bcrypt.genSalt(10);
  const newHashedPassword = await bcrypt.hash(req.body.password.trim(), salt);
  user.password = newHashedPassword;
  await user.save();
  res.send("Ok");
});

module.exports = router;
