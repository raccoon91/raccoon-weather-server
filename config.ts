require("dotenv").config();

export default {
	ENVIRONMENT: process.env.ENVIRONMENT,

	NAVER_ACCESS_KEY: process.env.NAVER_ACCESS_KEY,
	NAVER_SECRET_KEY: process.env.NAVER_SECRET_KEY,
	NAVER_HOST_NAME: process.env.NAVER_HOST_NAME,
	NAVER_REQUEST_URL: process.env.NAVER_REQUEST_URL,

	OPEN_WEATHER_API_KEY: process.env.OPEN_WEATHER_API_KEY,

	MYSQL_HOST: process.env.MYSQL_HOST,
	MYSQL_PORT: process.env.MYSQL_PORT,
	MYSQL_DB: process.env.MYSQL_DB,
	MYSQL_USER: process.env.MYSQL_USER,
	MYSQL_PASSWORD: process.env.MYSQL_PASSWORD,

	REDIS_HOST: process.env.REDIS_HOST,
	REDIS_PORT: process.env.REDIS_PORT,
	REDIS_PASSWORD: process.env.REDIS_PASSWORD,
};
