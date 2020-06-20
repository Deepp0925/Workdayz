import React, { PureComponent } from "react";
import {
  ICurrentProject,
  Response,
  IOtherUsers,
  IPhase,
  ITask,
  INewTask,
} from "../shared";
import _ from "underscore";
import Loader from "../Loader";
import axios from "axios";
import { Phase } from "./phase";
import { Member } from "./member";
import { User } from "./user";

export interface IProjectInViewProps extends Partial<ICurrentProject> {
  projectId: string;
}

export interface IProjectInViewContext extends ICurrentProject {
  members: Map<string, Member>;
  addMember: (info: IOtherUsers) => void;
  removeMember: (memberId: string) => void;
  addPhase: (info: IPhase) => void;
  removePhase: (phaseId: string) => void;
  addTask: (info: ITask, phaseId: string) => void;
  removeTask: (taskId: string, phaseId: string) => void;
  phases: Map<string, Phase>;
  close: () => void;
  isCreator: boolean;
  getMembers: () => void;
  getPhases: () => void;
}
export const ProjectInViewContext = React.createContext<IProjectInViewContext>(
  null as any
);

/**
 * should have projectId passed as prop not matter what
 */
export class ProjectInViewStore extends PureComponent<
  IProjectInViewProps,
  IProjectInViewContext
> {
  private isLoading = true;
  constructor(props: ICurrentProject) {
    super(props);
    // if project hasn't been fetched from the server
    // usuaully when user directly enters the user
    // handle this case
    this.handleProject()
      .then(() => this.getProgress())
      .catch(() =>
        console.log("an error occurred in project in view store constructor")
      );
  }

  private handleProject = async () => {
    try {
      let projectDetails: ICurrentProject;

      if (this.props.name === undefined || this.props.name === null) {
        const details = await this.fetchInfoForProject(this.props.projectId);
        if (details) projectDetails = details;
        // error fetching
        else console.log("error fetching ");
      } else {
        projectDetails = this.props as any;
      }

      console.log(projectDetails!);
      this.isLoading = false;
      this.state = {
        ...projectDetails!,
        projectId: this.props.projectId,
        phases: new Map(),
        members: new Map(),
        addMember: this.addMember,
        removeMember: this.removeMember,
        addPhase: this.addPhase,
        removePhase: this.removePhase,
        addTask: this.addTask,
        removeTask: this.removeTask,
        getMembers: this.getMembers,
        getPhases: this.getPhases,
        close: this.close,
        isCreator: projectDetails!.userId._id === User.info?.userId,
      };
    } catch (error) {
      console.log("an error occurred while handling project ", error);
    }
  };

  private fetchedPhases = false;
  getPhases = async () => {
    try {
      if (this.fetchedPhases) return;
      Loader.show();
      const response = await axios.get<Response<IPhase[]>>(
        `/phases/${this.props.projectId}/phases`
      );
      if (response.data.error) {
        Loader.hide();
        console.log("error fetching phases", response.data.data);
        throw response.data.data;
      }

      Loader.hide();
      this.fetchedPhases = true;
      response.data.data.forEach((phase) => this.addPhase(phase));
    } catch (error) {
      Loader.hide();
      console.log("an error occurred while fetching phases ", error);
      return undefined;
    }
  };

  private fetchInfoForProject = async (
    projectId: string
  ): Promise<ICurrentProject | undefined> => {
    try {
      Loader.show();
      const response = await axios.get<Response<{ project: ICurrentProject }>>(
        `/projects/details/${projectId}`
      );
      if (response.data.error) {
        Loader.hide();
        console.log("error fetching project details", response.data.data);
        throw response.data.data;
      }

      Loader.hide();
      // calculate the progress
      return response.data.data.project;
    } catch (error) {
      Loader.hide();
      console.log("an error occurred while fetching project info ", error);
      return undefined;
    }
  };

  private getProgress = async () => {
    try {
      if (this.props.name !== undefined || this.props.name !== null) return;
      // only get progress if not passed down from the
      const response = await axios.get<Response<{ progress: number }>>(
        `/project/progress/${this.state.projectId}`
      );
      if (response.data.error) {
        console.log("error deleting phase", response.data.data);
        throw response.data.data;
      }

      // calculate the progress
      this.setState({
        progress: response.data.data.progress,
      });
    } catch (error) {
      Loader.hide();
      console.log("an error occurred while fetching project info ", error);
    }
  };

  /**
   * closing a project
   */
  close = async () => {
    try {
      Loader.show();
      const response = await axios.get<Response<ICurrentProject>>(
        `/projects/close/${this.props.projectId}`
      );
      if (response.data.error) {
        Loader.hide();
        console.log("error fetching project details", response.data.data);
        throw response.data.data;
      }

      Loader.hide();
      // calculate the progress
      return response.data.data;
    } catch (error) {
      console.log("an error occurred while closing the project");
    }
  };

  addMember = (info: IOtherUsers) => {
    try {
      info.userId = info._id!;
      this.state.members.set(
        info.userId,
        new Member(info, this.state.projectId)
      );
    } catch (error) {
      console.log("error adding member", error);
    }
  };

  removeMember = (userId: string) => {
    try {
      this.state.members.delete(userId);
    } catch (error) {
      console.log("error removing member", error);
    }
  };

  addPhase = (info: IPhase) => {
    try {
      info.phaseId = info._id!;
      this.state.phases.set(info.phaseId, new Phase(info));
    } catch (error) {
      console.log("an error occurred while adding phase");
    }
  };

  removePhase = (phaseId: string) => {
    try {
      this.state.phases.delete(phaseId);
    } catch (error) {
      console.log("an error occurred while removing phase");
    }
  };

  addTask = (info: ITask, phaseId: string) => {
    try {
      this.state.phases.get(phaseId)?.addTask(info);
    } catch (error) {
      console.log("an error occurred while adding task");
    }
  };

  removeTask = (taskId: string, phaseId: string) => {
    try {
      this.state.phases.get(phaseId)?.removeTask(taskId);
    } catch (error) {
      console.log("an error occurred while removing task");
    }
  };

  private fetchedMembers: boolean = false;
  /**
   * fetchs member from the server
   * if not already done
   */
  getMembers = async () => {
    try {
      // already the member
      if (this.fetchedMembers) return;
      Loader.show();
      const response = await axios.get<
        Response<{ members: { userId: IOtherUsers; members: IOtherUsers[] } }>
      >(`/projects/${this.state.projectId}/members`);
      if (response.data.error) {
        Loader.hide();
        console.log("error fetching members", response.data.data);
        return;
      }

      this.fetchedMembers = true;
      console.log(response.data.data.members);
      this.addMember(response.data.data.members.userId);
      _.forEach(response.data.data.members.members, (member) =>
        this.addMember(member)
      );
      Loader.hide();
    } catch (error) {
      Loader.hide();
      console.log("error occurred while fetching members", error);
    }
  };

  render() {
    return (
      <ProjectInViewContext.Provider value={this.state}>
        {this.isLoading ? null : this.props.children}
      </ProjectInViewContext.Provider>
    );
  }
}
