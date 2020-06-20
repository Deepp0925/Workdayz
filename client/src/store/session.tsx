import React, { PureComponent } from "react";
import { IUser, IUpdateUser } from "../shared";
import _ from "underscore";
import { User } from "./user";

export interface ISessionContext {
  isLoggedIn: boolean;
  user?: IUser;
  login: (user: IUser) => void;
  logout: () => void;
  updateUser: (info: IUpdateUser) => void;
}
export const SessionContext = React.createContext<ISessionContext>(null as any);

// for testing purposes
export const UserModel: IUser = {
  fullName: "",
  jobTitle: "",
  description: "",
  skills: "",
  email: "",
  token: "",
  img: "",
  userId: "",
  _id: "",
  __v: 0,
};

export class SessionStore extends PureComponent<{}, ISessionContext> {
  constructor(props: any) {
    super(props);
    const isLoggedIn = this.isLoggedIn();
    this.state = {
      isLoggedIn,
      user: isLoggedIn
        ? JSON.parse(localStorage.getItem("users") || "{}")
        : undefined,
      login: this.login,
      logout: this.logout,
      updateUser: this.updateUser,
    };

    if (isLoggedIn) {
      User.info = this.state.user;
    }

    // prevents user from tampering with the token
    window.onstorage = this.logout;
  }

  updateUser = (info: any) => {
    try {
      this.setState({ user: { ...this.state.user, ...info } });
    } catch (error) {
      console.log("error updating user info", error);
    }
  };

  isLoggedIn = () => {
    try {
      const userInfo = JSON.parse(localStorage.getItem("users") || "{}");
      if (!userInfo) return false;

      const keys = Object.keys(UserModel);
      const dataKeys = Object.keys(userInfo);
      console.log(_.difference(keys, dataKeys));
      return _.difference(keys, dataKeys).length <= 3;
    } catch (error) {
      return false;
    }
  };

  login = (user: IUser) => {
    User.info = user;
    localStorage.setItem("users", JSON.stringify(user));
    localStorage.setItem("token", user.token);
    localStorage.setItem("loggedIn", String("true"));
    this.setState({
      user,
      isLoggedIn: true,
    });
  };

  logout = () => {
    localStorage.clear();
    User.info = undefined;
    this.setState({
      isLoggedIn: false,
      user: undefined,
    });
  };

  render() {
    return (
      <SessionContext.Provider value={this.state}>
        {this.props.children}
      </SessionContext.Provider>
    );
  }
}
