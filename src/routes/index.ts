import express, { Request } from "express";
import { locationMiddleware } from "../middleware";
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

router.get("/location", locationMiddleware, async (req: Request, res) => {
  const { location } = req.body;

  res.send(location);
});

export default router;
