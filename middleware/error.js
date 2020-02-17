const { Logger } = require("../utilities/winston");

module.exports = function(err, req, res, next) {
  //LOG EXCEPTIONS
  Logger.error(err.message, err);
  res.status(500).send("Something failed...");
};
