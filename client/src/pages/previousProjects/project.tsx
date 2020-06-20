import React, { Component } from "react";
import { IPreviousProject } from "../../shared";

class PreviousProject extends Component<IPreviousProject> {
  private color = () => {
    return this.props.reason === "completed" ? "text-success" : "text-error";
  };
  render() {
    return (
      <div className="project">
        <div className="projectInfo flex-1 flex flex-col">
          <span className="projectName mb-2 text-lg font-semibold">
            {this.props.name}
          </span>
          <span className="projectDescription flex h-32 mb-2 overflow-y-scroll hideScrollBar">
            {this.props.description}
          </span>
          <span
            className={`projectStatus text-lg font-medium uppercase ${this.color()}`}
          >
            {this.props.reason}
          </span>
        </div>
      </div>
    );
  }
}

export default PreviousProject;
