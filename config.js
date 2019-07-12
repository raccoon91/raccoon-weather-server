require("dotenv").config();

module.exports = {
  PRODUCTION: process.env.NODE_ENV === "production" ? true : false,
  WEATHER_KEY: process.env.WEATHER_KEY,

  MYSQL_ENDPOINT:
    process.env.MYSQL_ENDPOINT || "localhost:3306:raccoon:root:password",

  REDIS_HOST: process.env.REDIS_HOST || "localhost",
  REDIS_PORT: process.env.REDIS_PORT || "6379",
  REDIS_PASSWORD: process.env.REDIS_PASS || "password"
};
