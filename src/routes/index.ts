import express, { Request } from "express";
import { locationMiddleware, notFoundError, serverError } from "../middleware";
import { WeatherController, ForecastController, ClimateController } from "../controllers";

const router = express.Router();

// weather
router.get("/weather", locationMiddleware, WeatherController.getWeather);

// forecast
router.get("/forecast/:term", locationMiddleware, ForecastController.getForecast);

// climate
router.get("/climate/geo", ClimateController.getGeoClimate);

router.get("/climate/local/:city", ClimateController.getLocalClimate);

router.get("/scrap", ClimateController.scrapClimate);

router.get("/location", locationMiddleware, (req: Request, res) => {
  const { location } = req.body;

  res.send(location);
});

router.use(notFoundError);

router.use(serverError);

export default router;
