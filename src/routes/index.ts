import express, { Request } from "express";
import geolocation from "../middleware/geolocation";
import { WeatherController, ForecastController, ClimateController } from "../controllers";

const router = express.Router();

// extension

// route test
router.get("/", (req, res) => {
  res.send("hello raccon weather server");
});

// weather
router.get("/weather", geolocation, WeatherController.getWeather);

// forecast
router.get("/forecast/:term", geolocation, ForecastController.getForecast);

// climate
router.get("/climate/geo", ClimateController.getGeoClimate);

router.get("/climate/local/:city", ClimateController.getLocalClimate);

router.get("/scrap", ClimateController.scrapClimate);

router.get("/location", geolocation, async (req: Request, res) => {
  const { location } = req.body;

  res.send(location);
});

export default router;
