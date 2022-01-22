import { Injectable } from "@nestjs/common";
import { City } from "src/cities/city.entity";
import { DateService } from "./date.service";
import { BaseParserService } from "./base-parser.service";

@Injectable()
export class CovidParserService extends BaseParserService {
  constructor(private date: DateService) {
    super();
  }

  parseCovid(covid: ICovidItem) {
    return {
      case: covid.decideCnt,
      date: this.date.dayjs(covid.createDt).format("YYYY-MM-DD"),
    };
  }

  parseCovidSido(cities: City[], covidSidos: ICovidSidoItem[]) {
    const citiesDictionary: { [cityName: string]: City } = {};

    const covids: {
      [key: string]: {
        city: City;
        date: string;
        case: number;
        caseIncrement: number;
      };
    } = {};

    cities.forEach((city) => (citiesDictionary[city.korName] = city));

    covidSidos
      .filter((covidSido) => covidSido.gubunEn !== "Lazaretto")
      .forEach((covidSido) => {
        const korName = covidSido.gubun;
        const date = this.date.dayjs(covidSido.createDt).format("YYYY-MM-DD");
        const city = citiesDictionary[korName];

        if (city && !covids[`${korName}-${date}`]) {
          covids[`${korName}-${date}`] = {
            city: city,
            date: date,
            case: covidSido.defCnt,
            caseIncrement: covidSido.incDec,
          };
        }
      });

    return Object.values(covids);
  }
}
