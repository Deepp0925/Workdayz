import { Schema, SchemaTypes, model, Document } from "mongoose";
import ObjectId from "bson-objectid";
import { handleError, ServerError } from "../error";
import * as _ from "underscore";
import { statusOpts, StatusTypes } from "./shared";
import { Projects } from "./projects";

const tasksSchema = new Schema({
  phaseId: {
    type: SchemaTypes.ObjectId,
    required: true,
    trim: true,
    ref: "phases",
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
  // this the id of the person task is assigned to
  assignedTo: {
    type: SchemaTypes.ObjectId,
    required: true,
    trim: true,
    ref: "users",
  },
  status: {
    type: String,
    required: true,
    default: "not completed",
    enum: statusOpts,
  },
});

const tasks = model("tasks", tasksSchema);

interface INewTask {
  name: string;
  phaseId: string;
  description: string;
  // assigned to
  assignedTo: string;
  // id of the person adding it
  userId: string;
  projectId: string;
}

interface ITask extends Omit<INewTask, "userId" | "projectId"> {
  taskId: string;
  status: StatusTypes;
}

export class Tasks {
  /**
   * creates a new task based on given info
   */
  static async new(info: INewTask) {
    try {
      // checking if the adding user is a member of the project
      const isAddingUserMember = await Projects.isUserInProject(
        info.userId,
        info.projectId
      );
      if (!isAddingUserMember)
        throw new ServerError("You are not a member of this project", 401);

      // checking if the user assigned to task is member of the project
      // only if they are not the same people
      if (info.assignedTo !== info.userId) {
        const isUserAMember = await Projects.isUserInProject(
          info.assignedTo,
          info.projectId
        );

        if (!isUserAMember)
          throw new ServerError(
            "Provided user is not a member of this project",
            403
          );
      }

      // no longer needed
      delete info.userId;
      delete info.projectId;

      // create a new task
      const taskId = ObjectId.generate();
      const infoToBeInserted = { ...info, _id: taskId };

      await new tasks(infoToBeInserted).save();
      return true;
    } catch (error) {
      console.log(error);
      throw handleError(error, "An error occurred while creating a new task");
    }
  }

  /**
   * delete a task
   * can only be done by the creator of the project
   */
  static async delete(userId: string, projectId: string, taskId: string) {
    try {
      // checking if the userId is the creator of the project
      const isCreator = await Projects.isUserInProject(userId, projectId, true);

      if (!isCreator)
        throw new ServerError(
          "Only the creator of the project can delete a task",
          401
        );

      // delete the task
      await tasks.findByIdAndDelete(taskId);
      return true;
    } catch (error) {
      throw handleError(error, "An error occurred while deleting the task");
    }
  }

  /**
   * reassigning a task
   * can only be done by the creator of the project
   */
  static async reassignTask(
    userId: string,
    taskId: string,
    assignedTo: string,
    projectId: string
  ) {
    try {
      // checking if userId is the creator
      const isCreator = await Projects.isUserInProject(userId, projectId, true);
      if (!isCreator)
        throw new ServerError(
          "Only the creator of the project can reassign tasks",
          401
        );
      // checking if the assigned to is a member
      // if they are not the same people
      if (userId !== assignedTo) {
        const isMember = await Projects.isUserInProject(userId, projectId);
        if (!isMember)
          throw new ServerError(
            "Provided user is not a member of this project",
            403
          );
      }

      // reassign the task
      await tasks.findByIdAndUpdate(taskId, { assignedTo });
      return true;
    } catch (error) {
      throw handleError(error, "An error occurred while reassigning the task");
    }
  }

  /**
   * updating the status of task
   * can only be done by the person assigned or the creator of the project
   */
  static async updateStatus(
    userId: string,
    projectId: string,
    taskId: string,
    status: StatusTypes
  ) {
    try {
      if (!_.contains(statusOpts, status))
        throw new ServerError(
          "Status can only have a status of " + statusOpts.join("/ "),
          400
        );

      // checking for creator or person assigned
      const task: ITask & Document = (await tasks.findById(taskId)) as any;

      // not the person assigned to the task
      if (task.assignedTo !== userId) {
        // is it the creator of the project
        const isCreator = await Projects.isUserInProject(
          userId,
          projectId,
          true
        );
        // not the creator of the project either
        if (!isCreator)
          throw new ServerError(
            "Only the creator and the member assigned to the task can update the status",
            401
          );
      }

      // update the status
      task.status = status;

      await task.save();
      return true;
    } catch (error) {
      throw handleError(error, "An error occurred while updating task status");
    }
  }

  /**
   * get all my tasks in a phase
   * will only return 25 at a time
   */
  static async getAllMyTasksInPhase(
    userId: string,
    phaseId: string,
    skip: number = 0
  ) {
    try {
      return await tasks
        .find({
          assignedTo: userId,
          phaseId,
        })
        .skip(skip)
        .limit(25)
        .exec();
    } catch (error) {
      throw handleError(
        error,
        "An error occurred while fetching all your tasks"
      );
    }
  }

  /**
   * get all tasks in a phase
   * will only return 50 at a time
   */
  static async getAllTasksInPhase(
    phaseId: string,
    skip: number = 0
  ): Promise<ITask[]> {
    try {
      return (await tasks
        .find({
          phaseId,
        })
        .populate("assignedTo", "fullName")
        .skip(skip)
        .limit(50)
        .exec()) as any;
    } catch (error) {
      throw handleError(
        error,
        "An error occurred while fetching all your tasks"
      );
    }
  }
}
