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
  getLocalClimate = async (req: Request, res: Response): Promise<Response> => {
    console.log("get local climate request");

    const { city } = req.params;

    const climateDataList = await ClimateService.getLocalClimate(city);

    if (!climateDataList) {
      return res.send({ message: "data not found" });
    }

    return res.send(climateDataList);
  };

  getGeoClimate = async (req: Request, res: Response): Promise<Response> => {
    console.log("get geo climate request");

    const geoData = await ClimateService.getGeoClimate();

    if (!geoData) {
      return res.send({ message: "data not found" });
    }

    return res.send(geoData);
  };

  scrapClimate = async (req: Request, res: Response): Promise<Response> => {
    const startYear = req.query.start as string;
    const endYear = req.query.end as string;

    const startYearValidated = dateValidateYear(startYear);
    const endYearValidated = dateValidateYear(endYear);

    if (!startYearValidated || !endYearValidated) {
      return res.send("failed scrap. check date");
    } else {
      // node server request timeout
      req.setTimeout(3 * 60 * 1000);

      await ClimateService.scrapClimateData(startYear, endYear);

      return res.send("success scrap");
    }
  };
}

export default new ClimateController();
