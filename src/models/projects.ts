import { Schema, SchemaTypes, model, Document } from "mongoose";
import ObjectId from "bson-objectid";
import { handleError, ServerError } from "../error";
import * as _ from "underscore";
import { IUser } from "./users";

const reasons = ["completed", "cancelled"];
export type ReasonTypes = "completed" | "cancelled";

const projectsSchema = new Schema({
  userId: {
    type: SchemaTypes.ObjectId,
    required: true,
    trim: true,
    ref: "users",
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 52,
    minlength: 1,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  closed: {
    type: Boolean,
    required: true,
    default: false,
  },
  reason: {
    type: String,
    enum: reasons,
    required: false,
  },
  members: [
    {
      type: SchemaTypes.ObjectId,
      required: true,
      ref: "users",
      default: [],
    },
  ],
});

const projects = model("projects", projectsSchema);

export interface INewProject {
  name: string;
  userId: string;
  description: string;
}

export interface IProject<T = string> extends INewProject {
  projectId: string;
  members: Array<T>;
  closed: boolean;
  progress: number;
  reason?: string;
}

export class Projects {
  /**
   * creates a new project if the provided user
   * is not a part of 15 active projects
   */
  static async new(info: INewProject): Promise<IProject> {
    try {
      // only 15 projects allowed at a time
      // check active project count less than 15
      const activeProjects = await Projects.activeProjectsCount(info.userId);

      if (activeProjects >= 15)
        throw new ServerError("You already have 15 active projects", 409);

      const projectId = ObjectId.generate();
      const project = { ...info, _id: projectId };

      await new projects(project).save();
      return { ...project, members: [], closed: false, progress: 0, projectId };
    } catch (error) {
      console.log(error);
      throw handleError(error, "Error creating a new project");
    }
  }

  /**
   * returns number of projects of given userId
   */
  static async activeProjectsCount(userId: string): Promise<number> {
    try {
      return await projects
        .find({
          closed: false,
          $or: [{ userId }, { members: { $elemMatch: { $eq: userId } } }],
        })
        .count();
    } catch (error) {
      console.log(error);
      throw handleError(error, "Error counting number of current projects");
    }
  }

  /**
   * adds a member if he is not a part of 15 different active projects
   */
  static async addMember(
    userId: string,
    userToBeAdded: string,
    projectId: string
  ) {
    try {
      // only 15 projects allowed at a time
      // check active project count less than 15
      const activeProjects = await Projects.activeProjectsCount(userToBeAdded);

      if (activeProjects >= 15)
        throw new ServerError(
          "Provided user is already a part of 15 active projects",
          409
        );

      // checking if the adding user is a part of the project
      const project: IProject & Document = (await projects.findById(
        projectId
      )) as any;

      if (!_.contains(project.members, userId) && project.userId != userId)
        throw new ServerError("You don't have access to this project", 403);

      // only 100 members are allowed per project
      if (project.members.length >= 100)
        throw new ServerError(
          "Provided project already has 100 members, cannot add any more members.",
          409
        );

      // adding only if he is not already added
      await projects.findByIdAndUpdate(projectId, {
        $addToSet: { members: userToBeAdded },
      });
      return true;
    } catch (error) {
      console.log(error);
      throw handleError(error, "An error occurred while adding the member");
    }
  }

  /**
   * removes a member
   * can only be done by the creator
   */
  static async removeMember(
    userId: string,
    userToBeRemoved: string,
    projectId: string
  ) {
    try {
      // checking if the adding user is a part of the project
      const project: IProject & Document = (await projects.findById(
        projectId
      )) as any;

      // only project manager can remove users
      if (project.userId != userId)
        throw new ServerError(
          "Only the creator of the project can remove members",
          403
        );

      await projects
        .findByIdAndUpdate(projectId, { $pull: { members: userToBeRemoved } })
        .exec();

      return true;
    } catch (error) {
      console.log(error);
      throw handleError(error, "An error occurred while removing the member");
    }
  }

  /**
   * gets all previous projects associated to provided userId
   * would not include members
   * would return 25 each time
   */
  static async getPreviousProjectsForUserId(
    userId: string,
    skip: number = 0
  ): Promise<IProject[]> {
    try {
      return await projects.aggregate([
        {
          $match: {
            closed: true,
            $in: [userId, "$members"],
          },
        },
        {
          $sort: {
            _id: -1,
          },
        },
        {
          $skip: skip,
        },
        { $limit: 25 },
        {
          $project: {
            members: 0,
          },
        },
      ]);
    } catch (error) {
      throw handleError(
        error,
        "An error occurred while getting all your previous projects"
      );
    }
  }

  /**
   * get project details for a specific project
   */
  static async getDetailsForProject(projectId: string): Promise<IProject> {
    try {
      return (await projects
        .findOne({
          closed: false,
          _id: projectId,
        })
        .populate("userId", "fullName")
        .select("-members")) as any;
    } catch (error) {
      console.log(error);
      throw handleError(
        error,
        "An error occurred while getting all your previous projects"
      );
    }
  }

  /**
   * fetchs all the members in the project
   * only if the project is not closed
   * will only return 100
   */
  static async getAllMembersForProject(projectId: string): Promise<IUser[]> {
    try {
      const members = await projects
        .findOne({ closed: false, _id: projectId })
        .populate("userId", ["fullName", "img"])
        .select("members")
        .populate("members", ["fullName", "img"])
        .exec();

      return members?.toJSON();
    } catch (error) {
      console.log(error);
      throw handleError(error, "An error occurred while fetching members");
    }
  }
  /**
   * gets all active projects associated to provided userId
   * does not return populate members
   */
  static async getActiveProjectsForUserId(userId: string): Promise<IProject[]> {
    try {
      const myProjects: any[] = (await projects
        .find({
          closed: false,
          $or: [{ userId }, { members: { $elemMatch: { $eq: userId } } }],
        })
        .limit(15)
        .populate("userId", "fullName")
        .select("-members")
        .exec()) as any;

      console.log(myProjects);
      return myProjects;
    } catch (error) {
      console.log(error);
      throw handleError(
        error,
        "An error occurred while getting all your current projects"
      );
    }
  }

  /**
   * checks if the given userId is part of the project
   * an active project only
   * provide a third argument if you want to check for creator
   */
  static async isUserInProject(
    userId: string,
    projectId: string,
    checkIsCreator: boolean = false //
  ): Promise<boolean> {
    try {
      let project: IProject & Document = (await projects.findOne({
        _id: projectId,
        closed: false,
      })) as any;

      project = project.toJSON();

      // checking if this is the creator
      if (checkIsCreator) {
        return project.userId == userId;
      }

      // checking is member
      console.log(_.contains(project.members, userId), project.userId, userId);
      return _.contains(project.members, userId) || project.userId == userId;
    } catch (error) {
      return false;
    }
  }

  /**
   * close a project
   * can only be done by the creator
   */
  static async close(
    userId: string,
    projectId: string,
    reason: ReasonTypes = "completed"
  ) {
    try {
      // invalid reason
      // can only have completed or cancelled
      reason = reason.toLowerCase() as any;
      if (!_.contains(reasons, reason))
        throw new ServerError(
          "Closing a project can only have two reasons - completed/ cancelled",
          400
        );

      const project: Document & IProject = (await projects.findOne({
        _id: projectId,
        closed: false,
      })) as any;

      // no such project
      if (!project)
        throw new ServerError(
          "Project is either already closed or no such project exists",
          403
        );

      // not the creator
      if (userId != project.userId)
        throw new ServerError("Only the creator can close the project", 401);

      // saving the changes
      await projects.findOneAndUpdate(
        { _id: projectId },
        { closed: true, reason }
      );
      return true;
    } catch (error) {
      throw handleError(error, "An error occurred while closing the project");
    }
  }
}
