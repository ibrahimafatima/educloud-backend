const jwt = require("jsonwebtoken");
config = require("config");

module.exports = function(req, res, next) {
  const token = req.header("x-auth-token");
  if (!token) return res.status(401).send("You are not logged in");
  try {
    const decoded = jwt.verify(token, config.get("private_key"));
    req.adminToken = decoded;
    next();
  } catch (error) {
    res.status(404).send("Error, invalid token");
  }
};
