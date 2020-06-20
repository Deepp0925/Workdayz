import React, { Component } from "react";
import "../../styles/projects.scss";
import "react-circular-progressbar/dist/styles.css";
import NewProject from "./new";
import Modal from "../../ui/Modal";
import {
  ICurrentProjectContext,
  CurrentProjectContext,
} from "../../store/currentProjects";
import CurrentProject from "./project";
import { Feather } from "react-web-vector-icons";
import { Link } from "react-router-dom";

interface ICurrentState {
  isOpen: boolean;
}

class CurrentProjects extends Component<{}, ICurrentState> {
  constructor(props: any) {
    super(props);
    this.state = {
      isOpen: false,
    };
  }

  static contextType = CurrentProjectContext;
  context!: ICurrentProjectContext;

  private showModal = () => {
    this.setState({
      isOpen: true,
    });
  };

  private closeModal = () => {
    this.setState({
      isOpen: false,
    });
  };

  private renderProjects = () => {
    if (this.context.projects.size)
      return Array.from(this.context.projects.values()).map((project) => (
        <CurrentProject {...project} key={project.projectId} />
      ));

    return (
      <span className="font-medium uppercase w-full">No Active Projects</span>
    );
  };

  private fetchedMyProjects = false;

  private fetchMyProjects = () => {
    try {
      if (this.fetchedMyProjects) return;
      this.fetchedMyProjects = true;
      console.log("fetching");
      this.context.getMyProjects();
    } catch (error) {}
  };

  render() {
    this.fetchMyProjects();
    return (
      <React.Fragment>
        <Modal
          isOpen={this.state.isOpen}
          onRequestClose={this.closeModal}
          contentLabel="New Project"
        >
          <NewProject onRequestClose={this.closeModal} />
        </Modal>
        <div className="flex flex-col pb-3 mb-10">
          <div className="flex h-10">
            <span className="flex-1 truncate font-medium text-xl self-center">
              Current Project(s)
            </span>
            <button
              onClick={this.showModal}
              className="px-5 border-themeColor font-medium focus:outline-none border-2 rounded-full text-themeColor hover:text-white hover:bg-themeColor duration-200"
            >
              New Project
            </button>
            <Link to="/home" className="px-2">
              <Feather name="refresh-cw" size={20} color="#000" />
            </Link>
          </div>
          <div className="flex-1 flex projectsGrid py-4">
            {this.renderProjects()}
          </div>
        </div>
      </React.Fragment>
    );
  }
}

export default CurrentProjects;
