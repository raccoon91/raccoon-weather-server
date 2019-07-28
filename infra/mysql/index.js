const Sequelize = require("sequelize");
const tok = require("../../config.js").MYSQL_ENDPOINT.split(":");

const config = {
  database: tok[2],
  username: tok[3],
  password: tok[4],
  options: {
    host: tok[0],
    port: tok[1],
    dialect: "mysql",
    dialectOptions: {
      dateStrings: true,
      typeCast: true
    },
    timezone: "+09:00",
    define: {
      charset: "utf8mb4"
    },
    pool: {
      max: 5,
      min: 0,
      idle: 10000
    },
    logging: false,
    underscored: true
  }
};
const db = {};
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config.options
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.Weather = require("./weather.js")(sequelize, Sequelize);
db.Airpollution = require("./airpollution.js")(sequelize, Sequelize);

db.sequelizeConnect = callback => {
  sequelize
    .sync()
    .then(() => {
      console.log("Connection has been established successfully with mysql.");

      // execute cron job
      callback();
    })
    .catch(err => {
      console.error("Connection with mysql failed.", err);
    });
};

module.exports = db;
