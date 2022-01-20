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
    const covids: {
      [key: string]: {
        city: City;
        date: string;
        case: number;
        caseIncrement: number;
      };
    } = {};

    cities.forEach((city) => {
      if (!covids[city.korName]) {
        covids[city.korName] = { city, date: "", case: 0, caseIncrement: 0 };
      }
    });

    covidSidos
      .filter((covidSido) => covidSido.gubunEn !== "Total" && covidSido.gubunEn !== "Lazaretto")
      .forEach((covidSido) => {
        const korName = covidSido.gubun;

        if (covids[korName]) {
          covids[korName].date = this.date.dayjs(covidSido.createDt).format("YYYY-MM-DD");
          covids[korName].case = covidSido.defCnt;
          covids[korName].caseIncrement = covidSido.incDec;
        }
      });

    return Object.values(covids);
  }
}
