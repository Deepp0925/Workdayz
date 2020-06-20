import React, { Component } from "react";
import Modal from "../../ui/Modal";
import { statusColor } from "../../utils/color";
import Dropdown from "../../ui/Dropdown";
import { Feather } from "react-web-vector-icons";
import ManagementModals from ".";
import {
  IProjectInViewContext,
  ProjectInViewContext,
} from "../../store/projectInView";
import Loader from "../../Loader";
import axios from "axios";
import { Phase } from "../../store/phase";
import { User } from "../../store/user";
import StatusOptions from "../../ui/StatusOptions";
import { StatusTypes } from "../../shared";
interface IManagePhasesState {
  isOpen: boolean;
}
export class ManagePhases extends Component<{}, IManagePhasesState> {
  constructor(props: any) {
    super(props);
    this.state = {
      isOpen: false,
    };
  }

  context!: IProjectInViewContext;
  static contextType = ProjectInViewContext;

  openModal = () => {
    this.setState({ isOpen: true });
  };

  closeModal = () => {
    this.setState({ isOpen: false });
  };

  deletePhase = async (phase: Phase) => {
    try {
      await phase.delete();
      this.context.removePhase(phase.phaseId);
    } catch (error) {
      console.log("error deleting phase");
    }
  };

  updatePhase = async (status: StatusTypes, phase: Phase) => {
    try {
      await phase.updateStatus(status);
      this.context.removePhase(phase.phaseId);
    } catch (error) {
      console.log("error deleting phase");
    }
  };

  private renderPhases = () => {
    return Array.from(this.context.phases.values()).map((phase) => {
      const status = phase.status;
      return (
        <div
          key={phase.phaseId}
          className={`h-16 mt-2 rounded-lg flex p-2 items-center ${statusColor(
            status
          )}`}
        >
          <span className="truncate text-white flex-1">{phase.name}</span>
          <div className="-mt-2">
            {
              /**
               * only the creator of the project can create delete and update the status of the phase
               */
              this.context.isCreator ? (
                <Dropdown
                  onChange={(evt) =>
                    this.updatePhase(evt.currentTarget.value as any, phase)
                  }
                >
                  <StatusOptions status={status} />
                </Dropdown>
              ) : (
                <span className="text-white text-lg">{phase.status}</span>
              )
            }
          </div>

          {
            /**
             * only the creator of the project can create delete and update the status of the phase
             */
            this.context.isCreator ? (
              <button
                className="ml-2 w-12 h-12 bg-white text-error rounded-lg focus:outline-none"
                onClick={this.deletePhase.bind(phase) as any}
              >
                <Feather name="trash-2" size={20} color="#e74c3c" />
              </button>
            ) : null
          }
        </div>
      );
    });
  };

  render() {
    return (
      <Modal isOpen={this.state.isOpen} onRequestClose={this.closeModal}>
        <div className="flex flex-col flex-1">
          <div className="flex flex-col flex-1 px-5 pt-5 overflow-y-scroll pb-24 hideScrollBar">
            <span className="text-2xl font-semibold">Manage Phases</span>
            {
              /**
               * only the creator of the project can create delete and update the status of the phase
               */
              this.context.isCreator ? (
                <button
                  className="focus:outline-none bg-gray-200 h-12 mt-2 rounded-md"
                  onClick={ManagementModals.openNewPhase}
                >
                  Add Phase
                </button>
              ) : null
            }

            {this.renderPhases()}
          </div>
        </div>
      </Modal>
    );
  }
}

export default ManagePhases;
