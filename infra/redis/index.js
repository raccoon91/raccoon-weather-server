const redis = require("ioredis");
const config = require("../../config.js");

const redis_param = {
  host: config.REDIS_HOST,
  port: config.REDIS_PORT,
  password: config.REDIS_PASSWORD
};

const client = redis.createClient(redis_param);

client.on("connect", () => {
  console.log("Redis client connected");
});

client.on("error", err => {
  console.log("Something went wrong " + err);
});

const redisGet = key => {
  return client.get(key);
};

const redisSet = (key, value) => {
  return client.set(key, value, "EX", 60 * 5);
};

module.exports = {
  redisGet,
  redisSet
};
