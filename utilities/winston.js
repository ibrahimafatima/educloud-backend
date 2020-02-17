const winston = require("winston");
require("winston-mongodb");
const config = require("config");

const logger = winston.createLogger({
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: "error.log", level: "error" }),
    new winston.transports.File({ filename: "combined.log" }),
    new winston.transports.MongoDB({
      db: config.get("db"),
      level: "info"
    })
  ]
});

module.exports.Logger = logger;
