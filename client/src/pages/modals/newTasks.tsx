import React, { Component } from "react";
import Modal from "../../ui/Modal";
import { TextInput } from "../../ui/Input";
import axios from "axios";
import {
  ProjectInViewContext,
  IProjectInViewContext,
} from "../../store/projectInView";
import { Response, INewTask, ITask } from "../../shared";
import Loader from "../../Loader";
import { User } from "../../store/user";
import ManagementModals from ".";
import { wordCount } from "../../utils/string";
import ObjectId from "bson-objectid";
import Dropdown from "../../ui/Dropdown";
import MembersOptions from "../../ui/MembersOptions";
import PhasesOptions from "../../ui/PhasesOptions";
interface INewTaskState {
  isOpen: boolean;
  error?: string;
  isLoading: boolean;
}
export class NewTask extends Component<{}, INewTaskState> {
  cancelBtnRef: React.RefObject<HTMLButtonElement> = React.createRef();
  createBtnRef: React.RefObject<HTMLButtonElement> = React.createRef();
  private newTaskRef: React.RefObject<HTMLDivElement> = React.createRef();

  static contextType = ProjectInViewContext;
  context!: IProjectInViewContext;
  newTaskTried: boolean = false;
  constructor(props: any) {
    super(props);
    this.state = {
      isOpen: false,
      isLoading: false,
    };
  }

  private taskInfo: Omit<INewTask, "userId"> = {
    name: "",
    description: "",
    assignedTo: User.info!.userId,
    phaseId: "",
    projectId: "",
  };

  openModal = () => {
    this.setState({ isOpen: true });
    this.taskInfo.projectId = this.context.projectId;
  };

  closeModal = () => {
    this.setState({ isOpen: false });
  };

  private handleName = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.taskInfo.name = evt.currentTarget.value;
  };

  private handleDescription = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.taskInfo.description = evt.currentTarget.value;
  };

  private handlePhase = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    this.taskInfo.phaseId = evt.currentTarget.value;
  };

  private handleAssignedTo = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    this.taskInfo.assignedTo = evt.currentTarget.value;
  };

  private renderError = () =>
    this.state.error ? (
      <div className="bg-error text-center py-2 text-white rounded-lg">
        <h5>{this.state.error}</h5>
      </div>
    ) : null;

  private onNewTaskError = (msg: string) => {
    console.log("an error occurred while creating new task", msg);

    if (this.newTaskRef.current) {
      this.newTaskRef.current.classList.add("shake-horizontal");
      setTimeout(() => {
        this.newTaskRef.current?.classList.remove("shake-horizontal");
      }, 1000);
    }

    this.setState({
      // TODO enable following line
      error: msg,
      isLoading: false,
    });
    Loader.hide();
  };

  private onNewTask = async () => {
    try {
      Loader.show();
      this.setState({
        isLoading: true,
        error: undefined,
      });
      const name = this.taskInfo.name.trim();
      const description = this.taskInfo.description.trim();
      const assignedTo = this.taskInfo.assignedTo.trim();
      const phaseId = this.taskInfo.phaseId.trim();

      if (!name.length) return this.onNewTaskError("Please provide task name");

      if (name.length > 52)
        return this.onNewTaskError(
          "Please provide task name under 52 characters"
        );

      if (!description.length)
        return this.onNewTaskError("Please provide a task description");

      if (wordCount(description) > 150)
        return this.onNewTaskError(
          "Task description should be under 150 words"
        );

      if (!ObjectId.isValid(phaseId))
        return this.onNewTaskError("Please provide a valid phase");

      if (!ObjectId.isValid(assignedTo))
        return this.onNewTaskError("Please provide a valid member");

      const response = await axios.post<Response<ITask>>(
        "/tasks/new",
        {
          name,
          description,
          memberId: assignedTo,
          phaseId,
          projectId: this.context.projectId,
          userId: User.info!.userId,
        },
        {
          headers: {
            authorization: User.info?.token,
          },
        }
      );
      console.log(response.data);

      // if (response.data.error)
      //   return this.onNewTaskError(response.data.data as any);

      // this.context.addTask(response.data.data, phaseId);
      Loader.hide();
      ManagementModals.openManageTasks();
    } catch (error) {
      this.onNewTaskError("error occurred");
    }
  };

  private setBtnDisabled = () => {
    if (this.createBtnRef.current)
      this.createBtnRef.current.disabled = this.state.isLoading;

    if (this.cancelBtnRef.current)
      this.cancelBtnRef.current.disabled = this.state.isLoading;
  };

  render() {
    this.setBtnDisabled();
    this.taskInfo.phaseId = Array.from(
      this.context.phases.values()
    )[0]?.phaseId;
    return (
      <Modal isOpen={this.state.isOpen} onRequestClose={this.closeModal}>
        <div className="flex flex-col flex-1" ref={this.newTaskRef}>
          <div className="flex flex-col flex-1 px-5 pt-5 overflow-y-scroll pb-24 hideScrollBar">
            <span className="text-2xl font-semibold">New Task</span>
            {this.renderError()}
            <div className="mt-3 focus:outline-none">
              <TextInput
                name="Name"
                onChange={this.handleName}
                defaultValue={this.taskInfo.name}
              />
            </div>
            <div className="mt-3 focus:outline-none">
              <TextInput
                name="Description"
                isDescription
                onChange={this.handleDescription}
                defaultValue={this.taskInfo.description}
              />
            </div>
            <div className="mt-3 focus:outline-none">
              {/* TODO convert the following into select */}
              <Dropdown onChange={this.handleAssignedTo}>
                <MembersOptions userId={User.info!.userId} />
              </Dropdown>
            </div>
            <div className="mt-3 focus:outline-none">
              {/* TODO convert the following into select */}
              <Dropdown onChange={this.handlePhase}>
                <PhasesOptions
                  phase={Array.from(this.context.phases.values())[0]}
                />
              </Dropdown>
            </div>

            <div className="absolute bottom-0 left-0 right-0 bg-white h-20 flex mx-5">
              <button
                className="flex-1 text-lg font-medium text-error focus:outline-none"
                ref={this.cancelBtnRef}
                onClick={this.closeModal as any}
              >
                Cancel
              </button>
              <button
                className="flex-1 text-lg font-medium text-white bg-success rounded-full h-12 self-center focus:outline-none"
                ref={this.createBtnRef}
                onClick={this.onNewTask}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      </Modal>
    );
  }
}

export default NewTask;
