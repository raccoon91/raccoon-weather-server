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
  yesterday(timestamp) {
    return timestamp.subtract(1, "days");
  },
  dateLog(timestamp) {
    return timestamp.format("YYYY-MM-DD/HH:mm:ss");
  }
};

const locationList = [
  { city: "서울", nx: 60, ny: 127 },
  { city: "충북", nx: 69, ny: 107 }
];

const cityConvert = {
  서울특별시: "서울",
  부산광역시: "부산",
  대구광역시: "대구",
  인천광역시: "인천",
  광주광역시: "광주",
  대전광역시: "대전",
  울산광역시: "울산",
  세종특별자치시: "세종",
  경기도: "경기",
  강원도: "강원",
  충청북도: "충북",
  충청남도: "충남",
  전라북도: "전북",
  전라남도: "전남",
  경상북도: "경북",
  경상남도: "경남",
  제주특별자치도: "제주"
};

const airpollutionLocation = {
  seoul: "서울",
  chungbuk: "충북"
};

module.exports = {
  date,
  locationList,
  airpollutionLocation,
  cityConvert
};
