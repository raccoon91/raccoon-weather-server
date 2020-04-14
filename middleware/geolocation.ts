// naver cloud flatform geolocation

import axios, { AxiosResponse } from "axios";
import CryptoJS from "crypto-js";
import { Request, Response, NextFunction } from "express";
import config from "../config";

import { cityAbbreviations } from "../utils/location";
import date from "../utils/date";

const { NAVER_HOST_NAME, NAVER_REQUEST_URL, NAVER_ACCESS_KEY, NAVER_SECRET_KEY } = config;

interface IGeoResponseData {
	returnCode?: number;
	requestId?: string;
	geoLocation?: {
		country?: string;
		code?: string;
		r1?: string;
		r2?: string;
		r3?: string;
		lat?: number;
		long?: number;
		net?: string;
		city?: string;
	};
}

const makeSignature = (
	secretKey: string,
	method: string,
	baseString: string,
	timestamp: string,
	accessKey: string,
): string => {
	const space = " ";
	const newLine = "\n";
	// @ts-ignore
	const hmac = CryptoJS.algo.HMAC.create(CryptoJS.algo.SHA256, secretKey);

	hmac.update(method);
	hmac.update(space);
	hmac.update(baseString);
	hmac.update(newLine);
	hmac.update(timestamp);
	hmac.update(newLine);
	hmac.update(accessKey);
	const hash = hmac.finalize();

	return hash.toString(CryptoJS.enc.Base64);
};

const getLocation = async (req: Request): Promise<IGeoResponseData> => {
	const timeStamp = Math.floor(+new Date()).toString();
	const sortedSet: { ip?: string; ext?: string; responseFormatType?: "json" } = {};
	let ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

	ip = typeof ip === "string" ? ip.split(":").pop() : null;

	sortedSet.ip = ip === "127.0.0.1" || ip === "1" ? "211.36.142.207" : ip;
	sortedSet.ext = "t";
	sortedSet.responseFormatType = "json";

	let queryString = Object.keys(sortedSet).reduce((prev, curr) => {
		return `${prev}${curr}=${sortedSet[curr]}&`;
	}, "");

	queryString = queryString.substr(0, queryString.length - 1);

	const baseString = `${NAVER_REQUEST_URL}?${queryString}`;
	const signature = makeSignature(NAVER_SECRET_KEY, "GET", baseString, timeStamp, NAVER_ACCESS_KEY);
	const options = {
		headers: {
			"x-ncp-apigw-timestamp": timeStamp,
			"x-ncp-iam-access-key": NAVER_ACCESS_KEY,
			"x-ncp-apigw-signature-v2": signature,
		},
	};

	const response: AxiosResponse<IGeoResponseData> = await axios.get(`${NAVER_HOST_NAME}${baseString}`, options);

	const city = cityAbbreviations[response.data.geoLocation.r1];

	response.data.geoLocation.city = city;

	// TODO: use redis here
	// await res.cookie("location", response.data, {
	// 	maxAge: 1000 * 60 * 60 * 3,
	// });

	return response.data;
};

export default async (req: Request, res: Response, next: NextFunction): Promise<void> => {
	try {
		// TODO: use redis-session here
		// const location = req.cookies.location;

		// if (!location) {
		// }

		const geolocation = await getLocation(req);

		console.log(geolocation);
	} catch (error) {
		console.error(`[geolocation request FAIL ${date.today()}][${error.message}]`);
		console.error(error.stack);
	} finally {
		next();
	}
};
