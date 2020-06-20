import React, { Component } from "react";
import { TextInput } from "../../ui/Input";
import { SessionContext, ISessionContext } from "../../store/session";
import Loader from "../../Loader";
import { validateEmail } from "../../utils/validate";
import axios from "axios";
import { IUser, Response } from "../../shared";

interface ILoginInfo {
  email: string;
  password: string;
}

interface ILoginState {
  isLoading: boolean;
  error?: string;
}

class Login extends Component<{}, ILoginState> {
  private loginRef: React.RefObject<HTMLDivElement> = React.createRef();
  private loginBtnRef: React.RefObject<HTMLButtonElement> = React.createRef();
  private fpRef: React.RefObject<HTMLButtonElement> = React.createRef();

  private loginInfo: ILoginInfo = { email: "", password: "" };
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
    if (this.loginBtnRef.current)
      this.loginBtnRef.current.disabled = this.state.isLoading;

    if (this.fpRef.current) this.fpRef.current.disabled = this.state.isLoading;
  };

  private onLoginError = (msg: string) => {
    Loader.hide();
    this.setState({ isLoading: false, error: msg });
    if (this.loginRef.current) {
      this.loginRef.current.classList.add("shake-horizontal");
      setTimeout(() => {
        this.loginRef.current?.classList.remove("shake-horizontal");
      }, 1000);
    }
  };

  private onLogin = async () => {
    try {
      this.setState({ isLoading: true, error: undefined });
      Loader.show();

      const email = this.loginInfo.email.trim();
      const password = this.loginInfo.password.trim();
      // validate email
      if (email.length <= 0) {
        return this.onLoginError("Please provide an email");
      }

      if (!validateEmail(email)) {
        return this.onLoginError("Please provide a valid email");
      }

      // check password
      if (password.length <= 0) {
        return this.onLoginError("Please provide a password");
      }

      // send post request

      const response = await axios.post<Response<IUser>>("/users/login", {
        email,
        password,
      });

      if (response.data.error) {
        return this.onLoginError(response.data.data as any);
      }

      // all good
      Loader.hide();
      this.context.login(response.data.data);
    } catch (error) {
      console.log("an error occurred while logging", error);
      this.onLoginError("login error");
    }
  };

  private handleEmail = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.loginInfo.email = evt.currentTarget.value;
  };

  private handlePassword = (evt: React.ChangeEvent<HTMLInputElement>) => {
    this.loginInfo.password = evt.currentTarget.value;
  };

  render() {
    this.setBtnDisabled();
    return (
      <div className="py-4" ref={this.loginRef}>
        {this.renderError()}
        <div className="mt-5">
          <TextInput
            name="Email"
            type="email"
            defaultValue={this.loginInfo.email}
            onChange={this.handleEmail}
          />
        </div>
        <div className="mt-8">
          <TextInput
            name="Password"
            type="password"
            defaultValue={this.loginInfo.password}
            onChange={this.handlePassword}
          />
        </div>
        <div className="mt-12 flex">
          <button
            ref={this.loginBtnRef}
            type="submit"
            onClick={this.onLogin}
            className="rounded-full text-white bg-themeColor flex-1 py-3 focus:outline-none"
          >
            Login
          </button>
          {/* <button
            ref={this.fpRef}
            type="button"
            className="flex-1 text-right focus:outline-none"
          >
            Forgot Password?
          </button> */}
        </div>
      </div>
    );
  }
}

export default Login;
