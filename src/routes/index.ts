import express, { Request } from "express";
import geolocation from "../middleware/geolocation";
import { WeatherController, ForecastController, ClimateController } from "../controllers";

const router = express.Router();

// extension

// current
router.get("/current", geolocation, WeatherController.getWeather);

// forecast
// short
router.get("/forecast/short", geolocation, ForecastController.getShortForecast);

// mid
router.get("/forecast/mid", geolocation, ForecastController.getMidForecast);

// client
// temp
// rain
// humidity

router.get("/scrap", ClimateController.getScrapYearWeatherData);

router.get("/location", geolocation, async (req: Request, res) => {
  const { location } = req.body;

  res.send(location);
});

export default router;
