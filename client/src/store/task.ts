import { StatusTypes, ITask, Response, IOtherUsers } from "../shared";
import Loader from "../Loader";
import { User } from "./user";
import axios from "axios";

export class Task {
  private _status: StatusTypes;
  private _assignedTo: string;
  readonly taskId: string;
  readonly phaseId: string;
  readonly name: string;
  readonly description: string;
  constructor(info: ITask, public readonly projectId: string) {
    this._status = info.status;
    this.taskId = info.taskId;
    this.phaseId = info.phaseId;
    this.name = info.name;
    this._assignedTo = info.assignedTo;
    this.description = info.description;
  }

  get status() {
    return this._status;
  }

  get assignedTo() {
    return this._assignedTo;
  }

  updateStatus = async (status: StatusTypes) => {
    try {
      Loader.show();
      const response = await axios.post<Response<string>>(
        "/tasks/update/status",
        {
          userId: User.info?.userId,
          taskId: this.taskId,
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
        throw response.data.data;
      }

      this._status = status;
      Loader.hide();
    } catch (error) {
      Loader.hide();
      console.log("an error occurred while udpating task status");
      throw error;
    }
  };

  reassignTask = async (otherMemberInfo: IOtherUsers) => {
    try {
      Loader.show();
      const response = await axios.post<Response<string>>(
        "/tasks/reassign",
        {
          userId: User.info?.userId,
          taskId: this.taskId,
          memberId: otherMemberInfo.userId,
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
        throw response.data.data;
      }

      this._assignedTo = otherMemberInfo.fullName;
      Loader.hide();
    } catch (error) {
      Loader.hide();
      console.log("an error occurred while reassigning the task");
      throw error;
    }
  };

  delete = async () => {
    try {
      Loader.show();
      const response = await axios.post<Response<string>>(`/tasks/delete`, {
        userId: User.info?.userId,
        projectId: this.projectId,
        taskId: this.taskId,
      });
      if (response.data.error) {
        Loader.hide();
        console.log("error deleting task", response.data.data);
        throw response.data.data;
      }

      Loader.hide();
      return true;
    } catch (error) {
      Loader.hide();
      console.log("an error occurred while deleting task", error);
      throw error;
    }
  };
}
