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

    for (let year = 2020; year <= 2021; year++) {
      const startDate = `${year}0101`;
      const endDate =
        year === currentYear
          ? `${year}${currentMonth.toString().padStart(2, "0")}${currentDate.toString().padStart(2, "0")}`
          : `${year}1231`;

      promises.push(
        this.http
          .get<IWeatherHourResponse>("getWthrDataList", {
            params: {
              stnIds: stnId,
              startDt: startDate,
              endDt: endDate,
            },
          })
          .toPromise(),
      );
    }

    const responses = await Promise.all(promises);

    const weathers = responses.reduce(
      (acc, cur) =>
        acc.concat(
          cur?.data?.response?.body?.items?.item?.map((data) => ({
            city,
            temp: data.avgTa ? Number(data.avgTa) : null,
            maxTemp: data.maxTa ? Number(data.maxTa) : null,
            minTemp: data.minTa ? Number(data.minTa) : null,
            rain: data.sumRn && data.sumRn !== "0.0" ? Number(data.sumRn) : null,
            humid: data.avgRhm ? Number(data.avgRhm) : null,
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
