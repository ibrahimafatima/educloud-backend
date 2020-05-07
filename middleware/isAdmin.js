module.exports = function(req, res, next) {
  if (!req.adminToken.isAdmin)
    return res.status(403).send("You dont have the required permission");
  next();
};
