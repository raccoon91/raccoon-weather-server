import { CronJob } from "cron";
import { WeatherService, ForecastService, AirpollutionService } from "../services";

const jobList = [
  { func: WeatherService.cronCurrentWeather, cron: "00 00,50 * * * *" },
  { func: ForecastService.cronShortForecast, cron: "00 45 * * * *" },
  { func: ForecastService.cronMidForecast, cron: "00 20 02,05,08,11,14,17,20,23 * * *" },
  { func: AirpollutionService.cronAirpollution, cron: "00 10 * * * *" },
  { func: AirpollutionService.cronAirForecast, cron: "00 05 11,17,23 * * *" },
];

// const testList = [
//   { func: WeatherService.cronCurrentWeather, cron: "*/20 * * * * *" },
//   { func: ForecastService.cronShortForecast, cron: "*/20 * * * * *" },
//   { func: ForecastService.cronMidForecast, cron: "*/20 * * * * *" },
//   { func: AirpollutionService.cronAirpollution, cron: "*/20 * * * * *" },
//   { func: AirpollutionService.cronAirForecast, cron: "*/20 * * * * *" },
// ];

export const cronJob = (): void => {
  jobList.forEach((job) => {
    new CronJob(job.cron, () => job.func(), null, false, "Asia/Seoul").start();
  });
};
