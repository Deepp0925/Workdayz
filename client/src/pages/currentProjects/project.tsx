import React, { Component } from "react";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import { Link } from "react-router-dom";
import { ICurrentProject, Response } from "../../shared";
import axios from "axios";
import {
  CurrentProjectContext,
  ICurrentProjectContext,
} from "../../store/currentProjects";

const progStyle = buildStyles({
  // Colors
  pathColor: `#1abc9c`,
  textColor: "#1abc9c",
  trailColor: "#d6d6d6",
});
class CurrentProject extends Component<ICurrentProject> {
  constructor(props: ICurrentProject) {
    super(props);
    // project does not return progress byt default so go and fetch that
    axios
      .get<Response<{ progress: number }>>(
        "projects/progress/" + props.projectId
      )
      .then((data) => {})
      .catch((e) => console.log("an error while fetching progress", e));
  }

  static contextType = CurrentProjectContext;
  context!: ICurrentProjectContext;

  private fetchedProgress = false;
  private fetchProgress = async () => {
    try {
      // already fetched
      if (this.fetchedProgress) return;
      const response = await axios.get<Response<{ progress: number }>>(
        "projects/progress/" + this.props.projectId
      );

      if (response.data.error)
        return console.log("an error while fetching progress");

      this.fetchedProgress = true;
      this.context.setProgress(
        this.props.projectId,
        response.data.data.progress * 100
      );
    } catch (error) {
      console.log("an error while fetching progress", error);
    }
  };

  render() {
    this.fetchProgress();
    return (
      <Link
        to={`/project/${this.props.projectId}`}
        className="project hover:shadow-2xl duration-200 cursor-pointer"
      >
        <div className="projectInfo flex-1 flex flex-col">
          <span className="projectName mb-2 text-lg font-semibold">
            {this.props.name}
          </span>
          <span className="projectDescription flex h-32 mb-2 overflow-y-scroll hideScrollBar">
            {this.props.description}
          </span>
          <span className="projectManager text-lg font-medium">
            {(this.props.userId as any).fullName}
          </span>
        </div>
        <div className="projectStatus ml-2 w-20 self-center">
          <CircularProgressbar
            value={this.props.progress || 0}
            text={`${Math.round(this.props.progress || 0)}%`}
            styles={progStyle}
          />
        </div>
      </Link>
    );
  }
}

export default CurrentProject;
