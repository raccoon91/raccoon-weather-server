// naver cloud flatform geolocation

import { Request, Response, NextFunction } from "express";
import axios, { AxiosResponse } from "axios";
import CryptoJS from "crypto-js";
import config from "../config";
import { RedisGet, RedisSet } from "../models";
import { momentKR, dateLog, cityToAbbreviation } from "../utils";

const { NAVER_HOST_NAME, NAVER_REQUEST_URL, NAVER_ACCESS_KEY, NAVER_SECRET_KEY } = config;

interface IGeoResponseData {
  returnCode?: number;
  requestId?: string;
  geoLocation?: {
    ip?: string;
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

const getLocation = async (ip: string | undefined): Promise<IGeoResponseData["geoLocation"]> => {
  const timeStamp = Math.floor(momentKR().valueOf()).toString();
  const sortedSet: { ip?: string; ext?: string; responseFormatType?: "json" } = {};

  sortedSet.ip = ip === "127.0.0.1" || !ip ? "211.36.142.207" : ip;
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

  const city = cityToAbbreviation[response.data.geoLocation.r1];

  return {
    ip,
    city,
    ...response.data.geoLocation,
  };
};

export default async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const ip = req.headers["x-client-ip"] as string | undefined;

  try {
    const cachedIp = await RedisGet(`ip/${ip}`);

    if (cachedIp) {
      console.log("cached ip", ip);
      req.body.location = JSON.parse(cachedIp);
    } else {
      const geolocation = await getLocation(ip);

      await RedisSet(`ip/${ip}`, JSON.stringify(geolocation), "EX", 60 * 30);

      req.body.location = geolocation;
    }

    next();
  } catch (error) {
    console.error(`[geolocation request FAIL ip - ${ip} ${dateLog()}][${error.message}]`);
    console.error(`${ip} ${error.message} ${JSON.stringify(error?.response?.data)}`);
  }
};
