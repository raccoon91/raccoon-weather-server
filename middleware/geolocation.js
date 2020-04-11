const axios = require("axios");
const CryptoJS = require("crypto-js");
const config = require("../config.ts");
const { cityConvert } = require("../utils/utils.js");

const makeSignature = (secretKey, method, baseString, timestamp, accessKey) => {
	const space = " ";
	const newLine = "\n";
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

const getLocation = async (req, res) => {
	const { ACCESS_KEY, SECRET_KEY } = config;
	let ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
	const timeStamp = Math.floor(+new Date()).toString();
	const sortedSet = {};

	ip = ip.split(":").pop();

	sortedSet.ip = ip === "127.0.0.1" || ip === "1" ? "211.36.142.207" : ip;
	sortedSet.ext = "t";
	sortedSet.responseFormatType = "json";

	let queryString = Object.keys(sortedSet).reduce((prev, curr) => {
		return `${prev}${curr}=${sortedSet[curr]}&`;
	}, "");

	queryString = queryString.substr(0, queryString.length - 1);

	const baseString = `${config.requestUrl}?${queryString}`;
	const signature = makeSignature(SECRET_KEY, "GET", baseString, timeStamp, ACCESS_KEY);
	const options = {
		headers: {
			"x-ncp-apigw-timestamp": timeStamp,
			"x-ncp-iam-access-key": ACCESS_KEY,
			"x-ncp-apigw-signature-v2": signature,
		},
	};

	const location = await axios.get(`${config.hostName}${baseString}`, options);

	const city = cityConvert[location.data.geoLocation.r1];
	location.data.geoLocation.city = city;

	await res.cookie("location", location.data, {
		maxAge: 1000 * 60 * 60 * 3,
	});

	return location.data;
};

module.exports = async (req, res, next) => {
	try {
		const location = req.cookies.location;

		if (!location) {
			req.cookies.location = await getLocation(req, res);
		}

		next();
	} catch (err) {
		res.send(err);
	}
};
