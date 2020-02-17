require("express-async-errors");
const { Logger } = require("../utilities/winston");

module.exports = function() {
  process.on("uncaughtException", err => {
    Logger.error(err.message, err);
    process.exit(1);
  });

  process.on("unhandledRejection", err => {
    Logger.error(err.message, err);
    process.exit(1);
  });
};
