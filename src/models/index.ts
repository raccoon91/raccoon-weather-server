import { Sequelize, Options } from "sequelize";
import { LocationInit } from "./location";
import { ClimateInit } from "./climate";
import { WeatherInit } from "./weather";
import { ForecastInit } from "./forecast";
import { AirPollutionInit } from "./airpollution";
import { cronJob } from "../jobs";
import { errorLog } from "../lib";

const { MYSQL_HOST, MYSQL_PORT, MYSQL_DB, MYSQL_USER, MYSQL_PASSWORD } = process.env;

const mysqlOption: Options = {
  host: MYSQL_HOST,
  port: Number(MYSQL_PORT),
  dialect: "mysql",
  dialectOptions: {
    dateStrings: true,
    typeCast: true,
  },
  timezone: "+09:00",
  define: {
    charset: "utf8mb4",
  },
  pool: {
    acquire: 10000,
    idle: 10000,
    max: 5,
    min: 0,
  },
  logging: false,
};

const sequelize = new Sequelize(MYSQL_DB, MYSQL_USER, MYSQL_PASSWORD, mysqlOption);

const databaseConnect = (): void => {
  sequelize
    .sync()
    .then(() => {
      console.log("Sequelize connected with mysql.");

      // execute cron job
      cronJob();
      console.log("execute cron job");
    })
    .catch((error) => {
      errorLog(`mysql connection failed ${error.message}`, "sequelize");
    });
};

const Location = LocationInit(sequelize);
const Climate = ClimateInit(sequelize);
const Weather = WeatherInit(sequelize);
const Forecast = ForecastInit(sequelize);
const AirPollution = AirPollutionInit(sequelize);

export { databaseConnect, Location, Climate, Weather, Forecast, AirPollution };
