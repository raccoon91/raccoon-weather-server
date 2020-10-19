import { Request, Response, NextFunction } from "express";
import { LocationService } from "../services";

const getClientIp = (req: Request): string | null => {
  if (process.env.NODE_ENV === "development") {
    return "222.106.92.113";
  }

  return req.header("x-forwarded-for")?.split(",")[0] || null;
};

export const locationMiddleware = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const ip = getClientIp(req);
    const geolocation = await LocationService.getLocation(ip);

    req.body.location = geolocation;

    next();
  } catch (error) {
    next(error);
  }
};
