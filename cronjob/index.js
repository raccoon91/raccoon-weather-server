const { CronJob } = require("cron");
const weather = require("../scripts/contents/weather.js");
const shortForecast = require("../scripts/contents/shortForecast.js");
const midForecast = require("../scripts/contents/midForecast.js");

const jobList = [
  { func: weather, cron: "00,10,20,30,40,50 * * * * *" },
  { func: shortForecast, cron: "05,15,25,35,45,55 * * * * *" },
  { func: midForecast, cron: "08,18,28,38,48,58 * * * * *" }
];

const cronjob = () => {
  jobList.forEach(job => {
    new CronJob(job.cron, () => job.func(), null, false, "Asia/Seoul").start();
  });
};

module.exports = cronjob;
