import { Response, Request } from "express";
import { ForecastService } from "../services";

export class ForecastController {
  static getShortForecast = async (req: Request, res: Response): Promise<Response> => {
    const { city } = req.body.location;

    const forecastData = await ForecastService.getForecast(city, true);

    if (!forecastData) {
      return res.send({ message: "data not found" });
    }

    return res.json(forecastData);
  };

  static getMidForecast = async (req: Request, res: Response): Promise<Response> => {
    const { city } = req.body.location;

    const tomorrowData = await ForecastService.getForecast(city);

    if (!tomorrowData) {
      return res.send({ message: "data not found" });
    }

    return res.json(tomorrowData);
  };
}
