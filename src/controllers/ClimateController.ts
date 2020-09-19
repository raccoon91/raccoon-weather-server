import { Request, Response } from "express";
import { ClimateService } from "../services";

function dateValidateYear(year: string): boolean {
  if (!year || year.length !== 4) return false;

  if (Number(year) >= 1960 && Number(year) <= 2020) {
    return true;
  }

  return false;
}

class ClimateController {
  getClimate = async (req: Request, res: Response): Promise<Response> => {
    const { city } = req.params;

    const climateDataList = await ClimateService.getClimate(city);

    if (!climateDataList) {
      return res.send({ message: "data not found" });
    }

    return res.send(climateDataList);
  };

  getGeoData = async (req: Request, res: Response): Promise<Response> => {
    const geoData = await ClimateService.getGeoData();

    if (!geoData) {
      return res.send({ message: "data not found" });
    }

    return res.send(geoData);
  };

  getScrapYearWeatherData = async (req: Request, res: Response): Promise<Response> => {
    const startYear = req.query.start as string;
    const endYear = req.query.end as string;

    const startYearValidated = dateValidateYear(startYear);
    const endYearValidated = dateValidateYear(endYear);

    if (!startYearValidated || !endYearValidated) {
      return res.send("failed scrap check date");
    } else {
      // node server request timeout
      req.setTimeout(50 * 60 * 1000);

      await ClimateService.scrapPastWeatherData(startYear, endYear);

      return res.send("success scrap");
    }
  };
}

export default new ClimateController();
