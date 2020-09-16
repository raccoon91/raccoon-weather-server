import { RootService } from "./RootService";
import { AirPollution } from "../models";
import { IAirPollutionResData, IAirPollutionData, IAirForecastResData, IAirForecastData, ICityKor } from "../interface";
import { momentKR, dateLog, cityEngToKorDictionary } from "../utils";

type IParsedForecastData = {
  [key in ICityKor]?: string;
};

class AirpollutionService extends RootService {
  parseAirForecastResponseData = (
    forecastData: IAirForecastResData,
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

  combineAirpollutionData = (
    pm10CurrentData: IAirPollutionResData,
    pm25CurrentData: IAirPollutionResData,
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

  combineAirForecastData = (
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

  cronAirpollution = async (): Promise<void> => {
    try {
      const [pm10CurrentResData] = await this.requestAirPollution<IAirPollutionResData>("getCtprvnMesureLIst", {
        itemCode: "PM10",
        dataGubun: "HOUR",
      });

      const [pm25CurrentResData] = await this.requestAirPollution<IAirPollutionResData>("getCtprvnMesureLIst", {
        itemCode: "PM25",
        dataGubun: "HOUR",
      });

      const currentDate = momentKR(pm10CurrentResData.dataTime).format("YYYY-MM-DD HH:00:00");
      const pollutionData = this.combineAirpollutionData(pm10CurrentResData, pm25CurrentResData, currentDate);

      await this.bulkUpdateOrCreateAirPollution(AirPollution, pollutionData);

      console.log(`success air pollution job ${dateLog()}`);
    } catch (error) {
      console.error(`[airpollution request FAIL ${dateLog()}][${error.message}]`);
      console.error(error.stack);
    }
  };

  cronAirForecast = async (): Promise<void> => {
    try {
      const currentDate = momentKR().format("YYYY-MM-DD");

      const [, pm10ForecastResData] = await this.requestAirPollution<IAirForecastResData>("getMinuDustFrcstDspth", {
        searchDate: currentDate,
        informCode: "PM10",
      });

      const [, pm25ForecastResData] = await this.requestAirPollution<IAirForecastResData>("getMinuDustFrcstDspth", {
        searchDate: currentDate,
        informCode: "PM25",
      });

      const pm10ForecastData = this.parseAirForecastResponseData(pm10ForecastResData);
      const pm25ForecastData = this.parseAirForecastResponseData(pm25ForecastResData);

      const forecastDataList = this.combineAirForecastData(
        pm10ForecastData.airForecastData,
        pm25ForecastData.airForecastData,
        pm10ForecastData.airForecastDate,
      );

      await this.bulkUpdateOrCreateAirPollution(AirPollution, forecastDataList);

      console.log(`success air forecast job ${dateLog()}`);
    } catch (error) {
      console.error(`[air forecast request FAIL ${dateLog()}][${error.message}]`);
      console.error(error.stack);
    }
  };
}

export default new AirpollutionService();
