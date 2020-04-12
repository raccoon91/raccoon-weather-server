import { CronJob } from "cron";
import weather from "../scripts/weather";
import shortForecast from "../scripts/shortForecast";
import midForecast from "../scripts/midForecast";
import airpollution from "../scripts/airpollution";
import airForecast from "../scripts/airForecast";

const jobList = [
	{ func: weather, cron: "50 00,10,20,30,40,50 * * * *" },
	{ func: shortForecast, cron: "30 45 * * * *" },
	{ func: midForecast, cron: "00 10 02,05,08,11,14,17,20,23 * * *" },
	{ func: airpollution, cron: "00 10 * * * *" },
	{ func: airForecast, cron: "00 00 05,11,17,23 * * *" },
];

// const testList = [
// 	{ func: weather, cron: "*/5 * * * * *" },
// 	{ func: shortForecast, cron: "*/5 * * * * *" },
// 	{ func: midForecast, cron: "*/5 * * * * *" },
// 	{ func: airpollution, cron: "*/5 * * * * *" },
// 	{ func: airForecast, cron: "*/5 * * * * *" },
// ];

const cronjob = (): void => {
	jobList.forEach((job) => {
		new CronJob(job.cron, () => job.func(), null, false, "Asia/Seoul").start();
	});
};

export default cronjob;
