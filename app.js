const express = require("express");
const path = require("path");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const cronjob = require("./cronjob");
const { sequelizeConnect } = require("./infra/mysql/index");
const geolocation = require("./middleware/geolocation.js");

const indexRouter = require("./routes/index");

const app = express();

// sequelize connect & execute cron cronjob
sequelizeConnect(cronjob);

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// geolocation middleware
app.use(geolocation);

app.use("/", indexRouter);

module.exports = app;
