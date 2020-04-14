import redis from "redis";
import config from "../../config";

const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = config;

const redis_param = {
	host: REDIS_HOST,
	port: Number(REDIS_PORT),
	auth_pass: REDIS_PASSWORD,
};

let client: redis.RedisClient;

export const connectRedis = () => {
	client = redis.createClient(redis_param);

	client.on("connect", () => {
		console.log("Redis connected");
	});

	client.on("error", (err) => {
		console.log("Something went wrong " + err);
	});
};

export const redisGet = (key) => {
	return client.get(key);
};

export const redisSet = (key, value) => {
	return client.set(key, value, "EX", 60 * 5);
};
