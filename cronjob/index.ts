import { CronJob } from "cron";
import weather from "./weather";
import shortForecast from "./shortForecast";
import midForecast from "./midForecast";
import airpollution from "./airpollution";
import airForecast from "./airForecast";

// const jobList = [
// 	{ func: weather, cron: "40 00,10,20,30,40,50 * * * *" },
// 	{ func: shortForecast, cron: "30 45 * * * *" },
// 	{ func: midForecast, cron: "00 10 02,05,08,11,14,17,20,23 * * *" },
// 	{ func: airpollution, cron: "00 10 * * * *" },
// 	{ func: airForecast, cron: "00 00 05,11,17,23 * * *" },
// ];

const testList = [
	{ func: weather, cron: "*/10 * * * * *" },
	{ func: shortForecast, cron: "*/5 * * * * *" },
	{ func: midForecast, cron: "*/5 * * * * *" },
	// { func: airpollution, cron: "*/5 * * * * *" },
	// { func: airForecast, cron: "*/5 * * * * *" },
];

const cronjob = (): void => {
	testList.forEach((job) => {
		new CronJob(job.cron, () => job.func(), null, false, "Asia/Seoul").start();
	});
};

export default cronjob;
