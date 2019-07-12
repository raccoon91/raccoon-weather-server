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

const location = [
  { region: "서울", nx: 60, ny: 127 },
  { region: "강원", nx: 73, ny: 134 },
  { region: "경기", nx: 60, ny: 120 },
  { region: "경남", nx: 91, ny: 77 },
  { region: "경북", nx: 89, ny: 91 },
  { region: "광주", nx: 58, ny: 74 },
  { region: "대구", nx: 89, ny: 90 },
  { region: "대전", nx: 67, ny: 100 },
  { region: "부산", nx: 98, ny: 76 },
  { region: "세종", nx: 66, ny: 103 },
  { region: "울산", nx: 102, ny: 84 },
  { region: "인천", nx: 55, ny: 124 },
  { region: "전남", nx: 51, ny: 67 },
  { region: "전북", nx: 63, ny: 89 },
  { region: "제주", nx: 52, ny: 38 },
  { region: "충남", nx: 68, ny: 100 },
  { region: "충북", nx: 69, ny: 107 }
];

module.exports = {
  date,
  location
};
