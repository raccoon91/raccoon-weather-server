import { Sequelize, Options } from "sequelize";
import { promisify } from "util";
import { client } from "./redis";
import { ClimateInit } from "./climate";
import { WeatherInit } from "./weather";
import { ForecastInit } from "./forecast";
import { AirPollutionInit } from "./airpollution";
import { cronJob } from "../jobs";
import config from "../config";

const { MYSQL_HOST, MYSQL_PORT, MYSQL_DB, MYSQL_USER, MYSQL_PASSWORD } = config;

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
    .catch((err) => {
      console.error("Connection with mysql failed.", err);
    });
};

const Climate = ClimateInit(sequelize);
const Weather = WeatherInit(sequelize);
const Forecast = ForecastInit(sequelize);
const AirPollution = AirPollutionInit(sequelize);

const RedisGet = promisify(client.get).bind(client);
const RedisSet = promisify(client.set).bind(client);
const RedisKeys = promisify(client.keys).bind(client);

export { databaseConnect, Climate, Weather, Forecast, AirPollution, RedisGet, RedisSet, RedisKeys };
