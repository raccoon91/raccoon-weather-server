import moment, { Moment, MomentInput } from "moment";

export const momentKST = (timestamp?: MomentInput): Moment => {
  if (timestamp) {
    return moment(timestamp).utcOffset(9);
  }

  return moment().utcOffset(9);
};

export const momentTimezone = (timezone: number, timestamp?: MomentInput): Moment => {
  if (timestamp) {
    return moment(timestamp).utcOffset(timezone);
  }

  return moment().utcOffset(timezone);
};

export const yesterday = (timestamp: MomentInput): Moment => {
  return momentTimezone(0, timestamp).subtract(1, "days");
};

export const tomorrow = (timestamp: MomentInput): Moment => {
  return momentTimezone(0, timestamp).add(1, "days");
};

export const momentFormat = (timestamp: MomentInput, formatString: string): string => {
  return moment(timestamp).format(formatString);
};

export const dateLog = (): string => {
  return momentKST().format("YYYY-MM-DD HH:mm:ss");
};

export const getCurrentWeatherDate = (): { currentDate: string; currentTime: string; currentMinute: string } => {
  const current = momentKST();
  let hour = current.hour();
  const minute = current.minute();
  const currentMinute = Math.floor(minute / 10) * 10;
  let dayCalibrate = 0;

  if (minute < 50) {
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
};

export const getShortForecastDate = (): {
  currentDate: string;
  currentTime: string;
} => {
  const current = momentKST();
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
};

export const getMidForecastDate = (): {
  forecastDate: string;
  forecastTime: string;
} => {
  const current = momentKST();
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
};
