import cheerio from "cheerio";
import iconv from "iconv-lite";
import { Weather } from "../models";
import { requestScrapApi } from "../lib";
import { momentKR, formatNumberToDateString, dateLog } from "../utils";
import { cityCollectionList } from "../utils";

const pastWeatherCategoryList = [
  { fieldName: "temp", categoryNo: "07" },
  { fieldName: "max_temp", categoryNo: "08" },
  { fieldName: "min_temp", categoryNo: "10" },
  { fieldName: "rn1", categoryNo: "21" },
  { fieldName: "reh", categoryNo: "12" },
];

interface IWeatherData {
  city: string;
  weather_date: string;
  temp: number;
  max_temp: number;
  min_temp: number;
  rn1: number;
  reh: number;
}

class ClimateService {
  scrapPastWeatherData = async (startDate: string, endDate: string): Promise<void> => {
    try {
      const result: { [key: string]: IWeatherData } = {};
      let startMoment = momentKR(startDate);

      while (!startMoment.isAfter(endDate, "year")) {
        for (let i = 0; i < cityCollectionList.length; i++) {
          const { city, stn } = cityCollectionList[i];

          for (let j = 0; j < pastWeatherCategoryList.length; j++) {
            const { fieldName, categoryNo } = pastWeatherCategoryList[j];
            const year = startMoment.year();

            const response = await requestScrapApi({
              method: "get",
              params: {
                stn,
                yy: year,
                obs: categoryNo,
                responseType: "arraybuffer",
              },
            });

            const htmlDoc = iconv.decode(response.data, "EUC-KR").toString();
            const $ = cheerio.load(htmlDoc);

            const tableRow = $("table.table_develop > tbody > tr");

            for (let day = 0; day <= 30; day++) {
              const tableData = $(tableRow[day]).find("td");

              for (let month = 1; month <= 12; month++) {
                const weather_date = formatNumberToDateString(year, month, day + 1);
                const value = $(tableData[month]).text();

                if (value.trim().length) {
                  if (!result[`${weather_date}/${city}`]) {
                    result[`${weather_date}/${city}`] = {
                      city,
                      weather_date,
                      temp: null,
                      max_temp: null,
                      min_temp: null,
                      rn1: null,
                      reh: null,
                    };
                  }

                  result[`${weather_date}/${city}`][fieldName] = Number(value);
                }
              }
            }
          }
        }

        const pastWeatherDataList: IWeatherData[] = Object.values(result);
        const weatherList: IWeatherData[] = [];

        for (let i = 0; i < pastWeatherDataList.length; i++) {
          const { city, weather_date } = pastWeatherDataList[i];

          const weather = await Weather.findOne({
            where: { city, weather_date },
          });

          if (!weather && pastWeatherDataList[i].temp !== null) {
            weatherList.push(pastWeatherDataList[i]);
          }
        }

        await Weather.bulkCreate(weatherList);

        console.log(`success weather scrap ${startMoment} data ${dateLog()}`);

        startMoment = startMoment.add(1, "years");
      }
    } catch (err) {
      console.error(err.message);
    }
  };
}

export default new ClimateService();
