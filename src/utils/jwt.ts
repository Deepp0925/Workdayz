import { sign, verify, Secret, SignOptions, VerifyOptions } from "jsonwebtoken";
import { Response, Request, NextFunction } from "express";
import { handleError, ServerError } from "../error";
import { promisify } from "util";
import ObjectID from "bson-objectid";
import { packResponse } from "./response";

let secret = process.env.SECRET_KET;

function adjustSecret() {
  if (!secret) secret = process.env.SECRET_KEY;
}

export class JWT {
  static async sign(data: Object): Promise<string> {
    try {
      adjustSecret();
      return (await promisify<Object, Secret, SignOptions>(sign)(data, secret, {
        expiresIn: "10 days",
      })) as any;
    } catch (error) {
      console.log(error);
      throw handleError(error, "Authorization Error");
    }
  }

  static async authenticate(req: Request, res: Response, next: NextFunction) {
    try {
      adjustSecret();
      await promisify<string, Secret>(verify)(
        req.headers.authorization,
        secret
      );
      next();
    } catch (error) {
      res.sendStatus(403).json(packResponse(true, "Unauthorized"));
    }
  }

  static async authenticateWithBody(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      adjustSecret();

      if (!ObjectID.isValid(req.body.userId))
        throw new ServerError("Invalid user", 401);

      const data = (await promisify<string, Secret>(verify)(
        req.headers.authorization,
        secret
      )) as any;

      console.log(data.userId, req.body.userId);
      if (data.userId !== req.body.userId)
        throw new ServerError("Invalid user", 401);

      next();
    } catch (error) {
      console.log(error);
      if (error instanceof ServerError) {
        res.status(error.statusCode).json(packResponse(true, error.message));
      }
      res.sendStatus(401).json(packResponse(true, "Unauthorized"));
    }
  }
}
