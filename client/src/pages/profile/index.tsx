import React, { Component } from "react";
import Modal from "react-modal";
import { TextInput } from "../../ui/Input";
import { SessionContext, ISessionContext } from "../../store/session";
import { IUpdateUser, defaultProfileImg, Response } from "../../shared";
import axios from "axios";
import Loader from "../../Loader";
import { wordCount } from "../../utils/string";
import { User } from "../../store/user";
interface IProfileState {
  isOpen: boolean;
  error?: string;
  isLoading: boolean;
}
export default class MyProfile extends Component<{}, IProfileState> {
  private MyProfileRef: React.RefObject<HTMLDivElement> = React.createRef();
  private UpdateBtnRef: React.RefObject<HTMLButtonElement> = React.createRef();

  constructor(props: any) {
    super(props);
    this.state = {
      isOpen: false,
      isLoading: false,
    };
  }

  private updateInfo: IUpdateUser = {};

  openModal = () => {
    this.setState({ isOpen: true });
  };

  closeModal = () => {
    this.setState({ isOpen: false });
  };

  private handleFullName = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const fullName = evt.currentTarget.value;
    if (fullName.length) return (this.updateInfo.fullName = fullName);
    return delete this.updateInfo.fullName;
  };

  private handleImg = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const img = evt.currentTarget.value;
    if (img.length) return (this.updateInfo.img = img);
    return delete this.updateInfo.img;
  };
  private handleJobTitle = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const jobTitle = evt.currentTarget.value;
    if (jobTitle.length) return (this.updateInfo.jobTitle = jobTitle);
    return delete this.updateInfo.jobTitle;
  };
  private handleDescription = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const description = evt.currentTarget.value;
    if (description.length) return (this.updateInfo.description = description);
    return delete this.updateInfo.description;
  };

  private handleSkills = (evt: React.ChangeEvent<HTMLInputElement>) => {
    const skills = evt.currentTarget.value;
    if (skills.length) return (this.updateInfo.skills = skills);
    return delete this.updateInfo.skills;
  };

  private renderError = () =>
    this.state.error ? (
      <div className="bg-error text-center py-2 text-white rounded-lg">
        <h5>{this.state.error}</h5>
      </div>
    ) : null;

  private setBtnDisabled = () => {
    if (this.UpdateBtnRef.current)
      this.UpdateBtnRef.current.disabled = this.state.isLoading;
  };

  private onUpdateError = (msg: string) => {
    Loader.hide();
    this.setState({ isLoading: false, error: msg });
    if (this.MyProfileRef.current) {
      this.MyProfileRef.current.classList.add("shake-horizontal");
      setTimeout(() => {
        this.MyProfileRef.current?.classList.remove("shake-horizontal");
      }, 1000);
    }
  };

  private update = async () => {
    try {
      Loader.show();

      const fullName = this.updateInfo?.fullName?.trim();
      const jobTitle = this.updateInfo?.jobTitle?.trim();
      const description = this.updateInfo?.description?.trim();
      const skills = this.updateInfo?.skills?.trim();
      const img = this.updateInfo?.img?.trim();

      let updateInfo: IUpdateUser = {};

      if (fullName) {
        if (fullName.length <= 0) {
          return this.onUpdateError("Please provide a full name");
        }

        if (fullName.length > 24) {
          return this.onUpdateError(
            "Provided name is larger than 24 characters"
          );
        }
        updateInfo.fullName = fullName;
      }

      if (jobTitle) {
        // check job title length
        if (jobTitle.length <= 0) {
          return this.onUpdateError("Please provide a job title");
        }

        if (jobTitle.length > 36) {
          return this.onUpdateError(
            "Provided job title is larger than 36 characters"
          );
        }
        updateInfo.jobTitle = jobTitle;
      }

      if (description) {
        // check for description length
        if (description.length <= 0) {
          return this.onUpdateError("Please provide a description");
        }

        // word count check
        if (wordCount(description) > 150) {
          return this.onUpdateError(
            "Provided description is larger than 150 words"
          );
        }

        updateInfo.description = description;
      }

      if (skills) {
        // check skills
        if (skills.length <= 0) {
          return this.onUpdateError("Please provide one or more skills");
        }

        updateInfo.skills = skills;
      }

      if (img) {
        updateInfo.img = img;
      }

      Loader.hide();
      const response = await axios.post<Response<string>>(
        "/users/update",
        { ...updateInfo, userId: this.context.user?.userId },
        {
          headers: {
            authorization: this.context.user?.token,
          },
        }
      );

      if (response.data.error) {
        throw response.data.data;
      }

      console.log(response.data.data);
      User.info = { ...User.info, ...updateInfo } as any;
      this.context.updateUser(updateInfo);
    } catch (error) {
      console.log("an error occurred while updating profile", error);
    }
  };

  static contextType = SessionContext;
  context!: ISessionContext;

  render() {
    const user = this.context.user;
    this.setBtnDisabled();
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
        <div className="flex flex-1 flex-col p-3 mb-64" ref={this.MyProfileRef}>
          <div className="h-36 rounded-lg">
            <img
              src={user?.img || defaultProfileImg}
              alt="profile picture"
              className="object-cover rounded-lg shadow-2xl"
            />
          </div>
          {this.renderError()}
          <div className="mt-5">
            <TextInput
              name="Email"
              type="email"
              defaultValue={user?.email}
              disabled={true}
            />
          </div>
          <div className="mt-5">
            <TextInput
              name="Profile Picture(url)"
              type="text"
              defaultValue={user?.img}
              onChange={this.handleImg}
            />
          </div>
          <div className="mt-5">
            <TextInput
              name="Full Name"
              type="text"
              onChange={this.handleFullName}
              defaultValue={user?.fullName}
            />
          </div>
          <div className="mt-5">
            <TextInput
              name="Job Title"
              type="text"
              onChange={this.handleJobTitle}
              defaultValue={user?.jobTitle}
            />
          </div>
          <div className="mt-5">
            <TextInput
              name="Description (<150 words)"
              isDescription
              type="text"
              onChange={this.handleDescription}
              defaultValue={user?.description}
            />
          </div>
          <div className="mt-5">
            <TextInput
              name="Skills (comma separated)"
              type="text"
              onChange={this.handleSkills}
              defaultValue={user?.skills}
            />
          </div>

          <div className="mt-5">
            <button
              ref={this.UpdateBtnRef}
              type="submit"
              onClick={this.update}
              className="rounded-full text-white bg-themeColor w-1/2 py-3 focus:outline-none"
            >
              update
            </button>
          </div>
        </div>
      </Modal>
    );
  }
}
