import React, { Component } from "react";
import Modal from "../../ui/Modal";
import { TextInput } from "../../ui/Input";
import axios from "axios";
import {
  ProjectInViewContext,
  IProjectInViewContext,
} from "../../store/projectInView";
import { IPhase, Response, INewPhase } from "../../shared";
import Loader from "../../Loader";
import { User } from "../../store/user";
import ManagementModals from ".";
interface INewPhaseState {
  isOpen: boolean;
  error?: string;
  isLoading: boolean;
}
export class NewPhase extends Component<{}, INewPhaseState> {
  cancelBtnRef: React.RefObject<HTMLButtonElement> = React.createRef();
  createBtnRef: React.RefObject<HTMLButtonElement> = React.createRef();
  private newPhaseRef: React.RefObject<HTMLDivElement> = React.createRef();

  static contextType = ProjectInViewContext;
  context!: IProjectInViewContext;
  newPhaseTried: boolean = false;
  constructor(props: any) {
    super(props);
    this.state = {
      isOpen: false,
      isLoading: false,
    };
  }

  private phaseInfo: Omit<INewPhase, "userId" | "projectId"> = {
    name: "",
  };

  openModal = () => {
    this.setState({ isOpen: true });
  };

  closeModal = () => {
    this.setState({ isOpen: false });
  };

  private handleName = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.phaseInfo.name = evt.currentTarget.value;
  };

  private renderError = () =>
    this.state.error ? (
      <div className="bg-error text-center py-2 text-white rounded-lg">
        <h5>{this.state.error}</h5>
      </div>
    ) : null;

  private onNewPhaseError = (msg: string) => {
    console.log("an error occurred while creating new phase", msg);

    if (this.newPhaseRef.current) {
      this.newPhaseRef.current.classList.add("shake-horizontal");
      setTimeout(() => {
        this.newPhaseRef.current?.classList.remove("shake-horizontal");
      }, 1000);
    }

    this.setState({
      // TODO enable following line
      error: msg,
      isLoading: false,
    });
    Loader.hide();
  };

  private onNewPhase = async () => {
    try {
      Loader.show();
      this.setState({
        isLoading: true,
        error: undefined,
      });
      const name = this.phaseInfo.name.trim();
      if (!name.length) {
        return this.onNewPhaseError("Please provide phase name");
      }

      if (name.length > 52) {
        return this.onNewPhaseError(
          "Please provide phase name under 52 characters"
        );
      }

      const response = await axios.post<Response<IPhase>>(
        "/phases/new",
        { name, projectId: this.context.projectId, userId: User.info?.userId },
        {
          headers: {
            authorization: User.info?.token,
          },
        }
      );

      if (response.data.error)
        return this.onNewPhaseError(response.data.data as any);

      this.context.addPhase(response.data.data);
      Loader.hide();
      ManagementModals.openManagePhases();
    } catch (error) {
      this.onNewPhaseError(error);
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
    return (
      <Modal isOpen={this.state.isOpen} onRequestClose={this.closeModal}>
        <div className="flex flex-col flex-1" ref={this.newPhaseRef}>
          <div className="flex flex-col flex-1 px-5 pt-5 overflow-y-scroll pb-24 hideScrollBar">
            <span className="text-2xl font-semibold">New Phases</span>
            {this.renderError()}
            <div className="mt-3 focus:outline-none">
              <TextInput
                name="Name"
                onChange={this.handleName}
                defaultValue={this.phaseInfo.name}
              />
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
                onClick={this.onNewPhase}
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

export default NewPhase;
