import { Request, Response } from "express";
import { WeatherService } from "../services";
import { errorLog } from "../lib";

class WeatherController {
  getWeather = async (req: Request, res: Response): Promise<Response> => {
    try {
      const { location } = req.body;

      const weatherData = await WeatherService.getCurrentWeather(location);

      if (!weatherData) {
        return res.send({ message: "data not found" });
      }

      return res.json(weatherData);
    } catch (error) {
      errorLog(`${error.message}`, "WeatherController - getWeather");
    }
  };
}

export default new WeatherController();
