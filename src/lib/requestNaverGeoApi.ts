import axios, { AxiosInstance } from "axios";

const { NAVER_HOST_NAME, NAVER_ACCESS_KEY } = process.env;

export const requestNaverGeoApi: AxiosInstance = axios.create({
  baseURL: NAVER_HOST_NAME,
  headers: {
    "x-ncp-iam-access-key": NAVER_ACCESS_KEY,
  },
});
