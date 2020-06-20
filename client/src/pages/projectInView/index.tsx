import React, { PureComponent } from "react";
import { RouteComponentProps, withRouter, Link } from "react-router-dom";
import ObjectID from "bson-objectid";
import Dropdown from "../../ui/Dropdown";
import {
  ProjectInViewContext,
  IProjectInViewContext,
} from "../../store/projectInView";
import { Ionicons, Feather, MaterialIcons } from "react-web-vector-icons";
import ManagementModals from "../modals";
import { statusColor } from "../../utils/color";
import StatusOptions from "../../ui/StatusOptions";
import { Phase } from "../../store/phase";
import PhasesOptions from "../../ui/PhasesOptions";
import Tasks from "./tasks";

interface IProjectInViewState {
  phaseInView?: string;
}

interface IProjectInViewProps
  extends Readonly<RouteComponentProps<any, any, {}>> {}

class projectInView extends PureComponent<
  IProjectInViewProps,
  IProjectInViewState
> {
  static contextType = ProjectInViewContext;
  context!: IProjectInViewContext;

  state = {
    phaseInView: undefined,
  };

  private changePhase = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    const goToPhaseId = evt.currentTarget.value;

    if (this.state.phaseInView !== goToPhaseId) {
      this.setState({ phaseInView: goToPhaseId });
    }
  };

  componentDidUpdate() {
    this.setState({});
    console.log("updating state");
  }

  private changePhaseStatus = (evt: React.ChangeEvent<HTMLSelectElement>) => {
    const status = evt.currentTarget.value;
    this.context.phases
      .get(this.state.phaseInView!)
      ?.updateStatus(status.toLowerCase() as any);
  };

  private renderTasks = () => {
    if (this.state.phaseInView)
      return (
        <div className="tasksGrid">
          <Tasks phase={this.context.phases.get(this.state.phaseInView!)!} />
        </div>
      );

    return null;
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
    this.context.getPhases();
    this.context.getMembers();
    const phase = this.context.phases.get(this.state.phaseInView!);

    return ObjectID.isValid(this.context.projectId) ? (
      <div className="flex flex-col">
        <ManagementModals />
        <div className="flex h-56 flex-col overflow-visible">
          <div className="progress bg-gray-300 h-1 rounded-full w-full flex">
            <div
              className="h-full rounded-md duration-200 bg-themeColor"
              style={{ width: `${this.context.progress || 0}%` }}
            />
          </div>

          <div className="flex">
            <div className="flex flex-col flex-1">
              <span className="font-semibold text-2xl truncate mt-2">
                {this.context.name} - {Math.round(this.context.progress || 0)}%{" "}
                <Link
                  to={"/project/" + this.context.projectId}
                  className="px-2"
                >
                  <Feather name="refresh-cw" size={20} color="#000" />
                </Link>
              </span>

              <span className="font-medium text-xl truncate mt-1 text-gray-600">
                {(this.context?.userId as any).fullName}
              </span>
              <Dropdown onChange={this.changePhase}>
                {this.context.phases.size && phase ? (
                  <PhasesOptions phase={phase!} />
                ) : (
                  <option>No Phase</option>
                )}
              </Dropdown>
              {this.state.phaseInView && this.context.isCreator ? (
                <Dropdown onChange={this.changePhaseStatus}>
                  <StatusOptions status={phase?.status || "not completed"} />
                </Dropdown>
              ) : null}

              {this.state.phaseInView && !this.context.isCreator ? (
                <span
                  className={`text-lg uppercase ${statusColor(
                    phase?.status
                  )} py-1 px-2 rounded-md`}
                >
                  {phase?.status}
                </span>
              ) : null}
            </div>
            <div className="w-12 flex flex-col mr-2 ml-5">
              <button
                className="flex-1 flex self-center items-center  focus:outline-none"
                onClick={ManagementModals.openManagePhases.bind(
                  null,
                  this.context.projectId
                )}
              >
                <MaterialIcons name="developer-board" size={24} color="#000" />
              </button>
              <button
                className="flex-1 flex self-center items-center focus:outline-none"
                onClick={ManagementModals.openManageTasks}
              >
                <Ionicons name="md-today" size={24} color="#000" />
              </button>
              <button
                className="flex-1 flex self-center items-center focus:outline-none"
                onClick={ManagementModals.openManageMembers}
              >
                <Feather name="users" size={24} color="#000" />
              </button>
            </div>
          </div>
        </div>
        {this.renderTasks()}
      </div>
    ) : (
      <div>No Such Project Exists</div>
    );
  }
}

export default withRouter(projectInView);
