import { Request, Response, NextFunction } from "express";
import { LocationService } from "../services";
import { errorLog } from "../lib";

export const locationMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const ip = req.headers["x-client-ip"] as string | undefined;

  try {
    const geolocation = await LocationService.getLocation(ip);

    req.body.location = geolocation;

    next();
  } catch (error) {
    errorLog(`ip - ${ip} / ${error.message}`, "locationMiddleware");
  }
};
