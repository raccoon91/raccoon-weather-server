import { AxiosResponse } from "axios";
import CryptoJS from "crypto-js";
import { Location } from "../models";
import { requestNaverGeoApi, errorLog, infoLog } from "../lib";
import { momentKR, cityToAbbreviation } from "../utils";

const { NAVER_REQUEST_URL, NAVER_ACCESS_KEY, NAVER_SECRET_KEY } = process.env;

interface ILocationData {
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
}

interface IGeoResponseData {
  returnCode?: number;
  requestId?: string;
  geoLocation?: ILocationData;
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

export class LocationService {
  requestLocation = async (ip: string): Promise<ILocationData> => {
    try {
      const timeStamp = momentKR().valueOf().toString();
      const baseString = `${NAVER_REQUEST_URL}?ip=${ip}&ext=t&responseFormatType=json`;
      const signature = makeSignature(NAVER_SECRET_KEY, "GET", baseString, timeStamp, NAVER_ACCESS_KEY);

      const response: AxiosResponse<IGeoResponseData> = await requestNaverGeoApi({
        method: "get",
        url: baseString,
        headers: {
          "x-ncp-apigw-timestamp": timeStamp,
          "x-ncp-apigw-signature-v2": signature,
        },
      });

      if (!response.data) return null;

      const { geoLocation } = response.data;
      const city = cityToAbbreviation[geoLocation.r1];

      return {
        ip,
        city,
        ...geoLocation,
      };
    } catch (error) {
      const message = error?.response?.data?.error?.details || error.message;

      throw error;
    }
  };

  getLocation = async (ip?: string): Promise<ILocationData> => {
    try {
      let location: ILocationData;

      if (ip) {
        location = await Location.findOne({
          where: {
            ip,
          },
          attributes: ["ip", "city", "r1", "r2", "r3"],
          raw: true,
        });
      }

      if (!location) {
        location = await this.requestLocation(ip);

        if (location) {
          Location.create(location);
          infoLog("Create", `new location ${ip}`, "getLocation");
        }
      }

      if (!location) {
        location = await Location.findOne({
          where: {
            city: "서울",
          },
          attributes: ["ip", "city", "r1", "r2", "r3"],
          raw: true,
        });
      }

      return location;
    } catch (error) {
      const message = error?.response?.data?.error?.details || error.message;

      errorLog(`${message} / ip - ${ip}`, "LocationService - getLocation");

      throw error;
    }
  };
}

export default new LocationService();
