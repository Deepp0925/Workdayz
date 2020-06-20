import React, { Component } from "react";
import Modal from "../../ui/Modal";
import ManagementModals from ".";
import {
  ProjectInViewContext,
  IProjectInViewContext,
} from "../../store/projectInView";
import { ITask } from "../../shared";
import { statusColor } from "../../utils/color";
import { Feather } from "react-web-vector-icons";
import { Task } from "../../store/task";
import Dropdown from "../../ui/Dropdown";
import { User } from "../../store/user";
import PhasesOptions from "../../ui/PhasesOptions";
interface IManageTasksState {
  isOpen: boolean;
  phaseInView: string;
}
export class ManageTasks extends Component<{}, IManageTasksState> {
  constructor(props: any) {
    super(props);
    this.state = {
      isOpen: false,
      phaseInView: "",
    };
  }

  static contextType = ProjectInViewContext;
  context!: IProjectInViewContext;

  openModal = () => {
    const phaseInView = Array.from(this.context.phases.values())?.find(
      (phase) => phase.status === "in progress"
    )?.phaseId;
    this.setState({ isOpen: true, phaseInView: phaseInView || "" });
  };

  closeModal = () => {
    this.setState({ isOpen: false });
  };

  deleteTask = async (task: Task) => {
    try {
      await task.delete();
      this.context.removeTask(task.taskId, task.phaseId);
    } catch (error) {
      console.log("error deleting task");
    }
  };

  private renderTasks = () => {
    console.log(this.context.phases.get(this.state.phaseInView)?.tasks());
    if (this.state.phaseInView)
      return Array.from<Task>(
        this.context.phases.get(this.state.phaseInView)?.tasks() || ([] as any)
      ).map((task: Task) => {
        const status = task.status;
        return (
          <div
            key={task.taskId}
            className={`h-auto mt-2 rounded-lg flex p-2 items-center ${statusColor(
              status
            )}`}
          >
            <div className="flex flex-col">
              <div className="flex h-16">
                <span className="truncate text-white flex-1">{task.name}</span>

                {
                  /**
                   * only the creator of the project can create delete and update the status of the task
                   */
                  this.context.isCreator ? (
                    <button
                      className="ml-2 w-12 h-12 bg-white text-error rounded-lg focus:outline-none"
                      onClick={this.deleteTask.bind(task) as any}
                    >
                      <Feather name="trash-2" size={20} color="#e74c3c" />
                    </button>
                  ) : null
                }
              </div>
              <div className="flex h-20">
                <span className="text-white text-sm truncate">
                  {task.description}
                </span>
              </div>
            </div>
          </div>
        );
      });
    // don;t return any thing if no phase in view
    else return null;
  };

  private changePhase = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    const goToPhaseId = evt.currentTarget.value;

    if (this.state.phaseInView !== goToPhaseId) {
      this.setState({ phaseInView: goToPhaseId });
    }
  };

  private isPhaseSelected = false;
  private setPhaseInView = async () => {
    try {
      if (this.isPhaseSelected) return;

      const phases = Array.from(this.context.phases.values());

      //there are no phases
      if (!phases.length) return;

      let phaseInView = phases.find((phase) => phase.status === "in progress")
        ?.phaseId;

      // no active phase found
      // so select the first phase
      if (!phaseInView) {
        phaseInView = phases[0].phaseId;
      }

      this.isPhaseSelected = true;
      this.setState({
        phaseInView,
      });
    } catch (error) {
      console.log("an error occurred while selecting phase");
    }
  };

  render() {
    this.setPhaseInView();

    return (
      <Modal isOpen={this.state.isOpen} onRequestClose={this.closeModal}>
        <div className="flex flex-col flex-1">
          <div className="flex flex-col flex-1 px-5 pt-5 overflow-y-scroll pb-24 hideScrollBar">
            <span className="text-2xl font-semibold">Manage Tasks</span>
            <button
              className="focus:outline-none bg-gray-200 h-12 mt-2 rounded-md"
              onClick={ManagementModals.openNewTask}
            >
              Add Task
            </button>
            {this.state.phaseInView ? (
              <Dropdown onChange={this.changePhase}>
                <PhasesOptions
                  phase={this.context.phases.get(this.state.phaseInView)!}
                />
              </Dropdown>
            ) : null}

            {/*
            TODO add dropdown to select phase
             */}

            {this.renderTasks()}
          </div>
        </div>
      </Modal>
    );
  }
}

export default ManageTasks;
