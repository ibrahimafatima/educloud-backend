const mongoose = require("mongoose");
const { Logger } = require("../utilities/winston");
const config = require("config");

module.exports = function() {
  const db = config.get("db");
  mongoose.connect(db).then(() => Logger.info(`Connected to ${db}`));
};
