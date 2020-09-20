import sequelize from "sequelize";
import { Op } from "sequelize";
import cheerio from "cheerio";
import iconv from "iconv-lite";
import { AxiosPromise, AxiosResponse } from "axios";
import { RootService } from "./RootService";
import { Climate } from "../models";
import { requestScrapApi } from "../lib";
import { ICityGeolocation } from "../interface";
import { momentKR, dateLog, cityCollectionList, cityFromAbbreviation } from "../utils";

interface IClimateData {
  city: string;
  temp?: number;
  max_temp?: number;
  min_temp?: number;
  rn1?: number;
  reh?: number;
  year: number;
}

interface IPastWeatherCategory {
  fieldName: string;
  categoryNo: string;
}

interface IPromisesResponseData {
  responseHtml: Buffer;
  city: string;
  fieldName: string;
  year: number;
}

const pastWeatherCategoryList: IPastWeatherCategory[] = [
  { fieldName: "temp", categoryNo: "07" },
  { fieldName: "max_temp", categoryNo: "08" },
  { fieldName: "min_temp", categoryNo: "10" },
  { fieldName: "rn1", categoryNo: "21" },
  { fieldName: "reh", categoryNo: "12" },
];

const averageOfArray = (numberArray: number[]): number => {
  let total = 0;

  for (let i = 0; i < numberArray.length; i++) {
    total += numberArray[i];
  }

  return parseFloat((total / numberArray.length).toFixed(1));
};

class ClimateService extends RootService {
  getLocalClimate = async (city: string): Promise<{ [key: string]: IClimateData[] }> => {
    const findOption: { city?: string; year: {} } = {
      year: { [Op.between]: [1985, 2019] },
    };

    if (city !== "전국") {
      findOption.city = city;
    }

    const climates = await Climate.findAll({
      where: findOption,
      raw: true,
    });

    const localClimateData: { [key: string]: IClimateData[] } = {};

    climates.forEach((data) => {
      if (!localClimateData[data.year]) {
        localClimateData[data.year] = [data];
      } else {
        localClimateData[data.year].push(data);
      }
    });

    return localClimateData;
  };

  getGeoClimate = async (): Promise<{ [key: string]: IClimateData }> => {
    const climates = await Climate.findAll({
      where: {
        year: 2020,
      },
      raw: true,
    });

    const geoClimateData: { [key: string]: IClimateData } = {};

    climates.forEach((data) => {
      geoClimateData[cityFromAbbreviation[data.city]] = data;
    });

    return geoClimateData;
  };

  buildScrapRequest = (
    cityCollection: ICityGeolocation,
    pastWeatherCategory: IPastWeatherCategory,
    year: number,
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

  parseHtmlToClimateData = (promisesResponseData: AxiosResponse<IPromisesResponseData>[]): IClimateData[] => {
    const parsedPastWeatherData: { [key: string]: IClimateData } = {};

    promisesResponseData.forEach((response) => {
      const { responseHtml, city, year, fieldName } = response.data;

      const htmlDoc = iconv.decode(responseHtml, "EUC-KR").toString();
      const $ = cheerio.load(htmlDoc);

      const tableRow = $("table.table_develop > tbody > tr");
      const avgData = $(tableRow[31]).find("td");

      const climateDataList = [];

      for (let month = 1; month <= 12; month++) {
        const value = $(avgData[month]).text();

        if (value.trim().length) {
          climateDataList.push(Number(value));
        }
      }

      if (!parsedPastWeatherData[`${year}/${city}`]) {
        parsedPastWeatherData[`${year}/${city}`] = {
          city,
          year,
        };
      }

      parsedPastWeatherData[`${year}/${city}`][fieldName] = averageOfArray(climateDataList);
    });

    const pastWeatherDataList = Object.values(parsedPastWeatherData).filter(
      (pastWeatherData) => pastWeatherData.temp !== null,
    );

    return pastWeatherDataList;
  };

  scrapClimateData = async (startDate: string, endDate: string): Promise<void> => {
    const startYear = momentKR(startDate).year();
    const endYear = momentKR(endDate).year();
    const yearCalibrate = endYear - startYear + 1;

    for (let i = 0; i < yearCalibrate; i++) {
      const year = startYear + i;

      const yearWeatherData = await Climate.findOne({
        where: {
          year,
        },
      });

      if (yearWeatherData) {
        console.log(`skip scrap ${year} weather data`);
      } else {
        await this.scrapYearClimateData(year);
      }
    }
  };

  scrapYearClimateData = async (year: number): Promise<void> => {
    try {
      const promises: AxiosPromise<IPromisesResponseData>[] = [];

      cityCollectionList.forEach((cityCollection) => {
        pastWeatherCategoryList.forEach((pastWeatherCategory) => {
          promises.push(this.buildScrapRequest(cityCollection, pastWeatherCategory, year));
        });
      });

      const promisesResponseData = await Promise.all(promises);

      const pastWeatherDataList = this.parseHtmlToClimateData(promisesResponseData);

      await Climate.bulkCreate(pastWeatherDataList);

      console.log(`success weather scrap ${year} data ${dateLog()}`);
    } catch (err) {
      console.error(err.message);
    }
  };
}

export default new ClimateService();
