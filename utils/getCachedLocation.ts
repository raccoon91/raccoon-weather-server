import { redisKeys, redisGet } from "../infra/redis";
import { ILocation } from "../interface";

const getCachedLocation = async (): Promise<ILocation[]> => {
	const result = {};

	const redisKeyList = await redisKeys("*");

	for (let i = 0; i < redisKeyList.length; i++) {
		const key = redisKeyList[i];
		const category = key.split("/")[0];

		if (category === "ip") {
			const location = await redisGet(key);

			if (!result[location.city]) {
				result[location.city] = JSON.parse(location);
			}
		}
	}

	return Object.values(result);
};

export default getCachedLocation;
