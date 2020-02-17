module.exports = function(req, res, next) {
  if (!req.adminToken.isTeacher)
    return res.status(401).send("You dont have permission");
  next();
};
