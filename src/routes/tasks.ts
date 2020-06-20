import { Router, Request, Response } from "express";
import { Tasks } from "../models";
import { ServerError } from "../error";
import { packResponse } from "../utils/response";
import { JWT } from "../utils/jwt";
import ObjectID from "bson-objectid";
import { wordCount } from "../utils/string";
class TasksRouter {
  readonly router = Router();

  constructor() {
    this.router.post(
      "/update/status",
      JWT.authenticateWithBody,
      this.updateStatus
    );
    this.router.post("/new", JWT.authenticateWithBody, this.new);
    this.router.post("/delete", JWT.authenticateWithBody, this.delete);
    this.router.post("/reassign", JWT.authenticateWithBody, this.reassignTask);
    this.router.get("/:phaseId/tasks", this.getAllTasksForPhase);
    this.router.get("/:phaseId/tasks/:userId", this.getAllMyTasksForPhase);
  }

  private async getAllMyTasksForPhase(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      if (!ObjectID.isValid(userId)) throw new ServerError("Invalid User", 400);

      const phaseId = req.params.phaseId;
      if (!ObjectID.isValid(phaseId))
        throw new ServerError("Invalid Phase", 400);

      const skip = parseInt(String(req.query?.skip || "0"));

      const data = await Tasks.getAllMyTasksInPhase(userId, phaseId, skip);
      res.json(packResponse(false, data));
    } catch (error) {
      res.status(error.statusCode).json(packResponse(true, error.message));
    }
  }

  private async getAllTasksForPhase(req: Request, res: Response) {
    try {
      const phaseId = req.params.phaseId;
      if (!ObjectID.isValid(phaseId))
        throw new ServerError("Invalid Phase", 400);

      const skip = parseInt(String(req.query?.skip || "0"));

      const data = await Tasks.getAllTasksInPhase(phaseId, skip);
      res.json(packResponse(false, data));
    } catch (error) {
      res.status(error.statusCode).json(packResponse(true, error.message));
    }
  }

  private async new(req: Request, res: Response) {
    try {
      const phaseId = req.body.phaseId;
      if (!ObjectID.isValid(phaseId))
        throw new ServerError("Invalid Phase", 400);

      const projectId = req.body.projectId;
      if (!ObjectID.isValid(projectId))
        throw new ServerError("Invalid Project", 400);

      // member to assigned this task
      const memberId = req.body.memberId;
      if (!ObjectID.isValid(projectId))
        throw new ServerError("Invalid Member", 400);

      const name = req.body.name?.trim();
      if (!name.length) throw new ServerError("Please provide a task name");

      const description = req.body.description?.trim();
      if (!description.length)
        throw new ServerError("Please provide task description");

      if (wordCount(description) > 150)
        throw new ServerError("Description cannot have more than 150 words");

      const userId = req.body.userId;
      const data = await Tasks.new({
        name,
        assignedTo: memberId,
        phaseId,
        projectId,
        description,
        userId,
      });
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

      const taskId = req.body.taskId;
      if (!ObjectID.isValid(taskId)) throw new ServerError("Invalid Task", 400);

      const userId = req.body.userId?.trim();

      await Tasks.delete(userId, projectId, taskId);
      res.json(packResponse(false, "Deleted task successfully"));
    } catch (error) {
      res.status(error.statusCode).json(packResponse(true, error.message));
    }
  }

  private async updateStatus(req: Request, res: Response) {
    try {
      const projectId = req.body.projectId;
      if (!ObjectID.isValid(projectId))
        throw new ServerError("Invalid Project", 400);

      const taskId = req.body.taskId;
      if (!ObjectID.isValid(taskId)) throw new ServerError("Invalid Task", 400);

      const userId = req.body.userId?.trim();
      const status = req.body.status?.trim();

      await Tasks.updateStatus(userId, projectId, taskId, status);
      res.json(packResponse(false, "Updated task status successfully"));
    } catch (error) {
      res.status(error.statusCode).json(packResponse(true, error.message));
    }
  }

  private async reassignTask(req: Request, res: Response) {
    try {
      const projectId = req.body.projectId;
      if (!ObjectID.isValid(projectId))
        throw new ServerError("Invalid Project", 400);

      const taskId = req.body.taskId;
      if (!ObjectID.isValid(taskId)) throw new ServerError("Invalid Task", 400);

      const memberId = req.body.memberId?.trim();
      if (!ObjectID.isValid(taskId))
        throw new ServerError("Invalid Member", 400);

      const userId = req.body.userId?.trim();

      await Tasks.reassignTask(userId, taskId, memberId, projectId);
      res.json(packResponse(false, "Reassigned task successfully"));
    } catch (error) {
      res.status(error.statusCode).json(packResponse(true, error.message));
    }
  }
}
export const tasksRoutes = new TasksRouter().router;
