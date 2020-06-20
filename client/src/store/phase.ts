import { IPhase, StatusTypes, ITask, Response, statusOpts } from "../shared";
import axios from "axios";
import Loader from "../Loader";
import _ from "underscore";
import { User } from "./user";
import { Task } from "./task";

export class Phase {
  readonly name: string;
  readonly projectId: string;
  readonly phaseId: string;
  private _status: StatusTypes;
  constructor(info: IPhase) {
    this.name = info.name;
    this.projectId = info.projectId;
    this.phaseId = info.phaseId;
    this._status = info.status;
    this.getMyTasks().catch(() => console.log("error getting my tasks"));
  }

  get status() {
    return this._status;
  }

  /**
   * updates the status of the phase
   * will send post request
   */
  updateStatus = async (status: StatusTypes) => {
    try {
      Loader.show();
      const response = await axios.post<Response<string>>(
        "/phases/update/status",
        {
          userId: User.info?.userId,
          phaseId: this.phaseId,
          status,
          projectId: this.projectId,
        },
        {
          headers: {
            authorization: User.info?.token,
          },
        }
      );

      if (response.data.error) {
        console.log(response.data.data);
        Loader.hide();
        return;
      }

      this._status = status;
      Loader.hide();
    } catch (error) {
      console.log("an error occurred while updating phase status", error);
    }
  };

  // would return 50 or less each time
  private allTaskFromIndex = 0;
  private allTasksReachedEnd = false;
  // would return 25 or less each time
  private allMyTaskFromIndex = 0;
  private allMyTasksReachedEnd = false;
  private tasksInPhase: Map<string, Task> = new Map();

  addTask = (info: ITask) => {
    try {
      info.taskId = info._id!;
      this.tasksInPhase.set(info.taskId, new Task(info, this.projectId));
    } catch (error) {
      console.log("error occurred while adding task");
    }
  };

  removeTask = (taskId: string) => {
    try {
      this.tasksInPhase.delete(taskId);
    } catch (error) {
      console.log("error occurred while adding task");
    }
  };

  tasks = () => {
    try {
      return Array.from(this.tasksInPhase.values());
    } catch (error) {
      console.log("an error occurred fetching phase tasks");
    }
  };

  delete = async () => {
    try {
      Loader.show();
      const response = await axios.post<Response<string>>(`/phases/delete`, {
        userId: User.info?.userId,
        projectId: this.projectId,
        phaseId: this.phaseId,
      });
      if (response.data.error) {
        Loader.hide();
        console.log("error deleting phase", response.data.data);
        return;
      }

      Loader.hide();
      return true;
    } catch (error) {
      Loader.hide();
      console.log("an error occurred while deleting phase", error);
    }
  };

  // fetchs your tasks
  getMyTasks = async () => {
    try {
      if (this.allMyTasksReachedEnd || this.allTasksReachedEnd) return;
      Loader.show();
      const response = await axios.get<Response<ITask[]>>(
        `/tasks/${this.phaseId}/tasks/${User.info?.userId}?skip=${this.allMyTaskFromIndex}`
      );
      if (response.data.error) {
        Loader.hide();
        console.log("error fetching my tasks in this phase");
        throw response.data.data;
      }

      _.forEach(response.data.data, (task) => this.addTask(task));
      const numOfTasks = response.data.data.length;
      this.allMyTaskFromIndex += numOfTasks;
      this.allMyTasksReachedEnd = numOfTasks < 25;
      Loader.hide();
    } catch (error) {
      Loader.hide();
      console.log(
        "an error occurred while fetching my tasks in this phase",
        error
      );
      throw error;
    }
  };

  // fetchs your tasks
  getTasks = async () => {
    try {
      if (this.allTasksReachedEnd) return;
      Loader.show();
      const response = await axios.get<Response<ITask[]>>(
        `/tasks/${this.phaseId}/tasks?skip=${this.allTaskFromIndex}`
      );
      if (response.data.error) {
        Loader.hide();
        console.log("error fetching tasks in this phase");
        throw response.data.data;
      }

      _.forEach(response.data.data, (task) => this.addTask(task));
      const numOfTasks = response.data.data.length;
      this.allTaskFromIndex += numOfTasks;
      this.allTasksReachedEnd = numOfTasks < 50;
      Loader.hide();
    } catch (error) {
      console.log(
        "an error occurred while fetching tasks in this phase",
        error
      );
      throw error;
    }
  };
}
