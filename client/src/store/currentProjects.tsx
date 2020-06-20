import React, { PureComponent } from "react";
import { ICurrentProject, Response } from "../shared";
import _ from "underscore";
import Loader from "../Loader";
import axios from "axios";
import { User } from "./user";

export interface ICurrentProjectContext {
  errorFetching: boolean;
  projects: Map<string, ICurrentProject>;
  add: (info: ICurrentProject) => void;
  remove: (projectId: string) => void;
  getMyProjects: () => void;
  setProgress: (projectId: string, progress: number) => void;
}
export const CurrentProjectContext = React.createContext<
  ICurrentProjectContext
>(null as any);

export class CurrentProjectsStore extends PureComponent<
  {},
  ICurrentProjectContext
> {
  constructor(props: any) {
    super(props);
    this.state = {
      errorFetching: false,
      projects: new Map(),
      add: this.add,
      remove: this.remove,
      getMyProjects: this.getMyProject,
      setProgress: this.setProgress,
    };
  }

  /**
   * adds a project to the list
   */
  add = (info: ICurrentProject) => {
    try {
      info.projectId = info._id!;
      this.state.projects.set(info.projectId, info);
      console.log(info.projectId);
    } catch (error) {
      console.log("an error occurred", error);
    }
  };

  /**
   * removes a project from the list
   */
  remove = (projectId: string) => {
    try {
      this.state.projects.delete(projectId);
    } catch (error) {
      console.log("an error occurred", error);
    }
  };

  /**
   * fetchs all you projects from server
   * only call this function when projects if empty
   */
  getMyProject = async () => {
    try {
      Loader.show();
      const response = await axios.get<Response<ICurrentProject[]>>(
        `/projects/active/user/${User.info?.userId}`
      );
      console.log(response);
      if (response.data.error) {
        Loader.hide();
        console.log(response.data.data);
        this.setState({
          errorFetching: true,
        });
        return;
      }

      _.forEach(response.data.data, (project) => this.add(project));
      Loader.hide();
    } catch (error) {
      Loader.hide();
      console.log("an error ocurred", error);
    }
  };

  /**
   * set the progress after fetching it from the server
   */
  setProgress = (projectId: string, progress: number) => {
    try {
      const project = this.state.projects.get(projectId);
      if (project) project.progress = progress;
    } catch (error) {
      console.log("an error occurred", error);
    }
  };

  render() {
    return (
      <CurrentProjectContext.Provider value={this.state}>
        {this.props.children}
      </CurrentProjectContext.Provider>
    );
  }
}
