import { Injectable } from "@nestjs/common";
import dayjs from "dayjs";
import type { ConfigType } from "dayjs";

@Injectable()
export class DateService {
  dayjs(date?: ConfigType) {
    return dayjs(date);
  }

  formatWeatherDate(weatherDate: string, weatherTime: string) {
    return dayjs(`${weatherDate} ${weatherTime}`).format("YYYY-MM-DD");
  }

  formatForecastDate(weatherDate: string, weatherTime: string) {
    return dayjs(`${weatherDate} ${weatherTime}`).format("YYYY-MM-DD HH:mm");
  }

  generateClimateDate(year: number) {
    const currentDate = this.dayjs();
    const baseDate = this.dayjs().year(year);
    const startDate = baseDate.month(0).date(1).format("YYYYMMDD");
    let endDate: string;

    if (year === currentDate.year()) {
      endDate = currentDate.subtract(1, "day").format("YYYYMMDD");
    } else {
      endDate = baseDate.month(11).date(31).format("YYYYMMDD");
    }

    return { startDate, endDate };
  }

  generateCurrentWeatherDate() {
    const currentDate = this.dayjs().subtract(40, "minute");
    const baseDate = currentDate.format("YYYYMMDD");
    const baseTime = currentDate.format("HH00");

    return { baseDate, baseTime };
  }

  generateShortForecastDate() {
    const currentDate = this.dayjs().subtract(45, "minute");
    const baseDate = currentDate.format("YYYYMMDD");
    const baseTime = currentDate.format("HH30");

    return { baseDate, baseTime };
  }

  generateMidForecastDate() {
    let currentDate = this.dayjs().subtract(10, "minute");
    let currentHour = currentDate.hour();

    if (currentHour < 2) {
      currentDate = currentDate.subtract(1, "day");
      currentHour = currentHour = 23;
    }

    const midForecastHour = Math.floor((currentHour + 1) / 3) * 3 - 1;
    currentDate = currentDate.hour(midForecastHour);

    const baseDate = currentDate.format("YYYYMMDD");
    const baseTime = currentDate.format("HH10");

    return { baseDate, baseTime };
  }

  generateAirForecastDate(date: string) {
    const fromDate = this.dayjs(`${date} 00:00`).format("YYYY-MM-DD HH:mm");
    const toDate = this.dayjs(`${date} 23:59`).format("YYYY-MM-DD HH:mm");

    return { fromDate, toDate };
  }
}
