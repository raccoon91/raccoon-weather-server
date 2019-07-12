const { CronJob } = require("cron");
const weather = require("../scripts/contents/weather.js");
const shortForecast = require("../scripts/contents/shortForecast.js");
const midForecast = require("../scripts/contents/midForecast.js");

const jobList = [
  { func: weather, cron: "00,10,20,30,40,50 * * * * *" },
  { func: shortForecast, cron: "04,14,24,34,44,54 * * * * *" }
  // { func: midForecast, cron: "07,17,27,37,47,57 * * * *" }
];

const cronjob = () => {
  jobList.forEach(job => {
    new CronJob(job.cron, () => job.func(), null, false, "Asia/Seoul").start();
  });
};

module.exports = cronjob;
