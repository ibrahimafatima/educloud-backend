module.exports = function(req, res, next) {
  if (!req.adminToken.isTeacher)
    return res.status(403).send("You don't have the required permission");
  next();
};
