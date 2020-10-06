import { NextFunction, Request, Response } from "express";
import { errorLog } from "../api";

export const notFoundError = (req: Request, res: Response): void => {
  res.status(404).send({ message: "Not Found" });
};

export const serverError = async (error: Error, req: Request, res: Response, next: NextFunction): Promise<void> => {
  const { message, stack } = error;

  await errorLog(error);

  res.status(500).send({ message, stack });
};
