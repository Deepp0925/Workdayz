import React, { Component } from "react";
import Modal from "react-modal";
import { TextInput } from "../../ui/Input";
import {
  ProjectInViewContext,
  IProjectInViewContext,
} from "../../store/projectInView";
import { IUpdateUser, defaultProfileImg } from "../../shared";
import { User } from "../../store/user";
interface IProfileState {
  isOpen: boolean;
  error?: string;
  userId?: string;
  isLoading: boolean;
}
export default class OthersProfile extends Component<{}, IProfileState> {
  constructor(props: any) {
    super(props);
    this.state = {
      isOpen: false,
      isLoading: false,
    };
  }

  openModal = (userId: string) => {
    this.setState({ isOpen: true });
    this.setState({ userId });
  };

  closeModal = () => {
    this.setState({ isOpen: false });
  };

  static contextType = ProjectInViewContext;
  context!: IProjectInViewContext;

  private skill = (skill: string) => {
    return <span key={skill}>{skill.trim()}</span>;
  };

  render() {
    const user = this.context.members.get(this.state.userId || "");
    if (user)
      return (
        <Modal
          isOpen={this.state.isOpen}
          onRequestClose={this.closeModal as any}
          overlayClassName="fixed bg-black bg-opacity-75 h-full w-full"
          className="fixed bg-white w-11/12 md:w-1/2 lg:w-3/12 mb-10 profile-modal outline-none hideScrollBar overflow-y-scroll flex slide-in-right"
          shouldCloseOnEsc
          shouldFocusAfterRender
          shouldCloseOnOverlayClick
          contentLabel="Profile Page"
        >
          <div className="flex flex-1 flex-col p-3 mb-64">
            <div className="h-36 rounded-lg">
              <img
                src={user?.img || defaultProfileImg}
                alt="profile picture"
                className="object-cover rounded-lg shadow-2xl"
              />
            </div>
            <div className="mt-5">
              <span className="text lg uppercase font-semibold">
                {user.fullName}
              </span>
            </div>
            <div className="mt-5">
              {user.skills?.split(",").map((skill) => this.skill(skill))}
            </div>
            <div className="mt-5">
              <span>{user.jobTitle}</span>
            </div>
            <div className="mt-5">
              <span>{user.description}</span>
            </div>
          </div>
        </Modal>
      );
    // no such user found
    else return null;
  }
}
