import { Schema, SchemaTypes, model } from "mongoose";
import ObjectId from "bson-objectid";
import { handleError, ServerError } from "../error";
import * as _ from "underscore";
import { statusOpts, StatusTypes } from "./shared";
import { Projects } from "./projects";

const phasesSchema = new Schema({
  projectId: {
    type: SchemaTypes.ObjectId,
    required: true,
    trim: true,
    ref: "projects",
  },
  name: {
    type: String,
    required: true,
    trim: true,
    maxLength: 52,
    minlength: 1,
  },
  status: {
    type: String,
    required: true,
    default: "not completed",
    enum: statusOpts,
  },
});

const phases = model("phases", phasesSchema);

export interface INewPhase {
  name: string;
  userId: string;
  projectId: string;
}

export interface IPhase extends INewPhase {
  phaseId: string;
  status: StatusTypes;
}

export class Phases {
  /**
   * creates a new phase based on given info
   * limit only 20 phases per project
   * only the creator can do create
   */
  static async new(info: INewPhase) {
    try {
      const isCreator = await Projects.isUserInProject(
        info.userId,
        info.projectId,
        true
      );

      if (!isCreator)
        throw new ServerError("Only the project creator can create new phase");

      const phasesCount = await phases
        .find({ projectId: info.projectId })
        .count();

      if (phasesCount >= 20)
        throw new ServerError("A project has a limit of 20 phases", 409);

      const name = info.name.trim();
      const projectId = info.projectId.trim();
      const phaseId = ObjectId.generate();
      await new phases({ name, projectId, _id: phaseId }).save();
      return true;
    } catch (error) {
      console.log(error);
      throw handleError(error, "An error occurred while creating new phase");
    }
  }

  /**
   * updating status for given phase
   * only creator of the project can do this
   */
  static async updateStatus(
    userId: string,
    projectId: string,
    phaseId: string,
    status: StatusTypes
  ) {
    try {
      // invalid status
      if (!_.contains(statusOpts, status))
        throw new ServerError(
          "Phase can only have a status of " + statusOpts.join("/ "),
          400
        );

      // checking if the user is part of the project
      const isMember = await Projects.isUserInProject(userId, projectId, true);
      if (!isMember)
        throw new ServerError(
          "Only the creator of the project can update the status of a phase",
          401
        );

      // update the status
      await phases.findByIdAndUpdate(phaseId, { status });
      return true;
    } catch (error) {
      throw handleError(error, "An error occurred while updating phase status");
    }
  }

  /**
   * calculates a progress for a project
   * returns percentage in decimals
   */
  static async calculateProgress(projectId: string) {
    try {
      const phasesForProjects: IPhase[] = (await phases
        .find({ projectId })
        .limit(20)) as any;

      let completedPhases = 0;

      phasesForProjects.forEach((phase) => {
        if (phase.status === "completed") completedPhases++;
      });

      return completedPhases / phasesForProjects.length;
    } catch (error) {
      throw handleError(error, "Error calculating project's provided");
    }
  }

  /**
   * deleting a phase
   * can only be done by project creator
   */
  static async delete(userId: string, projectId: string, phaseId: string) {
    try {
      // verifying creator
      const isCreator = await Projects.isUserInProject(userId, projectId, true);
      if (!isCreator)
        throw new ServerError(
          "Only the creator of the project can delete a phase",
          401
        );

      // delete the phase
      await phases.findOneAndDelete({ projectId, _id: phaseId });
    } catch (error) {
      throw handleError(error, "An error occurred while deleting the phase");
    }
  }

  /**
   * get all phases for the given project
   */
  static async getAllPhasesForProject(projectId: string): Promise<IPhase[]> {
    try {
      return phases
        .find({
          projectId,
        })
        .limit(20)
        .exec() as any;
    } catch (error) {
      throw handleError(error, "An error occurred while fetching all phases.");
    }
  }
}
