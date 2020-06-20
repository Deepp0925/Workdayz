import React, { Component } from "react";
import "../../styles/projects.scss";
import PreviousProject from "./project";
import {
  PreviousProjectContext,
  IPreviousProjectContext,
} from "../../store/previousProjects";

class PreviousProjects extends Component {
  context!: IPreviousProjectContext;
  static contextType = PreviousProjectContext;

  private renderProjects = () => {
    if (this.context.projects.size)
      return Array.from(this.context.projects.values()).map((project) => (
        <PreviousProject {...project} key={project.projectId} />
      ));

    return (
      <span className="font-medium uppercase w-full">No Previous Projects</span>
    );
  };

  render() {
    return (
      <div className="flex flex-col pb-3 mb-10">
        <div className="flex h-10">
          <span className="flex-1 truncate font-medium text-xl self-center">
            Previous Project(s)
          </span>
        </div>
        <div className="flex-1 flex projectsGrid py-4">
          {this.renderProjects()}
        </div>
      </div>
    );
  }
}

export default PreviousProjects;
