import { Request, Response } from "express";
import { WeatherService } from "../services";

class WeatherController {
  getWeather = async (req: Request, res: Response): Promise<Response> => {
    const { location } = req.body;

    console.log("get weather request");

    const weatherData = await WeatherService.getCurrentWeather(location);

    if (!weatherData) {
      return res.send({ message: "data not found" });
    }

    return res.json(weatherData);
  };
}

export default new WeatherController();
