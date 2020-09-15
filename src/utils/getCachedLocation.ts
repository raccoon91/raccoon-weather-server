import { RedisGet, RedisKeys } from "../models";
import { ILocation } from "../interface";

export const getCachedLocation = async (): Promise<ILocation[]> => {
  const result = {};

  const redisKeyList = await RedisKeys("*");

  for (let i = 0; i < redisKeyList.length; i++) {
    const key = redisKeyList[i];
    const category = key.split("/")[0];

    if (category === "ip") {
      const location = await RedisGet(key);

      if (!result[location.city]) {
        result[location.city] = JSON.parse(location);
      }
    }
  }

  return Object.values(result);
};
