const date = {
  format(timestamp) {
    return timestamp.format("YYYYMMDD");
  },
  dayCalibrate(timestamp, day) {
    return date.format(timestamp.subtract(day, "days"));
  },
  dateQuery(currentDate, currentTime) {
    return `${currentDate.slice(0, 4)}-${currentDate.slice(
      4,
      6
    )}-${currentDate.slice(6)} ${currentTime.slice(0, 2)}:00:00`;
  }
};

const locationList = [{ city: "서울", nx: 60, ny: 127 }];

module.exports = {
  date,
  locationList
};
