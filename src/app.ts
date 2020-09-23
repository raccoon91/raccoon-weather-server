import "dotenv/config";
import express from "express";
import path from "path";
import cors from "cors";
import { databaseConnect } from "./models";
import indexRouter from "./routes/index";

const app = express();

//  connect sequelize execute cron cronjob
databaseConnect();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);

export default app;
