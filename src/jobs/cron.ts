import { CronJob } from "cron";
import { WeatherService, ForecastService, AirpollutionService } from "../services";
// import airpollution from "./airpollution";
// import airForecast from "./airForecast";

const jobList = [
  { func: WeatherService.cronCurrentWeather, cron: "40 00,10,20,30,40,50 * * * *" },
  { func: ForecastService.cronShortForecast, cron: "30 45 * * * *" },
  { func: ForecastService.cronMidForecast, cron: "00 10 02,05,08,11,14,17,20,23 * * *" },
  { func: AirpollutionService.cronAirpollution, cron: "00 10 * * * *" },
  { func: AirpollutionService.cronAirpollution, cron: "00 05 05,11,17,23 * * *" },
];

// const testList = [
//   { func: WeatherJob.saveCurrentWeather, cron: "*/5 * * * * *" },
//   { func: ShortForecastJob.saveShortForecast, cron: "*/5 * * * * *" },
//   { func: MidForecastJob.saveMidForecast, cron: "*/5 * * * * *" },
//   { func: AirpollutionService.cronAirpollution, cron: "*/5 * * * * *" },
//   { func: AirpollutionService.cronAirForecast, cron: "*/5 * * * * *" },
// ];

export const cronJob = (): void => {
  jobList.forEach((job) => {
    new CronJob(job.cron, () => job.func(), null, false, "Asia/Seoul").start();
  });
};
