import redis from "redis";
import config from "../../config";
import { promisify } from "util";

const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = config;

const redisOption = {
	host: REDIS_HOST,
	port: Number(REDIS_PORT),
	password: REDIS_PASSWORD,
};

let client: redis.RedisClient;
export let redisGet;
export let redisSet;

export const connectRedis = (): void => {
	client = redis.createClient(redisOption);

	client.on("connect", () => {
		console.log("Redis connected");
	});

	client.on("error", (err) => {
		console.log("Something went wrong " + err);
	});

	redisGet = promisify(client.get).bind(client);

	redisSet = promisify(client.set).bind(client);
};

// export const redisGet = (key): boolean => {
// 	return client.get(key);
// };

// export const redisSet = (key, value): boolean => {
// 	return client.set(key, value, "EX", 60 * 1);
// };
