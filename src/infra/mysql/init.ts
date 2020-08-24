import { Sequelize, Options } from "sequelize";
import config from "../../config";

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

export const sequelize = new Sequelize(MYSQL_DB, MYSQL_USER, MYSQL_PASSWORD, mysqlOption);

export const sequelizeConnect = (cronJob: () => void): void => {
  sequelize
    .sync()
    .then(() => {
      console.log("Connection has been established successfully with mysql.");

      // execute cron job
      cronJob();
      console.log("execute cron job");
    })
    .catch((err) => {
      console.error("Connection with mysql failed.", err);
    });
};

// export class
