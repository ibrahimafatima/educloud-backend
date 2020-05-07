const express = require("express");

const app = express();
require("dotenv").config();
require("./startup/logging")();
require("./startup/route")(app);
require("./startup/db")();
require("./startup/config")();
require("./startup/prod")(app);

const port = process.env.PORT || 3000;
const server = app.listen(port, () =>
  console.log(`Listening on port ${port} -- ${process.env.PUSHER_APP_KEY}`)
);

module.exports = server;
