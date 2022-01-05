export class BaseParserService {
  readonly defaultCurrentWeather = {
    date: null,
    temp: 0,
    rain: 0,
    rainType: 0,
    humid: 0,
    wind: 0,
    windDirection: 0,
  };

  readonly defaultForecast = {
    sky: 0,
    temp: 0,
    rain: 0,
    rainType: 0,
    rainProb: 0,
    humid: 0,
    wind: 0,
    windDirection: 0,
  };

  readonly currentWeatherKey = {
    T1H: "temp",
    RN1: "rain",
    PTY: "rainType",
    REH: "humid",
    WSD: "wind",
    VEC: "windDirection",
  };

  readonly shortForecastKey = {
    SKY: "sky",
    T1H: "temp",
    RN1: "rain",
    PTY: "rainType",
    REH: "humid",
    WSD: "wind",
    VEC: "windDirection",
  };

  readonly midForecastKey = {
    SKY: "sky",
    TMP: "temp",
    PCP: "rain",
    PTY: "rainType",
    POP: "rainProb",
    REH: "humid",
    WSD: "wind",
    VEC: "windDirection",
  };

  readonly airForecastGrade = {
    좋음: 1,
    보통: 2,
    나쁨: 3,
    매우나쁨: 4,
  };

  toNumber(value: string) {
    if (typeof value !== "string") return 0;

    if (!isNaN(parseFloat(value))) {
      return parseFloat(value);
    }

    return 0;
  }

  getFeelTemp = (temp: string, wind: string) => {
    const windCalib = Math.pow(Number(wind), 0.16);

    return Number((13.12 + 0.6215 * Number(temp) - 11.37 * windCalib + 0.3965 * windCalib * Number(temp)).toFixed(1));
  };
}
