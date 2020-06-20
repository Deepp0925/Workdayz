import React, { PureComponent } from "react";
import { IPreviousProject, Response } from "../shared";
import _ from "underscore";
import Loader from "../Loader";
import axios from "axios";
import { User } from "./user";

export interface IPreviousProjectContext {
  errorFetching: boolean;
  projects: Map<string, IPreviousProject>;
  add: (info: IPreviousProject) => void;
  getMyPreviousProject: (userId: string) => void;
  reachedEnd: boolean; // <-- no more previous projects
  fromIndex: number; // <-- this will keep track of from what number to get the projects
}
export const PreviousProjectContext = React.createContext<
  IPreviousProjectContext
>(null as any);

export class PreviousProjectsStore extends PureComponent<
  {},
  IPreviousProjectContext
> {
  constructor(props: any) {
    super(props);
    this.state = {
      errorFetching: false,
      projects: new Map(),
      fromIndex: 0,
      reachedEnd: false,
      add: this.add,
      getMyPreviousProject: this.getMyPreviousProject,
    };
  }

  /**
   * adds a project to the list
   */
  add = (info: IPreviousProject) => {
    try {
      this.state.projects.set(info.projectId, info);
    } catch (error) {
      console.log("an error occurred", error);
    }
  };

  /**
   * fetchs some of the project from the server
   * only if not reached end
   */
  getMyPreviousProject = async () => {
    try {
      if (this.state.reachedEnd) return;
      Loader.show();
      const response = await axios.get<Response<IPreviousProject[]>>(
        `/projects/previous/user/${User.info?.userId}?skip=${this.state.fromIndex}`
      );
      if (response.data.error) {
        Loader.hide();
        this.setState({
          errorFetching: true,
        });
        throw response.data.data;
      }

      _.forEach(response.data.data, (project) => this.add(project));
      const numOfProjects = response.data.data.length;
      this.setState({
        fromIndex: this.state.fromIndex + numOfProjects,
        reachedEnd: numOfProjects < 25,
      });
      Loader.hide();
    } catch (error) {
      Loader.hide();
      console.log("an error ocurred", error);
    }
  };

  render() {
    return (
      <PreviousProjectContext.Provider value={this.state}>
        {this.props.children}
      </PreviousProjectContext.Provider>
    );
  }
}
