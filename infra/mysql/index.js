const Sequelize = require("sequelize");
const tok = require("../../config.js").MYSQL_ENDPOINT.split(":");
const production = require("../../config").PRODUCTION;
const { locationList } = require("../../scripts/utils/utils.js");

const config = {
  database: tok[2],
  username: tok[3],
  password: tok[4],
  options: {
    host: tok[0],
    port: tok[1],
    dialect: "mysql",
    timezone: production ? "+00:00" : "+09:00",
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

db.Region = require("./region.js")(sequelize, Sequelize);
db.Weather = require("./weather.js")(sequelize, Sequelize);

db.Weather.belongsTo(db.Region, { foreignKey: "city" });
db.Region.hasMany(db.Weather, { foreignKey: "city" });

db.sequelizeConnect = callback => {
  sequelize
    .sync({ force: true })
    .then(() => {
      db.Region.sync().then(() => {
        locationList.forEach(async location => {
          await db.Region.findOne({ where: { city: location.city } }).then(
            async response => {
              if (!response) {
                await db.Region.create({ city: location.city });
              }
            }
          );
        });
        console.log("Connection has been established successfully with mysql.");

        // execute cron job
        callback();
      });
    })
    .catch(err => {
      console.error("Connection with mysql failed.", err);
    });
};

module.exports = db;
