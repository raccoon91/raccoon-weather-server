import { Response, Request } from "express";
import { IForecastRouteResponse } from "../interface";
import { ForecastService } from "../services";

class ForecastController {
  getForecast = async (req: Request, res: Response): Promise<Response> => {
    const { city } = req.body.location;
    const { term } = req.params;

    console.log(`get ${term} forecast request`);

    let forecastData: IForecastRouteResponse;

    if (term === "short") {
      forecastData = await ForecastService.getForecast(city, true);
    } else if (term === "mid") {
      forecastData = await ForecastService.getForecast(city);
    } else {
      return res.status(400).send("Bad Request");
    }

    if (!forecastData) {
      return res.send({ message: "data not found" });
    }

    return res.json(forecastData);
  };
}

export default new ForecastController();
