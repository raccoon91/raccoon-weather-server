import { Request, Response } from "express";
import { ClimateService } from "../services";

function dateValidateYear(year: string): boolean {
  if (!year || year.length !== 4) return false;

  if (Number(year) >= 1960 && Number(year) <= 2020) {
    return true;
  }

  return false;
}

export class ClimateController {
  static getScrapYearWeatherData = async (req: Request, res: Response): Promise<void> => {
    const startYear = req.query.start as string;
    const endYear = req.query.end as string;

    const startYearValidated = dateValidateYear(startYear);
    const endYearValidated = dateValidateYear(endYear);

    if (!startYearValidated || !endYearValidated) {
      res.send("failed scrap check date");
    } else {
      // node server request timeout
      req.setTimeout(50 * 60 * 1000);

      await ClimateService.scrapPastWeatherData(startYear, endYear);

      res.send("success scrap");
    }
  };
}
