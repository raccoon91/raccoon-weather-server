const { CronJob } = require("cron");
const weather = require("../scripts/contents/weather.js");
const shortForecast = require("../scripts/contents/shortForecast.js");
const midForecast = require("../scripts/contents/midForecast.js");
const airpollution = require("../scripts/contents/airpollution.js");
const airForecast = require("../scripts/contents/airForecast.js");

const jobList = [
  { func: weather, cron: "50 00,10,20,30,40,50 * * * *" },
  { func: shortForecast, cron: "30 45 * * * *" },
  { func: midForecast, cron: "00 10 02,05,08,11,14,17,20,23 * * *" },
  { func: airpollution, cron: "00 10 * * * *" },
  { func: airForecast, cron: "00 00 05,11,17,23 * * *" }
];

const testList = [
  { func: weather, cron: "*/5 * * * * *" },
  { func: shortForecast, cron: "*/5 * * * * *" },
  { func: midForecast, cron: "*/5 * * * * *" },
  { func: airpollution, cron: "*/5 * * * * *" },
  { func: airForecast, cron: "*/5 * * * * *" }
];

const cronjob = () => {
  jobList.forEach(job => {
    new CronJob(job.cron, () => job.func(), null, false, "Asia/Seoul").start();
  });
};

module.exports = cronjob;
