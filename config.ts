require("dotenv").config();

export default {
	PRODUCTION: process.env.NODE_ENV === "production" ? true : false,

	ACCESS_KEY: process.env.ACCESS_KEY,
	SECRET_KEY: process.env.SECRET_KEY,
	hostName: "https://geolocation.apigw.ntruss.com",
	requestUrl: "/geolocation/v2/geoLocation",

	WEATHER_KEY: process.env.WEATHER_KEY,

	MYSQL_ENDPOINT: process.env.MYSQL_ENDPOINT || "localhost:3306:raccoon:root:password",

	REDIS_HOST: process.env.REDIS_HOST || "localhost",
	REDIS_PORT: process.env.REDIS_PORT || "6379",
	REDIS_PASSWORD: process.env.REDIS_PASS || "password",
};
