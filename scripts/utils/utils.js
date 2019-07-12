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

const locationList = [
  { region: "서울", nx: 60, ny: 127 },
  { region: "강원", nx: 73, ny: 134 },
  { region: "경기", nx: 60, ny: 120 },
  { region: "경남", nx: 91, ny: 77 },
  { region: "경북", nx: 89, ny: 91 }
];

module.exports = {
  date,
  locationList
};
