import { Router, Request, Response } from "express";
import { Projects, Phases } from "../models";
import { ServerError } from "../error";
import { packResponse } from "../utils/response";
import { wordCount } from "../utils/string";
import ObjectID from "bson-objectid";
import { JWT } from "../utils/jwt";
class ProjectsRouter {
  readonly router = Router();

  constructor() {
    this.router.post("/new", JWT.authenticateWithBody, this.new);
    this.router.post("/close", JWT.authenticateWithBody, this.close);
    this.router.post("/member/add", JWT.authenticateWithBody, this.addMember);
    this.router.post(
      "/member/remove",
      JWT.authenticateWithBody,
      this.removeMember
    );
    this.router.get("/:projectId/members", this.getAllMembersForProject);
    this.router.get("/active/user/:userId", this.getMyActiveProjects);
    this.router.get("/previous/user/:userId", this.getMyPreviousProjects);
    this.router.get("/progress/:projectId", this.getProgressForProject);
    this.router.get("/details/:projectId", this.getDetailsForProject);
  }

  private async getDetailsForProject(req: Request, res: Response) {
    try {
      const projectId = req.params.projectId;
      if (!ObjectID.isValid(projectId))
        throw new ServerError("Invalid Project", 400);

      const project = await Projects.getDetailsForProject(projectId);
      res.json(packResponse(false, { project }));
    } catch (error) {
      console.log(error);
      res.status(error.statusCode).json(packResponse(true, error.message));
    }
  }

  private async getAllMembersForProject(req: Request, res: Response) {
    try {
      const projectId = req.params.projectId;
      if (!ObjectID.isValid(projectId))
        throw new ServerError("Invalid Project", 400);

      const members = await Projects.getAllMembersForProject(projectId);
      console.log(members);
      res.json(packResponse(false, { members }));
    } catch (error) {
      res.status(error.statusCode).json(packResponse(true, error.message));
    }
  }

  private async getProgressForProject(req: Request, res: Response) {
    try {
      const projectId = req.params.projectId;
      if (!ObjectID.isValid(projectId))
        throw new ServerError("Invalid Project", 400);

      const progress = await Phases.calculateProgress(projectId);
      res.json(packResponse(false, { progress }));
    } catch (error) {
      res.status(error.statusCode).json(packResponse(true, error.message));
    }
  }

  private async addMember(req: Request, res: Response) {
    try {
      const memberUserId = req.body.memberId;
      const projectId = req.body.projectId;
      const userId = req.body.userId;

      if (!ObjectID.isValid(memberUserId))
        throw new ServerError("Invalid member", 400);

      if (!ObjectID.isValid(projectId))
        throw new ServerError("Invalid Project", 400);

      await Projects.addMember(userId, memberUserId, projectId);
      res.json(packResponse(false, "Added member successfully"));
    } catch (error) {
      res.status(error.statusCode).json(packResponse(true, error.message));
    }
  }

  private async removeMember(req: Request, res: Response) {
    try {
      const memberUserId = req.body.memberId;
      const projectId = req.body.projectId;
      const userId = req.body.userId;

      if (!ObjectID.isValid(projectId))
        throw new ServerError("Invalid Project", 400);

      if (!ObjectID.isValid(memberUserId))
        throw new ServerError("Invalid member", 400);

      await Projects.removeMember(userId, memberUserId, projectId);
      res.json(packResponse(false, "Removed member successfully"));
    } catch (error) {
      res.status(error.statusCode).json(packResponse(true, error.message));
    }
  }

  private async close(req: Request, res: Response) {
    try {
      const reason = req.body.reason;
      const projectId = req.body.projectId;
      const userId = req.body.userId;

      if (ObjectID.isValid(projectId))
        throw new ServerError("Invalid Project", 400);

      await Projects.close(userId, projectId, reason);
      res.json(packResponse(false, "Project closed successfully"));
    } catch (error) {
      res.status(error.statusCode).json(packResponse(true, error.message));
    }
  }

  private async new(req: Request, res: Response) {
    try {
      const description = req.body.description?.trim();
      const name = req.body.name?.trim();
      const userId = req.body.userId;

      if (!name.length)
        throw new ServerError("Please provide a name for the project");

      if (wordCount(description) > 150)
        throw new ServerError("Description cannot have more than 150 words");

      const projectInfo = await Projects.new({ userId, description, name });
      res.json(packResponse(false, projectInfo));
    } catch (error) {
      res.status(error.statusCode).json(packResponse(true, error.message));
    }
  }

  private async getMyActiveProjects(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      if (!ObjectID.isValid(userId)) throw new ServerError("Invalid user", 400);

      const projects = await Projects.getActiveProjectsForUserId(userId);
      res.json(packResponse(false, projects));
    } catch (error) {
      res.status(error.statusCode).json(packResponse(true, error.message));
    }
  }

  private async getMyPreviousProjects(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      if (!ObjectID.isValid(userId)) throw new ServerError("Invalid user", 400);

      const skip = parseInt(String(req.query?.skip || "0"));
      const projects = await Projects.getPreviousProjectsForUserId(
        userId,
        skip
      );
      res.json(packResponse(false, projects));
    } catch (error) {
      res.status(error.statusCode).json(packResponse(true, error.message));
    }
  }
}
export const projectsRoutes = new ProjectsRouter().router;
