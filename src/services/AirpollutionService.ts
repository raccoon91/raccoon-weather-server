import { RootService } from "./RootService";
import { AirPollution } from "../models";
import {
  IAirPollutionResponseData,
  IAirPollutionData,
  IAirForecastResponseData,
  IAirForecastData,
  ICityKor,
} from "../interface";
import { momentKR, dateLog, cityEngToKorDictionary } from "../utils";

type IParsedForecastData = {
  [key in ICityKor]?: string;
};

export class AirpollutionService extends RootService {
  static parseAirForecastResponseData = (
    forecastData: IAirForecastResponseData,
  ): { airForecastData: IParsedForecastData; airForecastDate: string } => {
    const { informData, informGrade } = forecastData;
    const airForecastData: IParsedForecastData = {};

    informGrade.split(",").forEach((forecast) => {
      const splitedInform = forecast.split(" : ");
      let city = splitedInform[0];
      const air = splitedInform[1];

      // TODO: calcluate avg of forecast data
      if (city === "영동" || city === "영서") {
        city = "강원";
      } else if (city === "경기남부" || city === "경기북부") {
        city = "경기";
      }

      airForecastData[city] = air;
    });

    return {
      airForecastData,
      airForecastDate: momentKR(informData).format("YYYY-MM-DD 00:00:00"),
    };
  };

  static combineAirpollutionData = (
    pm10CurrentData: IAirPollutionResponseData,
    pm25CurrentData: IAirPollutionResponseData,
    currentDate: string,
  ): IAirPollutionData[] => {
    const result: IAirPollutionData[] = [];

    Object.keys(cityEngToKorDictionary).forEach((city_en: string) => {
      const currentAir: IAirPollutionData = {
        city: cityEngToKorDictionary[city_en],
        pm10: pm10CurrentData[city_en],
        pm25: pm25CurrentData[city_en],
        air_date: currentDate,
      };

      result.push(currentAir);
    });

    return result;
  };

  static combineAirForecastData = (
    pm10Forecast: IParsedForecastData,
    pm25Forecast: IParsedForecastData,
    forecastDate: string,
  ): IAirForecastData[] => {
    const result: IAirForecastData[] = [];

    Object.keys(pm10Forecast).forEach((city: ICityKor) => {
      const forecast = {
        city,
        pm10: pm10Forecast[city],
        pm25: pm25Forecast[city],
        air_date: forecastDate,
      };

      result.push(forecast);
    });

    return result;
  };

  static cronAirpollution = async (): Promise<void> => {
    try {
      const [pm10CurrentResponseData] = await AirpollutionService.requestAirPollution<IAirPollutionResponseData>(
        "getCtprvnMesureLIst",
        {
          itemCode: "PM10",
          dataGubun: "HOUR",
        },
      );

      const [pm25CurrentResponseData] = await AirpollutionService.requestAirPollution<IAirPollutionResponseData>(
        "getCtprvnMesureLIst",
        {
          itemCode: "PM25",
          dataGubun: "HOUR",
        },
      );

      const currentDate = momentKR(pm10CurrentResponseData.dataTime).format("YYYY-MM-DD HH:00:00");
      const pollutionData = AirpollutionService.combineAirpollutionData(
        pm10CurrentResponseData,
        pm25CurrentResponseData,
        currentDate,
      );

      await AirpollutionService.bulkUpdateOrCreateAirPollution(AirPollution, pollutionData);

      console.log("success air pollution job");
    } catch (error) {
      console.error(`[airpollution request FAIL ${dateLog()}][${error.message}]`);
      console.error(error.stack);
    }
  };

  static cronAirForecast = async (): Promise<void> => {
    try {
      const currentDate = momentKR().format("YYYY-MM-DD");

      const [, pm10ForecastResponseData] = await AirpollutionService.requestAirPollution<IAirForecastResponseData>(
        "getMinuDustFrcstDspth",
        {
          searchDate: currentDate,
          informCode: "PM10",
        },
      );

      const [, pm25ForecastResponseData] = await AirpollutionService.requestAirPollution<IAirForecastResponseData>(
        "getMinuDustFrcstDspth",
        {
          searchDate: currentDate,
          informCode: "PM25",
        },
      );

      const pm10ForecastData = AirpollutionService.parseAirForecastResponseData(pm10ForecastResponseData);
      const pm25ForecastData = AirpollutionService.parseAirForecastResponseData(pm25ForecastResponseData);

      const forecastDataList = AirpollutionService.combineAirForecastData(
        pm10ForecastData.airForecastData,
        pm25ForecastData.airForecastData,
        pm10ForecastData.airForecastDate,
      );

      await AirpollutionService.bulkUpdateOrCreateAirPollution(AirPollution, forecastDataList);

      console.log("success air forecast job");
    } catch (error) {
      console.error(`[air forecast request FAIL ${dateLog()}][${error.message}]`);
      console.error(error.stack);
    }
  };
}
