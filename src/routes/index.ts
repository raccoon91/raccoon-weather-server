import express, { Request } from "express";
import geolocation from "../middleware/geolocation";
import { WeatherController, ForecastController } from "../controllers";

// import { CollectRoute } from "./CollectRoute";

const router = express.Router();

router.use(geolocation);

// extension

// current
router.get("/current", WeatherController.getWeather);

// forecast
// short
router.get("/forecast/short", ForecastController.getShortForecast);

// mid
router.get("/forecast/mid", ForecastController.getMidForecast);

// client
// temp
// rain
// humidity

router.get("/location", async (req: Request, res) => {
  const { location } = req.body;

  res.send(location);
});

// router.get("/collect", new CollectRoute().getCollect);

export default router;
