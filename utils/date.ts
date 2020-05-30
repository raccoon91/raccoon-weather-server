import moment from "moment-timezone";

export default {
  today: (): string => {
    return moment().tz("Asia/Seoul");
  },
  yesterday: (timestamp): string => {
    return moment(timestamp).subtract(1, "days");
  },
  tomorrow: (timestamp): string => {
    return timestamp.add(1, "days");
  },
  format: (timestamp: string, format: string): string => {
    return moment(timestamp).tz("Asia/Seoul").format(format);
  },
  getCurrentWeatherDate: (): { currentDate: string; currentTime: string; currentMinute: string } => {
    const current = moment().tz("Asia/Seoul");
    let hour = current.hour();
    const minute = current.minute();
    const currentMinute = Math.floor(minute / 10) * 10;
    let dayCalibrate = 0;

    if (minute <= 20) {
      hour -= 1;
    }

    if (hour < 0) {
      hour = 23;
      dayCalibrate = 1;
    }

    return {
      currentDate: current.subtract(dayCalibrate, "days").format("YYYYMMDD"),
      currentTime: hour < 10 ? `0${hour}00` : `${hour}00`,
      currentMinute: currentMinute === 0 ? "00" : `${currentMinute}`,
    };
  },
  getShortForecastDate: (): {
    currentDate: string;
    currentTime: string;
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

    // mid forecast hour [02, 05, 08, 11, 14, 17, 20, 23]
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
  dateLog: (): string => {
    return moment().tz("Asia/Seoul").format("YYYY-MM-DD HH:mm:ss");
  },
};
