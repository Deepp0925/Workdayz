import React, { Component } from "react";
import { TextInput } from "../../ui/Input";
import { withRouter, RouteComponentProps } from "react-router-dom";
import {
  ICurrentProjectContext,
  CurrentProjectContext,
} from "../../store/currentProjects";
import { INewProject, ICurrentProject, Response } from "../../shared";
import Loader from "../../Loader";
import { wordCount } from "../../utils/string";
import { User } from "../../store/user";
import axios from "axios";

interface INewProjectProps extends Readonly<RouteComponentProps<any, any, {}>> {
  onRequestClose: Function;
}

interface INewProjectState {
  isLoading: boolean;
  error?: string;
}

class NewProject extends Component<INewProjectProps, INewProjectState> {
  private newProjectRef: React.RefObject<HTMLDivElement> = React.createRef();
  private cancelBtnRef: React.RefObject<HTMLButtonElement> = React.createRef();
  private createBtnRef: React.RefObject<HTMLButtonElement> = React.createRef();

  constructor(props: INewProjectProps) {
    super(props);
    this.state = {
      isLoading: false,
    };
  }

  static contextType = CurrentProjectContext;
  context!: ICurrentProjectContext;
  private newProjectTried: boolean = false;
  private projectInfo: Omit<INewProject, "userId"> = {
    name: "Your Project Name",
    description:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum quis fermentum risus. Nullam non magna velit. Donec eget dolor accumsan tortor gravida ullamcorper. Vivamus non ultricies sem, in vestibulum turpis. Duis nec blandit lectus. Pellentesque pulvinar odio leo, ut ultrices neque blandit ut. Aenean hendrerit quis libero a placerat. Sed vitae arcu non mauris hendrerit porta. Etiam sit amet nulla nunc. Proin aliquet libero arcu, ut tincidunt sem molestie quis. Aenean condimentum nulla tortor, id tristique elit lacinia sed. Suspendisse a massa in metus posuere auctor eget in ipsum.",
  };

  private handleName = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.projectInfo.name = evt.currentTarget.value;
  };

  private handleDescription = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.projectInfo.description = evt.currentTarget.value;
  };

  private renderError = () =>
    this.state.error ? (
      <div className="bg-error text-center py-2 text-white rounded-lg">
        <h5>{this.state.error}</h5>
      </div>
    ) : null;

  private onNewProject = async () => {
    try {
      this.setState({ isLoading: true, error: undefined });
      Loader.show();

      // can only have 15 active projects
      if (this.context.projects.size >= 15) {
        return this.onNewProjectError("You already have 10 active projects");
      }

      // validate fields
      // project name length check
      const name = this.projectInfo.name.trim();
      const description = this.projectInfo.description.trim();

      if (name.length <= 0) {
        return this.onNewProjectError("Please provide a project name");
      }

      if (name.length > 36) {
        return this.onNewProjectError("Project name longer 36 characters");
      }

      // word count for description 150 limit

      if (description.length <= 0) {
        return this.onNewProjectError("Please provide a decription");
      }

      if (wordCount(description) > 150) {
        return this.onNewProjectError("Description longer than 150 words");
      }

      const newProject: INewProject = {
        name,
        description,
        userId: User.info!.userId,
      };

      const response = await axios.post<Response<ICurrentProject>>(
        "/projects/new",
        newProject,
        {
          headers: {
            authorization: User.info?.token,
          },
        }
      );

      if (response.data.error) {
        console.log(response.data.data);
        throw response.data.data as any;
      }

      this.context.add(response.data.data);
      Loader.hide();
      this.props.onRequestClose();
      // and route to project/:id
      this.props.history.push("/project/" + response.data?.data?.projectId);
    } catch (error) {
      console.log("An error occurred while creating new project, ", error);
      this.onNewProjectError("An error occurred while creating new project, ");
    }
  };

  private setBtnDisabled = () => {
    if (this.createBtnRef.current)
      this.createBtnRef.current.disabled = this.state.isLoading;

    if (this.cancelBtnRef.current)
      this.cancelBtnRef.current.disabled = this.state.isLoading;
  };

  private onNewProjectError = (msg: string) => {
    Loader.hide();
    this.setState({ isLoading: false, error: msg });
    if (this.newProjectRef.current) {
      this.newProjectRef.current.classList.add("shake-horizontal");
      setTimeout(() => {
        this.newProjectRef.current?.classList.remove("shake-horizontal");
      }, 1000);
    }
  };

  render() {
    this.setBtnDisabled();
    return (
      <div className="flex flex-col flex-1" ref={this.newProjectRef}>
        <div className="flex flex-col flex-1 px-5 pt-5 overflow-y-scroll pb-24 hideScrollBar">
          <span className="text-2xl font-semibold">New Project</span>
          {this.renderError()}
          <div className="mt-3 focus:outline-none">
            <TextInput
              name="Project Name"
              onChange={this.handleName}
              defaultValue={this.projectInfo.name}
            />
          </div>
          <div className="mt-3 focus:outline-none">
            <TextInput
              isDescription
              name="Description (<150 words)"
              onChange={this.handleDescription}
              defaultValue={this.projectInfo.description}
            />
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-white h-20 flex mx-5">
          <button
            className="flex-1 text-lg font-medium text-error focus:outline-none"
            ref={this.cancelBtnRef}
            onClick={this.props.onRequestClose as any}
          >
            Cancel
          </button>
          <button
            className="flex-1 text-lg font-medium text-white bg-success rounded-full h-12 self-center focus:outline-none"
            ref={this.createBtnRef}
            onClick={this.onNewProject}
          >
            Create
          </button>
        </div>
      </div>
    );
  }
}

export default withRouter(NewProject);
