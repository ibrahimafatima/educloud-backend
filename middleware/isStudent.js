module.exports = function(req, res, next) {
  if (!req.adminToken.isStudent)
    return res.status(401).send("You are allowed to access ressources here...");
  next();
};
