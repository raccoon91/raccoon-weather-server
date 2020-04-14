import redis from "redis";
import config from "../../config";

const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = config;

const redisOption = {
	host: REDIS_HOST,
	port: Number(REDIS_PORT),
	password: REDIS_PASSWORD,
};

let client: redis.RedisClient;

export const connectRedis = (): void => {
	client = redis.createClient(redisOption);

	client.on("connect", () => {
		console.log("Redis connected");
	});

	client.on("error", (err) => {
		console.log("Something went wrong " + err);
	});
};

export const redisGet = (key): boolean => {
	return client.get(key);
};

export const redisSet = (key, value): boolean => {
	return client.set(key, value, "EX", 60 * 5);
};
