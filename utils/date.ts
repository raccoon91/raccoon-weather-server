import dayjs from "dayjs";
require("dayjs/locale/ko");

dayjs.locale("ko");

export default {
	today: (): string => {
		return dayjs().subtract(1, "day").format("YYYY-MM-DD");
	},
	getWeatherDate: (): {
		currentDate: string;
		currentTime: string;
		yesterday: string;
	} => {
		const current = dayjs();
		let hour = current.hour();
		const minute = current.minute();
		let dayCalibrate = 0;

		if (minute < 30) {
			hour -= 1;
		}

		if (hour < 0) {
			hour = 23;
			dayCalibrate = 1;
		}

		return {
			currentDate: current.subtract(dayCalibrate, "day").format("YYYYMMDD"),
			currentTime: hour < 10 ? `0${hour}00` : `${hour}00`,
			yesterday: current.subtract(dayCalibrate + 1, "day").format("YYYYMMDD"),
		};
	},
	getMidForecastDate: (): {
		forecastDate: string;
		forecastTime: string;
	} => {
		const current = dayjs();
		let hour = current.hour();
		const minute = current.minute();
		let dayCalibrate = 0;

		if (minute < 30) {
			hour -= 1;
		}

		// mid forecast hour
		hour = (Math.floor((hour + 1) / 3) - 1) * 3 + 2;

		if (hour < 0) {
			hour = 23;
			dayCalibrate = 1;
		}

		return {
			forecastDate: current.subtract(dayCalibrate, "day").format("YYYYMMDD"),
			forecastTime: hour < 10 ? `0${hour}00` : `${hour}00`,
		};
	},
	dateQuery: (currentDate, currentTime): string => {
		return `${currentDate.slice(0, 4)}-${currentDate.slice(4, 6)}-${currentDate.slice(6)} ${currentTime.slice(
			0,
			2,
		)}:00:00`;
	},
	dateLog: () => {
		return dayjs().format("YYYY-MM-DD/HH:mm:ss");
	},
	// tomorrow(timestamp) {
	// 	return timestamp.add(1, "days").format("YYYY-MM-DD 00:00:00");
	// },
	// yesterday(timestamp) {
	// 	return timestamp.subtract(1, "days");
	// },
};