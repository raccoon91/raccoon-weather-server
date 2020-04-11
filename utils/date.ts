import dayjs from "dayjs";
require("dayjs/locale/ko");

dayjs.locale("ko");

export default {
	today: (): string => {
		return dayjs().subtract(1, "day").format("YYYY-MM-DD");
	},
	// format(timestamp) {
	// 	return timestamp.format("YYYYMMDD");
	// },
	// dayCalibrate(timestamp, day) {
	// 	return date.format(timestamp.subtract(day, "days"));
	// },
	// tomorrow(timestamp) {
	// 	return timestamp.add(1, "days").format("YYYY-MM-DD 00:00:00");
	// },
	// dateQuery(currentDate, currentTime) {
	// 	return `${currentDate.slice(0, 4)}-${currentDate.slice(4, 6)}-${currentDate.slice(6)} ${currentTime.slice(
	// 		0,
	// 		2,
	// 	)}:00:00`;
	// },
	// yesterday(timestamp) {
	// 	return timestamp.subtract(1, "days");
	// },
	// dateLog(timestamp) {
	// 	return timestamp.format("YYYY-MM-DD/HH:mm:ss");
	// },
};
