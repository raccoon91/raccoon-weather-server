import redis from "redis";
import config from "../config";

const { REDIS_HOST, REDIS_PORT, REDIS_PASSWORD } = config;

const redisOptions: redis.ClientOpts = {
  host: REDIS_HOST,
  port: Number(REDIS_PORT),
  password: REDIS_PASSWORD,
};

export const client = redis.createClient(redisOptions);

client.on("connect", () => {
  console.log("Redis connected");
});

client.on("error", (err) => {
  console.log("Something went wrong " + err);

  // reconnect
});
