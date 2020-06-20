import { Router, Request, Response } from "express";
import { Phases } from "../models";
import { ServerError } from "../error";
import { packResponse } from "../utils/response";
import { JWT } from "../utils/jwt";
import ObjectID from "bson-objectid";
class PhasesRouter {
  readonly router = Router();

  constructor() {
    this.router.post(
      "/update/status",
      JWT.authenticateWithBody,
      this.updateStatus
    );
    this.router.post("/new", JWT.authenticateWithBody, this.new);
    this.router.post("/delete", JWT.authenticateWithBody, this.delete);
    this.router.get("/:projectId/phases", this.getAllPhasesForProject);
  }

  private async getAllPhasesForProject(req: Request, res: Response) {
    try {
      const projectId = req.params.projectId;
      if (!ObjectID.isValid(projectId))
        throw new ServerError("Invalid Project", 400);
      const data = await Phases.getAllPhasesForProject(projectId);
      res.json(packResponse(false, data));
    } catch (error) {
      res.status(error.statusCode).json(packResponse(true, error.message));
    }
  }

  private async new(req: Request, res: Response) {
    try {
      const projectId = req.body.projectId;
      if (!ObjectID.isValid(projectId))
        throw new ServerError("Invalid Project", 400);

      const name = req.body.name?.trim();
      if (!name.length) throw new ServerError("Please provide a phase name");

      const userId = req.body.userId;

      const data = await Phases.new({ name, projectId, userId });
      res.json(packResponse(false, data));
    } catch (error) {
      res.status(error.statusCode).json(packResponse(true, error.message));
    }
  }

  private async delete(req: Request, res: Response) {
    try {
      const projectId = req.body.projectId;
      if (!ObjectID.isValid(projectId))
        throw new ServerError("Invalid Project", 400);

      const phaseId = req.body.phaseId;
      if (!ObjectID.isValid(phaseId))
        throw new ServerError("Invalid Phase", 400);

      const userId = req.body.userId?.trim();

      await Phases.delete(userId, projectId, phaseId);
      res.json(packResponse(false, "Deleted Phase successfully"));
    } catch (error) {
      res.status(error.statusCode).json(packResponse(true, error.message));
    }
  }

  private async updateStatus(req: Request, res: Response) {
    try {
      const projectId = req.body.projectId;
      if (!ObjectID.isValid(projectId))
        throw new ServerError("Invalid Project", 400);

      const phaseId = req.body.phaseId;
      if (!ObjectID.isValid(phaseId))
        throw new ServerError("Invalid Phase", 400);

      const userId = req.body.userId?.trim();
      const status = req.body.status?.trim();

      await Phases.updateStatus(userId, projectId, phaseId, status);
      res.json(packResponse(false, "Updated phase status successfully"));
    } catch (error) {
      res.status(error.statusCode).json(packResponse(true, error.message));
    }
  }
}
export const phasesRoutes = new PhasesRouter().router;
