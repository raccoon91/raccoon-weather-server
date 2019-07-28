const axios = require("axios");
const CryptoJS = require("crypto-js");
const config = require("../config.js");

const getLocation = req => {
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
  const signature = makeSignature(
    SECRET_KEY,
    "GET",
    baseString,
    timeStamp,
    ACCESS_KEY
  );
  const options = {
    headers: {
      "x-ncp-apigw-timestamp": timeStamp,
      "x-ncp-iam-access-key": ACCESS_KEY,
      "x-ncp-apigw-signature-v2": signature
    }
  };

  return axios.get(`${config.hostName}${baseString}`, options);
};

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

module.exports = { getLocation };
