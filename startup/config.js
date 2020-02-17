const config = require("config");
const { Logger } = require("../utilities/winston");

module.exports = function() {
  if (!config.get("private_key")) {
    Logger.error("FATAL ERROR : Environment not set");
    process.exit(1);
  }
};
