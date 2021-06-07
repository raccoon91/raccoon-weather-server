import { Injectable, HttpService } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import dayjs from "dayjs";
import { CreateWeatherInput, UpdateWeatherInput } from "./weather.dto";
import { Weather } from "./weather.entity";
import { Location } from "src/locations/location.entity";

@Injectable()
export class WeathersService {
  constructor(
    @InjectRepository(Weather)
    private weatherRepository: Repository<Weather>,
    private http: HttpService,
  ) {}

  create(createWeatherInput: CreateWeatherInput) {
    return this.weatherRepository.save(createWeatherInput);
  }

  async createLocationWeathers(location: Location) {
    const { city, stnId } = location;
    const promises: Promise<{ data?: IWeatherHourResponse }>[] = [];

    const today = dayjs().subtract(1, "day");
    const currentYear = today.year();
    const currentMonth = today.month() + 1;
    const currentDate = today.date();

    for (let year = 2021; year <= currentYear; year++) {
      if (year < currentYear) {
        for (let page = 1; page <= 10; page++) {
          promises.push(
            this.http
              .get<IWeatherHourResponse>("getWthrDataList", {
                params: {
                  pageNo: page,
                  stnIds: stnId,
                  startDt: `${year}0101`,
                  endDt: `${year}1231`,
                },
              })
              .toPromise(),
          );
        }
      } else {
        const total = 24 * 30 * currentMonth;
        const last = Math.ceil(total / 900);

        for (let page = 1; page <= last; page++) {
          promises.push(
            this.http
              .get<IWeatherHourResponse>("getWthrDataList", {
                params: {
                  pageNo: page,
                  stnIds: stnId,
                  startDt: `${year}0101`,
                  endDt: `${year}${currentMonth.toString().padStart(2, "0")}${currentDate.toString().padStart(2, "0")}`,
                },
              })
              .toPromise(),
          );
        }
      }
    }

    const responses = await Promise.all(promises);

    const weathers: CreateWeatherInput[] = responses.reduce(
      (acc, cur) =>
        acc.concat(
          cur?.data?.response?.body?.items?.item
            ?.filter((data) => data.ta !== "")
            ?.map((data) => ({
              city,
              temp: data.ta ? Number(data.ta) : null,
              rain: data.rn && data.rn !== "0.0" ? Number(data.rn) : null,
              humid: data.hm ? Number(data.hm) : null,
              date: dayjs(data.tm).add(9, "hour").format("YYYY-MM-DD HH:mm:ss"),
            })) || [],
        ),
      [],
    );

    await this.weatherRepository.save(weathers);

    return weathers;
  }

  findAll() {
    return this.weatherRepository.find();
  }

  update(id: number, updateWeatherInput: UpdateWeatherInput) {
    return this.weatherRepository.save({
      id,
      ...updateWeatherInput,
    });
  }

  remove(id: number) {
    return this.weatherRepository.delete({ id });
  }
}
