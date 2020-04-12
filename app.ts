import express from "express";
import path from "path";
import cors from "cors";
import cookieParser from "cookie-parser";
import logger from "morgan";
import cronjob from "./cronjob";
import { sequelizeConnect } from "./infra/mysql";

// const indexRouter = require("./routes/index");

const app = express();

// sequelize connect & execute cron cronjob
sequelizeConnect(cronjob);

app.use(cors());
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

// app.use("/", indexRouter);
app.get("/", (req, res) => {
	res.send("hi");
});

export default app;
