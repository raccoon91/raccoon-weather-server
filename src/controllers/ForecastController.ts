import { Response, Request } from "express";
import { IForecastRouteResponse } from "../interface";
import { ForecastService } from "../services";
import { errorLog } from "../lib";

class ForecastController {
  getForecast = async (req: Request, res: Response): Promise<Response> => {
    const { term } = req.params;

    try {
      const { city } = req.body.location;

      let forecastData: IForecastRouteResponse;

      if (term === "short") {
        forecastData = await ForecastService.getForecast(city, "short");
      } else if (term === "mid") {
        forecastData = await ForecastService.getForecast(city, "mid");
      } else {
        return res.status(400).send("Bad Request");
      }

      if (!forecastData) {
        return res.send({ message: "data not found" });
      }

      return res.json(forecastData);
    } catch (error) {
      errorLog(`term - ${term} / ${error.message}`, "ForecastController - getForecast");
    }
  };
}

export default new ForecastController();
