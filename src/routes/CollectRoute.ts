import { Request, Response } from "express";
import axios from "axios";
import cheerio from "cheerio";
import iconv from "iconv-lite";
import date from "../utils/date";

const baseUrl = "https://www.weather.go.kr/weather/climate/past_table.jsp";

const categoryList = [
  { name: "temp", no: "07" },
  { name: "max_temp", no: "08" },
  { name: "min_temp", no: "10" },
  { name: "rn1", no: "21" },
  { name: "reh", no: "12" },
];

function dateValidateYear(year: string): boolean {
  if (year.length !== 4) return false;

  if (Number(year) > 1960 && Number(year) <= 2020) {
    return true;
  }

  return false;
}

export class CollectRoute {
  // data = {};

  getCollect = async (req: Request, res: Response): Promise<void> => {
    const data = {};
    const { start, end } = req.query;

    const startYearValidated = dateValidateYear(start as string);
    const endYearValidated = dateValidateYear(end as string);

    if (!startYearValidated || !endYearValidated) {
      res.send("check date");
    } else {
      let startDate = date.moment(start as string);

      while (!startDate.isAfter(end, "year")) {
        for (let i = 0; i < categoryList.length; i++) {
          const category = categoryList[i];
          const year = startDate.year();
          const response = await axios.get(`${baseUrl}?stn=108&yy=${year}&obs=${category.no}`, {
            responseType: "arraybuffer",
          });
          const htmlDoc = iconv.decode(response.data, "EUC-KR").toString();
          const $ = cheerio.load(htmlDoc);

          const tableRow = $("table.table_develop > tbody > tr");

          for (let day = 0; day <= 30; day++) {
            const tableData = $(tableRow[day]).find("td");

            for (let month = 1; month <= 12; month++) {
              const weather_date = date.numberFomatToString(year, month, day + 1);

              if (!data[weather_date]) {
                data[weather_date] = {
                  weather_date,
                  temp: null,
                  max_temp: null,
                  min_temp: null,
                  rn1: null,
                  reh: null,
                };
              }

              const value = $(tableData[month]).text();

              if (value.trim().length) {
                data[weather_date][category.name] = Number(value);
              }
            }
          }
        }

        startDate = startDate.add(1, "years");
      }

      res.send(data);
    }
  };
}
