import express, { Request } from "express";
import geolocation from "../middleware/geolocation";
import { WeatherController, ForecastController, ClimateController } from "../controllers";

const router = express.Router();

// extension

// current
router.get("/current", geolocation, WeatherController.getWeather);

// forecast
router.get("/forecast/:term", geolocation, ForecastController.getForecast);

// climate
router.get("/climate/geo", ClimateController.getGeoData);

router.get("/climate/local/:city", ClimateController.getClimate);

router.get("/scrap", ClimateController.getScrapYearWeatherData);

router.get("/location", geolocation, async (req: Request, res) => {
  const { location } = req.body;

  res.send(location);
});

export default router;
