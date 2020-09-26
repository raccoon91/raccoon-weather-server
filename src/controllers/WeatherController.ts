import { Request, Response, NextFunction } from "express";
import { WeatherService } from "../services";

class WeatherController {
  getWeather = async (req: Request, res: Response, next: NextFunction): Promise<Response> => {
    try {
      const { location } = req.body;

      const weatherData = await WeatherService.getCurrentWeather(location);

      if (!weatherData) {
        return res.send({ message: "data not found" });
      }

      return res.json(weatherData);
    } catch (error) {
      next(error);
    }
  };
}

export default new WeatherController();
