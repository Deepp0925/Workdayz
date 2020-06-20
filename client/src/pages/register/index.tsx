import React, { Component } from "react";
import { TextInput } from "../../ui/Input";
import { SessionContext, ISessionContext } from "../../store/session";
import { INewUser, IUser, Response } from "../../shared";
import Loader from "../../Loader";
import axios from "axios";
import { validateEmail } from "../../utils/validate";
import { wordCount } from "../../utils/string";

interface IRegisterState {
  isLoading: boolean;
  error?: string;
}

class Register extends Component<{}, IRegisterState> {
  private registerRef: React.RefObject<HTMLDivElement> = React.createRef();
  private registerBtnRef: React.RefObject<
    HTMLButtonElement
  > = React.createRef();

  private registerInfo: INewUser = {
    fullName: "",
    description: "",
    skills: "",
    email: "",
    password: "",
    jobTitle: "",
  };
  static contextType = SessionContext;
  context!: ISessionContext;

  constructor(props: any) {
    super(props);
    this.state = {
      isLoading: false,
    };
  }

  private renderError = () =>
    this.state.error ? (
      <div className="bg-error text-center py-2 text-white rounded-lg">
        <h5>{this.state.error}</h5>
      </div>
    ) : null;

  private setBtnDisabled = () => {
    if (this.registerBtnRef.current)
      this.registerBtnRef.current.disabled = this.state.isLoading;
  };

  private onRegisterError = (msg: string) => {
    Loader.hide();
    this.setState({ isLoading: false, error: msg });
    if (this.registerRef.current) {
      this.registerRef.current.classList.add("shake-horizontal");
      setTimeout(() => {
        this.registerRef.current?.classList.remove("shake-horizontal");
      }, 1000);
    }
  };

  private onRegister = async () => {
    try {
      this.setState({ isLoading: true, error: undefined });
      Loader.show();

      const fullName = this.registerInfo.fullName.trim();
      const jobTitle = this.registerInfo.jobTitle.trim();
      const description = this.registerInfo.description.trim();
      const skills = this.registerInfo.skills.trim();
      const email = this.registerInfo.email.trim();
      const password = this.registerInfo.password.trim();

      // check full name length
      if (fullName.length <= 0) {
        return this.onRegisterError("Please provide a full name");
      }

      if (fullName.length > 24) {
        return this.onRegisterError(
          "Provided name is larger than 24 characters"
        );
      }
      // check job title length
      if (jobTitle.length <= 0) {
        return this.onRegisterError("Please provide a job title");
      }

      if (jobTitle.length > 36) {
        return this.onRegisterError(
          "Provided job title is larger than 36 characters"
        );
      }
      // check for description length
      if (description.length <= 0) {
        return this.onRegisterError("Please provide a description");
      }

      // word count check
      if (wordCount(description) > 150) {
        return this.onRegisterError(
          "Provided description is larger than 150 words"
        );
      }
      // check skills
      if (skills.length <= 0) {
        return this.onRegisterError("Please provide one or more skills");
      }
      // check for email
      if (email.length <= 0) {
        return this.onRegisterError("Please provide an email");
      }

      if (!validateEmail(email)) {
        return this.onRegisterError("Invalid email provided");
      }
      // check for password length
      if (password.length < 8) {
        return this.onRegisterError(
          "Please provide a password of at least 8 characters"
        );
      }

      if (password.length > 24) {
        return this.onRegisterError(
          "Provided password is more than 24 characters"
        );
      }

      // send post request

      const response = await axios.post<Response<IUser>>("/users/register", {
        email,
        password,
        description,
        fullName,
        jobTitle,
        skills,
      });

      if (response.data.error) {
        return this.onRegisterError(response.data.data as any);
      }

      // all good
      Loader.hide();
      this.context.login(response.data.data);
    } catch (error) {
      console.log("an error occurred while registering", error);
      this.onRegisterError("registaration error");
    }
  };

  private handleFullName = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.registerInfo.fullName = evt.currentTarget.value;
  };

  private handleJobTitle = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.registerInfo.jobTitle = evt.currentTarget.value;
  };
  private handleDescription = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.registerInfo.description = evt.currentTarget.value;
  };

  private handleSkills = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.registerInfo.skills = evt.currentTarget.value;
  };

  private handleEmail = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.registerInfo.email = evt.currentTarget.value;
  };

  private handlePassword = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.registerInfo.password = evt.currentTarget.value;
  };

  render() {
    this.setBtnDisabled();
    return (
      <div className="py-4" ref={this.registerRef}>
        {this.renderError()}
        <div className="mt-5">
          <TextInput
            name="Full Name"
            type="text"
            defaultValue={this.registerInfo.fullName}
            onChange={this.handleFullName}
          />
        </div>
        <div className="mt-5">
          <TextInput
            name="Job Title"
            type="text"
            defaultValue={this.registerInfo.jobTitle}
            onChange={this.handleJobTitle}
          />
        </div>
        <div className="mt-5">
          <TextInput
            name="Description (<150 words)"
            isDescription
            type="text"
            defaultValue={this.registerInfo.description}
            onChange={this.handleDescription}
          />
        </div>
        <div className="mt-5">
          <TextInput
            name="Skills (comma separated)"
            type="text"
            defaultValue={this.registerInfo.skills}
            onChange={this.handleSkills}
          />
        </div>
        <div className="mt-5">
          <TextInput
            name="Email"
            type="email"
            defaultValue={this.registerInfo.email}
            onChange={this.handleEmail}
          />
        </div>
        <div className="mt-5">
          <TextInput
            name="Password"
            type="password"
            defaultValue={this.registerInfo.password}
            onChange={this.handlePassword}
          />
        </div>
        <div className="mt-12 flex">
          <button
            ref={this.registerBtnRef}
            type="submit"
            onClick={this.onRegister}
            className="rounded-full text-white bg-themeColor w-1/2 py-3 focus:outline-none"
          >
            Register
          </button>
        </div>
      </div>
    );
  }
}

export default Register;
