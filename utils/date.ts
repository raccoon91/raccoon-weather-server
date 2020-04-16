import moment from "moment-timezone";

export default {
	today: (): string => {
		return moment().tz("Asia/Seoul").subtract(1, "days").format("YYYY-MM-DD");
	},
	getWeatherDate: (): {
		currentDate: string;
		currentTime: string;
		yesterday: string;
	} => {
		const current = moment().tz("Asia/Seoul");
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
			currentDate: current.subtract(dayCalibrate, "days").format("YYYYMMDD"),
			currentTime: hour < 10 ? `0${hour}00` : `${hour}00`,
			yesterday: current.subtract(dayCalibrate + 1, "days").format("YYYYMMDD"),
		};
	},
	getMidForecastDate: (): {
		forecastDate: string;
		forecastTime: string;
	} => {
		const current = moment().tz("Asia/Seoul");
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
	dateLog: (): string => {
		return moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss");
	},
	yesterday: (timestamp): string => {
		return moment(timestamp).subtract(1, "days").format("YYYY-MM-DD HH:mm:ss");
	},
	// tomorrow(timestamp) {
	// 	return timestamp.add(1, "days").format("YYYY-MM-DD 00:00:00");
	// },
};
