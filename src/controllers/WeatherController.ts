import { Request, Response } from "express";
import { WeatherService } from "../services";

export class WeatherController {
  static getWeather = async (req: Request, res: Response): Promise<Response> => {
    const { location } = req.body;

    const weatherData = await WeatherService.getCurrentWeather(location);

    if (!weatherData) {
      return res.send({ message: "data not found" });
    }

    return res.json(weatherData);
  };
}
