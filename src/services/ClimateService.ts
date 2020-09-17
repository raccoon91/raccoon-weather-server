import sequelize from "sequelize";
import cheerio from "cheerio";
import iconv from "iconv-lite";
import { AxiosPromise, AxiosResponse } from "axios";
import { RootService } from "./RootService";
import { Weather } from "../models";
import { requestScrapApi } from "../lib";
import { ICityGeolocation } from "../interface";
import { momentKR, formatNumberToDateString, dateLog, cityCollectionList } from "../utils";

interface IWeatherData {
  city: string;
  weather_date: string;
  temp: number;
  max_temp: number;
  min_temp: number;
  rn1: number;
  reh: number;
}

interface IPastWeatherCategory {
  fieldName: string;
  categoryNo: string;
}

interface IPromisesResponseData {
  responseHtml: Buffer;
  city: string;
  year: string;
  fieldName: string;
}

const pastWeatherCategoryList: IPastWeatherCategory[] = [
  { fieldName: "temp", categoryNo: "07" },
  { fieldName: "max_temp", categoryNo: "08" },
  { fieldName: "min_temp", categoryNo: "10" },
  { fieldName: "rn1", categoryNo: "21" },
  { fieldName: "reh", categoryNo: "12" },
];

class ClimateService extends RootService {
  buildScrapRequest = (
    cityCollection: ICityGeolocation,
    pastWeatherCategory: IPastWeatherCategory,
    year: string,
  ): AxiosPromise<IPromisesResponseData> => {
    const { city, stn } = cityCollection;
    const { fieldName, categoryNo } = pastWeatherCategory;

    return requestScrapApi({
      method: "get",
      params: {
        stn,
        yy: year,
        obs: categoryNo,
        responseType: "arraybuffer",
      },
      transformResponse(responseHtml) {
        return {
          responseHtml,
          city,
          year,
          fieldName,
        };
      },
    });
  };

  parseHtmlToWeatherData = (promisesResponseData: AxiosResponse<IPromisesResponseData>[]): IWeatherData[] => {
    const parsedPastWeatherData: { [key: string]: IWeatherData } = {};

    promisesResponseData.forEach((response) => {
      const { responseHtml, city, year, fieldName } = response.data;

      const htmlDoc = iconv.decode(responseHtml, "EUC-KR").toString();
      const $ = cheerio.load(htmlDoc);

      const tableRow = $("table.table_develop > tbody > tr");

      for (let day = 0; day <= 30; day++) {
        const tableData = $(tableRow[day]).find("td");

        for (let month = 1; month <= 12; month++) {
          const weather_date = formatNumberToDateString(year, month, day + 1);
          const value = $(tableData[month]).text();

          if (value.trim().length) {
            if (!parsedPastWeatherData[`${weather_date}/${city}`]) {
              parsedPastWeatherData[`${weather_date}/${city}`] = {
                city,
                weather_date,
                temp: null,
                max_temp: null,
                min_temp: null,
                rn1: null,
                reh: null,
              };
            }

            parsedPastWeatherData[`${weather_date}/${city}`][fieldName] = Number(value);
          }
        }
      }
    });

    return Object.values(parsedPastWeatherData).filter((pastWeatherData) => pastWeatherData.temp !== null);
  };

  scrapPastWeatherData = async (startDate: string, endDate: string): Promise<void> => {
    const startYear = momentKR(startDate).year();
    const endYear = momentKR(endDate).year();
    const yearCalibrate = endYear - startYear + 1;

    for (let i = 0; i < yearCalibrate; i++) {
      const year = String(startYear + i);

      const yearWeatherData = await Weather.findOne({
        where: sequelize.where(sequelize.fn("YEAR", sequelize.col("weather_date")), year),
      });

      if (yearWeatherData) {
        console.log(`skip scrap ${year} weather data`);
      } else {
        await this.scrapYearWeatherData(year);
      }
    }
  };

  scrapYearWeatherData = async (year: string): Promise<void> => {
    try {
      const promises: AxiosPromise<IPromisesResponseData>[] = [];

      cityCollectionList.forEach((cityCollection) => {
        pastWeatherCategoryList.forEach((pastWeatherCategory) => {
          promises.push(this.buildScrapRequest(cityCollection, pastWeatherCategory, year));
        });
      });

      const promisesResponseData = await Promise.all(promises);

      const pastWeatherDataList = this.parseHtmlToWeatherData(promisesResponseData);

      await Weather.bulkCreate(pastWeatherDataList);

      console.log(`success weather scrap ${year} data ${dateLog()}`);
    } catch (err) {
      console.error(err.message);
    }
  };
}

export default new ClimateService();
