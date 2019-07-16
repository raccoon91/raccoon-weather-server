const date = {
  format(timestamp) {
    return timestamp.format("YYYYMMDD");
  },
  dayCalibrate(timestamp, day) {
    return date.format(timestamp.subtract(day, "days"));
  },
  tomorrow(timestamp) {
    return date.format(timestamp.add(1, "days"));
  },
  dateQuery(currentDate, currentTime) {
    return `${currentDate.slice(0, 4)}-${currentDate.slice(
      4,
      6
    )}-${currentDate.slice(6)} ${currentTime.slice(0, 2)}:00:00`;
  },
  dateLog(timestamp) {
    return timestamp.format("YYYY-MM-DD/HH:mm:ss");
  }
};

const locationList = [
  { city: "서울", nx: 60, ny: 127 },
  { city: "충북", nx: 69, ny: 107 }
];

const airpollutionLocation = {
  seoul: "서울",
  chungbuk: "충북"
};

module.exports = {
  date,
  locationList,
  airpollutionLocation
};
