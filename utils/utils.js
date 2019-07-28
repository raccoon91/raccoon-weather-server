const date = {
  format(timestamp) {
    return timestamp.format("YYYYMMDD");
  },
  dayCalibrate(timestamp, day) {
    return date.format(timestamp.subtract(day, "days"));
  },
  tomorrow(timestamp) {
    return timestamp.add(1, "days").format("YYYY-MM-DD 00:00:00");
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
  { city: "강원", nx: 73, ny: 134 },
  { city: "경기", nx: 60, ny: 120 },
  { city: "경남", nx: 91, ny: 77 },
  { city: "경북", nx: 89, ny: 91 },
  { city: "광주", nx: 58, ny: 74 },
  { city: "대구", nx: 89, ny: 90 },
  { city: "대전", nx: 67, ny: 100 },
  { city: "부산", nx: 98, ny: 76 },
  { city: "세종", nx: 66, ny: 103 },
  { city: "울산", nx: 102, ny: 84 },
  { city: "인천", nx: 55, ny: 124 },
  { city: "전남", nx: 51, ny: 67 },
  { city: "전북", nx: 63, ny: 89 },
  { city: "제주", nx: 52, ny: 38 },
  { city: "충남", nx: 68, ny: 100 },
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
  chungbuk: "충북",
  busan: "부산",
  chungnam: "충남",
  daegu: "대구",
  daejeon: "대전",
  gangwon: "강원",
  gwangju: "광주",
  gyeongbuk: "경북",
  gyeonggi: "경기",
  gyeongnam: "경남",
  incheon: "인천",
  jeju: "제주",
  jeonbuk: "전북",
  jeonnam: "전남",
  sejong: "세종",
  ulsan: "울산"
};

module.exports = {
  date,
  locationList,
  airpollutionLocation,
  cityConvert
};
